import { Link, Navigate } from "react-router-dom"
import { currentModuleId, doneCount, MODULES } from "../lib/modules"
import { useStore } from "../store"

export function ModeratePage() {
  const { isModerator, projects, peerById } = useStore()

  if (!isModerator) return <Navigate to="/" replace />

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Модерация</h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <div className="grid min-w-[44rem] grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr_auto] gap-3 border-b border-line px-4 py-3 text-[11px] uppercase tracking-wider text-mute">
          <span>проект</span>
          <span>команда</span>
          <span>прогресс</span>
          <span>сейчас</span>
          <span />
        </div>
        {projects.map((project) => {
          const owner = peerById(project.ownerId)
          const current = MODULES.find((item) => item.id === currentModuleId(project))
          const done = doneCount(project)
          return (
            <div
              key={project.id}
              className="grid min-w-[44rem] grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{project.title}</p>
                <p className="truncate text-xs text-mute">{owner?.nickname ?? "—"}</p>
              </div>
              <p className="truncate text-sm text-mute">{project.teamName}</p>
              <p className="text-sm">
                {done}/{MODULES.length}
              </p>
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
          )
        })}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Модули</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {MODULES.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-line bg-panel p-4">
              <p className="text-sm">
                {index + 1}. {item.title}
              </p>
              <p className="mt-1 text-xs text-mute">{item.fields.map((field) => field.label).join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
