import { Link } from 'react-router-dom'

function ShieldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4 L26 8 V16 C26 22.5 21.6 27.2 16 29 C10.4 27.2 6 22.5 6 16 V8 Z" fill="#10B981" />
      <path d="M11 16 L14.5 19.5 L21 13" stroke="#0B1219" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-20 border-t border-border-subtle/60 bg-slate-950/40 font-body">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <ShieldMark />
            <span className="font-display text-lg font-bold tracking-tight text-emerald-50">PostureScan</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-emerald-50/55">
            Grade any domain&apos;s external security in seconds. TLS, HTTP
            headers, cookies, DNS — twenty-plus checks, one report.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
            Product
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/"          className="text-emerald-50/70 transition hover:text-emerald-50">Scan a domain</Link></li>
            <li><Link to="/dashboard" className="text-emerald-50/70 transition hover:text-emerald-50">Public dashboard</Link></li>
            <li>
              <a href="https://github.com/MDPorsch/posturescan" target="_blank" rel="noreferrer"
                 className="text-emerald-50/70 transition hover:text-emerald-50">
                Source on GitHub ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Project */}
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-400">
            Project
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/about"   className="text-emerald-50/70 transition hover:text-emerald-50">About</Link></li>
            <li><Link to="/team"    className="text-emerald-50/70 transition hover:text-emerald-50">The team</Link></li>
            <li><Link to="/privacy" className="text-emerald-50/70 transition hover:text-emerald-50">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border-subtle/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-emerald-50/35">
            © {year} PostureScan · a Cloud &amp; DevOps capstone project
          </p>
          <p className="font-mono text-[11px] text-emerald-50/35">
            Built in Lagos · open source
          </p>
        </div>
      </div>
    </footer>
  )
}
