import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

// ── Static content ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    k: 'TLS / SSL',
    d: 'Certificate validity, expiry, and protocol version.',
    issue: 'TLS 1.0 detected on apex',
    fix: 'Disable TLS 1.0/1.1 on your web server. Require TLS 1.2+.',
  },
  {
    k: 'HTTP headers',
    d: 'HSTS, CSP, X-Frame-Options, and four more.',
    issue: 'HSTS missing',
    fix: 'Strict-Transport-Security: max-age=31536000; includeSubDomains',
  },
  {
    k: 'Cookie flags',
    d: 'Secure, HttpOnly, and SameSite on every cookie.',
    issue: 'session cookie missing HttpOnly',
    fix: 'Set Secure; HttpOnly; SameSite=Lax on every session cookie',
  },
  {
    k: 'DNS health',
    d: 'SPF, DMARC, and CAA records on the apex.',
    issue: 'no DMARC record',
    fix: 'TXT at _dmarc.example.com: "v=DMARC1; p=quarantine; rua=mailto:dmarc@…"',
  },
  {
    k: 'Open redirects',
    d: 'Probe common parameters for unsafe redirect targets.',
    issue: 'open redirect on ?next= parameter',
    fix: 'Validate redirect targets against an allowlist of known paths/hosts.',
  },
  {
    k: 'Mixed content',
    d: 'Detect plain-HTTP resources served on HTTPS pages.',
    issue: '6 insecure resources on /login',
    fix: "Replace 'http://' with 'https://' (or use protocol-relative '//' URLs).",
  },
]

const STEPS = [
  { n: '01', t: 'Type a domain', d: 'No login. No tracking pixel. Just the hostname.' },
  { n: '02', t: 'Watch the scan',d: 'Each check lights up in emerald as it completes.' },
  { n: '03', t: 'Get the fix',   d: 'Every finding comes with a copy-paste remediation.' },
]

const PRESETS = [
  { host: 'github.com',           grade: 'A', note: 'typically' },
  { host: 'stripe.com',           grade: 'A', note: 'typically' },
  { host: 'cloudflare.com',       grade: 'A', note: 'typically' },
  { host: 'badssl.com',           grade: 'F', note: 'broken by design' },
  { host: 'expired.badssl.com',   grade: 'F', note: 'expired cert' },
  { host: 'self-signed.badssl.com', grade: 'F', note: 'self-signed' },
]

// Fallback rotation for the hero card while the API loads or if it's empty.
const FALLBACK_BENCHMARKS = [
  { hostname: 'stripe.com',     score: 96, grade: 'A' },
  { hostname: 'github.com',     score: 92, grade: 'A' },
  { hostname: 'badssl.com',     score: 28, grade: 'F' },
]

const GRADE_COLORS = {
  A: '#10B981', B: '#34D399', C: '#FBBF24', D: '#F97316', F: '#EF4444',
}

