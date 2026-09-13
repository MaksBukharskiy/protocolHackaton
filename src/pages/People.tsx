import { useMemo, useState } from "react"
import { PeerCard } from "../components/PeerCard"
import { Empty, selectClass } from "../components/ui"
import { LOOKING_LABEL, ROLE_LABEL } from "../lib/labels"
import { useStore } from "../store"
import { LOOKING_FOR, ROLES, type LookingFor, type Role } from "../types"

export function PeoplePage() {
  const { peers } = useStore()
  const [role, setRole] = useState<Role | "all">("all")
  const [looking, setLooking] = useState<LookingFor | "all">("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return peers.filter((peer) => {
      if (role !== "all" && !peer.roles.includes(role)) return false
      if (looking !== "all" && peer.lookingFor !== looking) return false
      if (!q) return true
      const blob = `${peer.nickname} ${peer.name} ${peer.bio} ${peer.skills.join(" ")} ${peer.campus}`.toLowerCase()
      return blob.includes(q)
    })
  }, [looking, peers, query, role])

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-mute">пиры</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Кто есть в кампусе</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "all")}
          className={selectClass()}
        >
          <option value="all">любой навык</option>
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {ROLE_LABEL[item]}
            </option>
          ))}
        </select>
        <select
          value={looking}
          onChange={(e) => setLooking(e.target.value as LookingFor | "all")}
          className={selectClass()}
        >
          <option value="all">любое намерение</option>
          {LOOKING_FOR.map((item) => (
            <option key={item} value={item}>
              {LOOKING_LABEL[item]}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ник, навык, кампус"
          className="min-w-48 flex-1 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs outline-none focus:border-accent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <Empty title="Пиры не нашлись" hint="Попробуй другой навык — в сидах есть ML, дизайн и бэкенд." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((peer) => (
            <PeerCard key={peer.id} peer={peer} />
          ))}
        </div>
      )}
    </div>
  )
}
