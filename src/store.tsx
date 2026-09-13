import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { STORAGE_KEY, STORAGE_VERSION, peers as seedPeers, projects as seedProjects } from "./data/seed"
import { DEFAULT_MODULES, emptyAnswers, emptyFields, slugifyModuleId } from "./lib/modules"
import type { AccessRole, AppState, ModuleDef, ModuleId, Peer, Project, TemplateField } from "./types"

type Store = {
  currentUser: Peer | null
  currentRole: AccessRole | null
  isModerator: boolean
  peers: Peer[]
  projects: Project[]
  modules: ModuleDef[]
  login: (peerId: string) => void
  verify: (nickname: string, password: string) => Peer | undefined
  register: (input: {
    nickname: string
    name: string
    campus: string
    password: string
  }) => string
  logout: () => void
  updatePeer: (peerId: string, patch: Partial<Peer>) => void
  createProject: (
    input: Omit<Project, "id" | "ownerId" | "memberIds" | "interestIds" | "answers" | "pagerNote"> & {
      extraMembers?: string[]
    },
  ) => string
  updateProject: (
    projectId: string,
    patch: Partial<Pick<Project, "title" | "teamName" | "pitch" | "pagerNote" | "status" | "neededRoles" | "stack">>,
  ) => void
  saveAnswer: (projectId: string, moduleId: ModuleId, fields: Record<string, string>) => void
  toggleInterest: (projectId: string) => void
  acceptMember: (projectId: string, peerId: string) => void
  rejectInterest: (projectId: string, peerId: string) => void
  addModule: (input: { title: string; hint: string; fields: TemplateField[] }) => string
  deleteModule: (moduleId: ModuleId) => void
  moveModule: (moduleId: ModuleId, direction: -1 | 1) => void
  resetDemo: () => void
  peerById: (id: string) => Peer | undefined
}

const StoreContext = createContext<Store | null>(null)

function cloneModules(source: readonly ModuleDef[] = DEFAULT_MODULES): ModuleDef[] {
  return source.map((module) => ({
    ...module,
    fields: module.fields.map((field) => ({ ...field })),
  }))
}

function emptyState(): AppState {
  return {
    version: STORAGE_VERSION,
    currentUserId: null,
    currentRole: null,
    peers: seedPeers,
    projects: seedProjects,
    passwords: Object.fromEntries(seedPeers.map((peer) => [peer.id, "21"])),
    modules: cloneModules(),
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as AppState
    if (parsed.version !== STORAGE_VERSION) return emptyState()
    return {
      ...parsed,
      peers: parsed.peers.map((peer) => ({
        ...peer,
        accessRole: peer.accessRole === "moderator" ? "moderator" : "participant",
      })),
      passwords: {
        ...Object.fromEntries(seedPeers.map((peer) => [peer.id, "21"])),
        ...parsed.passwords,
      },
      modules: Array.isArray(parsed.modules) && parsed.modules.length > 0 ? parsed.modules : cloneModules(),
    }
  } catch {
    return emptyState()
  }
}

