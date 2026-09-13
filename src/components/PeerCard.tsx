import { Link } from "react-router-dom"
import { LOOKING_LABEL, ROLE_LABEL } from "../lib/labels"
import type { Peer } from "../types"
import { Avatar } from "./ui"

export function PeerCard({ peer }: { peer: Peer }) {
  const roles = peer.roles.map((role) => ROLE_LABEL[role]).join(" · ")
  return (
    <Link
      to={`/peer/${peer.id}`}
      className="flex items-center gap-3 border-b border-line py-3 transition hover:text-accent"
    >
      <Avatar id={peer.id} nickname={peer.nickname} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {peer.nickname}
          <span className="ml-2 font-normal text-mute">{peer.name}</span>
        </p>
        <p className="truncate text-xs text-mute">{roles || "—"}</p>
      </div>
      <p className="hidden shrink-0 text-xs text-mute sm:block">{peer.campus}</p>
      <p className="shrink-0 text-[11px] text-mute">{LOOKING_LABEL[peer.lookingFor]}</p>
    </Link>
  )
}
