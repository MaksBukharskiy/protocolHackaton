import type { ReactNode } from "react"

const AVATAR_TONES = ["#1ecb5c", "#16a34a", "#4ade80", "#15803d", "#86efac"]

export function toneFrom(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash + ch.charCodeAt(0)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

export function Avatar({ id, nickname, size = "md" }: { id: string; nickname: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-8 text-xs" : "size-11 text-sm"
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${dim}`}
      style={{ background: toneFrom(id) }}
    >
      {nickname.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] tracking-wide ${
        active ? "bg-accent text-ink" : "bg-white/5 text-mute"
      }`}
    >
      {children}
    </span>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <p className="text-lg">{title}</p>
      {hint ? <p className="mt-2 text-sm text-mute">{hint}</p> : null}
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
