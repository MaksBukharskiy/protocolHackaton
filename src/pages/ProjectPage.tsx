import { Link, useParams } from "react-router-dom"
import { Avatar, Chip, Empty } from "../components/ui"
import { ROLE_LABEL, STATUS_LABEL } from "../lib/labels"
import { useStore } from "../store"

export function ProjectPage() {
  const { id } = useParams()
  const { projects, currentUser, peerById, toggleInterest, acceptMember } = useStore()
  const project = projects.find((item) => item.id === id)

  if (!project || !currentUser) {
    return <Empty title="Проект не найден" hint="Вернись в ленту и выбери другую карточку." />
  }

  const owner = peerById(project.ownerId)
  const isOwner = project.ownerId === currentUser.id
  const isMember = project.memberIds.includes(currentUser.id)
  const interested = project.interestIds.includes(currentUser.id)

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="font-mono text-xs text-mute hover:text-white">
        ← лента
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">{project.title}</h1>
        <Chip active={project.status === "looking"}>{STATUS_LABEL[project.status]}</Chip>
      </div>
      <p className="mt-4 text-lg leading-relaxed text-mute">{project.pitch}</p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {project.stack.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-mute">
        ищем: {project.neededRoles.map((role) => ROLE_LABEL[role]).join(", ")}
      </p>

      {owner ? (
        <Link to={`/peer/${owner.id}`} className="mt-6 flex items-center gap-3">
          <Avatar id={owner.id} nickname={owner.nickname} />
          <div>
            <p className="font-mono text-xs text-lime">{owner.nickname}</p>
            <p>владелец · {owner.name}</p>
          </div>
        </Link>
      ) : null}

      {!isOwner && !isMember ? (
        <button
          type="button"
          onClick={() => toggleInterest(project.id)}
          className={`mt-8 rounded-full px-5 py-2.5 font-mono text-sm ${
            interested ? "border border-line text-mute" : "bg-lime text-ink"
          }`}
        >
          {interested ? "Отклик отправлен · отменить" : "Хочу в команду"}
        </button>
      ) : null}
      {isMember && !isOwner ? (
        <p className="mt-8 font-mono text-sm text-lime">Ты уже в этой команде</p>
      ) : null}

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wider text-mute">команда</h2>
        <div className="mt-3 grid gap-2">
          {project.memberIds.map((memberId) => {
            const member = peerById(memberId)
            if (!member) return null
            return (
              <Link
                key={member.id}
                to={`/peer/${member.id}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2"
              >
                <Avatar id={member.id} nickname={member.nickname} size="sm" />
                <span className="font-mono text-sm">{member.nickname}</span>
                <span className="text-sm text-mute">{member.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-wider text-mute">отклики</h2>
        {project.interestIds.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Пока пусто — кто-то из ленты нажмёт «Хочу в команду».</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {project.interestIds.map((peerId) => {
              const peer = peerById(peerId)
              if (!peer) return null
              return (
                <div
                  key={peer.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2"
                >
                  <Link to={`/peer/${peer.id}`} className="flex items-center gap-3">
                    <Avatar id={peer.id} nickname={peer.nickname} size="sm" />
                    <span className="font-mono text-sm">{peer.nickname}</span>
                    <span className="text-sm text-mute">{peer.name}</span>
                  </Link>
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => acceptMember(project.id, peer.id)}
                      className="rounded-full bg-lime px-3 py-1 font-mono text-xs text-ink"
                    >
                      в команду
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
