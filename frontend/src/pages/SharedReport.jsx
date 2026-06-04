import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { CATEGORY_LABELS } from '../lib/grade.js'
import { groupByCategory } from '../lib/scan.js'
import CheckResult from '../components/CheckResult.jsx'
import GradeCard from '../components/GradeCard.jsx'

export default function SharedReport() {
  const { token } = useParams()
  const [scan, setScan]   = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api.sharedReport(token)
      .then((s) => { if (alive) setScan(s) })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [token])

  const grouped = useMemo(() => groupByCategory(scan?.results || []), [scan])

  if (error) return <Centered>This report link is invalid or has expired.</Centered>
  if (!scan)  return <Centered>Loading report…</Centered>

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">shared report</p>
      <GradeCard
        hostname={scan.hostname}
        score={scan.score}
        grade={scan.grade}
        scannedAt={scan.created_at}
      />
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

function Centered({ children }) {
  return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
}
