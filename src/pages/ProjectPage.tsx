import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Avatar, Empty, FieldLabel, inputClass } from "../components/ui"
import {
  canAccessProject,
  currentModuleId,
  doneCount,
  isModuleDone,
  isUnlocked,
  MODULES,
} from "../lib/modules"
import { useStore } from "../store"
import type { ModuleId } from "../types"

export function ProjectPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { projects, currentUser, isModerator, peerById, saveAnswer, updateProject } = useStore()
  const project = projects.find((item) => item.id === id)
  const requested = params.get("m") as ModuleId | null
  const canOpen = (moduleId: ModuleId) => Boolean(project && (isModerator || isUnlocked(project, moduleId)))
  const selected =
    project && requested && MODULES.some((item) => item.id === requested) && canOpen(requested)
      ? requested
      : project
        ? currentModuleId(project)
        : "problem"
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [title, setTitle] = useState("")
  const [teamName, setTeamName] = useState("")
  const [pitch, setPitch] = useState("")

  useEffect(() => {
    setDraft(project?.answers[selected] ?? {})
    setSaved(false)
  }, [project?.id, selected])

  useEffect(() => {
    if (!project) return
    setTitle(project.title)
    setTeamName(project.teamName)
    setPitch(project.pitch)
  }, [project])

  if (!project || !currentUser) {
    return <Empty title="Проект не найден" hint="Создай свой или открой свой из обзора." />
  }

  if (!canAccessProject(project, currentUser.id, isModerator)) {
    return <Empty title="Закрыто" />
  }

  const board = project
  const canEdit = board.memberIds.includes(currentUser.id) || isModerator
  const module = MODULES.find((item) => item.id === selected) ?? MODULES[0]
  const done = doneCount(board)
  const nextModule = MODULES.find(
    (item, index) => index > MODULES.findIndex((step) => step.id === module.id) && isUnlocked(board, item.id),
  )

  function openModule(moduleId: ModuleId) {
    if (!isModerator && !isUnlocked(board, moduleId)) return
    setParams({ m: moduleId })
  }

  function onSave() {
    saveAnswer(board.id, module.id, draft)
    setSaved(true)
  }

  function onSaveProfile() {
    updateProject(board.id, { title: title.trim(), teamName: teamName.trim(), pitch: pitch.trim() })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="text-xs text-mute hover:text-white">
        ← назад
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-mute">{project.teamName}</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">{project.title}</h1>
          <p className="mt-2 max-w-2xl text-mute">{project.pitch}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-sm text-mute">
            {done}/{MODULES.length}
          </p>
          <Link
            to={`/project/${project.id}/onepager`}
            className="rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110"
          >
            One-pager
          </Link>
        </div>
      </div>

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs uppercase tracking-wider text-mute">профиль проекта</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <FieldLabel>название</FieldLabel>
              <input className={inputClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <FieldLabel>команда</FieldLabel>
              <input className={inputClass()} value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <FieldLabel>краткое описание</FieldLabel>
            <textarea className={`${inputClass()} min-h-20`} value={pitch} onChange={(e) => setPitch(e.target.value)} />
          </div>
          <p className="mt-3 text-xs text-mute">
            состав:{" "}
            {project.memberIds
              .map((memberId) => peerById(memberId)?.nickname)
              .filter(Boolean)
              .join(", ")}
          </p>
          <button type="button" onClick={onSaveProfile} className="mt-3 text-sm text-accent">
            Сохранить профиль
          </button>
        </section>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <ol className="flex flex-col">
          {MODULES.map((item, index) => {
            const open = isModerator || isUnlocked(project, item.id)
            const doneItem = isModuleDone(project, item.id)
            const here = item.id === module.id
            const last = index === MODULES.length - 1
            return (
              <li key={item.id} className="flex flex-col">
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => openModule(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                    here
                      ? "border-accent bg-accent/10"
                      : open
                        ? "border-line bg-panel hover:border-accent/60"
                        : "cursor-not-allowed border-line/60 bg-ink text-mute"
                  }`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-full text-xs ${
                      doneItem ? "bg-accent text-ink" : here ? "bg-white text-ink" : "bg-white/5"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">{item.title}</span>
                    <span className="block text-[11px] text-mute">
                      {doneItem ? "пройден" : here ? "сейчас" : open ? "открыт" : "закрыт"}
                    </span>
                  </span>
                </button>
                {!last ? (
                  <div
                    className={`flex justify-center py-1.5 ${doneItem ? "text-accent" : "text-mute/50"}`}
                    aria-hidden
                  >
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                      <path
                        d="M7 1v12M7 13l-4-4M7 13l4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-2xl font-semibold">{module.title}</h2>
          <p className="mt-1 text-sm text-mute">{module.hint}</p>

          <div className="mt-5 grid gap-4">
            {module.fields.map((field) => (
              <div key={field.id}>
                <FieldLabel>{field.label}</FieldLabel>
                <textarea
                  className={`${inputClass()} min-h-20`}
                  value={draft[field.id] ?? ""}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    setDraft((prev) => ({ ...prev, [field.id]: e.target.value }))
                    setSaved(false)
                  }}
                />
              </div>
            ))}
          </div>

          {canEdit ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onSave} className="rounded-full bg-accent px-5 py-2.5 text-sm text-ink">
                Сохранить ответ
              </button>
              {saved && nextModule ? (
                <button type="button" onClick={() => openModule(nextModule.id)} className="text-sm text-accent">
                  Дальше → {nextModule.title}
                </button>
              ) : null}
              {saved ? (
                <Link to={`/project/${project.id}/onepager`} className="text-sm text-accent">
                  One-pager →
                </Link>
              ) : null}
              {saved ? <span className="text-xs text-mute">сохранено</span> : null}
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-wider text-mute">состав команды</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.memberIds.map((memberId) => {
            const member = peerById(memberId)
            if (!member) return null
            return (
              <div key={member.id} className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5">
                <Avatar id={member.id} nickname={member.nickname} size="sm" />
                <span className="text-sm">{member.nickname}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
