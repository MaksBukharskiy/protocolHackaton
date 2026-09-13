import { Link } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { Empty } from "../components/ui"
import { earnedBadges } from "../lib/badges"
import { canAccessProject, doneCount } from "../lib/modules"
import { useStore } from "../store"

export function FeedPage() {
  const { projects, currentUser, isModerator, modules } = useStore()
  if (!currentUser) return null

  const mine = projects.filter((project) => canAccessProject(project, currentUser.id, isModerator))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{isModerator ? "Команды" : "Мой проект"}</h1>
          {!isModerator ? <p className="mt-1 text-sm text-mute">Только свои модули и one-pager.</p> : null}
        </div>
        <Link
          to={isModerator ? "/moderate" : "/new"}
          className="rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110"
        >
          {isModerator ? "Модерация" : "Создать проект"}
        </Link>
      </div>

      {mine.length === 0 ? (
        <div className="mt-8">
          <Empty title="Пока нет своего проекта" hint="Создай проект." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {mine.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} />
              <p className="mt-2 px-1 text-xs text-mute">
                модули {doneCount(project, modules)}/{modules.length} · бейджи {earnedBadges(project, modules).length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