function normalise(input) {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Landing() {
  const nav = useNavigate()
  const [hostname, setHostname] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [benchmarks, setBenchmarks] = useState(FALLBACK_BENCHMARKS)
  const [demoIdx, setDemoIdx] = useState(0)

  // Pull real data from the dashboard endpoint.
  useEffect(() => {
    let alive = true
    api.publicDashboard()
      .then((data) => {
        if (!alive) return
        setStats({
          total: data.total_scans,
          today: data.total_scans_today,
          avg:   data.average_score,
        })
        if (data.recent_benchmarks?.length) {
          setBenchmarks(data.recent_benchmarks.slice(0, 6))
        }
      })
      .catch(() => { /* fall back to defaults silently */ })
    return () => { alive = false }
  }, [])

  // Rotate the hero card.
  useEffect(() => {
    if (benchmarks.length === 0) return
    const id = setInterval(
      () => setDemoIdx((i) => (i + 1) % benchmarks.length),
      4200,
    )
    return () => clearInterval(id)
  }, [benchmarks.length])

  const startScan = (host) => {
    setError('')
    nav('/scan/results', { state: { hostname: host } })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const host = normalise(hostname)
    if (!host) return setError('Please enter a domain.')
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
      return setError("That doesn't look like a valid domain.")
    }
    startScan(host)
  }

  const demo = benchmarks[demoIdx] || FALLBACK_BENCHMARKS[0]
  const gradeColor = GRADE_COLORS[demo.grade] || GRADE_COLORS.F

  return (
    <div className="relative">
      <StickyScanBar onSubmit={onSubmit} value={hostname} onChange={setHostname} />
      <ScanGridBackdrop />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Hero ── */}
        <section className="pb-20 pt-20 sm:pt-28" id="hero">
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

              {error && <p className="mt-3 font-mono text-sm text-red-400">{error}</p>}

              {/* Preset chips */}
              <div className="mt-6">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-emerald-50/40">
                  or try one of these
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.host}
                      type="button"
                      onClick={() => startScan(p.host)}
                      className="group inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-slate-900/60 px-3 py-1.5 text-sm transition hover:border-emerald-500/50 hover:bg-slate-900"
                    >
                      <span className="font-mono text-emerald-50/85 group-hover:text-emerald-50">{p.host}</span>
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                        style={{ background: `${GRADE_COLORS[p.grade]}22`, color: GRADE_COLORS[p.grade] }}
                      >
                        {p.grade}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-50/35">{p.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live stats strip */}
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border-subtle/40 pt-6 text-[13px] text-emerald-50/55">
                <Stat label="total scans"   value={stats?.total} fallback="—" counter />
                <Stat label="last 24h"      value={stats?.today} fallback="—" counter />
                <Stat label="avg score"     value={stats?.avg !== undefined ? `${stats.avg}/100` : null} fallback="—" />
                <Stat label="categories"    value="8" />
              </div>
            </div>

            {/* Decorative mock report tile */}
            <div className="relative hidden lg:block">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-3xl blur-3xl"
                style={{ background: `radial-gradient(40rem 30rem at 60% 40%, ${gradeColor}1f, transparent 70%)` }}
              />
              <div
                key={demoIdx}
                className="ps-card relative p-6 animate-rise overflow-hidden"
                style={{ boxShadow: `0 0 0 1px ${gradeColor}33, 0 24px 64px -24px ${gradeColor}40` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                    most recent · benchmark
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                    style={{ background: `${gradeColor}1f`, color: gradeColor }}
                  >
                    {demo.grade} · {demo.score}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight break-all">
                  {demo.hostname}
                </h3>
                <SyntheticChecks score={demo.score} grade={demo.grade} />
                <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-emerald-50/40">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                  rotating real scans · type a domain to run your own
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="border-t border-border-subtle/60 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">how it works</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">Three steps. Zero friction.</h2>
          <div className="mt-12 space-y-10">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`grid items-center gap-8 ${i % 2 === 0 ? '' : 'lg:[direction:rtl]'} sm:grid-cols-[18rem_1fr]`}
              >
                <div className="ps-card flex aspect-[3/2] items-center justify-center overflow-hidden p-6 [direction:ltr]">
                  {i === 0 && <IllustrationType />}
                  {i === 1 && <IllustrationScan />}
                  {i === 2 && <IllustrationFix />}
                </div>
                <div className="[direction:ltr]">
                  <div className="font-mono text-xs text-emerald-400">{s.n}</div>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{s.t}</h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-emerald-50/70">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What we check ── */}
        <section className="border-t border-border-subtle/60 py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">what we check</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Eight categories. <span className="text-emerald-400">Over twenty checks.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-base text-emerald-50/55">
            Hover any tile to see an example finding and the fix you&apos;d get.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => <FeatureTile key={f.k} f={f} />)}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border-subtle/60 py-20">
          <div className="ps-card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Track domains over time.</h2>
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

// ── Sub-components ───────────────────────────────────────────────────────────

function Stat({ label, value, fallback = '—', counter = false }) {
  const display = value === null || value === undefined ? fallback : value
  const isNumber = typeof value === 'number'
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-bold tracking-tight text-emerald-50 tabular-nums">
        {counter && isNumber ? <CountUp to={value} /> : display}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-50/40">{label}</span>
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
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(eased * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <>{n.toLocaleString()}</>
}

function FeatureTile({ f }) {
  return (
    <div className="group relative overflow-hidden bg-slate-900/70 p-6 transition hover:bg-slate-900">
      <div className="transition group-hover:opacity-0">
        <h3 className="font-display text-base font-semibold tracking-tight text-emerald-400">{f.k}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-emerald-50/70">{f.d}</p>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center bg-slate-900 px-6 opacity-0 transition group-hover:opacity-100">
        <div className="flex items-center gap-2">
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: '#EF444422', color: '#EF4444' }}>
            issue
          </span>
          <span className="font-mono text-xs text-emerald-50/80">{f.issue}</span>
        </div>
        <div className="mt-3 flex items-start gap-2">
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: '#10B98122', color: '#10B981' }}>
            fix
          </span>
          <span className="font-mono text-xs leading-relaxed text-emerald-50/85">{f.fix}</span>
        </div>
      </div>
    </div>
  )
}

