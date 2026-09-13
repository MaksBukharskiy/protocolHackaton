import { Navigate } from "react-router-dom"
import { Avatar, Chip } from "../components/ui"
import { LOOKING_LABEL } from "../lib/labels"
import { useStore } from "../store"

export function LoginPage() {
  const { peers, currentUser, login, resetDemo } = useStore()

  if (currentUser) return <Navigate to="/" replace />

  return (
    <div className="min-h-dvh bg-ink px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">School 21 · прототип</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Сквад 21</h1>
        <p className="mt-3 max-w-xl text-lg text-mute">
          Найди пира в команду за минуту. Навыки, проекты и слоты — без ленты мемов и без Intra-хаоса.
        </p>
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-wider text-mute">войти как</p>
          <button type="button" onClick={resetDemo} className="font-mono text-xs text-mute hover:text-white">
            сбросить демо
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {peers.map((peer) => (
            <button
              key={peer.id}
              type="button"
              onClick={() => login(peer.id)}
              className="rounded-2xl border border-line bg-panel p-4 text-left transition hover:border-lime"
            >
              <div className="flex items-center gap-3">
                <Avatar id={peer.id} nickname={peer.nickname} />
                <div>
                  <p className="font-mono text-sm text-lime">{peer.nickname}</p>
                  <p className="font-semibold">{peer.name}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-mute">{peer.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip active>{LOOKING_LABEL[peer.lookingFor]}</Chip>
                <Chip>{peer.campus}</Chip>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
