import { useState, type ReactNode } from "react"
import { APPLICATION_STATUS_LABEL, MODERATION_STATUS_LABEL, STATUS_LABEL } from "../lib/labels"
import type { ApplicationStatus, ModerationStatus, ProjectStatus } from "../types"

const AVATAR_TONES = ["#1ecb5c", "#16a34a", "#4ade80", "#15803d", "#86efac"]

export function toneFrom(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash + ch.charCodeAt(0)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

export function Avatar({ id, nickname, size = "md" }: { id: string; nickname: string; size?: "sm" | "md" | "lg" }) {
  const [broken, setBroken] = useState(false)
  const dim = size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-8 text-xs" : "size-11 text-sm"
  if (broken) {
    return (
      <div
        className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${dim}`}
        style={{ background: toneFrom(id) }}
      >
        {nickname.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={`/avatars/${id}.png`}
      alt={nickname}
      className={`shrink-0 rounded-full object-cover ${dim}`}
      onError={() => setBroken(true)}
    />
  )
}

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-2.5 py-1 text-[11px] font-medium leading-none tracking-wide ${
        active
          ? "bg-accent text-ink"
          : "border border-white/12 bg-white/[0.05] text-mute"
      }`}
    >
      {children}
    </span>
  )
}

export function StatusChip({ status }: { status: ProjectStatus }) {
  return <Chip active={status === "looking"}>{STATUS_LABEL[status]}</Chip>
}

export function ApplicationStatusChip({ status }: { status: ApplicationStatus }) {
  return <Chip active={status === "accepted"}>{APPLICATION_STATUS_LABEL[status]}</Chip>
}

export function ModerationStatusChip({ status }: { status: ModerationStatus }) {
  return <Chip active={status === "approved"}>{MODERATION_STATUS_LABEL[status]}</Chip>
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <p className="text-lg">{title}</p>
      {hint ? <p className="mt-2 text-sm text-mute">{hint}</p> : null}
    </div>
  )
}

export function AccessDenied() {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative mb-14 grid size-28 place-items-center">
        <span className="access-ring absolute inset-0 rounded-full border border-accent/40" />
        <span className="access-ring-2 absolute -inset-5 rounded-full border border-accent/25" />
        <span className="access-ring-3 absolute -inset-10 rounded-full border border-accent/15" />
        <span className="access-glow absolute inset-0 rounded-full bg-accent/25 blur-2xl" />
        <span className="relative size-4 rounded-full bg-accent" />
      </div>
      <p className="access-fade text-xl tracking-wide text-mute">вы не можете это посмотреть</p>
    </div>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-mute">{children}</label>
}

export function inputClass() {
  return "w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm outline-none placeholder:text-mute/70 focus:border-accent"
}

export function selectClass() {
  return "rounded-lg border border-line bg-panel px-3 py-1.5 text-xs text-mute outline-none focus:border-accent"
}
