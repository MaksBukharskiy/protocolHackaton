import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { STORAGE_KEY, STORAGE_VERSION, peers as seedPeers, projects as seedProjects } from "./data/seed"
import type { AppState, Peer, Project } from "./types"

type Store = {
  currentUser: Peer | null
  peers: Peer[]
  projects: Project[]
  login: (peerId: string) => void
  logout: () => void
  updatePeer: (peerId: string, patch: Partial<Peer>) => void
  createProject: (input: Omit<Project, "id" | "ownerId" | "memberIds" | "interestIds">) => string
  toggleInterest: (projectId: string) => void
  acceptMember: (projectId: string, peerId: string) => void
  resetDemo: () => void
  peerById: (id: string) => Peer | undefined
}

const StoreContext = createContext<Store | null>(null)

function emptyState(): AppState {
  return {
    version: STORAGE_VERSION,
    currentUserId: null,
    peers: seedPeers,
    projects: seedProjects,
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as AppState
    if (parsed.version !== STORAGE_VERSION) return emptyState()
    return parsed
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

    return {
      currentUser,
      peers: state.peers,
      projects: state.projects,
      peerById: (id) => state.peers.find((p) => p.id === id),
      login: (peerId) => commit({ ...state, currentUserId: peerId }),
      logout: () => commit({ ...state, currentUserId: null }),
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
        const project: Project = {
          ...input,
          id,
          ownerId,
          memberIds: [ownerId],
          interestIds: [],
        }
        commit({ ...state, projects: [project, ...state.projects] })
        return id
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
        commit({
          ...state,
          projects: state.projects.map((project) => {
            if (project.id !== projectId || project.ownerId !== me) return project
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
    }
  }, [commit, state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore outside provider")
  return ctx
}
