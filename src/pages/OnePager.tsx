import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { BadgeRow } from "../components/Badge"
import { Brand } from "../components/Logo"
import { Avatar, AccessDenied, Empty, inputClass } from "../components/ui"
import { badgesFor, isBadgeEarned } from "../lib/badges"
import { STATUS_LABEL } from "../lib/labels"
import { canAccessProject, doneCount, isComplete, isFieldFilled, moduleLines } from "../lib/modules"
import { useStore } from "../store"
import type { Peer, Project, ProjectComment } from "../types"

export function OnePagerPage() {
  const { id } = useParams()
  const {
    projects,
    currentUser,
    currentRole,
    isModerator,
    peerById,
    updateProject,
    addComment,
    modules,
  } = useStore()
  const project = projects.find((item) => item.id === id)
  const [note, setNote] = useState("")
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")

  useEffect(() => {
    setNote(project?.pagerNote ?? "")
  }, [project?.id, project?.pagerNote])

  if (!currentUser || !currentRole) return <Navigate to="/login" replace />
  if (!project) return <EmptyShell kind="missing" />
  if (!canAccessProject(project, currentUser.id, isModerator)) {
    return <EmptyShell kind="denied" />
  }

  const board = project
  const members = board.memberIds
    .map((memberId) => peerById(memberId))
    .filter((member): member is Peer => Boolean(member))
  const ready = isComplete(board, modules)
  const canEdit = board.memberIds.includes(currentUser.id) && !isModerator
  const comments = board.comments ?? []
  const done = doneCount(board, modules)
  const showSidePanel = isModerator || comments.length > 0

  function onSaveNote() {
    updateProject(board.id, { pagerNote: note.trim() })
    setSaved(true)
    setEditing(false)
  }

  function onPrint() {
    window.print()
  }

  function onAddComment() {
    const text = commentDraft.trim()
    if (!text) return
    addComment(board.id, text)
    setCommentDraft("")
  }

  return (
    <div className="min-h-dvh bg-ink text-white print:bg-white print:text-black">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur print:hidden sm:px-8">
        <div className="flex items-center gap-4">
          <Link to="/onepagers" className="text-xs text-mute hover:text-white">
            ← one-pager
          </Link>
          <Link to={`/project/${project.id}`} className="text-xs text-mute hover:text-white">
            проект
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-mute">{ready ? "готово" : "черновик"}</p>
          <button
            type="button"
            onClick={onPrint}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-mute hover:border-accent hover:text-white"
          >
            печать
          </button>
        </div>
      </header>

      <div
        className={`mx-auto px-4 py-8 sm:px-8 ${
          showSidePanel ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <div
          className={
            showSidePanel
              ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_19.5rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
              : undefined
          }
        >
          <article className="rounded-3xl border border-line bg-panel px-6 py-8 sm:px-10 print:border-0 print:bg-transparent print:p-0">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">one-pager</p>
            <Brand />
            <p className="mt-6 text-sm text-mute">{project.teamName}</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">{project.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-mute">{project.pitch}</p>

            <div className="mt-6">
              <BadgeRow
                badges={badgesFor(modules).map((badge) => ({
                  badge,
                  earned: isBadgeEarned(project, badge.id, modules),
                }))}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar id={member.id} nickname={member.nickname} size="sm" />
                  <span className="text-sm">{member.nickname}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-8">
              {modules.map((item, index) => {
                const lines = moduleLines(project, item.id, modules)
                const empty = lines.every((line) => !isFieldFilled(line.value))
                return (
                  <section key={item.id}>
                    <p className="text-[11px] uppercase tracking-wider text-mute">
                      {index + 1}. {item.title}
                    </p>
                    {empty ? (
                      <p className="mt-2 text-mute">ещё не пройдено</p>
                    ) : (
                      <dl className="mt-3 space-y-3">
                        {lines.map((line) => (
                          <div key={line.label}>
                            <dt className="text-xs text-accent">{line.label}</dt>
                            <dd className="mt-1 whitespace-pre-wrap text-base leading-relaxed">
                              {isFieldFilled(line.value) ? line.value : "—"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>
                )
              })}
            </div>

            <section className="mt-10 border-t border-line pt-6">
              <p className="text-[11px] uppercase tracking-wider text-mute">заметка one-pager</p>
              {editing && canEdit ? (
                <>
                  <textarea
                    className={`${inputClass()} mt-3 min-h-24`}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value)
                      setSaved(false)
                    }}
                    placeholder="Заметка"
                  />
                  <button type="button" onClick={onSaveNote} className="mt-3 text-sm text-accent">
                    Сохранить
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-base leading-relaxed">{project.pagerNote || "—"}</p>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="mt-3 text-sm text-accent print:hidden"
                    >
                      Править
                    </button>
                  ) : null}
                </>
              )}
              {saved ? <p className="mt-2 text-xs text-mute">сохранено</p> : null}
            </section>
          </article>

          {showSidePanel ? (
            <aside className="print:hidden lg:sticky lg:top-16 lg:self-start">
              <SidePanel
                project={board}
                members={members}
                done={done}
                moduleTotal={modules.length}
                ready={ready}
                comments={comments}
                isModerator={isModerator}
                commentDraft={commentDraft}
                onCommentDraftChange={setCommentDraft}
                onAddComment={onAddComment}
                peerById={peerById}
              />
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function SidePanel({
  project,
  members,
  done,
  moduleTotal,
  ready,
  comments,
  isModerator,
  commentDraft,
  onCommentDraftChange,
  onAddComment,
  peerById,
}: {
  project: Project
  members: Peer[]
  done: number
  moduleTotal: number
  ready: boolean
  comments: ProjectComment[]
  isModerator: boolean
  commentDraft: string
  onCommentDraftChange: (value: string) => void
  onAddComment: () => void
  peerById: (id: string) => Peer | undefined
}) {
  const latest = comments[comments.length - 1]
  const progressPct = moduleTotal > 0 ? Math.round((done / moduleTotal) * 100) : 0

  return (
    <div className="space-y-4">
      {isModerator ? (
        <section className="overflow-hidden rounded-3xl border border-line bg-panel">
          <div className="border-b border-line bg-gradient-to-br from-accent/15 via-transparent to-transparent px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent">модерация</p>
            <p className="mt-1 text-sm text-mute">карточка рядом с one-pager</p>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-mute">статус</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-line px-3 py-1 text-xs text-white/90">
                  {STATUS_LABEL[project.status]}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    ready ? "bg-accent/15 text-accent" : "border border-line text-mute"
                  }`}
                >
                  {ready ? "готово к демо" : "черновик"}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[11px] uppercase tracking-wider text-mute">прогресс</p>
                <p className="text-xs text-mute">
                  {done}/{moduleTotal}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-mute">команда</p>
              <div className="mt-2 space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar id={member.id} nickname={member.nickname} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm">{member.nickname}</p>
                      <p className="truncate text-[11px] text-mute">{member.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/project/${project.id}`}
              className="flex items-center justify-between rounded-2xl border border-line bg-ink/60 px-4 py-3 text-sm text-white/90 transition hover:border-accent/50 hover:text-white"
            >
              <span>ответы проекта</span>
              <span className="text-accent">→</span>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-line bg-panel px-5 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] uppercase tracking-wider text-mute">
            {isModerator ? "комментарии" : "фидбек модератора"}
          </p>
          {comments.length > 0 ? <p className="text-xs text-mute">{comments.length}</p> : null}
        </div>

        {latest && isModerator ? (
          <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-wider text-accent">последний</p>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-white/90">{latest.text}</p>
          </div>
        ) : null}

        {comments.length > 0 ? (
          <div className="mt-4 max-h-[28rem] space-y-4 overflow-y-auto pr-1">
            {[...comments].reverse().map((comment) => {
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
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                    {comment.text}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-mute">
            {isModerator ? "Пока пусто — оставьте фидбек команде." : "Пока нет комментариев."}
          </p>
        )}

        {isModerator ? (
          <div className="mt-4 border-t border-line pt-4">
            <textarea
              className={`${inputClass()} min-h-24`}
              value={commentDraft}
              placeholder="Комментарий команде…"
              onChange={(e) => onCommentDraftChange(e.target.value)}
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
    </div>
  )
}

function EmptyShell({ kind }: { kind: "missing" | "denied" }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4">
      <div className="text-center">
        {kind === "denied" ? <AccessDenied /> : <Empty title="Проект не найден" />}
        <Link to="/onepagers" className="mt-2 inline-block text-sm text-accent">
          ← к списку
        </Link>
      </div>
    </div>
  )
}
