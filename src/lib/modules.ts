import type { ModuleDef, ModuleId, Project } from "../types"

export type { ModuleDef, TemplateField } from "../types"

/** Seed / default Launch Lab modules. Runtime list lives in store. */
export const DEFAULT_MODULES: ModuleDef[] = [
  {
    id: "problem",
    title: "Проблема",
    hint: "Только боль.",
    fields: [
      { id: "pain", label: "Боль", placeholder: "Что болит?" },
      { id: "who", label: "Кто", placeholder: "Кому больно?" },
      { id: "now", label: "Сейчас", placeholder: "Как решают?" },
    ],
  },
  {
    id: "audience",
    title: "Для кого",
    hint: "Первый пользователь.",
    fields: [
      { id: "segment", label: "Кто", placeholder: "Сегмент" },
      { id: "place", label: "Где", placeholder: "Кампус / чат" },
      { id: "job", label: "Задача", placeholder: "Что хочет закрыть?" },
    ],
  },
  {
    id: "solution",
    title: "Решение",
    hint: "Что и как.",
    fields: [
      { id: "what", label: "Что", placeholder: "Одной фразой" },
      { id: "how", label: "Как", placeholder: "2–3 шага" },
      { id: "proof", label: "Почему", placeholder: "Сигнал / пилот" },
    ],
  },
  {
    id: "wedge",
    title: "Почему мы",
    hint: "Команда и момент.",
    fields: [
      { id: "team", label: "Команда", placeholder: "Кто что закрывает" },
      { id: "moment", label: "Сейчас", placeholder: "Почему сейчас" },
      { id: "edge", label: "Край", placeholder: "Что только у вас" },
    ],
  },
  {
    id: "ask",
    title: "Кого ищем",
    hint: "Один слот.",
    fields: [
      { id: "role", label: "Слот", placeholder: "Роль" },
      { id: "week", label: "Неделя", placeholder: "Что сделает за 7 дней" },
      { id: "offer", label: "Даём", placeholder: "Опыт / доля" },
    ],
  },
  {
    id: "next",
    title: "Следующий шаг",
    hint: "14 дней.",
    fields: [
      { id: "plan", label: "План", placeholder: "Что должно случиться" },
      { id: "metric", label: "Метрика", placeholder: "Как измерить" },
      { id: "need", label: "Нужно", placeholder: "Запрос к лабу" },
    ],
  },
]

/** @deprecated Use store.modules or pass modules explicitly. */
export const MODULES = DEFAULT_MODULES

export type FieldMap = Record<string, string>

function list(modules?: readonly ModuleDef[]) {
  return modules && modules.length > 0 ? modules : DEFAULT_MODULES
}

export function emptyFields(id: ModuleId, modules?: readonly ModuleDef[]): FieldMap {
  const module = list(modules).find((item) => item.id === id)
  if (!module) return {}
  return Object.fromEntries(module.fields.map((field) => [field.id, ""]))
}

export function emptyAnswers(modules?: readonly ModuleDef[]): Record<string, FieldMap> {
  return Object.fromEntries(list(modules).map((module) => [module.id, emptyFields(module.id, modules)]))
}

export function fillModule(id: ModuleId, values: FieldMap, modules?: readonly ModuleDef[]): FieldMap {
  return { ...emptyFields(id, modules), ...values }
}

export function isFieldFilled(value: string | undefined) {
  return Boolean(value?.trim())
}

export function isModuleDone(project: Project, id: ModuleId, modules?: readonly ModuleDef[]) {
  const module = list(modules).find((item) => item.id === id)
  if (!module) return false
  const answers = project.answers[id] ?? {}
  return module.fields.every((field) => isFieldFilled(answers[field.id]))
}

export function moduleIndex(id: ModuleId, modules?: readonly ModuleDef[]) {
  return list(modules).findIndex((item) => item.id === id)
}

export function isUnlocked(project: Project, id: ModuleId, modules?: readonly ModuleDef[]) {
  const catalog = list(modules)
  const index = moduleIndex(id, catalog)
  if (index < 0) return false
  if (index === 0) return true
  const prev = catalog[index - 1]
  return isModuleDone(project, prev.id, catalog)
}

export function currentModuleId(project: Project, modules?: readonly ModuleDef[]): ModuleId {
  const catalog = list(modules)
  if (catalog.length === 0) return ""
  return catalog.find((item) => !isModuleDone(project, item.id, catalog))?.id ?? catalog[catalog.length - 1].id
}

export function doneCount(project: Project, modules?: readonly ModuleDef[]) {
  const catalog = list(modules)
  return catalog.filter((item) => isModuleDone(project, item.id, catalog)).length
}

export function leftCount(project: Project, modules?: readonly ModuleDef[]) {
  const catalog = list(modules)
  return catalog.length - doneCount(project, catalog)
}

export function isComplete(project: Project, modules?: readonly ModuleDef[]) {
  const catalog = list(modules)
  return catalog.length > 0 && doneCount(project, catalog) === catalog.length
}

export function moduleLines(project: Project, id: ModuleId, modules?: readonly ModuleDef[]) {
  const module = list(modules).find((item) => item.id === id)
  if (!module) return []
  const answers = project.answers[id] ?? {}
  return module.fields.map((field) => ({
    label: field.label,
    value: answers[field.id] ?? "",
  }))
}

export function slugifyModuleId(title: string, existing: readonly ModuleDef[]) {
  const base =
    title
      .trim()
      .toLowerCase()
      .replaceAll("ё", "е")
      .replace(/[^a-z0-9а-я]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "module"
  let id = base
  let n = 2
  const taken = new Set(existing.map((item) => item.id))
  while (taken.has(id)) {
    id = `${base}-${n}`
    n += 1
  }
  return id
}

export function canAccessProject(project: Project, userId: string | undefined, isModerator: boolean) {
  if (isModerator) return true
  if (!userId) return false
  return project.memberIds.includes(userId) || project.ownerId === userId
}

/** Публичный просмотр: только одобренные проекты со статусом «ищем в команду». */
export function canPreviewProject(project: Project, userId: string | undefined, isModerator: boolean) {
  if (canAccessProject(project, userId, isModerator)) return true
  if (!userId) return false
  return project.moderationStatus === "approved" && project.status === "looking"
}

export function isPubliclyListed(project: Project) {
  return project.moderationStatus === "approved" && project.status === "looking"
}
