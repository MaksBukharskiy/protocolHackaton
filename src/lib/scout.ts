import { ROLE_LABEL } from "./labels"
import { ROLES, type Peer, type Project, type Role } from "../types"

export type ScoutLink = { kind: "project" | "peer"; id: string; label: string }
export type ScoutAnswer = { text: string; links: ScoutLink[] }

type Ctx = {
  peers: Peer[]
  projects: Project[]
  me: Peer
  isModerator?: boolean
}

const ROLE_HINTS: Record<Role, string[]> = {
  frontend: ["фронт", "frontend", "react", "typescript", "vite"],
  backend: ["бэк", "backend", "go", "postgres", "node", "devops"],
  mobile: ["мобайл", "mobile", "swift", "flutter"],
  design: ["дизайн", "design", "figma", "ux", "ui"],
  ml: ["ml", "мл", "машин", "нейрон", "pytorch", "nlp", "cv", "python"],
  biz: ["бизнес", "biz", "питч", "custdev", "продукт"],
}

function norm(s: string) {
  return s.toLowerCase().replaceAll("ё", "е")
}

function detectRoles(q: string): Role[] {
  return ROLES.filter((role) => {
    if (q.includes(role) || q.includes(ROLE_LABEL[role])) return true
    return ROLE_HINTS[role].some((hint) => q.includes(hint))
  })
}

function countNeeded(projects: Project[]) {
  const tally: Record<Role, number> = {
    frontend: 0,
    backend: 0,
    mobile: 0,
    design: 0,
    ml: 0,
    biz: 0,
  }
  for (const project of projects) {
    for (const role of project.neededRoles) tally[role] += 1
  }
  return ROLES.map((role) => ({ role, count: tally[role] })).sort((a, b) => b.count - a.count)
}

