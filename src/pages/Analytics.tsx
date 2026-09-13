import { useMemo, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ROLE_LABEL, STATUS_LABEL } from "../lib/labels"
import { doneCount, isComplete, isModuleDone } from "../lib/modules"
import { useStore } from "../store"
import type { ProjectStatus, Role } from "../types"

const ACCENT = "#1ecb5c"
const MUTE = "#8a8a8a"
const LINE = "#1f1f1f"
const INK = "#0a0a0a"
const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "#3d3d3d",
  building: "#1ecb5c",
  looking: "#a3e635",
}

const tooltipStyle = {
  backgroundColor: INK,
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  fontSize: 12,
}

export function AnalyticsPage() {
  const { projects, peers, currentUser, isModerator, modules } = useStore()

  const scope = useMemo(() => {
    if (!currentUser) return []
    if (isModerator) return projects
    return projects.filter((p) => p.memberIds.includes(currentUser.id) || p.ownerId === currentUser.id)
  }, [currentUser, isModerator, projects])

  const filledModules = scope.reduce((sum, p) => sum + doneCount(p, modules), 0)
  const maxModules = scope.length * modules.length || 1
  const complete = scope.filter((p) => isComplete(p, modules)).length
  const interests = scope.reduce(
    (sum, p) => sum + (p.applications ?? []).filter((a) => a.status === "pending").length,
    0,
  )
  const openPeers = peers.filter((p) => p.lookingFor !== "none").length
  const avgProgress = Math.round((filledModules / maxModules) * 100)

  const moduleChart = useMemo(
    () =>
      modules.map((module) => ({
        name: module.title,
        done: scope.filter((p) => isModuleDone(p, module.id, modules)).length,
        left: Math.max(scope.length - scope.filter((p) => isModuleDone(p, module.id, modules)).length, 0),
      })),
    [modules, scope],
  )

  const statusChart = useMemo(() => {
    const counts: Record<ProjectStatus, number> = { idea: 0, building: 0, looking: 0 }
    for (const project of scope) counts[project.status] += 1
    return (Object.keys(counts) as ProjectStatus[])
      .map((status) => ({
        name: STATUS_LABEL[status],
        value: counts[status],
        status,
      }))
      .filter((row) => row.value > 0)
  }, [scope])

  const projectChart = useMemo(
    () =>
      scope.map((project) => ({
        id: project.id,
        name: project.title.length > 14 ? `${project.title.slice(0, 14)}…` : project.title,
        full: project.title,
        progress: Math.round((doneCount(project, modules) / (modules.length || 1)) * 100),
        modules: doneCount(project, modules),
      })),
    [modules, scope],
  )

  const roleChart = useMemo(() => {
    const map = new Map<string, number>()
    for (const project of scope) {
      for (const role of project.neededRoles) {
        map.set(role, (map.get(role) ?? 0) + 1)
      }
    }
    return [...map.entries()]
      .map(([role, value]) => ({ name: ROLE_LABEL[role as Role] ?? role, value }))
      .sort((a, b) => b.value - a.value)
  }, [scope])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Аналитика</h1>
        <p className="text-xs text-mute">{isModerator ? "вся доска" : "мой проект"}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="проекты" value={scope.length} />
        <Stat label="готовые one-pager" value={complete} />
        <Stat label="прогресс" value={`${avgProgress}%`} accent />
        <Stat label="отклики" value={interests} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <ChartCard title="модули по доске">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={moduleChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: MUTE, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: MUTE, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f5f5f5" }}
                cursor={{ fill: "rgba(30,203,92,0.08)" }}
              />
              <Bar dataKey="done" name="готово" stackId="m" fill={ACCENT} radius={[0, 0, 0, 0]} />
              <Bar dataKey="left" name="осталось" stackId="m" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="статусы проектов">
          {statusChart.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke={INK}
                >
                  {statusChart.map((row) => (
                    <Cell key={row.status} fill={STATUS_COLORS[row.status]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f5f5f5" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-mute">
            {statusChart.map((row) => (
              <span key={row.status} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: STATUS_COLORS[row.status] }} />
                {row.name}: {row.value}
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <ChartCard title="прогресс команд">
          {projectChart.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(220, projectChart.length * 44)}>
              <BarChart
                layout="vertical"
                data={projectChart}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid stroke={LINE} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: MUTE, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: MUTE, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "#f5f5f5" }}
                  formatter={(value) => [`${value}%`, "прогресс"]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
                  cursor={{ fill: "rgba(30,203,92,0.08)" }}
                />
                <Bar dataKey="progress" name="прогресс" fill={ACCENT} radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="нужные роли">
          {roleChart.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={LINE} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: MUTE, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: MUTE, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f5f5f5" }} cursor={{ fill: "rgba(30,203,92,0.08)" }} />
                <Bar dataKey="value" name="слотов" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat label="пиры открыты" value={openPeers} />
        <Stat label="всего пиров" value={peers.length} />
      </div>

      {scope.length > 0 ? (
        <section className="mt-8">
          <p className="mb-3 text-sm text-mute">проекты</p>
          <div className="space-y-2">
            {scope.map((project) => {
              const done = doneCount(project, modules)
              const pct = Math.round((done / (modules.length || 1)) * 100)
              return (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 hover:border-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.title}</p>
                    <p className="text-xs text-mute">{project.teamName}</p>
                  </div>
                  <div className="w-28 shrink-0">
                    <p className="mb-1 text-right text-xs text-mute">
                      {done}/{modules.length}
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <p className="mb-2 text-sm text-mute">{title}</p>
      {children}
    </section>
  )
}

function EmptyChart() {
  return <p className="flex h-[260px] items-center justify-center text-sm text-mute">пока нет данных</p>
}

function Stat({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-5 py-4">
      <p className="text-xs text-mute">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  )
}
