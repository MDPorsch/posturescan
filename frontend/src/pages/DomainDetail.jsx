import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { GRADE_COLORS } from '../lib/grade.js'
import ScanProgress from '../components/ScanProgress.jsx'
import ScoreChart from '../components/ScoreChart.jsx'

export default function DomainDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [domain, setDomain] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)

  const reload = useCallback(() =>
    Promise.all([
      api.domains().then((all) => setDomain(all.find((d) => String(d.id) === String(id)))),
      api.domainHistory(id).then(setHistory),
    ]).catch((e) => setError(e.message)),
  [id])

  useEffect(() => { reload() }, [reload])

  const onScan = async () => {
    setScanning(true)
    try {
      const scan = await api.scanDomain(id)
      nav(`/app/scans/${scan.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const onVerify = async () => {
    try {
      const d = await api.verifyDomain(id)
      setDomain(d)
    } catch (err) {
      setError(err.data?.detail || err.message)
    }
  }

  const onDelete = async () => {
    if (!window.confirm(
      `Stop tracking "${domain.hostname}"?\n\nThis permanently removes the domain and all its scan history.`,
    )) return
    try {
      await api.deleteDomain(id)
      nav('/app')
    } catch (err) {
      setError(err.data?.detail || err.message || 'Could not delete domain.')
    }
  }

  if (error)  return <Centered>{error}</Centered>
  if (!domain) return <Centered>Loading…</Centered>

  const palette = GRADE_COLORS[domain.latest_grade] || null

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">domain</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{domain.hostname}</h1>
          <p className="mt-2 font-mono text-xs text-emerald-50/50">
            {domain.is_verified ? '✓ verified ownership' : 'unverified — anyone can scan, only owners can manage'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {palette && (
            <div className="text-right">
              <span
                className="grade-pill h-14 w-14 rounded-xl text-3xl"
                style={{ color: palette.text, background: palette.bg,
                         boxShadow: `inset 0 0 0 2px ${palette.ring}66` }}
              >
                {domain.latest_grade}
              </span>
              <p className="mt-1 font-mono text-xs text-emerald-50/50">
                latest {domain.latest_score}/100
              </p>
            </div>
          )}
          <button onClick={onScan} disabled={scanning} className="ps-btn-primary disabled:opacity-60">
            {scanning ? 'Scanning…' : 'Run new scan'}
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      {!domain.is_verified && (
        <div className="ps-card mt-8 p-5">
          <h2 className="font-display text-base font-semibold tracking-tight">Verify ownership</h2>
          <p className="mt-1 text-sm text-emerald-50/70">
            Add this TXT record to <span className="font-mono text-emerald-400">{domain.hostname}</span>,
            then click verify.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border-subtle/60 bg-slate-950/70 p-3 font-mono text-xs text-emerald-50/80">
{`TXT  posturescan-verify=${domain.verification_token}`}
          </pre>
          <button onClick={onVerify} className="ps-btn-ghost mt-3 text-sm">Verify now</button>
        </div>
      )}

      {scanning && (
        <div className="ps-card mt-8 p-6">
          <ScanProgress done={false} />
        </div>
      )}

      <div className="mt-8">
        <ScoreChart history={history || []} />
      </div>

      <h2 className="mt-12 mb-4 font-display text-lg font-semibold tracking-tight">Scan history</h2>
      <div className="ps-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80">
            <tr className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/50">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3">Grade</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/60">
            {(history || []).map((s) => (
              <tr key={s.id} className="hover:bg-slate-900/40">
                <td className="px-5 py-3 text-emerald-50/80">{new Date(s.created_at).toLocaleString()}</td>
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
                <td className="px-5 py-3 text-emerald-50/60">{s.status}</td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/app/scans/${s.id}`} className="ps-link">View →</Link>
                </td>
              </tr>
            ))}
            {(!history || history.length === 0) && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-emerald-50/40">
                  No scans yet — run one to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Centered({ children }) {
  return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
}
