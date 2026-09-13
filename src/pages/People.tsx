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
      const blob = `${peer.nickname} ${peer.name} ${peer.skills.join(" ")} ${peer.campus}`.toLowerCase()
      return blob.includes(q)
    })
  }, [looking, peers, query, role])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Пиры</h1>
        <p className="text-xs text-mute">{filtered.length}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="поиск"
          className="min-w-40 flex-1 rounded-lg border border-line bg-ink px-3 py-1.5 text-xs outline-none focus:border-accent"
        />
        <select value={role} onChange={(e) => setRole(e.target.value as Role | "all")} className={selectClass()}>
          <option value="all">роль</option>
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
          <option value="all">статус</option>
          {LOOKING_FOR.map((item) => (
            <option key={item} value={item}>
              {LOOKING_LABEL[item]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <Empty title="Пусто" hint="Другой фильтр." />
        </div>
      ) : (
        <div className="mt-2">
          {filtered.map((peer) => (
            <PeerCard key={peer.id} peer={peer} />
          ))}
        </div>
      )}
    </div>
  )
}
