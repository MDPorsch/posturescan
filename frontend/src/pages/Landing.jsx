import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const FEATURES = [
  { k: 'TLS / SSL',     d: 'Certificate validity, expiry, and protocol version.' },
  { k: 'HTTP headers',  d: 'HSTS, CSP, X-Frame-Options, and four more.' },
  { k: 'Cookie flags',  d: 'Secure, HttpOnly, and SameSite on every cookie.' },
  { k: 'DNS health',    d: 'SPF, DMARC, and CAA records on the apex.' },
  { k: 'Open redirects',d: 'Probe common parameters for unsafe redirect targets.' },
  { k: 'Mixed content', d: 'Detect plain-HTTP resources served on HTTPS pages.' },
]

const STEPS = [
  { n: '01', t: 'Type a domain', d: 'No login. No tracking pixel. Just the hostname.' },
  { n: '02', t: 'Watch the scan',d: 'Each check lights up in emerald as it completes.' },
  { n: '03', t: 'Get the fix',   d: 'Every finding comes with a copy-paste remediation.' },
]

function normalise(input) {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

export default function Landing() {
  const nav = useNavigate()
  const [hostname, setHostname] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const host = normalise(hostname)
    if (!host) return setError('Please enter a domain.')
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
      return setError('That doesn\'t look like a valid domain.')
    }
    setError('')
    setSubmitting(true)
    try {
      const scan = await api.guestScan(host)
      nav(`/scan/results/${scan.id}`, { state: { scan } })
    } catch (err) {
      setError(err.data?.detail || err.message || 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="pb-16 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-slate-900/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-emerald" />
              v1 · zero signup required
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Grade any domain&apos;s
              <br />
              <span className="text-emerald-400">external security</span> in 12 seconds.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-emerald-50/70">
              PostureScan inspects TLS, HTTP headers, cookies, DNS, and more — then
              hands you a graded report with a copy-paste fix for every finding.
            </p>

            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-emerald-50/40">
                  https://
                </span>
                <input
                  className="ps-input pl-[5.25rem] text-base"
                  placeholder="example.com"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="ps-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Scanning…' : 'Scan now →'}
              </button>
            </form>

            {error && (
              <p className="mt-3 font-mono text-sm text-red-400">{error}</p>
            )}
            <p className="mt-3 text-xs text-emerald-50/40">
              Try <button type="button" onClick={() => setHostname('badssl.com')} className="ps-link">badssl.com</button>,{' '}
              <button type="button" onClick={() => setHostname('github.com')} className="ps-link">github.com</button>, or any
              site you own.
            </p>
          </div>

          {/* Decorative mock report tile */}
          <div className="relative hidden lg:block">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/0 to-transparent blur-2xl"
            />
            <div className="ps-card relative p-6 animate-rise" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                  live report
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                  A · 96
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold tracking-tight">demo.example.com</h3>
              <ul className="mt-5 space-y-2 text-sm">
                {[
                  ['TLS 1.3, valid 87 days', 'pass'],
                  ['HSTS max-age 63072000', 'pass'],
                  ['CSP missing', 'warn'],
                  ['SameSite=Lax on all cookies', 'pass'],
                  ['DMARC v=DMARC1; p=reject', 'pass'],
                  ['HTTP/2 negotiated', 'pass'],
                ].map(([label, st]) => (
                  <li key={label} className="flex items-center justify-between rounded-lg border border-border-subtle/60 px-3 py-2">
                    <span className="font-mono text-xs text-emerald-50/80">{label}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: st === 'pass' ? '#10B98122' : '#FBBF2422',
                        color:      st === 'pass' ? '#10B981'   : '#FBBF24',
                      }}
                    >
                      {st}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border-subtle/60 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">how it works</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Three steps. Zero friction.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="ps-card p-6">
              <div className="font-mono text-xs text-emerald-400">{s.n}</div>
              <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border-subtle/60 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">what we check</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Eight categories. <span className="text-emerald-400">Over twenty checks.</span>
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.k} className="bg-slate-900/70 p-6">
              <h3 className="font-display text-base font-semibold tracking-tight text-emerald-400">{f.k}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-emerald-50/70">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border-subtle/60 py-16">
        <div className="ps-card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Track domains over time.
            </h2>
            <p className="mt-2 text-emerald-50/70">
              Free account adds history, score-over-time, and scan comparison.
            </p>
          </div>
          <a href="/register" className="ps-btn-primary">Create a free account</a>
        </div>
      </section>
    </div>
  )
}
