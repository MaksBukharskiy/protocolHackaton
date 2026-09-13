import { Link } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { Empty } from "../components/ui"
import { doneCount } from "../lib/modules"
import { useStore } from "../store"

export function FeedPage() {
  const { projects, currentUser, isModerator, modules } = useStore()
  if (!currentUser) return null

  const mine = isModerator
    ? projects
    : projects.filter((project) => project.memberIds.includes(currentUser.id) || project.ownerId === currentUser.id)

  const openRoles = isModerator
    ? []
    : projects.filter(
        (project) =>
          project.status === "looking" &&
          !project.memberIds.includes(currentUser.id) &&
          project.ownerId !== currentUser.id,
      )

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{isModerator ? "Команды" : "Мой проект"}</h1>
          {!isModerator ? (
            <p className="mt-1 text-sm text-mute">Модули, one-pager и набор в команду.</p>
          ) : null}
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
          <Empty title="Пока нет своего проекта" hint="Создай проект или откликнись на открытый набор ниже." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {mine.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} />
              <p className="mt-2 px-1 text-xs text-mute">
                модули {doneCount(project, modules)}/{modules.length}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isModerator ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Ищем в команду</h2>
          <p className="mt-1 text-sm text-mute">Открытые проекты — можно подать заявку.</p>
          {openRoles.length === 0 ? (
            <div className="mt-6">
              <Empty title="Сейчас никто не набирает" hint="Когда проект поставит статус «ищем в команду», он появится здесь." />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {openRoles.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
