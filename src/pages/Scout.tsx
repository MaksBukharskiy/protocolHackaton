import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { askScoutRag, ollamaReady } from "../lib/ollama"
import { type ScoutAnswer } from "../lib/scout"
import { useStore } from "../store"
import { Mark } from "../components/Logo"

type Msg = ScoutAnswer & { id: string; from: "scout" | "user"; source?: "ollama" | "rules"; animate?: boolean }

const SUGGESTIONS = ["Кого ищут", "Кто свободен", "Мне слот"]

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function ScoutPage() {
  const { peers, projects, currentUser, isModerator } = useStore()
  const ctx = useMemo(
    () => (currentUser ? { peers, projects, me: currentUser, isModerator } : null),
    [currentUser, isModerator, peers, projects],
  )
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    void ollamaReady()
  }, [])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [text])

  if (!ctx || !currentUser) return null

  const board = ctx
  const empty = messages.length === 0 && !busy

  function push(answer: string | ScoutAnswer, from: Msg["from"] = "scout", source?: Msg["source"]) {
    const payload = typeof answer === "string" ? { text: answer, links: [] } : answer
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from, ...payload, source, animate: true },
    ])
    queueMicrotask(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  async function ask(question: string) {
    const q = question.trim()
    if (!q || busy) return
    push(q, "user")
    setText("")
    setBusy(true)
    try {
      const [answer] = await Promise.all([askScoutRag(q, board), wait(2000)])
      push(answer, "scout", answer.source)
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void ask(text)
  }

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh)] flex-col bg-ink sm:-mx-8">
      <header className="flex h-12 shrink-0 items-center justify-center border-b border-line/60">
        <p className="text-sm font-medium tracking-tight">Scout</p>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
          {empty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-accent">
                <Mark className="size-7" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Чем помочь?</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={busy}
                    onClick={() => void ask(item)}
                    className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-mute transition hover:border-white/20 hover:text-white disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) =>
              msg.from === "user" ? (
                <div key={msg.id} className={`flex justify-end ${msg.animate ? "scout-msg-in" : ""}`}>
                  <div className="max-w-[85%] rounded-[1.25rem] bg-[#2f2f2f] px-4 py-2.5 text-[15px] leading-relaxed text-white sm:max-w-[70%]">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className={`flex gap-3 ${msg.animate ? "scout-msg-in" : ""}`}>
                  <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent">
                    <Mark className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-[#ececec]">
                      {msg.animate ? <TypeText text={msg.text} /> : msg.text}
                    </p>
                    {msg.links.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.links.map((link) => (
                          <Link
                            key={`${link.kind}-${link.id}`}
                            to={link.kind === "project" ? `/project/${link.id}` : `/peer/${link.id}`}
                            className="rounded-full border border-line px-3 py-1 text-xs text-mute transition hover:border-accent hover:text-accent"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ),
            )
          )}

          {busy ? (
            <div className="flex gap-3 scout-msg-in">
              <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent">
                <Mark className="size-4" />
              </div>
              <div className="flex items-center gap-1.5 pt-2" aria-label="думаю">
                <span className="scout-think-dot size-1.5 rounded-full bg-white/70" />
                <span className="scout-think-dot size-1.5 rounded-full bg-white/70" style={{ animationDelay: "0.2s" }} />
                <span className="scout-think-dot size-1.5 rounded-full bg-white/70" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-line/40 bg-ink px-3 pb-4 pt-3 sm:px-6">
        {!empty ? (
          <div className="mx-auto mb-3 flex max-w-3xl flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                disabled={busy}
                onClick={() => void ask(item)}
                className="rounded-full border border-line px-3 py-1 text-xs text-mute hover:text-white disabled:opacity-50"
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={onSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2 rounded-[1.75rem] border border-line bg-[#1a1a1a] px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] focus-within:border-white/20"
        >
          <textarea
            ref={inputRef}
            value={text}
            rows={1}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void ask(text)
              }
            }}
            placeholder="Спроси Scout…"
            disabled={busy}
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-mute disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="mb-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink transition enabled:hover:bg-accent disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-mute"
            aria-label="Отправить"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-mute/70">Enter — отправить · Shift+Enter — новая строка</p>
      </div>
    </div>
  )
}

function TypeText({ text }: { text: string }) {
  const [shown, setShown] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setShown("")
    setDone(false)
    let i = 0
    const step = Math.max(1, Math.ceil(text.length / 48))
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + step)
      setShown(text.slice(0, i))
      if (i >= text.length) {
        window.clearInterval(id)
        setDone(true)
      }
    }, 28)
    return () => window.clearInterval(id)
  }, [text])

  return (
    <>
      {shown}
      {!done ? <span className="scout-type-caret ml-0.5 inline-block text-accent">▍</span> : null}
    </>
  )
}
