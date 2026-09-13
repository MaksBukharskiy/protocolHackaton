import { LOOKING_LABEL, ROLE_LABEL, STATUS_LABEL } from "./labels"
import { DEFAULT_MODULES, moduleLines, isFieldFilled, doneCount, canAccessProject } from "./modules"
import type { ModuleDef, Peer, Project } from "../types"
import type { ScoutLink } from "./scout"

export type RagChunk = {
  id: string
  kind: "peer" | "project" | "module" | "meta"
  link?: ScoutLink
  text: string
  tokens: string[]
}

export type RagCtx = {
  peers: Peer[]
  projects: Project[]
  me: Peer
  isModerator: boolean
  modules?: ModuleDef[]
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ё", "е")
    .split(/[^a-zа-я0-9_+#.-]+/i)
    .filter((t) => t.length > 1)
}

function uniqueTokens(text: string) {
  return [...new Set(tokenize(text))]
}

export function buildCorpus(ctx: RagCtx): RagChunk[] {
  const chunks: RagChunk[] = []
  const modules = ctx.modules && ctx.modules.length > 0 ? ctx.modules : DEFAULT_MODULES

  chunks.push({
    id: "meta-me",
    kind: "meta",
    text: `Текущий пользователь: ${ctx.me.nickname} (${ctx.me.name}). Роль доступа: ${
      ctx.isModerator ? "модератор" : "участник"
    }. Кампус ${ctx.me.campus}. Роли: ${ctx.me.roles
      .map((r) => ROLE_LABEL[r])
      .join(", ")}. Навыки: ${ctx.me.skills.join(", ")}. Статус: ${LOOKING_LABEL[ctx.me.lookingFor]}. Био: ${ctx.me.bio}`,
    tokens: uniqueTokens(
      `${ctx.me.nickname} ${ctx.me.name} ${ctx.me.skills.join(" ")} ${ctx.me.roles.join(" ")} ${ctx.me.bio}`,
    ),
  })

  chunks.push({
    id: "meta-board",
    kind: "meta",
    text: `На доске protocol ${ctx.projects.length} проектов и ${ctx.peers.length} пиров. Ищут команду: ${
      ctx.projects.filter((p) => p.status === "looking").length
    }. Открыты к сборке: ${ctx.peers.filter((p) => p.lookingFor !== "none").length}.`,
    tokens: uniqueTokens("доска статистика проекты пиры слоты команда"),
  })

  for (const peer of ctx.peers) {
    const text = [
      `Пир ${peer.nickname} / ${peer.name}.`,
      `Кампус ${peer.campus}, ${peer.cohort}.`,
      `Роли: ${peer.roles.map((r) => ROLE_LABEL[r]).join(", ")}.`,
      `Навыки: ${peer.skills.join(", ")}.`,
      `Ищет: ${LOOKING_LABEL[peer.lookingFor]}.`,
      peer.bio,
    ].join(" ")
    chunks.push({
      id: `peer:${peer.id}`,
      kind: "peer",
      link: { kind: "peer", id: peer.id, label: peer.nickname },
      text,
      tokens: uniqueTokens(text),
    })
  }

  for (const project of ctx.projects) {
    const privateOk = canAccessProject(project, ctx.me.id, ctx.isModerator)
    const need = project.neededRoles.map((r) => ROLE_LABEL[r]).join(", ")

    const publicText = [
      `Проект ${project.title}, команда ${project.teamName}.`,
      `Статус: ${STATUS_LABEL[project.status]}.`,
      project.pitch,
      `Стек: ${project.stack.join(", ")}.`,
      `Нужны роли: ${need || "никого"}.`,
      `Состав: ${project.memberIds.length}.`,
      privateOk ? `Модули пройдено: ${doneCount(project, modules)}/${modules.length}.` : "",
      privateOk && project.pagerNote ? `Заметка one-pager: ${project.pagerNote}` : "",
      !privateOk ? "Ответы модулей и one-pager закрыты." : "",
    ]
      .filter(Boolean)
      .join(" ")

    chunks.push({
      id: `project:${project.id}`,
      kind: "project",
      link: privateOk ? { kind: "project", id: project.id, label: project.title } : undefined,
      text: publicText,
      tokens: uniqueTokens(publicText),
    })

    if (!privateOk) continue

    for (const module of modules) {
      const lines = moduleLines(project, module.id, modules).filter((line) => isFieldFilled(line.value))
      if (lines.length === 0) continue
      const body = lines.map((line) => `${line.label}: ${line.value}`).join(". ")
      const text = `Проект ${project.title}, модуль ${module.title}. ${body}`
      chunks.push({
        id: `module:${project.id}:${module.id}`,
        kind: "module",
        link: { kind: "project", id: project.id, label: project.title },
        text,
        tokens: uniqueTokens(text),
      })
    }
  }

  return chunks
}

function scoreChunk(queryTokens: string[], chunk: RagChunk) {
  if (queryTokens.length === 0) return 0
  let hits = 0
  for (const token of queryTokens) {
    if (chunk.tokens.includes(token)) hits += 1
    else if (chunk.tokens.some((t) => t.includes(token) || token.includes(t))) hits += 0.4
  }
  return hits / queryTokens.length + Math.min(chunk.tokens.length, 40) * 0.001
}

export function retrieve(query: string, corpus: RagChunk[], limit = 6) {
  const queryTokens = uniqueTokens(query)
  return [...corpus]
    .map((chunk) => ({ chunk, score: scoreChunk(queryTokens, chunk) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.chunk)
}

export function linksFromChunks(chunks: RagChunk[]): ScoutLink[] {
  const seen = new Set<string>()
  const links: ScoutLink[] = []
  for (const chunk of chunks) {
    if (!chunk.link) continue
    const key = `${chunk.link.kind}:${chunk.link.id}`
    if (seen.has(key)) continue
    seen.add(key)
    links.push(chunk.link)
  }
  return links
}

export function contextBlock(chunks: RagChunk[]) {
  if (chunks.length === 0) return "Контекст пуст."
  return chunks.map((chunk, i) => `[${i + 1}] ${chunk.text}`).join("\n\n")
}