function StickyScanBar({ onSubmit, value, onChange }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      className={[
        'fixed inset-x-0 top-[60px] z-30 transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-4 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="mx-auto max-w-3xl px-4">
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-slate-950/90 p-2 shadow-glow backdrop-blur"
        >
          <span className="hidden pl-2 font-mono text-[11px] uppercase tracking-wider text-emerald-400 sm:inline">
            quick scan
          </span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="example.com"
            className="flex-1 bg-transparent px-2 py-1.5 font-mono text-sm text-emerald-50 placeholder:text-emerald-50/30 focus:outline-none"
            spellCheck="false"
            autoComplete="off"
          />
          <button type="submit" className="ps-btn-primary px-3 py-1.5 text-sm">
            Scan →
          </button>
        </form>
      </div>
    </div>
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent animate-scan-sweep" />
    </div>
  )
}

// Synthetic finding rows displayed inside the hero card.
// Selected from the demo's grade so the card always looks coherent.
function SyntheticChecks({ grade }) {
  const PASS = ['TLS 1.3, valid 142 days', 'HSTS max-age 63072000', 'CSP strict, nonce-based',
                'SameSite=Lax on all cookies', 'DMARC v=DMARC1; p=reject', 'HTTP/2 negotiated']
  const MIXED = ['TLS 1.3, valid 87 days', 'HSTS max-age 0', 'CSP missing',
                 'HttpOnly missing on session', 'DMARC v=DMARC1; p=none', 'HTTP/1.1 only']
  const BAD = ['TLS 1.0 detected', 'Certificate expires in 4 days', 'CSP missing',
               'Mixed content on /login', 'No DMARC record', 'Open redirect on ?next=']
  const set = grade === 'A' || grade === 'B' ? PASS
            : grade === 'F' || grade === 'D' ? BAD
            : MIXED
  const statusOf = (i) => {
    if (set === PASS) return 'pass'
    if (set === BAD)  return 'fail'
    return i === 0 ? 'pass' : i % 2 === 0 ? 'warn' : 'fail'
  }
  return (
    <ul className="mt-5 space-y-2 text-sm">
      {set.map((label, i) => (
        <li
          key={label}
          className="flex items-center justify-between rounded-lg border border-border-subtle/60 px-3 py-2 animate-rise"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="font-mono text-xs text-emerald-50/80">{label}</span>
          <StatusPill status={statusOf(i)} />
        </li>
      ))}
    </ul>
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
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: c.bg, color: c.fg }}>
      {status}
    </span>
  )
}

// ── Illustrations for "How it works" ────────────────────────────────────────

function IllustrationType() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <defs>
        <linearGradient id="t-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <rect x="20" y="60" width="280" height="56" rx="10" fill="#0B1219" stroke="#1A3022" />
      <text x="36" y="92" fontFamily="ui-monospace, monospace" fontSize="13" fill="#94A3B8">https://</text>
      <text x="92" y="92" fontFamily="ui-monospace, monospace" fontSize="14" fill="#F0FDF4">
        example.com
        <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
      </text>
      <rect x="208" y="80" width="2" height="14" fill="#10B981">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
      <rect x="226" y="68" width="58" height="40" rx="8" fill="url(#t-grad)" />
      <text x="255" y="92" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#0B1219">Scan →</text>
    </svg>
  )
}

function IllustrationScan() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <defs>
        <radialGradient id="r-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="100" r="70" fill="url(#r-grad)" />
      <circle cx="160" cy="100" r="30" fill="none" stroke="#10B981" strokeOpacity="0.45" />
      <circle cx="160" cy="100" r="30" fill="none" stroke="#10B981">
        <animate attributeName="r" from="30" to="90" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="100" r="30" fill="none" stroke="#10B981">
        <animate attributeName="r" from="30" to="90" dur="2s" begin="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.7" to="0" dur="2s" begin="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="100" r="4" fill="#10B981" />
    </svg>
  )
}

function IllustrationFix() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <rect x="60" y="40" width="200" height="124" rx="10" fill="#0F1A22" stroke="#1A3022" />
      <rect x="60" y="40" width="200" height="28" rx="10" fill="#0B1219" />
      <circle cx="76" cy="54" r="3" fill="#EF4444" />
      <circle cx="88" cy="54" r="3" fill="#FBBF24" />
      <circle cx="100" cy="54" r="3" fill="#10B981" />
      <text x="80" y="92" fontFamily="ui-monospace, monospace" fontSize="11" fill="#A7F3D0">
        Strict-Transport-Security:
      </text>
      <text x="80" y="108" fontFamily="ui-monospace, monospace" fontSize="11" fill="#F0FDF4">
        max-age=31536000;
      </text>
      <text x="80" y="124" fontFamily="ui-monospace, monospace" fontSize="11" fill="#F0FDF4">
        includeSubDomains
      </text>
      <rect x="200" y="132" width="48" height="20" rx="6" fill="#10B98122" stroke="#10B981" strokeOpacity="0.4" />
      <text x="224" y="146" textAnchor="middle" fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="600" fill="#10B981">
        Copied
      </text>
    </svg>
  )
}
