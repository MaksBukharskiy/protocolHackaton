import type { BadgeDef } from "../lib/badges"

export function Badge({
  badge,
  earned,
  size = "md",
}: {
  badge: BadgeDef
  earned: boolean
  size?: "sm" | "md"
}) {
  const box = size === "sm" ? "size-12 text-[10px]" : "size-16 text-xs"
  return (
    <div className={`flex flex-col items-center gap-2 ${earned ? "" : "opacity-35"}`}>
      <div
        className={`grid ${box} place-items-center rounded-2xl border font-semibold ${
          earned ? "border-accent bg-accent text-ink" : "border-line bg-ink text-mute"
        }`}
      >
        {badge.mark}
      </div>
      <div className="text-center">
        <p className={`text-xs ${earned ? "text-white" : "text-mute"}`}>{badge.title}</p>
        {size === "md" ? <p className="mt-0.5 text-[11px] text-mute">{badge.hint}</p> : null}
      </div>
    </div>
  )
}

export function BadgeRow({ badges }: { badges: { badge: BadgeDef; earned: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {badges.map(({ badge, earned }) => (
        <Badge key={badge.id} badge={badge} earned={earned} size="sm" />
      ))}
    </div>
  )
}
