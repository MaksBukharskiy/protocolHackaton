import { Link, useParams } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { Avatar, Chip, Empty } from "../components/ui"
import { LOOKING_LABEL, ROLE_LABEL } from "../lib/labels"
import { useStore } from "../store"

export function PeerPage() {
  const { id } = useParams()
  const { peers, projects, currentUser } = useStore()
  const peer = peers.find((item) => item.id === id)

  if (!peer) return <Empty title="Пир не найден" />

  const owned = projects.filter((project) => project.ownerId === peer.id)
  const joined = projects.filter(
    (project) => project.memberIds.includes(peer.id) && project.ownerId !== peer.id,
  )
  const all = [...owned, ...joined]
  const mine = currentUser?.id === peer.id

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/people" className="text-xs text-mute hover:text-white">
        ← пиры
      </Link>

      <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="h-1.5 bg-accent" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
          <Avatar id={peer.id} nickname={peer.nickname} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-accent">{peer.nickname}</p>
            <h1 className="mt-0.5 text-3xl font-semibold tracking-tight">{peer.name}</h1>
            <p className="mt-2 text-sm text-mute">
              {peer.campus} · {peer.cohort}
            </p>
            <p className="mt-3 text-sm text-accent">{LOOKING_LABEL[peer.lookingFor]}</p>
          </div>
          {mine ? (
            <Link to="/me" className="shrink-0 self-start text-sm text-accent hover:underline">
              редактировать
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Stat label="проекты" value={all.length} />
        <Stat label="свои" value={owned.length} />
        <Stat label="в командах" value={joined.length} />
      </div>

      <section className="mt-3 rounded-2xl border border-line bg-panel p-5">
        <p className="text-[11px] uppercase tracking-wider text-mute">о себе</p>
        <p className="mt-3 text-base leading-relaxed">{peer.bio}</p>
      </section>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-wider text-mute">роли</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {peer.roles.length ? (
              peer.roles.map((role) => (
                <Chip key={role} active>
                  {ROLE_LABEL[role]}
                </Chip>
              ))
            ) : (
              <p className="text-sm text-mute">не указаны</p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-wider text-mute">навыки</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {peer.skills.length ? (
              peer.skills.map((skill) => <Chip key={skill}>{skill}</Chip>)
            ) : (
              <p className="text-sm text-mute">не указаны</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-3 rounded-2xl border border-line bg-panel p-5">
        <p className="text-[11px] uppercase tracking-wider text-mute">проекты</p>
        {all.length === 0 ? (
          <p className="mt-3 text-sm text-mute">пока без проектов</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {owned.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {joined.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-5 py-4">
      <p className="text-xs text-mute">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
