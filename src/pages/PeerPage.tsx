import { Link, useParams } from "react-router-dom"
import { ProjectCard } from "../components/ProjectCard"
import { Avatar, Empty } from "../components/ui"
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

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/people" className="text-xs text-mute hover:text-white">
        ← пиры
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <Avatar id={peer.id} nickname={peer.nickname} size="lg" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{peer.nickname}</h1>
          <p className="text-sm text-mute">
            {peer.name} · {peer.campus}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-mute">{peer.bio}</p>
      <p className="mt-4 text-xs text-mute">
        {peer.roles.map((role) => ROLE_LABEL[role]).join(" · ")}
        {peer.skills.length ? ` · ${peer.skills.join(", ")}` : ""}
      </p>
      <p className="mt-2 text-xs text-accent">{LOOKING_LABEL[peer.lookingFor]}</p>

      {currentUser?.id === peer.id ? (
        <Link to="/me" className="mt-5 inline-block text-sm text-accent">
          редактировать →
        </Link>
      ) : null}

      {(owned.length > 0 || joined.length > 0) && (
        <section className="mt-10">
          <p className="mb-3 text-xs uppercase tracking-wider text-mute">проекты</p>
          <div className="grid gap-3">
            {owned.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {joined.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
