import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">about</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Web security shouldn&apos;t need an audit.
      </h1>

      <div className="prose-ps mt-8 space-y-5 text-base leading-relaxed text-emerald-50/75">
        <p>
          Most web security misconfigurations are small, well-documented, and trivially fixable.
          A missing HSTS header. A cookie that forgot the <span className="font-mono text-emerald-400">Secure</span> flag.
          An expired DMARC record. Each one is a single line of configuration. None of them
          are mysteries.
        </p>
        <p>
          Yet most sites have at least one. Running every check from scratch means
          assembling five specialist tools, reading five specifications, and remembering
          to do it on a schedule. Most teams don&apos;t, because the bar to start is too high.
        </p>
        <p>
          <span className="font-display text-emerald-400 italic font-medium">PostureScan lowers that bar.</span>{' '}
          Type a domain. Wait ten seconds. Get a graded report with a copy-paste fix
          for every finding. No account required. No email gate. No waitlist.
        </p>
      </div>

      <h2 className="mt-14 font-display text-2xl font-bold tracking-tight">What it actually checks</h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-emerald-50/75">
        <p>
          Eight categories, just over twenty individual checks: TLS configuration and
          certificate validity, the seven security-relevant HTTP response headers, cookie
          flags (<span className="font-mono text-emerald-400">Secure</span>,{' '}
          <span className="font-mono text-emerald-400">HttpOnly</span>,{' '}
          <span className="font-mono text-emerald-400">SameSite</span>), redirect chains,
          mixed-content detection on key pages, DNS records that matter for email
          (<span className="font-mono text-emerald-400">SPF</span>,{' '}
          <span className="font-mono text-emerald-400">DMARC</span>) and HTTPS issuance
          control (<span className="font-mono text-emerald-400">CAA</span>), and the HTTP
          version your server negotiates.
        </p>
        <p>
          Every check produces a pass, warning, or fail — and every fail comes with the
          exact remediation. Not a link to documentation. The configuration line.
        </p>
      </div>

      <h2 className="mt-14 font-display text-2xl font-bold tracking-tight">Who it&apos;s for</h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-emerald-50/75">
        <p>
          Developers shipping a service and wanting a sanity check before launch.
          Operations folks responsible for a fleet of customer-facing properties. Security
          teams doing initial reconnaissance. Anyone curious how a domain they use stacks up.
        </p>
        <p>
          The free guest flow is sized for that — one domain, one scan, no commitment.
          Authenticated accounts add what you&apos;d expect: history, score-over-time,
          scan-to-scan comparison, downloadable reports.
        </p>
      </div>

      <h2 className="mt-14 font-display text-2xl font-bold tracking-tight">Built honestly</h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-emerald-50/75">
        <p>
          PostureScan is a student capstone, not a venture-backed startup. We say this
          because honesty is the point of the product. There are no tracking pixels, no
          ad networks, no third-party analytics scripts, no buried data-sharing clauses.
          The source code is on GitHub.
        </p>
        <p>
          When you scan a domain, the hostname goes into our database. If that hostname
          isn&apos;t on a short allowlist of widely-known public sites
          (<span className="font-mono">github.com</span>, <span className="font-mono">stripe.com</span>,
          and friends — the kind of hostnames whose security posture is already public knowledge),
          it&apos;s masked before being shown anywhere visitors can see it. The details are
          on the <Link to="/privacy" className="ps-link">privacy page</Link>.
        </p>
      </div>

      <div className="ps-card mt-14 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold tracking-tight">Try it.</h3>
          <p className="mt-1 text-emerald-50/65">Type a domain. Ten seconds. No signup.</p>
        </div>
        <Link to="/" className="ps-btn-primary">Run a scan</Link>
      </div>
    </div>
  )
}
