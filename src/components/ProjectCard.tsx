import { Link } from "react-router-dom"
import { ROLE_LABEL, STATUS_LABEL } from "../lib/labels"
import { useStore } from "../store"
import type { Project } from "../types"
import { Avatar, Chip } from "./ui"

export function ProjectCard({ project }: { project: Project }) {
  const { peerById } = useStore()
  const owner = peerById(project.ownerId)

  return (
    <Link
      to={`/project/${project.id}`}
      className="block rounded-2xl border border-line bg-panel p-5 transition hover:border-lime/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-mute">{project.pitch}</p>
        </div>
        <Chip active={project.status === "looking"}>{STATUS_LABEL[project.status]}</Chip>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
          ищем: {project.neededRoles.map((role) => ROLE_LABEL[role]).join(", ") || "никого"}
        </p>
        {owner ? (
          <div className="flex items-center gap-2">
            <Avatar id={owner.id} nickname={owner.nickname} size="sm" />
            <span className="font-mono text-xs">{owner.nickname}</span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}
