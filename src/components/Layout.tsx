import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import { ACCESS_LABEL } from "../lib/labels"
import { useStore } from "../store"
import { Brand } from "./Logo"
import { Avatar } from "./ui"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
    isActive ? "bg-white/5 text-white" : "text-mute hover:bg-white/5 hover:text-white"
  }`

export function Layout() {
  const { currentUser, currentRole, isModerator, logout } = useStore()
  const navigate = useNavigate()

  if (!currentUser || !currentRole) return <Navigate to="/login" replace />

  const nav = isModerator
    ? [
        { to: "/", label: "Обзор", end: true },
        { to: "/scout", label: "Scout", end: false },
        { to: "/onepagers", label: "One-pager", end: false },
        { to: "/badges", label: "Бейджи", end: false },
        { to: "/analytics", label: "Аналитика", end: false },
        { to: "/moderate", label: "Модерация", end: false },
        { to: "/people", label: "Пиры", end: false },
        { to: "/me", label: "Профиль", end: false },
      ]
    : [
        { to: "/", label: "Мой проект", end: true },
        { to: "/scout", label: "Scout", end: false },
        { to: "/onepagers", label: "One-pager", end: false },
        { to: "/badges", label: "Бейджи", end: false },
        { to: "/analytics", label: "Аналитика", end: false },
        { to: "/new", label: "Создать", end: false },
        { to: "/people", label: "Пиры", end: false },
        { to: "/me", label: "Профиль", end: false },
      ]

  return (
    <div className="min-h-dvh bg-ink lg:flex">
      <aside className="flex flex-col border-b border-line px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-b-0 lg:border-r">
        <NavLink to="/" className="px-1">
          <Brand />
        </NavLink>
        <div className="mt-6 flex items-center gap-3 px-1">
          <Avatar id={currentUser.id} nickname={currentUser.nickname} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentUser.name}</p>
            <p className="truncate text-xs text-mute">
              {currentUser.nickname} · {ACCESS_LABEL[currentRole]}
            </p>
          </div>
        </div>
        <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-1 lg:flex-col">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate("/login")
          }}
          className="mt-4 w-full rounded-full bg-accent py-2.5 text-sm text-ink hover:brightness-110"
        >
          Выйти
        </button>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
