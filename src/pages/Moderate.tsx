import { useMemo, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { Avatar, FieldLabel, inputClass } from "../components/ui"
import {
  currentModuleId,
  doneCount,
  isComplete,
  type TemplateField,
} from "../lib/modules"
import { useStore } from "../store"

const CAMPUSES = ["all", "Ташкент", "Самарканд"] as const

type FieldDraft = { label: string; placeholder: string }

const emptyField = (): FieldDraft => ({ label: "", placeholder: "" })

export function ModeratePage() {
  const {
    isModerator,
    projects,
    peerById,
    acceptMember,
    rejectInterest,
    modules,
    addModule,
    deleteModule,
    moveModule,
  } = useStore()
  const [campus, setCampus] = useState<(typeof CAMPUSES)[number]>("all")
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [hint, setHint] = useState("")
  const [fields, setFields] = useState<FieldDraft[]>([emptyField(), emptyField()])

  const rows = useMemo(() => {
    return projects
      .map((project) => {
        const owner = peerById(project.ownerId)
        const done = doneCount(project, modules)
        const current = modules.find((item) => item.id === currentModuleId(project, modules))
        const pending = project.interestIds.length
        return { project, owner, done, current, complete: isComplete(project, modules), pending }
      })
      .filter((row) => campus === "all" || row.owner?.campus === campus)
      .sort((a, b) => {
        if (b.pending !== a.pending) return b.pending - a.pending
        return b.done - a.done
      })
  }, [campus, modules, peerById, projects])

  const pendingApps = useMemo(() => {
    return projects
      .flatMap((project) =>
        project.interestIds.map((peerId) => ({
          project,
          peer: peerById(peerId),
          owner: peerById(project.ownerId),
        })),
      )
      .filter((row) => row.peer && (campus === "all" || row.owner?.campus === campus))
  }, [campus, peerById, projects])

  const completeCount = rows.filter((row) => row.complete).length
  const pendingCount = pendingApps.length
  const moduleTotal = modules.length || 1

  if (!isModerator) return <Navigate to="/" replace />

  function resetForm() {
    setTitle("")
    setHint("")
    setFields([emptyField(), emptyField()])
    setAdding(false)
  }

  function onAddModule() {
    const payload: TemplateField[] = fields.map((field, index) => ({
      id: `f${index + 1}`,
      label: field.label,
      placeholder: field.placeholder,
    }))
    const id = addModule({ title, hint, fields: payload })
    if (id) resetForm()
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Модерация</h1>
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-line bg-panel p-1">
          {CAMPUSES.map((item) => {
            const active = campus === item
            const label = item === "all" ? "Все" : item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCampus(item)}
                className={`rounded-xl px-3.5 py-2 text-sm transition-colors ${
                  active ? "bg-accent text-ink" : "text-mute hover:text-white"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="команд" value={rows.length} />
        <Stat label="one-pager готов" value={completeCount} accent={completeCount > 0} />
        <Stat label="заявки ждут" value={pendingCount} accent={pendingCount > 0} />
      </div>

      {pendingApps.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Заявки</h2>
            <p className="text-xs text-mute">{pendingApps.length}</p>
          </div>
          <div className="grid gap-3">
            {pendingApps.map(({ project, peer }) => {
              if (!peer) return null
              return (
                <div
                  key={`${project.id}-${peer.id}`}
                  className="flex flex-col gap-4 rounded-2xl border border-accent/35 bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar id={peer.id} nickname={peer.nickname} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{peer.nickname}</p>
                      <p className="truncate text-xs text-mute">
                        {peer.name} · {peer.campus}
                      </p>
                      <p className="mt-1.5 truncate text-sm text-mute">
                        →{" "}
                        <Link to={`/project/${project.id}`} className="text-white hover:text-accent">
                          {project.title}
                        </Link>
                        <span className="text-mute"> · {project.teamName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => acceptMember(project.id, peer.id)}
                      className="rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110"
                    >
                      Принять
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectInterest(project.id, peer.id)}
                      className="rounded-full border border-line px-4 py-2 text-sm text-mute hover:border-white/20 hover:text-white"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Команды</h2>
          <p className="text-xs text-mute">{campus === "all" ? "все" : campus}</p>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-mute">
            Нет команд по этому фильтру.
          </p>
        ) : (
          <div className="grid gap-3">
            {rows.map(({ project, owner, done, current, complete, pending }) => {
              const pct = Math.round((done / moduleTotal) * 100)
              const commentCount = project.comments?.length ?? 0
              return (
                <article
                  key={project.id}
                  className="rounded-2xl border border-line bg-panel p-4 transition-colors hover:border-white/15 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-medium sm:text-lg">{project.title}</h3>
                        {complete ? (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                            готово
                          </span>
                        ) : null}
                        {pending > 0 ? (
                          <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                            {pending} заявк{pending === 1 ? "а" : pending < 5 ? "и" : "ок"}
                          </span>
                        ) : null}
                        {commentCount > 0 ? (
                          <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
                            {commentCount} коммент.
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-mute">{project.teamName}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        to={`/project/${project.id}`}
                        className="rounded-full bg-accent px-3.5 py-2 text-xs font-medium text-ink hover:brightness-110 sm:text-sm"
                      >
                        Ответы
                      </Link>
                      <Link
                        to={`/project/${project.id}/onepager`}
                        className="rounded-full border border-line px-3.5 py-2 text-xs text-mute hover:border-white/20 hover:text-white sm:text-sm"
                      >
                        One-pager
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 min-w-0">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
                      <span>
                        <span className="text-white">{owner?.nickname ?? "—"}</span>
                        {owner?.name ? ` · ${owner.name}` : ""}
                      </span>
                      <span>{owner?.campus ?? "—"}</span>
                      <span className="truncate">сейчас: {current?.title ?? "—"}</span>
                    </div>
                    {commentCount > 0 ? (
                      <p className="mt-2 line-clamp-2 text-sm text-mute">
                        {project.comments[commentCount - 1]?.text}
                      </p>
                    ) : null}
                    <div className="mt-3">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-mute">модули</span>
                        <span>
                          {done}/{modules.length}
                          <span className="text-mute"> · {pct}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                        <div
                          className="h-full rounded-full bg-accent transition-[width]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Модули</h2>
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-full bg-accent px-3.5 py-2 text-sm text-ink hover:brightness-110"
            >
              Добавить
            </button>
          ) : null}
        </div>

        <div className="grid gap-2">
          {modules.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="text-mute">{index + 1}.</span> {item.title}
                </p>
                {item.hint ? <p className="mt-1 text-xs text-mute">{item.hint}</p> : null}
                <p className="mt-1.5 text-xs text-mute">
                  {item.fields.map((field) => field.label).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveModule(item.id, -1)}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-mute disabled:opacity-30 hover:enabled:border-white/20 hover:enabled:text-white"
                  aria-label="Выше"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === modules.length - 1}
                  onClick={() => moveModule(item.id, 1)}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-mute disabled:opacity-30 hover:enabled:border-white/20 hover:enabled:text-white"
                  aria-label="Ниже"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={modules.length <= 1}
                  onClick={() => {
                    if (window.confirm(`Удалить модуль «${item.title}»?`)) deleteModule(item.id)
                  }}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-mute disabled:opacity-30 hover:enabled:border-red-500/40 hover:enabled:text-red-300"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="mt-4 rounded-2xl border border-line bg-panel p-4 sm:p-5">
            <p className="text-sm font-medium">Новый модуль</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>название</FieldLabel>
                <input
                  className={inputClass()}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Пилот"
                />
              </div>
              <div>
                <FieldLabel>подсказка</FieldLabel>
                <input
                  className={inputClass()}
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="Коротко для участников"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <FieldLabel>поле {index + 1}</FieldLabel>
                    <input
                      className={inputClass()}
                      value={field.label}
                      onChange={(e) =>
                        setFields((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)),
                        )
                      }
                      placeholder="Лейбл"
                    />
                  </div>
                  <div>
                    <FieldLabel>placeholder</FieldLabel>
                    <input
                      className={inputClass()}
                      value={field.placeholder}
                      onChange={(e) =>
                        setFields((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, placeholder: e.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Подсказка в поле"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      disabled={fields.length <= 1}
                      onClick={() => setFields((prev) => prev.filter((_, i) => i !== index))}
                      className="rounded-lg border border-line px-3 py-2.5 text-xs text-mute disabled:opacity-30 hover:enabled:text-white"
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFields((prev) => [...prev, emptyField()])}
                className="rounded-full border border-line px-3.5 py-2 text-sm text-mute hover:border-white/20 hover:text-white"
              >
                + поле
              </button>
              <button
                type="button"
                onClick={onAddModule}
                disabled={!title.trim() || !fields.some((field) => field.label.trim())}
                className="rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110 disabled:opacity-40"
              >
                Сохранить модуль
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-line px-3.5 py-2 text-sm text-mute hover:text-white"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
      <p className="text-xs text-mute">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  )
}
