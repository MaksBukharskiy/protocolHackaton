export const ROLES = [
  "frontend",
  "backend",
  "mobile",
  "design",
  "ml",
  "biz",
] as const

export type Role = (typeof ROLES)[number]

export const PROJECT_STATUSES = ["idea", "building", "looking"] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const LOOKING_FOR = ["cofounder", "teammate", "none"] as const
export type LookingFor = (typeof LOOKING_FOR)[number]

export const ACCESS_ROLES = ["participant", "moderator"] as const
export type AccessRole = (typeof ACCESS_ROLES)[number]

export type Peer = {
  id: string
  nickname: string
  name: string
  campus: string
  cohort: string
  bio: string
  skills: string[]
  roles: Role[]
  lookingFor: LookingFor
  accessRole: AccessRole
}

/** Runtime module ids are strings so moderators can add custom modules. */
export type ModuleId = string

/** Seed ids kept for reference / migrations. */
export const MODULE_IDS = ["problem", "audience", "solution", "wedge", "ask", "next"] as const

export type TemplateField = {
  id: string
  label: string
  placeholder: string
}

export type ModuleDef = {
  id: ModuleId
  title: string
  hint: string
  fields: TemplateField[]
}

export type ProjectComment = {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export type Project = {
  id: string
  ownerId: string
  title: string
  teamName: string
  pitch: string
  status: ProjectStatus
  stack: string[]
  neededRoles: Role[]
  memberIds: string[]
  interestIds: string[]
  answers: Record<string, Record<string, string>>
  pagerNote: string
  comments: ProjectComment[]
}

export type AppState = {
  version: number
  currentUserId: string | null
  currentRole: AccessRole | null
  peers: Peer[]
  projects: Project[]
  passwords: Record<string, string>
  modules: ModuleDef[]
}
