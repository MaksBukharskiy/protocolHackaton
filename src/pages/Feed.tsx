import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { Empty } from "../components/ui"
import { ROLE_LABEL, STATUS_LABEL } from "../lib/labels"
import { useStore } from "../store"
import { PROJECT_STATUSES, ROLES, type ProjectStatus, type Role } from "../types"

export function FeedPage() {
  const { projects } = useStore()
  const [status, setStatus] = useState<ProjectStatus | "all">("all")
  const [role, setRole] = useState<Role | "all">("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((project) => {
      if (status !== "all" && project.status !== status) return false
      if (role !== "all" && !project.neededRoles.includes(role)) return false
      if (!q) return true
      const blob = `${project.title} ${project.pitch} ${project.stack.join(" ")}`.toLowerCase()
      return blob.includes(q)
    })
  }, [projects, query, role, status])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">лента</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Кого ищут в команду</h1>
        </div>
        <Link
          to="/new"
          className="rounded-full bg-lime px-4 py-2 font-mono text-sm text-ink hover:brightness-110"
        >
          Создать проект
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus | "all")}
          className="rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs"
        >
          <option value="all">все статусы</option>
          {PROJECT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {STATUS_LABEL[item]}
            </option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "all")}
          className="rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs"
        >
          <option value="all">любая роль</option>
          {ROLES.map((item) => (
            <option key={item} value={item}>
              ищем {ROLE_LABEL[item]}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="стек или название"
          className="min-w-48 flex-1 rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs outline-none focus:border-lime"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <Empty title="Нет проектов с таким фильтром" hint="Сбрось роль или статус — доска сразу оживает." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
