import { useMemo, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Avatar } from "../components/ui"
import { ROLE_LABEL } from "../lib/labels"
import { askScout, greeting, scoutStats, type ScoutAnswer } from "../lib/scout"
import { useStore } from "../store"

type Msg = ScoutAnswer & { id: string; from: "scout" | "user" }

const SUGGESTIONS = [
  "Кого ищут",
  "Кто свободен",
  "Где нужен фронтенд",
  "Кого подобрать мне",
  "Топ навыков",
  "Мои отклики",
]

export function ScoutPage() {
  const { peers, projects, currentUser } = useStore()
  const ctx = useMemo(
    () => (currentUser ? { peers, projects, me: currentUser } : null),
    [currentUser, peers, projects],
  )
  const [messages, setMessages] = useState<Msg[]>(() =>
    ctx ? [{ id: "hi", from: "scout", ...greeting(ctx) }] : [],
  )
  const [text, setText] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  if (!ctx || !currentUser) return null

  const board = ctx
  const stats = scoutStats(board)

  function push(answer: string | ScoutAnswer, from: Msg["from"] = "scout") {
    const payload = typeof answer === "string" ? { text: answer, links: [] } : answer
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from, ...payload }])
    queueMicrotask(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  function ask(question: string) {
    const q = question.trim()
    if (!q) return
    push(q, "user")
    push(askScout(q, board))
    setText("")
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    ask(text)
  }

  return (
    <div className="-mx-4 -my-8 flex min-h-dvh flex-col lg:min-h-[calc(100dvh)] lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-mute">helper</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Scout</h1>
        <p className="mt-1 text-sm text-mute">Отвечает по живой доске protocol, не по интернету.</p>

        <div ref={listRef} className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className={msg.from === "user" ? "flex justify-end" : "max-w-2xl"}>
              {msg.from === "scout" ? <p className="mb-1 text-xs text-accent">SCOUT</p> : null}
              <div
                className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.from === "user" ? "bg-accent text-ink" : "bg-panel text-white"
                }`}
              >
                {msg.text}
              </div>
              {msg.links.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.links.map((link) => (
                    <Link
                      key={`${link.kind}-${link.id}`}
                      to={link.kind === "project" ? `/project/${link.id}` : `/peer/${link.id}`}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-accent hover:bg-white/10"
                    >
                      {link.kind === "project" ? "проект" : "пир"} · {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => ask(item)}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-mute hover:border-accent hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напиши вопрос"
            className="flex-1 rounded-lg border border-line bg-panel px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-ink hover:brightness-110"
            aria-label="Отправить"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
              <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </section>

      <aside className="border-t border-line px-5 py-8 lg:w-80 lg:border-l lg:border-t-0">
        <div className="flex items-center gap-3">
          <Avatar id="scout" nickname="sc" />
          <div>
            <p className="font-semibold">Scout</p>
            <p className="text-xs text-mute">protocol · подбор команды</p>
          </div>
        </div>
        <p className="mt-6 text-[11px] uppercase tracking-wider text-mute">могу ответить</p>
        <ul className="mt-2 space-y-1.5 text-sm text-mute">
          <li>Кого ищут в проекты</li>
          <li>Кто открыт к команде</li>
          <li>Где нужен твой стек</li>
          <li>Что с твоими откликами</li>
        </ul>
        <p className="mt-8 text-[11px] uppercase tracking-wider text-mute">сейчас</p>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="топ слот" value={`${ROLE_LABEL[stats.topRole.role]} · ${stats.topRole.count}`} />
          <Row label="ищем команду" value={String(stats.looking)} />
          <Row label="пиры открыты" value={String(stats.openPeers)} />
          <Row label="проекты" value={`${stats.projects}`} />
          <Row label="отклики" value={String(stats.interests)} />
        </dl>
        <button
          type="button"
          onClick={() => ask("Кого ищут")}
          className="mt-8 w-full rounded-full bg-accent py-2.5 text-sm text-ink"
        >
          Топ слотов
        </button>
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-mute">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
