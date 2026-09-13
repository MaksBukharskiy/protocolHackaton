import { Link } from "react-router-dom"

export function Mark({ className = "size-8" }: { className?: string }) {
  return <img src="/logomark.png" alt="" className={`object-contain ${className}`} />
}

export function Brand({
  markClass = "size-7",
  textClass = "text-xl",
  to = "/",
}: {
  markClass?: string
  textClass?: string
  to?: string | null
}) {
  const content = (
    <>
      <Mark className={markClass} />
      <span className={`font-semibold tracking-tight ${textClass}`}>protocol</span>
    </>
  )

  if (!to) {
    return <div className="flex items-center gap-2.5 text-white">{content}</div>
  }

  return (
    <Link to={to} className="flex items-center gap-2.5 text-white hover:opacity-90">
      {content}
    </Link>
  )
}
