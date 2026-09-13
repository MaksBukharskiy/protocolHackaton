import { Link } from "react-router-dom"
import { Badge } from "../components/Badge"
import { badgesFor, earnedBadges } from "../lib/badges"
import { canAccessProject } from "../lib/modules"
import { useStore } from "../store"

export function BadgesPage() {
  const { projects, currentUser, isModerator, modules } = useStore()
  if (!currentUser) return null

  const catalog = badgesFor(modules)
  const mine = projects.filter((project) => canAccessProject(project, currentUser.id, isModerator))
  const collected = new Set(mine.flatMap((project) => earnedBadges(project, modules).map((badge) => badge.id)))

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Бейджи</h1>
      <p className="mt-2 text-sm text-mute">За каждый закрытый модуль. One-pager — когда пройдены все.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {catalog.map((badge) => {
          const earned = collected.has(badge.id)
          return (
            <div key={badge.id} className="rounded-2xl border border-line bg-panel p-5">
              <Badge badge={badge} earned={earned} />
              <p className="mt-4 text-center text-xs text-mute">{earned ? "получен" : "ещё нет"}</p>
            </div>
          )
        })}
      </div>

      {mine.length > 0 ? (
        <section className="mt-10">
          <p className="mb-3 text-sm text-mute">по проектам</p>
          <div className="space-y-2">
            {mine.map((project) => {
              const got = earnedBadges(project, modules)
              return (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 hover:border-accent/50"
                >
                  <p className="truncate font-medium">{project.title}</p>
                  <p className="shrink-0 text-xs text-mute">
                    {got.length}/{catalog.length}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
