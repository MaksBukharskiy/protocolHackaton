import type { AccessRole, LookingFor, ProjectStatus, Role } from "../types"

export const ROLE_LABEL: Record<Role, string> = {
  frontend: "фронтенд",
  backend: "бэкенд",
  mobile: "мобайл",
  design: "дизайн",
  ml: "ML",
  biz: "бизнес",
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "идея",
  building: "в работе",
  looking: "ищем команду",
}

export const ACCESS_LABEL: Record<AccessRole, string> = {
  participant: "участник",
  moderator: "модератор",
}

export const LOOKING_LABEL: Record<LookingFor, string> = {
  cofounder: "ищет кофаундера",
  teammate: "ищет в команду",
  none: "пока не ищет",
}
