import { isComplete, isModuleDone, type ModuleDef } from "./modules"
import type { ModuleId, Project } from "../types"

export type BadgeDef = {
  id: ModuleId | "complete"
  title: string
  mark: string
  hint: string
}

export function badgesFor(modules: readonly ModuleDef[]): BadgeDef[] {
  const items = modules.map((module, index) => ({
    id: module.id,
    title: module.title,
    mark: String(index + 1).padStart(2, "0"),
    hint: module.hint,
  }))
  return [...items, { id: "complete", title: "One-pager", mark: "★", hint: "все модули закрыты" }]
}

export function isBadgeEarned(project: Project, badgeId: BadgeDef["id"], modules?: readonly ModuleDef[]) {
  if (badgeId === "complete") return isComplete(project, modules)
  return isModuleDone(project, badgeId, modules)
}

export function earnedBadges(project: Project, modules?: readonly ModuleDef[]) {
  return badgesFor(modules ?? []).filter((badge) => isBadgeEarned(project, badge.id, modules))
}
