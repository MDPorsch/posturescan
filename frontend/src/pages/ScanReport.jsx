import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { CATEGORY_LABELS } from '../lib/grade.js'
import { groupByCategory } from '../lib/scan.js'
import CheckResult from '../components/CheckResult.jsx'
import GradeCard from '../components/GradeCard.jsx'

export default function ScanReport() {
  const { id } = useParams()
  const [scan, setScan] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [compareId, setCompareId] = useState('')
  const [diff, setDiff] = useState(null)

  useEffect(() => {
    let alive = true
    api.scan(id)
      .then(async (s) => {
        if (!alive) return
        setScan(s)
        // load history for the compare picker
        try {
          // We need the domain id; the scan API doesn't expose it directly,
          // so we look it up via /api/domains/.
          const domains = await api.domains()
          const owner = domains.find((d) => d.hostname === s.hostname)
          if (owner) {
            const h = await api.domainHistory(owner.id)
            if (alive) setHistory(h.filter((x) => x.id !== s.id))
          }
        } catch { /* ignore */ }
      })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [id])

  const grouped = useMemo(() => groupByCategory(scan?.results || []), [scan])

  const onCompare = async () => {
    if (!compareId) return
    try {
      const d = await api.compare(compareId, id)
      setDiff(d)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <Centered>{error}</Centered>
  if (!scan) return <Centered>Loading report…</Centered>

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <GradeCard
        hostname={scan.hostname}
        score={scan.score}
        grade={scan.grade}
        scannedAt={scan.created_at}
      >
        <div className="flex flex-wrap items-center gap-3">
          <a href={api.scanPdfUrl(scan.id)} className="ps-btn-ghost text-sm" target="_blank" rel="noreferrer">
            Download PDF
          </a>
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={compareId} onChange={(e) => setCompareId(e.target.value)}
                className="ps-input py-2 pl-3 pr-8 text-sm"
              >
                <option value="">Compare to previous…</option>
                {history.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.created_at).toLocaleString()} — {s.score}/{s.grade}
                  </option>
                ))}
              </select>
              <button onClick={onCompare} disabled={!compareId} className="ps-btn-ghost text-sm disabled:opacity-60">
                Compare
              </button>
            </div>
          )}
        </div>
      </GradeCard>

      {diff && (
        <section className="ps-card mt-8 p-6">
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold tracking-tight">Comparison</h2>
            <span className="font-mono text-sm" style={{
              color: diff.score_delta >= 0 ? '#10B981' : '#EF4444',
            }}>
              {diff.score_delta >= 0 ? '+' : ''}{diff.score_delta} score
            </span>
          </header>
          {diff.diff.length === 0 ? (
            <p className="text-sm text-emerald-50/60">No differences between these two scans.</p>
          ) : (
            <ul className="divide-y divide-border-subtle/60 text-sm">
              {diff.diff.map((d, i) => (
                <li key={i} className="grid grid-cols-[1fr_1fr_1fr] gap-4 py-3">
                  <div className="font-mono text-emerald-50/80">{d.category}/{d.check_key}</div>
                  <div className="text-emerald-50/60">
                    {d.before.status ? <Pill status={d.before.status} /> : <span className="text-emerald-50/30">absent</span>}
                  </div>
                  <div>
                    {d.after.status ? <Pill status={d.after.status} /> : <span className="text-emerald-50/30">absent</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mt-10 space-y-10">
        {grouped.map(([cat, results]) => (
          <section key={cat}>
            <h2 className="mb-4 font-display text-xl font-semibold tracking-tight text-emerald-400">
              {CATEGORY_LABELS[cat] || cat}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((r) => <CheckResult key={r.id} result={r} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Pill({ status }) {
  const colors = { pass: '#10B981', warn: '#FBBF24', fail: '#EF4444', info: '#94A3B8' }
  const c = colors[status] || '#94A3B8'
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${c}22`, color: c }}>
      {status}
    </span>
  )
}

function Centered({ children }) {
  return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
}
