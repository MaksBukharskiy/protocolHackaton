import { Link } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { ApplicationStatusChip, Empty, ModerationStatusChip } from "../components/ui"
import { myApplications } from "../lib/applications"
import { isPubliclyListed, doneCount } from "../lib/modules"
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
          isPubliclyListed(project) &&
          !project.memberIds.includes(currentUser.id) &&
          project.ownerId !== currentUser.id,
      )

  const applications = isModerator ? [] : myApplications(projects, currentUser.id)

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
          className="rounded bg-accent px-4 py-2 text-sm text-ink hover:brightness-110"
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
              <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
                <p className="text-xs text-mute">
                  модули {doneCount(project, modules)}/{modules.length}
                </p>
                {!isModerator ? <ModerationStatusChip status={project.moderationStatus} /> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isModerator && applications.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Мои заявки</h2>
          <p className="mt-1 text-sm text-mute">Заявки в чужие команды — статус и ответ владельца.</p>
          <div className="mt-6 grid gap-3">
            {applications.map(({ project, application }) => (
              <Link
                key={application.id}
                to={`/project/${project.id}`}
                className="block rounded-2xl border border-line bg-panel p-4 transition hover:border-accent/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-mute">{project.teamName}</p>
                    <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
                    {application.message ? (
                      <p className="mt-2 text-sm text-mute line-clamp-2">{application.message}</p>
                    ) : null}
                    {application.decisionNote ? (
                      <p className="mt-2 text-sm text-white/90">Ответ: {application.decisionNote}</p>
                    ) : null}
                  </div>
                  <ApplicationStatusChip status={application.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!isModerator ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Ищем в команду</h2>
          <p className="mt-1 text-sm text-mute">Опубликованные проекты — можно подать заявку владельцу.</p>
          {openRoles.length === 0 ? (
            <div className="mt-6">
              <Empty
                title="Сейчас никто не набирает"
                hint="Когда опубликованный проект поставит статус «ищем в команду», он появится здесь."
              />
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
