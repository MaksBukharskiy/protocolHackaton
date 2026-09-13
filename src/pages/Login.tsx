import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Brand, Mark } from "../components/Logo"
import { useStore } from "../store"

type Mode = "login" | "register"

const fieldClass =
  "mt-1.5 w-full rounded-full border border-line bg-ink px-4 py-3 text-sm outline-none focus:border-accent"

export function LoginPage() {
  const { login, logout, verify, register, resetDemo } = useStore()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>("login")
  const [nickname, setNickname] = useState("")
  const [name, setName] = useState("")
  const [campus, setCampus] = useState("Москва")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    logout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (mode === "login") {
      const peer = verify(nickname, password)
      if (!peer) {
        setError("Неверный логин или пароль")
        return
      }
      login(peer.id)
      navigate("/", { replace: true })
      return
    }

    if (!/^[a-z0-9_]{3,16}$/i.test(nickname.trim())) {
      setError("Логин: 3–16 символов")
      return
    }
    if (!name.trim()) {
      setError("Укажи имя")
      return
    }
    if (password.length < 2) {
      setError("Придумай пароль")
      return
    }
    if (password !== confirm) {
      setError("Пароли не совпадают")
      return
    }
    const id = register({ nickname, name, campus, password })
    if (!id) {
      setError("Логин занят")
      return
    }
    navigate("/", { replace: true })
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[calc(50%-150px)_1fr]">
      <section className="relative hidden overflow-hidden bg-accent lg:block">
        <div
            className="absolute inset-0 opacity-12"
          style={{
            backgroundImage:
              "linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="glow-breathe pointer-events-none absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/20 blur-3xl" />

        <div className="drift absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2">
          <div className="pulse-ring absolute inset-0 rounded-full border border-ink/20" />
          <div className="pulse-ring-2 absolute inset-5 rounded-full border border-ink/16" />
          <div className="pulse-ring-3 absolute inset-10 rounded-full border border-ink/12" />

          <div className="spin-orbit absolute inset-8">
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-ink/45 blur-[0.5px]" />
            <span className="absolute bottom-6 left-8 size-1.5 rounded-full bg-ink/35" />
          </div>
          <div className="spin-orbit-rev absolute inset-14">
            <span className="absolute right-4 top-1/3 size-2 rounded-full bg-ink/30" />
            <span className="absolute bottom-10 left-1/2 size-1 rounded-full bg-ink/25" />
          </div>

          <span className="float-dot absolute left-10 top-20 size-2 rounded-full bg-ink/40" />
          <span className="float-dot-2 absolute bottom-24 right-12 size-2.5 rounded-full bg-ink/35" />
          <span className="float-dot-3 absolute right-16 top-28 size-1.5 rounded-full bg-ink/30" />
        </div>

        <div className="logo-pulse absolute left-1/2 top-1/2 grid size-40 place-items-center rounded-full bg-ink">
          <Mark className="mark-pulse size-[5.25rem]" />
        </div>

        <div className="absolute bottom-10 left-10 text-ink">
          <p className="text-4xl font-semibold tracking-tight">protocol</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-ink px-4 py-10">
        <div className="w-full max-w-[calc(28rem+35px)] rounded-3xl border border-line bg-panel px-6 py-[calc(1.5rem+5px)] sm:px-8 sm:py-[calc(2rem+5px)]">
          <div className="mb-8">
            <Brand markClass="size-10" textClass="text-2xl" to="/" />
          </div>

          <div className="grid grid-cols-2 rounded-full bg-ink p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  setError("")
                }}
                className={`rounded-full py-2 text-sm ${mode === item ? "bg-accent text-ink" : "text-mute"}`}
              >
                {item === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "register" ? (
              <>
                <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
                <input
                  className={fieldClass}
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="Кампус"
                />
              </>
            ) : null}
            <input
              className={fieldClass}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="username"
              placeholder="Логин"
            />
            <input
              type="password"
              className={fieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Пароль"
            />
            {mode === "register" ? (
              <input
                type="password"
                className={fieldClass}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="Повтор пароля"
              />
            ) : null}

            {error ? <p className="text-sm text-accent">{error}</p> : null}

            <button type="submit" className="w-full rounded-full bg-accent py-3 text-sm font-medium text-ink">
              {mode === "login" ? "Войти" : "Создать"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-mute">
            участник: stockcol / 21 · модератор: labmod / 21
            <br />
            <button type="button" onClick={resetDemo} className="mt-1 hover:text-white">
              сброс демо
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
