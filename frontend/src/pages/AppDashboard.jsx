import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { GRADE_COLORS } from '../lib/grade.js'

export default function AppDashboard() {
  const [domains, setDomains] = useState(null)
  const [error, setError] = useState('')

  const [adding, setAdding] = useState(false)
  const [hostname, setHostname] = useState('')
  const [addError, setAddError] = useState('')

  const reload = () =>
    api.domains()
      .then(setDomains)
      .catch((e) => setError(e.message))

  useEffect(() => { reload() }, [])

  const onAdd = async (e) => {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    try {
      await api.addDomain(hostname.trim().toLowerCase())
      setHostname('')
      await reload()
    } catch (err) {
      setAddError(err.data?.hostname || err.message)
    } finally {
      setAdding(false)
    }
  }

  if (error)   return <Centered>Could not load domains: {error}</Centered>
  if (!domains) return <Centered>Loading your domains…</Centered>

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">your space</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Tracked domains</h1>
        </div>
        <span className="font-mono text-sm text-emerald-50/50">{domains.length} total</span>
      </div>

      {/* Add a domain */}
      <form onSubmit={onAdd} className="ps-card mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <input
          className="ps-input flex-1"
          placeholder="example.com"
          value={hostname}
          onChange={(e) => setHostname(e.target.value)}
        />
        <button type="submit" disabled={adding || !hostname} className="ps-btn-primary disabled:opacity-60">
          {adding ? 'Adding…' : 'Add domain'}
        </button>
        {addError && <p className="font-mono text-sm text-red-400 sm:ml-3">{addError}</p>}
      </form>

      {/* Grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => {
          const palette = GRADE_COLORS[d.latest_grade] || null
          return (
            <Link
              key={d.id}
              to={`/app/domains/${d.id}`}
              className="ps-card group p-5 transition hover:border-emerald-500/50 hover:shadow-glow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-semibold tracking-tight">
                    {d.hostname}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-emerald-50/50">
                    {d.is_verified ? 'verified' : 'unverified'}
                    {d.last_scanned_at && ` · last scan ${new Date(d.last_scanned_at).toLocaleDateString()}`}
                  </p>
                </div>
                {d.latest_grade ? (
                  <span
                    className="grade-pill h-12 w-12 rounded-xl text-2xl"
                    style={{
                      color: palette.text, background: palette.bg,
                      boxShadow: `inset 0 0 0 2px ${palette.ring}66`,
                    }}
                  >
                    {d.latest_grade}
                  </span>
                ) : (
                  <span className="rounded-xl border border-dashed border-border-subtle px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-emerald-50/40">
                    no scan
                  </span>
                )}
              </div>
              {d.latest_score !== null && d.latest_score !== undefined && (
                <p className="mt-4 font-mono text-xs text-emerald-50/60">
                  Score <span className="text-emerald-50">{d.latest_score}</span>/100
                </p>
              )}
            </Link>
          )
        })}
        {domains.length === 0 && (
          <div className="col-span-full ps-card p-10 text-center text-sm text-emerald-50/50">
            Add your first domain above to start tracking.
          </div>
        )}
      </div>
    </div>
  )
}

function Centered({ children }) {
  return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-emerald-50/60">{children}</div>
}
