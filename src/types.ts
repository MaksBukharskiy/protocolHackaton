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
}

export type Project = {
  id: string
  ownerId: string
  title: string
  pitch: string
  status: ProjectStatus
  stack: string[]
  neededRoles: Role[]
  memberIds: string[]
  interestIds: string[]
}

export type AppState = {
  version: number
  currentUserId: string | null
  peers: Peer[]
  projects: Project[]
}
