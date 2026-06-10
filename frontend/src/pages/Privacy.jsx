import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">privacy</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        What we collect, what we don&apos;t.
      </h1>
      <p className="mt-4 text-base text-emerald-50/55">
        Last updated: June 2026. Plain language, no boilerplate. If anything below isn&apos;t
        true, treat it as a bug we want to know about.
      </p>

      {/* ── What we collect ── */}
      <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">What we collect</h2>
      <ul className="mt-5 space-y-4 text-base leading-relaxed text-emerald-50/75">
        <li>
          <span className="font-medium text-emerald-50">Hostnames you submit for scanning</span> —
          stored alongside the scan results in our database so we can show you a report.
          For guests, no identity is attached; just the hostname and the result.
        </li>
        <li>
          <span className="font-medium text-emerald-50">Scan results</span> — the findings of
          each check (TLS version, header values, cookie flags, etc.), the computed score,
          and the timestamp. This data drives the public dashboard&apos;s aggregate statistics.
        </li>
        <li>
          <span className="font-medium text-emerald-50">If you sign up</span> — your email
          address, a hashed password, optionally a display name. That account ties any scans
          you run to your history.
        </li>
        <li>
          <span className="font-medium text-emerald-50">Operational logs</span> — Railway and
          Vercel record the standard request metadata (IP, user agent, timestamp) any web
          server logs. Sentry receives error events when something breaks, so we can fix it.
        </li>
      </ul>

      {/* ── What we don't ── */}
      <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight">
        What we don&apos;t
      </h2>
      <ul className="mt-5 space-y-4 text-base leading-relaxed text-emerald-50/75">
        <li>
          <span className="font-medium text-emerald-50">No tracking pixels.</span> No Google
          Analytics, no Hotjar, no Mixpanel, no Facebook Pixel. Open the site, view the
          page source — you can verify this directly.
        </li>
        <li>
          <span className="font-medium text-emerald-50">No advertising.</span> No ad networks
          embedded in our pages. No data sold or shared with advertisers.
        </li>
        <li>
          <span className="font-medium text-emerald-50">No third-party analytics</span> beyond
          what Vercel and Railway log natively for service operations.
        </li>
        <li>
          <span className="font-medium text-emerald-50">No browser fingerprinting.</span>
        </li>
        <li>
          <span className="font-medium text-emerald-50">No marketing emails.</span> Your
          account email is used only for transactional notifications you trigger (password
          reset, account events).
        </li>
      </ul>

      {/* ── Privacy by design ── */}
      <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight">
        Privacy by design
      </h2>
      <div className="mt-5 space-y-5 text-base leading-relaxed text-emerald-50/75">
        <p>
          Three concrete decisions in the product itself protect the people scanning:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-base font-semibold text-emerald-400">
              Hostname masking
            </h3>
            <p className="mt-1.5">
              The public dashboard&apos;s recent-scans table masks every hostname to the first
              two characters of the apex plus the TLD —{' '}
              <span className="font-mono text-emerald-300">acme-internal.example.com</span> is
              shown as <span className="font-mono text-emerald-300">ex***.com</span>. Visitors
              get a sense of activity; nobody else sees that you scanned your staging server.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-emerald-400">
              Benchmark allowlist
            </h3>
            <p className="mt-1.5">
              Only a short list of widely-recognised public companies (GitHub, Stripe,
              Cloudflare, and similar — sites whose security posture is already public
              knowledge) are ever displayed in full on the public dashboard. Everything else
              is masked.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-emerald-400">
              SSRF guard
            </h3>
            <p className="mt-1.5">
              The scan engine refuses to probe private-network addresses, loopback,
              link-local, and metadata-service hosts. This protects both you (your internal
              services don&apos;t get scanned by mistake) and us (the scanner can&apos;t
              be turned into a reconnaissance tool against private infrastructure).
            </p>
          </div>
        </div>
      </div>

      {/* ── Retention ── */}
      <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight">
        How long we keep things
      </h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-emerald-50/75">
        <p>
          Scan records are kept indefinitely so the public dashboard&apos;s aggregate
          statistics remain meaningful over time and so authenticated users can see their
          full history. Hostnames in those records remain masked unless they&apos;re on the
          public benchmarks allowlist.
        </p>
        <p>
          If you have an account and want it (and all your scans) deleted, contact us
          through the project&apos;s{' '}
          <a
            href="https://github.com/MDPorsch/posturescan/issues"
            target="_blank"
            rel="noreferrer"
            className="ps-link"
          >
            GitHub issues
          </a>
          .
        </p>
      </div>

      {/* ── Cookies ── */}
      <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight">
        Cookies and storage
      </h2>
      <p className="mt-5 text-base leading-relaxed text-emerald-50/75">
        We don&apos;t set tracking cookies. When you sign in, the browser stores a JWT
        access and refresh token in local storage so the site can keep you signed in. That
        token isn&apos;t shared with anyone else and lives only in your browser.
      </p>

      {/* ── Questions ── */}
      <div className="ps-card mt-14 p-8">
        <h3 className="font-display text-xl font-semibold tracking-tight">Questions?</h3>
        <p className="mt-3 text-emerald-50/70">
          Open an issue on the{' '}
          <a
            href="https://github.com/MDPorsch/posturescan/issues"
            target="_blank"
            rel="noreferrer"
            className="ps-link"
          >
            PostureScan GitHub repository
          </a>
          {' '}— we respond. You can also reach the team through any contact listed on
          the <Link to="/team" className="ps-link">team page</Link>.
        </p>
      </div>
    </div>
  )
}
