import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { FieldLabel, inputClass } from "../components/ui"
import { LOOKING_LABEL, ROLE_LABEL } from "../lib/labels"
import { useStore } from "../store"
import { LOOKING_FOR, ROLES, type LookingFor, type Role } from "../types"

function toggleRole(roles: Role[], role: Role) {
  return roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]
}

export function EditProfilePage() {
  const { currentUser, updatePeer } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState(currentUser?.name ?? "")
  const [campus, setCampus] = useState(currentUser?.campus ?? "")
  const [cohort, setCohort] = useState(currentUser?.cohort ?? "")
  const [bio, setBio] = useState(currentUser?.bio ?? "")
  const [skills, setSkills] = useState(currentUser?.skills.join(", ") ?? "")
  const [roles, setRoles] = useState<Role[]>(currentUser?.roles ?? [])
  const [lookingFor, setLookingFor] = useState<LookingFor>(currentUser?.lookingFor ?? "teammate")

  if (!currentUser) return null
  const peerId = currentUser.id

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    updatePeer(peerId, {
      name: name.trim(),
      campus: campus.trim(),
      cohort: cohort.trim(),
      bio: bio.trim(),
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      roles,
      lookingFor,
    })
    navigate(`/peer/${peerId}`)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">профиль</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Редактировать себя</h1>
      <p className="mt-2 font-mono text-sm text-mute">{currentUser.nickname}</p>

      <div className="mt-8 grid gap-4">
        <div>
          <FieldLabel>имя</FieldLabel>
          <input className={inputClass()} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>кампус</FieldLabel>
            <input className={inputClass()} value={campus} onChange={(e) => setCampus(e.target.value)} required />
          </div>
          <div>
            <FieldLabel>кластер</FieldLabel>
            <input className={inputClass()} value={cohort} onChange={(e) => setCohort(e.target.value)} required />
          </div>
        </div>
        <div>
          <FieldLabel>о себе</FieldLabel>
          <textarea className={`${inputClass()} min-h-28`} value={bio} onChange={(e) => setBio(e.target.value)} required />
        </div>
        <div>
          <FieldLabel>навыки через запятую</FieldLabel>
          <input className={inputClass()} value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>
        <div>
          <FieldLabel>роли</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoles(toggleRole(roles, role))}
                className={`rounded-full border px-3 py-1 font-mono text-xs ${
                  roles.includes(role) ? "border-lime bg-lime text-ink" : "border-line text-mute"
                }`}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>кого ищу</FieldLabel>
          <select
            className={inputClass()}
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value as LookingFor)}
          >
            {LOOKING_FOR.map((item) => (
              <option key={item} value={item}>
                {LOOKING_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="mt-8 rounded-full bg-lime px-5 py-2.5 font-mono text-sm text-ink">
        Сохранить
      </button>
    </form>
  )
}
