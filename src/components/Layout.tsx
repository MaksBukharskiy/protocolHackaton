import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useStore } from "../store"
import { Avatar } from "./ui"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 font-mono text-sm ${
    isActive ? "bg-lime text-ink" : "text-mute hover:text-white"
  }`

export function Layout() {
  const { currentUser, logout } = useStore()
  const navigate = useNavigate()

  if (!currentUser) return <Navigate to="/login" replace />

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-mono text-lime">21</span>
            <span className="text-lg font-semibold tracking-tight">Сквад</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Лента
            </NavLink>
            <NavLink to="/people" className={linkClass}>
              Пиры
            </NavLink>
            <NavLink to="/new" className={linkClass}>
              Проект
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <NavLink to="/me" className="flex items-center gap-2">
              <Avatar id={currentUser.id} nickname={currentUser.nickname} size="sm" />
              <span className="hidden font-mono text-sm sm:inline">{currentUser.nickname}</span>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate("/login")
              }}
              className="font-mono text-xs text-mute hover:text-white"
            >
              выйти
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
