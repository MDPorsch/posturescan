import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { api } from '../api/client.js'
import { GRADE_COLORS } from '../lib/grade.js'

export default function PublicDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api.publicDashboard()
      .then((d) => { if (alive) setData(d) })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [])

  // Pick 3 random benchmarks from the (up to 24) returned. Memoised so the
  // trio is stable for the lifetime of this page view; a fresh refresh gives
  // a different mix because the dashboard endpoint is re-fetched on mount.
  const featuredBenchmarks = useMemo(() => {
    if (!data?.recent_benchmarks?.length) return []
    return [...data.recent_benchmarks].sort(() => Math.random() - 0.5).slice(0, 3)
  }, [data])

  if (error) return <Centered>Could not load dashboard: {error}</Centered>
  if (!data)  return <Centered>Loading dashboard…</Centered>

  // Randomly pick 3 benchmarks from the (up to 24) the backend returns —
  // memoised so the trio is stable for the lifetime of this page view but
  // a fresh refresh gives a different mix.
  // (Defined inside the render because it depends on `data` and is cheap.)

  const gradePie = Object.entries(data.grade_distribution || {})
    .map(([grade, count]) => ({
      name: grade,
      value: count,
      fill: GRADE_COLORS[grade]?.ring || '#6B7280',
    }))
    .filter((d) => d.value > 0)

  const failures = (data.common_failures || []).map((f) => ({
    label: `${f.category}/${f.check_key}`,
    count: f.count,
  }))

  const topFailLabel = data.common_failures?.[0]
    ? `${data.common_failures[0].category}/${data.common_failures[0].check_key}`
    : '—'

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
        public dashboard
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        The state of web security.
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-emerald-50/70">
        Every scan PostureScan runs feeds this board. Aggregate health — no
        personal data, no hostnames you didn&apos;t already know about.
      </p>

      {/* ── Top stats ── */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="total scans"    value={data.total_scans}        counter />
        <Stat label="last 24h"       value={data.total_scans_today}  counter />
        <Stat label="average score"  value={data.average_score} suffix="/100" />
        <Stat label="most-failed check" value={topFailLabel} mono />
      </div>

      {/* ── Featured benchmarks ── */}
      <section className="mt-14">
        <header className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              featured benchmarks
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Real grades on well-known sites.
            </h2>
          </div>
          {data.recent_benchmarks?.length > 0 && (
            <span className="hidden font-mono text-xs text-emerald-50/40 sm:inline">
              showing {featuredBenchmarks.length} of {data.recent_benchmarks.length} · refresh for a new mix
            </span>
          )}
        </header>

        {featuredBenchmarks.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBenchmarks.map((b) => <BenchmarkCard key={b.id} b={b} />)}
          </div>
        ) : (
          <div className="ps-card mt-6 p-8 text-center text-sm text-emerald-50/40">
            No benchmark scans yet. Scan one of the allowlisted sites
            (github.com, stripe.com, badssl.com…) to populate this section.
          </div>
        )}
      </section>

      {/* ── Charts ── */}
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="ps-card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
            Grade distribution
          </h2>
          <div className="h-64">
            {gradePie.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}
                       stroke="#0B1219" strokeWidth={3}>
                    {gradePie.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="ps-card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
            Most common failures
          </h2>
          <div className="h-64">
            {failures.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failures} layout="vertical"
                          margin={{ top: 4, right: 16, bottom: 4, left: 12 }}>
                  <CartesianGrid stroke="#1A3022" strokeDasharray="3 4" horizontal={false} />
                  <XAxis type="number"   stroke="#7B8B82" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" stroke="#7B8B82" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent activity (masked) ── */}
      <section className="mt-14">
        <header className="flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              recent activity
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Latest scans.
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-emerald-50/40 sm:inline">
            hostnames masked for privacy
          </span>
        </header>

        <div className="ps-card mt-6 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80">
              <tr className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/50">
                <th className="px-5 py-3">Hostname</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {(data.recent_scans || []).map((s) => {
                const palette = GRADE_COLORS[s.grade]?.ring || '#6B7280'
                return (
                  <tr key={s.id} className="hover:bg-slate-900/40">
                    <td className="px-5 py-3 font-mono text-base text-emerald-50/90">
                      {s.hostname}
                    </td>
                    <td className="px-5 py-3 font-mono text-base">{s.score}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ background: `${palette}22`, color: palette }}>
                        {s.grade}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {(data.recent_scans || []).length === 0 && (
                <tr>
                  <td colSpan="3" className="px-5 py-10 text-center text-emerald-50/40">
                    No scans yet. Be the first to scan a domain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 font-mono text-[11px] text-emerald-50/35">
          Hostnames are masked to the first two characters of the apex label.
          Visit the hostname directly to verify your own scan; allowlisted
          public sites appear in full in the Featured benchmarks section above.
        </p>
      </section>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function BenchmarkCard({ b }) {
  const palette = GRADE_COLORS[b.grade]?.ring || '#6B7280'
  return (
    <Link
      to={`/scan/results/${b.id}`}
      className="ps-card group flex flex-col gap-4 p-5 transition hover:border-emerald-500/40 hover:shadow-glow"
      style={{ boxShadow: `0 0 0 1px ${palette}1f` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-bold tracking-tight break-all">
          {b.hostname}
        </h3>
        <span
          className="grade-pill h-10 w-10 shrink-0 rounded-lg text-xl"
          style={{ background: `${palette}22`, color: palette, boxShadow: `inset 0 0 0 1.5px ${palette}55` }}
        >
          {b.grade}
        </span>
      </div>
      <div className="flex items-baseline justify-between font-mono text-xs text-emerald-50/55">
        <span>
          <span className="text-emerald-50/85">{b.score}</span>/100
        </span>
        <span>{timeAgo(b.created_at)}</span>
      </div>
    </Link>
  )
}

function Stat({ label, value, suffix, mono = false, counter = false }) {
  return (
    <div className="ps-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/50">{label}</p>
      <p className={[
        'mt-2 font-display tracking-tight tabular-nums',
        mono ? 'font-mono text-base text-emerald-50/85 break-all' : 'text-3xl font-bold',
      ].join(' ')}>
        {counter && typeof value === 'number' ? <CountUp to={value} /> : value}
        {suffix && <span className="ml-1 text-base text-emerald-50/60">{suffix}</span>}
      </p>
    </div>
  )
}

function CountUp({ to, duration = 900 }) {
  const [n, setN] = useState(0)
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(eased * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{n.toLocaleString()}</>
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-emerald-50/40">
      No data yet.
    </div>
  )
}

function Centered({ children }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
  )
}

// Small relative-time formatter so we don't need a date library.
function timeAgo(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (seconds < 60)   return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)   return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)     return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30)      return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
