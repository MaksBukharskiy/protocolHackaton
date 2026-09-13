import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { FieldLabel, inputClass } from "../components/ui"
import { ROLE_LABEL, STATUS_LABEL } from "../lib/labels"
import { useStore } from "../store"
import { PROJECT_STATUSES, ROLES, type ProjectStatus, type Role } from "../types"

function toggleRole(roles: Role[], role: Role) {
  return roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]
}

export function NewProjectPage() {
  const { createProject } = useStore()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [teamName, setTeamName] = useState("")
  const [pitch, setPitch] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("looking")
  const [stack, setStack] = useState("")
  const [neededRoles, setNeededRoles] = useState<Role[]>(["frontend"])
  const [roster, setRoster] = useState("")

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const id = createProject({
      title: title.trim(),
      teamName: teamName.trim(),
      pitch: pitch.trim(),
      status,
      stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
      neededRoles,
      extraMembers: roster.split(",").map((item) => item.trim()).filter(Boolean),
    })
    navigate(`/project/${id}`)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">Проект</h1>

      <div className="mt-8 grid gap-4">
        <div>
          <FieldLabel>название</FieldLabel>
          <input
            className={inputClass()}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="IntraMatch"
            required
          />
        </div>
        <div>
          <FieldLabel>название команды</FieldLabel>
          <input
            className={inputClass()}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Слот"
            required
          />
        </div>
        <div>
          <FieldLabel>состав команды, ники через запятую</FieldLabel>
          <input
            className={inputClass()}
            value={roster}
            onChange={(e) => setRoster(e.target.value)}
            placeholder="akostyl, mivanov"
          />
        </div>
        <div>
          <FieldLabel>краткое описание</FieldLabel>
          <textarea
            className={`${inputClass()} min-h-28`}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Одной-двумя фразами: что это и кого не хватает"
            required
          />
        </div>
        <div>
          <FieldLabel>статус</FieldLabel>
          <select
            className={inputClass()}
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {PROJECT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>стек через запятую</FieldLabel>
          <input
            className={inputClass()}
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="React, Go, Figma"
          />
        </div>
        <div>
          <FieldLabel>кого ищем</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setNeededRoles(toggleRole(neededRoles, role))}
                className={`rounded-full border px-3 py-1 text-xs ${
                  neededRoles.includes(role) ? "border-accent bg-accent text-ink" : "border-line text-mute"
                }`}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className="mt-8 rounded-full bg-accent px-5 py-2.5 text-sm text-ink">
        Открыть модуль
      </button>
    </form>
  )
}
