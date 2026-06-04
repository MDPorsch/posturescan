import { useEffect, useState } from 'react'
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

  if (error) return <Centered>Could not load dashboard: {error}</Centered>
  if (!data)  return <Centered>Loading dashboard…</Centered>

  const gradePie = Object.entries(data.grade_distribution || {})
    .map(([grade, count]) => ({ name: grade, value: count, fill: GRADE_COLORS[grade]?.ring || '#6B7280' }))
    .filter((d) => d.value > 0)

  const failures = (data.common_failures || []).map((f) => ({
    label: `${f.category}/${f.check_key}`,
    count: f.count,
  }))

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">public dashboard</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        The state of web security.
      </h1>
      <p className="mt-2 max-w-2xl text-emerald-50/70">
        Every scan PostureScan runs feeds this board. No personal data, just aggregate health.
      </p>

      {/* Top stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Total scans"    value={data.total_scans} />
        <Stat label="Average score"  value={data.average_score} suffix="/100" />
        <Stat
          label="Most-failed check"
          value={data.common_failures?.[0]
            ? `${data.common_failures[0].category}/${data.common_failures[0].check_key}`
            : '—'}
          mono
        />
      </div>

      {/* Charts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="ps-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Grade distribution</h2>
          <div className="h-64">
            {gradePie.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} stroke="#0B1219" strokeWidth={3}>
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
          <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Most common failures</h2>
          <div className="h-64">
            {failures.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failures} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 12 }}>
                  <CartesianGrid stroke="#1A3022" strokeDasharray="3 4" horizontal={false} />
                  <XAxis type="number" stroke="#7B8B82" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" stroke="#7B8B82" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent */}
      <h2 className="mt-12 mb-4 font-display text-lg font-semibold tracking-tight">Recent scans</h2>
      <div className="ps-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80">
            <tr className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/50">
              <th className="px-5 py-3">Hostname</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3">Grade</th>
              <th className="px-5 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/60">
            {(data.recent_scans || []).map((s) => (
              <tr key={s.id} className="hover:bg-slate-900/40">
                <td className="px-5 py-3 font-mono text-emerald-50/90">
                  <Link to={`/scan/results/${s.id}`} className="ps-link">{s.hostname}</Link>
                </td>
                <td className="px-5 py-3 font-mono">{s.score}</td>
                <td className="px-5 py-3">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: `${GRADE_COLORS[s.grade]?.ring || '#6B7280'}22`,
                             color:      GRADE_COLORS[s.grade]?.ring || '#6B7280' }}
                  >
                    {s.grade}
                  </span>
                </td>
                <td className="px-5 py-3 text-emerald-50/60">
                  {new Date(s.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(data.recent_scans || []).length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-emerald-50/40">
                  No scans yet. Be the first to scan a domain.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, suffix, mono }) {
  return (
    <div className="ps-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/50">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold tracking-tight ${mono ? 'font-mono text-xl' : ''}`}>
        {value}{suffix && <span className="ml-1 text-base text-emerald-50/60">{suffix}</span>}
      </p>
    </div>
  )
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-sm text-emerald-50/40">No data yet.</div>
}
function Centered({ children }) {
  return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
}
