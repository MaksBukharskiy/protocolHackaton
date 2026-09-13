import { Link } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { Empty } from "../components/ui"
import { doneCount, MODULES } from "../lib/modules"
import { useStore } from "../store"

export function FeedPage() {
  const { projects, currentUser, isModerator } = useStore()
  if (!currentUser) return null

  const mine = isModerator
    ? projects
    : projects.filter((project) => project.memberIds.includes(currentUser.id) || project.ownerId === currentUser.id)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{isModerator ? "Команды" : "Проект"}</h1>
        <Link
          to={isModerator ? "/moderate" : "/new"}
          className="rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110"
        >
          {isModerator ? "Модерация" : "Создать"}
        </Link>
      </div>

      {mine.length === 0 ? (
        <div className="mt-8">
          <Empty title="Пусто" hint="Создай проект." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {mine.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} />
              <p className="mt-2 px-1 text-xs text-mute">
                {doneCount(project)}/{MODULES.length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
