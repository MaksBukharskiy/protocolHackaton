import type { ModuleId, Project } from "../types"

export type TemplateField = {
  id: string
  label: string
  placeholder: string
}

export type ModuleDef = {
  id: ModuleId
  title: string
  hint: string
  fields: readonly TemplateField[]
}

export const MODULES: readonly ModuleDef[] = [
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

export type FieldMap = Record<string, string>

export function emptyFields(id: ModuleId): FieldMap {
  const module = MODULES.find((item) => item.id === id)
  if (!module) return {}
  return Object.fromEntries(module.fields.map((field) => [field.id, ""]))
}

export function emptyAnswers(): Record<ModuleId, FieldMap> {
  return {
    problem: emptyFields("problem"),
    audience: emptyFields("audience"),
    solution: emptyFields("solution"),
    wedge: emptyFields("wedge"),
    ask: emptyFields("ask"),
    next: emptyFields("next"),
  }
}

export function fillModule(id: ModuleId, values: FieldMap): FieldMap {
  return { ...emptyFields(id), ...values }
}

export function isFieldFilled(value: string | undefined) {
  return Boolean(value?.trim())
}

export function isModuleDone(project: Project, id: ModuleId) {
  const module = MODULES.find((item) => item.id === id)
  if (!module) return false
  const answers = project.answers[id] ?? {}
  return module.fields.every((field) => isFieldFilled(answers[field.id]))
}

export function moduleIndex(id: ModuleId) {
  return MODULES.findIndex((item) => item.id === id)
}

export function isUnlocked(project: Project, id: ModuleId) {
  const index = moduleIndex(id)
  if (index <= 0) return true
  const prev = MODULES[index - 1]
  return isModuleDone(project, prev.id)
}

export function currentModuleId(project: Project): ModuleId {
  return MODULES.find((item) => !isModuleDone(project, item.id))?.id ?? MODULES[MODULES.length - 1].id
}

export function doneCount(project: Project) {
  return MODULES.filter((item) => isModuleDone(project, item.id)).length
}

export function leftCount(project: Project) {
  return MODULES.length - doneCount(project)
}

export function isComplete(project: Project) {
  return doneCount(project) === MODULES.length
}

export function moduleLines(project: Project, id: ModuleId) {
  const module = MODULES.find((item) => item.id === id)
  if (!module) return []
  const answers = project.answers[id] ?? {}
  return module.fields.map((field) => ({
    label: field.label,
    value: answers[field.id] ?? "",
  }))
}

export function canAccessProject(project: Project, userId: string | undefined, isModerator: boolean) {
  if (isModerator) return true
  if (!userId) return false
  return project.memberIds.includes(userId) || project.ownerId === userId
}

/** Публичный просмотр для заявки в команду (без ответов модулей). */
export function canPreviewProject(project: Project, userId: string | undefined, isModerator: boolean) {
  if (canAccessProject(project, userId, isModerator)) return true
  if (!userId) return false
  return project.status === "looking"
}
