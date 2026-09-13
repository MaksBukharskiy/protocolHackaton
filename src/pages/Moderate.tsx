import { useMemo, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { currentModuleId, doneCount, isComplete, MODULES } from "../lib/modules"
import { useStore } from "../store"

const CAMPUSES = ["all", "Ташкент", "Самарканд"] as const

export function ModeratePage() {
  const { isModerator, projects, peerById } = useStore()
  const [campus, setCampus] = useState<(typeof CAMPUSES)[number]>("all")

  const rows = useMemo(() => {
    return projects
      .map((project) => {
        const owner = peerById(project.ownerId)
        const done = doneCount(project)
        const current = MODULES.find((item) => item.id === currentModuleId(project))
        return { project, owner, done, current, complete: isComplete(project) }
      })
      .filter((row) => campus === "all" || row.owner?.campus === campus)
      .sort((a, b) => b.done - a.done)
  }, [campus, peerById, projects])

  if (!isModerator) return <Navigate to="/" replace />

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-mute">Launch Lab 21</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Модерация</h1>
          <p className="mt-2 text-sm text-mute">
            Все команды инкубатора: прогресс модулей, кампус, быстрый доступ к ответам и one-pager.
          </p>
        </div>
        <label className="text-xs text-mute">
          Кампус
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value as (typeof CAMPUSES)[number])}
            className="mt-1 block rounded-xl border border-line bg-panel px-3 py-2 text-sm text-white"
          >
            <option value="all">Все</option>
            <option value="Ташкент">Ташкент</option>
            <option value="Самарканд">Самарканд</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <p className="rounded-full border border-line px-3 py-1 text-mute">
          команд: <span className="text-white">{rows.length}</span>
        </p>
        <p className="rounded-full border border-line px-3 py-1 text-mute">
          one-pager готов:{" "}
          <span className="text-white">{rows.filter((row) => row.complete).length}</span>
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <div className="grid min-w-[52rem] grid-cols-[1.3fr_0.9fr_0.7fr_0.6fr_0.8fr_auto] gap-3 border-b border-line px-4 py-3 text-[11px] uppercase tracking-wider text-mute">
          <span>проект</span>
          <span>владелец</span>
          <span>кампус</span>
          <span>прогресс</span>
          <span>сейчас</span>
          <span />
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-mute">Нет команд по этому фильтру.</p>
        ) : (
          rows.map(({ project, owner, done, current, complete }) => (
            <div
              key={project.id}
              className="grid min-w-[52rem] grid-cols-[1.3fr_0.9fr_0.7fr_0.6fr_0.8fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{project.title}</p>
                <p className="truncate text-xs text-mute">{project.teamName}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm">{owner?.nickname ?? "—"}</p>
                <p className="truncate text-xs text-mute">{owner?.name ?? ""}</p>
              </div>
              <p className="truncate text-sm text-mute">{owner?.campus ?? "—"}</p>
              <div>
                <p className="text-sm">
                  {done}/{MODULES.length}
                </p>
                <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(done / MODULES.length) * 100}%` }}
                  />
                </div>
                {complete ? <p className="mt-1 text-[10px] uppercase tracking-wider text-accent">готово</p> : null}
              </div>
              <p className="truncate text-sm text-mute">{current?.title}</p>
              <div className="flex gap-2">
                <Link to={`/project/${project.id}`} className="text-xs text-accent">
                  ответы
                </Link>
                <Link to={`/project/${project.id}/onepager`} className="text-xs text-mute hover:text-white">
                  pager
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Модули программы</h2>
        <p className="mt-1 text-sm text-mute">Шаблон Launch Lab: порядок фиксирован, ответы копятся в one-pager.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {MODULES.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-sm">
                {index + 1}. {item.title}
              </p>
              <p className="mt-1 text-xs text-mute">{item.hint}</p>
              <p className="mt-2 text-xs text-mute">{item.fields.map((field) => field.label).join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
