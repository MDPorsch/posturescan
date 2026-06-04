import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api, BASE_URL } from '../api/client.js'
import { CATEGORY_LABELS } from '../lib/grade.js'
import { groupByCategory } from '../lib/scan.js'
import CheckResult from '../components/CheckResult.jsx'
import GradeCard from '../components/GradeCard.jsx'
import ScanProgress from '../components/ScanProgress.jsx'

export default function ScanResults() {
  const { id } = useParams()
  const location = useLocation()
  const initial = location.state?.scan || null

  const [scan, setScan] = useState(initial)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial || !id) return
    let alive = true
    api.guestScanDetail(id)
      .then((s) => { if (alive) setScan(s) })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [id, initial])

  const done = scan?.status === 'completed' || scan?.status === 'failed'
  const grouped = useMemo(() => groupByCategory(scan?.results || []), [scan])

  if (error) {
    return <Centered>Something went wrong: {error}</Centered>
  }

  if (!scan) {
    return <Centered>Loading scan…</Centered>
  }

  if (!done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">scanning</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{scan.hostname}</h1>
        <p className="mt-2 text-emerald-50/60">Hold tight — this takes about ten seconds.</p>
        <div className="ps-card mt-8 p-6">
          <ScanProgress done={false} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <GradeCard
        hostname={scan.hostname}
        score={scan.score}
        grade={scan.grade}
        scannedAt={scan.created_at}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/report/${scan.share_token}`} className="ps-btn-ghost text-sm">
            Get shareable link
          </Link>
          <a
            href={`${BASE_URL}/api/public/badge/${encodeURIComponent(scan.hostname)}/`}
            target="_blank" rel="noreferrer"
            className="ps-btn-ghost text-sm"
          >
            Embed badge
          </a>
          <Link to="/register" className="ps-btn-primary text-sm">
            Track this domain →
          </Link>
        </div>
      </GradeCard>

      <div className="mt-10 space-y-10">
        {grouped.map(([cat, results]) => (
          <section key={cat}>
            <header className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-emerald-400">
                {CATEGORY_LABELS[cat] || cat}
              </h2>
              <span className="font-mono text-xs text-emerald-50/40">
                {results.length} check{results.length === 1 ? '' : 's'}
              </span>
            </header>
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((r) => <CheckResult key={r.id} result={r} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Centered({ children }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
  )
}
