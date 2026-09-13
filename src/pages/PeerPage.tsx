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

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/people" className="font-mono text-xs text-mute hover:text-white">
        ← пиры
      </Link>
      <div className="mt-4 flex items-start gap-4">
        <Avatar id={peer.id} nickname={peer.nickname} size="lg" />
        <div>
          <p className="font-mono text-sm text-lime">{peer.nickname}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{peer.name}</h1>
          <p className="mt-1 font-mono text-xs text-mute">
            {peer.campus} · {peer.cohort}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-mute">
            {LOOKING_LABEL[peer.lookingFor]}
          </p>
        </div>
      </div>
      <p className="mt-6 text-lg leading-relaxed text-mute">{peer.bio}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {peer.roles.map((role) => (
          <Chip key={role} active>
            {ROLE_LABEL[role]}
          </Chip>
        ))}
        {peer.skills.map((skill) => (
          <Chip key={skill}>{skill}</Chip>
        ))}
      </div>
      {currentUser?.id === peer.id ? (
        <Link to="/me" className="mt-6 inline-block font-mono text-sm text-lime">
          редактировать профиль →
        </Link>
      ) : null}

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wider text-mute">проекты</h2>
        {owned.length === 0 && joined.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Пока без проектов на доске.</p>
        ) : (
          <div className="mt-4 grid gap-4">
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
