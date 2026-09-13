import type { ReactNode } from "react"

const AVATAR_TONES = ["#c8f542", "#9ae6ff", "#ffd37a", "#f5a3c7", "#c4b5fd"]

export function toneFrom(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash + ch.charCodeAt(0)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

export function Avatar({ id, nickname, size = "md" }: { id: string; nickname: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-8 text-xs" : "size-11 text-sm"
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full font-mono font-medium text-ink ${dim}`}
      style={{ background: toneFrom(id) }}
    >
      {nickname.slice(0, 2)}
    </div>
  )
}

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
        active
          ? "border-lime bg-lime text-ink"
          : "border-line bg-panel text-mute"
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
  return <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-mute">{children}</label>
}

export function inputClass() {
  return "w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm outline-none placeholder:text-mute/70 focus:border-lime"
}