function persist(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)

  const commit = useCallback((next: AppState) => {
    persist(next)
    setState(next)
  }, [])

  const value = useMemo<Store>(() => {
    const currentUser = state.peers.find((p) => p.id === state.currentUserId) ?? null
    const currentRole = currentUser?.accessRole ?? null
    const isModerator = currentRole === "moderator"
    const modules = state.modules.length > 0 ? state.modules : cloneModules()

    return {
      currentUser,
      currentRole,
      isModerator,
      peers: state.peers,
      projects: state.projects,
      modules,
      peerById: (id) => state.peers.find((p) => p.id === id),
      login: (peerId) => {
        const peer = state.peers.find((item) => item.id === peerId)
        if (!peer) return
        commit({ ...state, currentUserId: peerId, currentRole: peer.accessRole })
      },
      verify: (nickname, password) => {
        const loginName = nickname.trim().toLowerCase()
        const peer = state.peers.find((item) => item.nickname.toLowerCase() === loginName || item.id === loginName)
        if (!peer || state.passwords[peer.id] !== password) return undefined
        return peer
      },
      register: (input) => {
        const nickname = input.nickname.trim().toLowerCase()
        const taken = state.peers.some((peer) => peer.nickname.toLowerCase() === nickname)
        if (taken) return ""
        const id = nickname.replace(/[^a-z0-9]/g, "") || crypto.randomUUID().slice(0, 8)
        const peer: Peer = {
          id,
          nickname,
          name: input.name.trim(),
          campus: input.campus.trim() || "Ташкент",
          cohort: "25_12_TAS",
          bio: "Только что зашёл в Launch Lab 21. Профиль ещё пустой.",
          skills: [],
          roles: ["frontend"],
          lookingFor: "teammate",
          accessRole: "participant",
        }
        commit({
          ...state,
          peers: [peer, ...state.peers],
          passwords: { ...state.passwords, [id]: input.password },
          currentUserId: id,
          currentRole: "participant",
        })
        return id
      },
      logout: () => commit({ ...state, currentUserId: null, currentRole: null }),
      resetDemo: () => commit(emptyState()),
      updatePeer: (peerId, patch) => {
        commit({
          ...state,
          peers: state.peers.map((p) => (p.id === peerId ? { ...p, ...patch, id: p.id } : p)),
        })
      },
      createProject: (input) => {
        const id = crypto.randomUUID()
        const ownerId = state.currentUserId
        if (!ownerId) return id
        const { extraMembers = [], ...rest } = input
        const extra = extraMembers
          .map((nick) => state.peers.find((p) => p.nickname.toLowerCase() === nick.trim().toLowerCase())?.id)
          .filter((memberId): memberId is string => Boolean(memberId) && memberId !== ownerId)
        const project: Project = {
          ...rest,
          id,
          ownerId,
          memberIds: [ownerId, ...extra],
          interestIds: [],
          answers: emptyAnswers(modules),
          pagerNote: "",
        }
        commit({ ...state, projects: [project, ...state.projects] })
        return id
      },
      updateProject: (projectId, patch) => {
        const me = state.currentUserId
        commit({
          ...state,
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project
            // Только команда правит профиль. Модератор — только смотрит.
            if (!me || (project.ownerId !== me && !project.memberIds.includes(me))) return project
            return { ...project, ...patch }
          }),
        })
      },
      saveAnswer: (projectId, moduleId, fields) => {
        const me = state.currentUserId
        commit({
          ...state,
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project
            // Ответы модулей пишет только команда.
            if (!me || !project.memberIds.includes(me)) return project
            return {
              ...project,
              answers: { ...project.answers, [moduleId]: fields },
            }
          }),
        })
      },
      toggleInterest: (projectId) => {
        const me = state.currentUserId
        if (!me) return
        commit({
          ...state,
          projects: state.projects.map((project) => {
            if (project.id !== projectId || project.ownerId === me) return project
            if (project.memberIds.includes(me)) return project
            const interested = project.interestIds.includes(me)
            return {
              ...project,
              interestIds: interested
                ? project.interestIds.filter((id) => id !== me)
                : [...project.interestIds, me],
            }
          }),
        })
      },
      acceptMember: (projectId, peerId) => {
        const me = state.currentUserId
        const moderator = state.currentRole === "moderator"
        commit({
          ...state,
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project
            if (!moderator && project.ownerId !== me) return project
            return {
              ...project,
              memberIds: project.memberIds.includes(peerId)
                ? project.memberIds
                : [...project.memberIds, peerId],
              interestIds: project.interestIds.filter((id) => id !== peerId),
            }
          }),
        })
      },
      rejectInterest: (projectId, peerId) => {
        const me = state.currentUserId
        const moderator = state.currentRole === "moderator"
        commit({
          ...state,
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project
            if (!moderator && project.ownerId !== me) return project
            return {
              ...project,
              interestIds: project.interestIds.filter((id) => id !== peerId),
            }
          }),
        })
      },
      addModule: (input) => {
        if (state.currentRole !== "moderator") return ""
        const title = input.title.trim()
        if (!title) return ""
        const fields = input.fields
          .map((field, index) => ({
            id: field.id.trim() || `field-${index + 1}`,
            label: field.label.trim(),
            placeholder: field.placeholder.trim(),
          }))
          .filter((field) => field.label)
        if (fields.length === 0) return ""
        const id = slugifyModuleId(title, modules)
        const nextModule: ModuleDef = {
          id,
          title,
          hint: input.hint.trim(),
          fields,
        }
        commit({
          ...state,
          modules: [...modules, nextModule],
          projects: state.projects.map((project) => ({
            ...project,
            answers: {
              ...project.answers,
              [id]: emptyFields(id, [nextModule]),
            },
          })),
        })
        return id
      },
      deleteModule: (moduleId) => {
        if (state.currentRole !== "moderator") return
        if (!modules.some((item) => item.id === moduleId)) return
        if (modules.length <= 1) return
        commit({
          ...state,
          modules: modules.filter((item) => item.id !== moduleId),
          projects: state.projects.map((project) => {
            const { [moduleId]: _removed, ...rest } = project.answers
            return { ...project, answers: rest }
          }),
        })
      },
      moveModule: (moduleId, direction) => {
        if (state.currentRole !== "moderator") return
        const index = modules.findIndex((item) => item.id === moduleId)
        const target = index + direction
        if (index < 0 || target < 0 || target >= modules.length) return
        const next = [...modules]
        const [item] = next.splice(index, 1)
        next.splice(target, 0, item)
        commit({ ...state, modules: next })
      },
    }
  }, [commit, state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore outside provider")
  return ctx
}
