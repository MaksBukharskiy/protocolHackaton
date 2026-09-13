import { Link } from "react-router-dom"
import { LOOKING_LABEL, ROLE_LABEL } from "../lib/labels"
import type { Peer } from "../types"
import { Avatar, Chip } from "./ui"

export function PeerCard({ peer }: { peer: Peer }) {
  return (
    <Link
      to={`/peer/${peer.id}`}
      className="block rounded-2xl border border-line bg-panel p-5 transition hover:border-lime/60"
    >
      <div className="flex items-start gap-3">
        <Avatar id={peer.id} nickname={peer.nickname} />
        <div className="min-w-0">
          <p className="font-mono text-sm text-lime">{peer.nickname}</p>
          <p className="truncate text-lg font-semibold">{peer.name}</p>
          <p className="mt-1 font-mono text-[11px] text-mute">
            {peer.campus} · {peer.cohort}
          </p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-mute">{peer.bio}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {peer.roles.map((role) => (
          <Chip key={role} active>
            {ROLE_LABEL[role]}
          </Chip>
        ))}
        {peer.skills.slice(0, 3).map((skill) => (
          <Chip key={skill}>{skill}</Chip>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-mute">
        {LOOKING_LABEL[peer.lookingFor]}
      </p>
    </Link>
  )
}
