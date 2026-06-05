import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api, BASE_URL } from '../api/client.js'
import { CATEGORY_LABELS } from '../lib/grade.js'
import { groupByCategory, SCAN_STEPS } from '../lib/scan.js'
import CheckResult from '../components/CheckResult.jsx'
import GradeCard from '../components/GradeCard.jsx'
import ScanProgress from '../components/ScanProgress.jsx'

export default function ScanResults() {
  const { id } = useParams()
  const location = useLocation()
  const initialScan = location.state?.scan || null
  const startHostname = location.state?.hostname || null

  const [scan, setScan] = useState(initialScan)
  const [error, setError] = useState('')

  useEffect(() => {
    if (scan) return
    let alive = true

    if (startHostname) {
      api.guestScan(startHostname)
        .then((s) => {
          if (!alive) return
          setScan(s)
          window.history.replaceState(null, '', `/scan/results/${s.id}`)
        })
        .catch((e) => {
          if (alive) setError(e.data?.detail || e.message || 'Scan failed')
        })
      return () => { alive = false }
    }

    if (id) {
      api.guestScanDetail(id)
        .then((s) => { if (alive) setScan(s) })
        .catch((e) => { if (alive) setError(e.message) })
      return () => { alive = false }
    }

    setError('No scan to load.')
  }, [id, scan, startHostname])

  const done = scan?.status === 'completed' || scan?.status === 'failed'
  const grouped = useMemo(() => groupByCategory(scan?.results || []), [scan])

  if (error) {
    return <Centered>Something went wrong: {error}</Centered>
  }

  if (!done) {
    return <ScanningState hostname={scan?.hostname || startHostname || '...'} />
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
              <h2 className="font-display text-2xl font-semibold tracking-tight text-emerald-400 sm:text-3xl">
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

function ScanningState({ hostname }) {
  // Cycle through a "currently checking" label so the user feels motion
  // even though the request is one big synchronous call on the backend.
  const [stepIdx, setStepIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((i) => (i < SCAN_STEPS.length - 1 ? i + 1 : i))
    }, 650)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-16">
      {/* Radar pulse behind the title */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2">
        <RadarPulse />
      </div>

      <div className="relative text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">
          scanning
        </p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight break-words sm:text-6xl">
          {hostname}
        </h1>
        <p className="mt-5 font-mono text-base text-emerald-50/70">
          <span className="text-emerald-400">›</span>{' '}
          {SCAN_STEPS[stepIdx]}
          <span className="animate-pulse">…</span>
        </p>
      </div>

      <div className="ps-card relative mt-12 p-8">
        <ScanProgress done={false} />
      </div>

      <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-wider text-emerald-50/40">
        no signup · no tracking · result ready in ~10 seconds
      </p>
    </div>
  )
}

function RadarPulse() {
  return (
    <svg width="320" height="320" viewBox="0 0 320 320" className="opacity-60">
      <defs>
        <radialGradient id="radar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#10B981" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="80" fill="url(#radar)" />
      <circle cx="160" cy="160" r="40" fill="none" stroke="#10B981" strokeOpacity="0.35" />
      <circle cx="160" cy="160" r="80" fill="none" stroke="#10B981" strokeOpacity="0.2">
        <animate attributeName="r" from="40" to="140" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="160" r="80" fill="none" stroke="#10B981" strokeOpacity="0.2">
        <animate attributeName="r" from="40" to="140" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function Centered({ children }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
  )
}
