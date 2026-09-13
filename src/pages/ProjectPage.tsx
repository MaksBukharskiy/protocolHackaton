import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { BadgeRow } from "../components/Badge"
import { Avatar, AccessDenied, Empty, FieldLabel, inputClass } from "../components/ui"
import { badgesFor, isBadgeEarned } from "../lib/badges"
import { ROLE_LABEL, STATUS_LABEL } from "../lib/labels"
import {
  canAccessProject,
  currentModuleId,
  doneCount,
  isModuleDone,
  isUnlocked,
} from "../lib/modules"
import { useStore } from "../store"
import { PROJECT_STATUSES, ROLES, type ModuleId, type ProjectStatus, type Role } from "../types"

function toggleRole(roles: Role[], role: Role) {
  return roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]
}

export function ProjectPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const {
    projects,
    currentUser,
    isModerator,
    peerById,
    saveAnswer,
    updateProject,
    acceptMember,
    rejectInterest,
    addComment,
    modules,
  } = useStore()
  const project = projects.find((item) => item.id === id)
  const requested = params.get("m") as ModuleId | null
  const canOpen = (moduleId: ModuleId) =>
    Boolean(project && (isModerator || isUnlocked(project, moduleId, modules)))
  const selected =
    project && requested && modules.some((item) => item.id === requested) && canOpen(requested)
      ? requested
      : project
        ? currentModuleId(project, modules)
        : modules[0]?.id ?? ""
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [title, setTitle] = useState("")
  const [teamName, setTeamName] = useState("")
  const [pitch, setPitch] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("idea")
  const [neededRoles, setNeededRoles] = useState<Role[]>([])
  const [commentDraft, setCommentDraft] = useState("")

  useEffect(() => {
    setDraft(project?.answers[selected] ?? {})
    setSaved(false)
  }, [project?.id, selected])

  useEffect(() => {
    if (!project) return
    setTitle(project.title)
    setTeamName(project.teamName)
    setPitch(project.pitch)
    setStatus(project.status)
    setNeededRoles(project.neededRoles)
  }, [project])

  if (!project || !currentUser) {
    return <Empty title="Проект не найден" hint="Создай свой или открой из обзора." />
  }

  const fullAccess = canAccessProject(project, currentUser.id, isModerator)

  if (!fullAccess) {
    return (
      <div className="-mx-4 -my-8 grid min-h-[calc(100dvh)] place-items-center bg-ink sm:-mx-8">
        <AccessDenied />
      </div>
    )
  }

  const board = project
  const isMember = board.memberIds.includes(currentUser.id)
  const canEdit = fullAccess && isMember && !isModerator
  const canModerateJoin = isModerator || board.ownerId === currentUser.id
  const module = modules.find((item) => item.id === selected) ?? modules[0]
  const done = doneCount(board, modules)
  const moduleIndex = module ? modules.findIndex((step) => step.id === module.id) : -1
  const nextModule = modules.find(
    (item, index) => index > moduleIndex && isUnlocked(board, item.id, modules),
  )

  function openModule(moduleId: ModuleId) {
    if (!isModerator && !isUnlocked(board, moduleId, modules)) return
    setParams({ m: moduleId })
  }

  function onSave() {
    if (!module) return
    saveAnswer(board.id, module.id, draft)
    setSaved(true)
  }

  function onSaveProfile() {
    updateProject(board.id, {
      title: title.trim(),
      teamName: teamName.trim(),
      pitch: pitch.trim(),
      status,
      neededRoles,
    })
  }

  function onAddComment() {
    const text = commentDraft.trim()
    if (!text) return
    addComment(board.id, text)
    setCommentDraft("")
  }

  const comments = board.comments ?? []

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/" className="text-xs text-mute hover:text-white">
        ← назад
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-accent">{STATUS_LABEL[project.status]}</p>
          <p className="mt-1 text-xs text-mute">{project.teamName}</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">{project.title}</h1>
          <p className="mt-2 max-w-2xl text-mute">{project.pitch}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-sm text-mute">
            {done}/{modules.length}
          </p>
          <Link
            to={`/project/${project.id}/onepager`}
            className="rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110"
          >
            One-pager
          </Link>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
        <p className="mb-4 text-xs uppercase tracking-wider text-mute">бейджи модулей</p>
        <BadgeRow badges={badgesFor(modules).map((badge) => ({ badge, earned: isBadgeEarned(board, badge.id, modules) }))} />
      </section>

      {fullAccess && isModerator && !isMember ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
          <p className="text-sm text-mute">Просмотр · заявки</p>
          <Link
            to="/moderate"
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-mute hover:border-white/20 hover:text-white"
          >
            ← модерация
          </Link>
        </div>
      ) : null}

      {canEdit ? (
        <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs uppercase tracking-wider text-mute">профиль проекта</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <FieldLabel>название</FieldLabel>
              <input className={inputClass()} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <FieldLabel>команда</FieldLabel>
              <input className={inputClass()} value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <FieldLabel>краткое описание</FieldLabel>
            <textarea className={`${inputClass()} min-h-20`} value={pitch} onChange={(e) => setPitch(e.target.value)} />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <FieldLabel>статус набора</FieldLabel>
              <select
                className={inputClass()}
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                {PROJECT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABEL[item]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-mute">
                «ищем в команду» — модератор видит статус, заявки принимает владелец
              </p>
            </div>
            <div>
              <FieldLabel>кого ищем</FieldLabel>
              <div className="mt-1 flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setNeededRoles(toggleRole(neededRoles, role))}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      neededRoles.includes(role) ? "border-accent bg-accent text-ink" : "border-line text-mute"
                    }`}
                  >
                    {ROLE_LABEL[role]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={onSaveProfile} className="mt-4 text-sm text-accent">
            Сохранить профиль
          </button>
        </section>
      ) : null}

      {canModerateJoin && project.interestIds.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-accent/40 bg-panel p-5">
          <p className="text-xs uppercase tracking-wider text-accent">заявки</p>
          <div className="mt-3 grid gap-3">
            {project.interestIds.map((peerId) => {
              const peer = peerById(peerId)
              if (!peer) return null
              return (
                <div key={peer.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar id={peer.id} nickname={peer.nickname} size="sm" />
                    <div>
                      <p className="text-sm">{peer.nickname}</p>
                      <p className="text-xs text-mute">
                        {peer.name} · {peer.campus}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => acceptMember(project.id, peer.id)}
                      className="rounded-full bg-accent px-3 py-1.5 text-xs text-ink"
                    >
                      Принять
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectInterest(project.id, peer.id)}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-mute"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {(comments.length > 0 || isModerator) && (
        <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs uppercase tracking-wider text-mute">комментарии</p>
            {comments.length > 0 ? <p className="text-xs text-mute">{comments.length}</p> : null}
          </div>

          {comments.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {comments.map((comment) => {
                const author = peerById(comment.authorId)
                return (
                  <div key={comment.id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-2">
                      {author ? <Avatar id={author.id} nickname={author.nickname} size="sm" /> : null}
                      <div className="min-w-0">
                        <p className="text-sm">
                          {author?.nickname ?? comment.authorId}
                          <span className="text-mute"> · модератор</span>
                        </p>
                        <p className="text-[11px] text-mute">
                          {new Date(comment.createdAt).toLocaleString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/90">{comment.text}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-mute">Пока пусто</p>
          )}

          {isModerator ? (
            <div className="mt-4 border-t border-line pt-4">
              <textarea
                className={`${inputClass()} min-h-20`}
                value={commentDraft}
                placeholder="Комментарий команде…"
                onChange={(e) => setCommentDraft(e.target.value)}
              />
              <button
                type="button"
                disabled={!commentDraft.trim()}
                onClick={onAddComment}
                className="mt-3 rounded-full bg-accent px-4 py-2 text-sm text-ink hover:brightness-110 disabled:opacity-40"
              >
                Отправить
              </button>
            </div>
          ) : null}
        </section>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <ol className="flex flex-col">
          {modules.map((item, index) => {
            const open = isModerator || isUnlocked(project, item.id, modules)
            const doneItem = isModuleDone(project, item.id, modules)
            const here = module ? item.id === module.id : false
            const last = index === modules.length - 1
            return (
              <li key={item.id} className="flex flex-col">
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => openModule(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                    here
                      ? "border-accent bg-accent/10"
                      : open
                        ? "border-line bg-panel hover:border-accent/60"
                        : "cursor-not-allowed border-line/60 bg-ink text-mute"
                  }`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-full text-xs ${
                      doneItem ? "bg-accent text-ink" : here ? "bg-white text-ink" : "bg-white/5"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">{item.title}</span>
                    <span className="block text-[11px] text-mute">
                      {doneItem ? "пройден" : here ? "сейчас" : open ? "открыт" : "закрыт"}
                    </span>
                  </span>
                </button>
                {!last ? (
                  <div
                    className={`flex justify-center py-1.5 ${doneItem ? "text-accent" : "text-mute/50"}`}
                    aria-hidden
                  >
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                      <path
                        d="M7 1v12M7 13l-4-4M7 13l4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>

        <section className="rounded-2xl border border-line bg-panel p-5">
          {module ? (
            <>
          <h2 className="text-2xl font-semibold">{module.title}</h2>
          <p className="mt-1 text-sm text-mute">{module.hint}</p>

          <div className="mt-5 grid gap-4">
            {module.fields.map((field) => (
              <div key={field.id}>
                <FieldLabel>{field.label}</FieldLabel>
                <textarea
                  className={`${inputClass()} min-h-20`}
                  value={draft[field.id] ?? ""}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    setDraft((prev) => ({ ...prev, [field.id]: e.target.value }))
                    setSaved(false)
                  }}
                />
              </div>
            ))}
          </div>

          {canEdit ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onSave} className="rounded-full bg-accent px-5 py-2.5 text-sm text-ink">
                Сохранить ответ
              </button>
              {saved && nextModule ? (
                <button type="button" onClick={() => openModule(nextModule.id)} className="text-sm text-accent">
                  Дальше → {nextModule.title}
                </button>
              ) : null}
              {saved ? (
                <Link to={`/project/${project.id}/onepager`} className="text-sm text-accent">
                  One-pager →
                </Link>
              ) : null}
              {saved ? <span className="text-xs text-mute">сохранено</span> : null}
            </div>
          ) : null}
            </>
          ) : (
            <p className="text-sm text-mute">Нет модулей в программе.</p>
          )}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-wider text-mute">состав команды</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.memberIds.map((memberId) => {
            const member = peerById(memberId)
            if (!member) return null
            return (
              <div key={member.id} className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5">
                <Avatar id={member.id} nickname={member.nickname} size="sm" />
                <span className="text-sm">
                  {member.nickname}
                  <span className="text-mute"> · {member.name}</span>
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
