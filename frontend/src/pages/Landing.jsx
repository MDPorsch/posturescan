import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

// Rotating examples for the mock report card so the hero feels alive.
const DEMOS = [
  {
    host: 'stripe.com', grade: 'A', score: 96,
    rows: [
      ['TLS 1.3, valid 142 days', 'pass'],
      ['HSTS max-age 63072000', 'pass'],
      ['CSP strict, nonce-based', 'pass'],
      ['SameSite=Lax on all cookies', 'pass'],
      ['DMARC v=DMARC1; p=reject', 'pass'],
      ['HTTP/2 negotiated', 'pass'],
    ],
  },
  {
    host: 'demo.example.com', grade: 'C', score: 74,
    rows: [
      ['TLS 1.3, valid 87 days', 'pass'],
      ['HSTS max-age 0', 'warn'],
      ['CSP missing', 'fail'],
      ['HttpOnly missing on session', 'fail'],
      ['DMARC v=DMARC1; p=none', 'warn'],
      ['HTTP/1.1 only', 'warn'],
    ],
  },
  {
    host: 'legacy.acme.io', grade: 'F', score: 28,
    rows: [
      ['TLS 1.0 detected', 'fail'],
      ['Certificate expires in 4 days', 'fail'],
      ['CSP missing', 'fail'],
      ['Mixed content on /login', 'fail'],
      ['No DMARC record', 'fail'],
      ['Open redirect on ?next=', 'fail'],
    ],
  },
]

const GRADE_COLORS = {
  A: '#10B981', B: '#34D399', C: '#FBBF24', D: '#F97316', F: '#EF4444',
}

function normalise(input) {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

export default function Landing() {
  const nav = useNavigate()
  const [hostname, setHostname] = useState('')
  const [error, setError] = useState('')
  const [demoIdx, setDemoIdx] = useState(0)

  // Cycle the mock card through demos so the hero never sits static.
  useEffect(() => {
    const id = setInterval(() => setDemoIdx((i) => (i + 1) % DEMOS.length), 4200)
    return () => clearInterval(id)
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    const host = normalise(hostname)
    if (!host) return setError('Please enter a domain.')
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
      return setError("That doesn't look like a valid domain.")
    }
    setError('')
    nav('/scan/results', { state: { hostname: host } })
  }

  const demo = DEMOS[demoIdx]
  const gradeColor = GRADE_COLORS[demo.grade]

  return (
    <div className="relative">
      {/* Animated scanner grid backdrop, lives behind the hero */}
      <ScanGridBackdrop />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="pb-20 pt-20 sm:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-in">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live · zero signup required
              </p>
              <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Grade any domain&apos;s
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  external security
                </span>
                <br />
                in 12 seconds.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-emerald-50/70">
                PostureScan inspects TLS, HTTP headers, cookies, DNS, and more — then
                hands you a graded report with a copy-paste fix for every finding.
              </p>

              <form onSubmit={onSubmit} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 group">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-emerald-50/40 group-focus-within:text-emerald-400 transition">
                    https://
                  </span>
                  <input
                    className="ps-input pl-[5.25rem] text-base"
                    placeholder="example.com"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                    autoFocus
                  />
                </div>
                <button type="submit" className="ps-btn-primary group">
                  Scan now
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
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

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border-subtle/40 pt-6 text-[13px] text-emerald-50/55">
                <Stat label="checks per scan" value="20+" />
                <Stat label="avg scan time" value="~10s" />
                <Stat label="categories covered" value="8" />
                <Stat label="false positives" value="0" />
              </div>
            </div>

            {/* Decorative mock report tile */}
            <div className="relative hidden lg:block">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-emerald-500/25 via-emerald-500/0 to-transparent blur-3xl"
                style={{ background: `radial-gradient(40rem 30rem at 60% 40%, ${gradeColor}1f, transparent 70%)` }}
              />
              <div
                key={demoIdx}
                className="ps-card relative p-6 animate-rise overflow-hidden"
                style={{ boxShadow: `0 0 0 1px ${gradeColor}33, 0 24px 64px -24px ${gradeColor}40` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                    posture report
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: `${gradeColor}1f`, color: gradeColor }}
                  >
                    {demo.grade} · {demo.score}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{demo.host}</h3>
                <ul className="mt-5 space-y-2 text-sm">
                  {demo.rows.map(([label, st], i) => (
                    <li
                      key={`${demoIdx}-${i}`}
                      className="flex items-center justify-between rounded-lg border border-border-subtle/60 px-3 py-2 animate-rise"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="font-mono text-xs text-emerald-50/80">{label}</span>
                      <StatusPill status={st} />
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-emerald-50/40">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                  rotating sample · type a domain above to run your own
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border-subtle/60 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">how it works</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Three steps. Zero friction.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="ps-card p-6 transition hover:border-emerald-500/40 hover:shadow-glow">
                <div className="font-mono text-xs text-emerald-400">{s.n}</div>
                <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-50/70">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border-subtle/60 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">what we check</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Eight categories. <span className="text-emerald-400">Over twenty checks.</span>
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.k} className="bg-slate-900/70 p-6 transition hover:bg-slate-900">
                <h3 className="font-display text-base font-semibold tracking-tight text-emerald-400">{f.k}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-50/70">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border-subtle/60 py-20">
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
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-bold tracking-tight text-emerald-50">{value}</span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/40">{label}</span>
    </div>
  )
}

function StatusPill({ status }) {
  const colors = {
    pass: { bg: '#10B98122', fg: '#10B981' },
    warn: { bg: '#FBBF2422', fg: '#FBBF24' },
    fail: { bg: '#EF444422', fg: '#EF4444' },
  }
  const c = colors[status] || colors.pass
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: c.bg, color: c.fg }}
    >
      {status}
    </span>
  )
}

function ScanGridBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ps-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#10B981" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="ps-fade" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#0B1219" stopOpacity="0" />
            <stop offset="100%" stopColor="#0B1219" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#ps-grid)" />
        <rect width="100%" height="100%" fill="url(#ps-fade)" />
      </svg>
      {/* Scanning line that sweeps top-to-bottom */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent animate-scan-sweep" />
    </div>
  )
}
