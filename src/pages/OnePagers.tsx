import { Link } from "react-router-dom"
import { Empty } from "../components/ui"
import { doneCount, isComplete, MODULES } from "../lib/modules"
import { useStore } from "../store"

export function OnePagersPage() {
  const { projects, currentUser, isModerator } = useStore()
  if (!currentUser) return null

  const scope = isModerator
    ? projects
    : projects.filter((p) => p.memberIds.includes(currentUser.id) || p.ownerId === currentUser.id)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">One-pager</h1>
        <p className="text-xs text-mute">{isModerator ? "все команды" : "мои проекты"}</p>
      </div>

      {scope.length === 0 ? (
        <div className="mt-8">
          <Empty title="Пусто" hint="Сначала создай проект." />
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line">
          {scope.map((project) => {
            const done = doneCount(project)
            const ready = isComplete(project)
            return (
              <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{project.title}</p>
                  <p className="text-xs text-mute">
                    {project.teamName} · {done}/{MODULES.length}
                    {ready ? " · готово" : " · черновик"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/project/${project.id}`} className="text-xs text-mute hover:text-white">
                    проект
                  </Link>
                  <Link
                    to={`/project/${project.id}/onepager`}
                    className="rounded-lg bg-accent px-3 py-1.5 text-sm text-ink hover:brightness-110"
                  >
                    открыть
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
