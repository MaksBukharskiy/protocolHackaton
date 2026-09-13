import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Brand } from "../components/Logo"
import { Avatar, Empty, inputClass } from "../components/ui"
import { canAccessProject, isComplete, isFieldFilled, MODULES, moduleLines } from "../lib/modules"
import { useStore } from "../store"

export function OnePagerPage() {
  const { id } = useParams()
  const { projects, currentUser, isModerator, peerById, updateProject } = useStore()
  const project = projects.find((item) => item.id === id)
  const [note, setNote] = useState("")
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNote(project?.pagerNote ?? "")
  }, [project?.id, project?.pagerNote])

  if (!project || !currentUser) return <Empty title="Проект не найден" />
  if (!canAccessProject(project, currentUser.id, isModerator)) {
    return <Empty title="Закрыто" />
  }

  const board = project
  const members = board.memberIds.map((memberId) => peerById(memberId)).filter(Boolean)
  const ready = isComplete(board)
  const canEdit = board.memberIds.includes(currentUser.id) || isModerator

  function onSaveNote() {
    updateProject(board.id, { pagerNote: note.trim() })
    setSaved(true)
    setEditing(false)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/project/${project.id}`} className="text-xs text-mute hover:text-white">
          ← назад
        </Link>
        <p className="text-xs text-mute">{ready ? "готово" : "черновик"}</p>
      </div>

      <article className="mt-6 rounded-3xl border border-line bg-panel px-6 py-8 sm:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">one-pager</p>
        <Brand />
        <p className="mt-6 text-sm text-mute">{project.teamName}</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-mute">{project.pitch}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {members.map((member) =>
            member ? (
              <div key={member.id} className="flex items-center gap-2">
                <Avatar id={member.id} nickname={member.nickname} size="sm" />
                <span className="text-sm">{member.nickname}</span>
              </div>
            ) : null,
          )}
        </div>

        <div className="mt-10 space-y-8">
          {MODULES.map((item, index) => {
            const lines = moduleLines(project, item.id)
            const empty = lines.every((line) => !isFieldFilled(line.value))
            return (
              <section key={item.id}>
                <p className="text-[11px] uppercase tracking-wider text-mute">
                  {index + 1}. {item.title}
                </p>
                {empty ? (
                  <p className="mt-2 text-mute">ещё не пройдено</p>
                ) : (
                  <dl className="mt-3 space-y-3">
                    {lines.map((line) => (
                      <div key={line.label}>
                        <dt className="text-xs text-accent">{line.label}</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-base leading-relaxed">
                          {isFieldFilled(line.value) ? line.value : "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            )
          })}
        </div>

        <section className="mt-10 border-t border-line pt-6">
          <p className="text-[11px] uppercase tracking-wider text-mute">заметка one-pager</p>
          {editing && canEdit ? (
            <>
              <textarea
                className={`${inputClass()} mt-3 min-h-24`}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setSaved(false)
                }}
                placeholder="Заметка"
              />
              <button type="button" onClick={onSaveNote} className="mt-3 text-sm text-accent">
                Сохранить
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-base leading-relaxed">{project.pagerNote || "—"}</p>
              {canEdit ? (
                <button type="button" onClick={() => setEditing(true)} className="mt-3 text-sm text-accent">
                  Править
                </button>
              ) : null}
            </>
          )}
          {saved ? <p className="mt-2 text-xs text-mute">сохранено</p> : null}
        </section>
      </article>
    </div>
  )
}