function topSkills(peers: Peer[], limit = 6) {
  const tally = new Map<string, number>()
  for (const peer of peers) {
    for (const skill of peer.skills) tally.set(skill, (tally.get(skill) ?? 0) + 1)
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function projectLine(project: Project) {
  const need = project.neededRoles.map((role) => ROLE_LABEL[role]).join(", ")
  return `${project.title} — ${project.pitch} Ищем: ${need || "никого"}.`
}

export function greeting(ctx: Ctx): ScoutAnswer {
  return {
    text: `Привет, ${ctx.me.nickname}.`,
    links: [],
  }
}

export function askScout(raw: string, ctx: Ctx): ScoutAnswer {
  const q = norm(raw.trim())
  if (!q) return { text: "Напиши вопрос — например, «кого ищут» или «где нужен фронтенд».", links: [] }

  const roles = detectRoles(q)
  const namedPeer = ctx.peers.find((peer) => {
    const first = norm(peer.name.split(" ")[0] ?? "")
    return q.includes(norm(peer.nickname)) || (first.length >= 3 && q.includes(first))
  })
  const namedProject = ctx.projects.find((project) => q.includes(norm(project.title)))

  if (/(как работать|что ты|помощь|help|умеешь)/.test(q)) {
    return {
      text: "Я читаю живую доску, не интернет. Могу сказать: кого ищут, кто свободен, где нужен стек, кого подобрать тебе и что с твоими откликами.",
      links: [],
    }
  }

  if (/(мо[йи]|отклик|интерес)/.test(q)) {
    const mine = ctx.projects.filter((project) => project.interestIds.includes(ctx.me.id))
    const owned = ctx.projects.filter((project) => project.ownerId === ctx.me.id)
    if (mine.length === 0 && owned.length === 0) {
      return {
        text: "Откликов пока нет. Открой Mentora или IntraMatch и нажми «Хочу в команду» — я сразу это увижу.",
        links: [],
      }
    }
    const lines = [
      mine.length ? `Твои отклики:\n${mine.map((p, i) => `${i + 1}. ${p.title}`).join("\n")}` : "",
      owned.length ? `Твои проекты:\n${owned.map((p, i) => `${i + 1}. ${p.title}`).join("\n")}` : "",
    ].filter(Boolean)
    return {
      text: lines.join("\n\n"),
      links: [...mine, ...owned].map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
    }
  }

  if (/(подбер|совпад|кого мне|под мой|мне команду)/.test(q)) {
    const fits = ctx.projects.filter(
      (project) =>
        !project.memberIds.includes(ctx.me.id) &&
        project.neededRoles.some((role) => ctx.me.roles.includes(role)),
    )
    const partners = ctx.peers.filter(
      (peer) =>
        peer.id !== ctx.me.id &&
        peer.lookingFor !== "none" &&
        !peer.roles.every((role) => ctx.me.roles.includes(role)),
    )
    if (fits.length === 0) {
      return {
        text: `Под ${ctx.me.roles.map((r) => ROLE_LABEL[r]).join(", ")} открытых слотов нет. Посмотри, кто ищет кофаундера — или создай свой проект.`,
        links: partners.slice(0, 3).map((p) => ({ kind: "peer" as const, id: p.id, label: p.nickname })),
      }
    }
    return {
      text: `Тебе по ролям ${ctx.me.roles.map((r) => ROLE_LABEL[r]).join(", ")} подходят:\n${fits
        .map((p, i) => `${i + 1}. ${projectLine(p)}`)
        .join("\n")}\n\nРядом свободны: ${partners
        .slice(0, 3)
        .map((p) => p.nickname)
        .join(", ") || "пока никого"}.`,
      links: [
        ...fits.map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
        ...partners.slice(0, 3).map((p) => ({ kind: "peer" as const, id: p.id, label: p.nickname })),
      ],
    }
  }

  if (namedProject) {
    const owner = ctx.peers.find((p) => p.id === namedProject.ownerId)
    return {
      text: `${namedProject.title}: ${namedProject.pitch}\nВладелец — ${owner?.nickname ?? "неизвестен"}. В команде ${namedProject.memberIds.length}, откликов ${namedProject.interestIds.length}. Ищем: ${namedProject.neededRoles.map((r) => ROLE_LABEL[r]).join(", ") || "никого"}.`,
      links: [{ kind: "project", id: namedProject.id, label: namedProject.title }],
    }
  }

  if (namedPeer) {
    const owned = ctx.projects.filter((p) => p.ownerId === namedPeer.id)
    return {
      text: `${namedPeer.nickname} · ${namedPeer.name}, ${namedPeer.campus}. ${namedPeer.bio}\nРоли: ${namedPeer.roles.map((r) => ROLE_LABEL[r]).join(", ")}. Навыки: ${namedPeer.skills.join(", ")}.`,
      links: [
        { kind: "peer", id: namedPeer.id, label: namedPeer.nickname },
        ...owned.map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
      ],
    }
  }

  if (roles.length && /(ищ|нуж|слот|вакан|проект)/.test(q)) {
    const hits = ctx.projects.filter((project) => project.neededRoles.some((role) => roles.includes(role)))
    if (hits.length === 0) {
      return { text: `Слотов на ${roles.map((r) => ROLE_LABEL[r]).join(", ")} сейчас нет.`, links: [] }
    }
    return {
      text: `Ищут ${roles.map((r) => ROLE_LABEL[r]).join(", ")}:\n${hits
        .map((p, i) => `${i + 1}. ${projectLine(p)}`)
        .join("\n")}`,
      links: hits.map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
    }
  }

  if (roles.length && /(кто|пир|люд|свобод)/.test(q)) {
    const hits = ctx.peers.filter((peer) => peer.roles.some((role) => roles.includes(role)))
    return {
      text: `Пиры со стеком ${roles.map((r) => ROLE_LABEL[r]).join(", ")}:\n${hits
        .map((p, i) => `${i + 1}. ${p.nickname} — ${p.lookingFor === "none" ? "занят" : "открыт к команде"}`)
        .join("\n")}`,
      links: hits.map((p) => ({ kind: "peer" as const, id: p.id, label: p.nickname })),
    }
  }

  if (/(свобод|открыт|ищет команду|кофаунд|кого набрать)/.test(q)) {
    const open = ctx.peers.filter((peer) => peer.lookingFor !== "none")
    return {
      text: `Открыты к команде:\n${open
        .map((p, i) => `${i + 1}. ${p.nickname} — ${p.roles.map((r) => ROLE_LABEL[r]).join(", ")}`)
        .join("\n")}`,
      links: open.map((p) => ({ kind: "peer" as const, id: p.id, label: p.nickname })),
    }
  }

  if (/(кого ищ|слот|ваканс|открыт.*проект|ищем команду)/.test(q)) {
    const looking = ctx.projects.filter((p) => p.status === "looking")
    return {
      text: `Проекты, которым нужна команда:\n${looking
        .map((p, i) => `${i + 1}. ${projectLine(p)}`)
        .join("\n")}`,
      links: looking.map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
    }
  }

  if (/(топ|навык|скилл|часто)/.test(q)) {
    const skills = topSkills(ctx.peers)
    const needed = countNeeded(ctx.projects)
    return {
      text: `Топ навыков на доске:\n${skills
        .map(([name, n], i) => `${i + 1}. ${name} — ${n}`)
        .join("\n")}\n\nЧаще ищут: ${needed
        .filter((x) => x.count)
        .map((x) => `${ROLE_LABEL[x.role]} (${x.count})`)
        .join(", ")}.`,
      links: [],
    }
  }

  if (/(сколько|стат|обзор|сводк)/.test(q)) {
    const looking = ctx.projects.filter((p) => p.status === "looking").length
    const open = ctx.peers.filter((p) => p.lookingFor !== "none").length
    return {
      text: `На доске ${ctx.projects.length} проектов, ${ctx.peers.length} пиров. Ищут команду: ${looking}. Открыты к сборке: ${open}.`,
      links: [],
    }
  }

  if (roles.length) {
    const projects = ctx.projects.filter((p) => p.neededRoles.some((role) => roles.includes(role)))
    const people = ctx.peers.filter((p) => p.roles.some((role) => roles.includes(role)))
    return {
      text: `По запросу «${roles.map((r) => ROLE_LABEL[r]).join(", ")}» вижу ${projects.length} проектов и ${people.length} пиров. Уточни: слоты или люди?`,
      links: [
        ...projects.slice(0, 3).map((p) => ({ kind: "project" as const, id: p.id, label: p.title })),
        ...people.slice(0, 3).map((p) => ({ kind: "peer" as const, id: p.id, label: p.nickname })),
      ],
    }
  }

  return {
    text: "Не разобрал формулировку. Спроси «кого ищут», «кто свободен», «где нужен фронтенд» или «кого подобрать мне» — отвечаю по живой доске.",
    links: [],
  }
}

export function scoutStats(ctx: Ctx) {
  const needed = countNeeded(ctx.projects)
  return {
    topRole: needed[0],
    looking: ctx.projects.filter((p) => p.status === "looking").length,
    openPeers: ctx.peers.filter((p) => p.lookingFor !== "none").length,
    projects: ctx.projects.length,
    interests: ctx.projects.reduce((sum, p) => sum + p.interestIds.length, 0),
  }
}
