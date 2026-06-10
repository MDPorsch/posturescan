const TEAM = [
  {
    name: 'Mohammed Orunsolu',
    role: 'Lead engineer',
    bio: 'Cybersecurity engineer. Founder of ',
    bioLink: { label: 'Breachrr', url: 'https://breachrr.com' },
  },
  {
    name: 'Aishat Igbinadalor',
    role: 'DevOps',
    bio: 'Aspiring DevOps engineer with a background in IT support and key account management, focused on building efficient and scalable cloud solutions.',
  },
  {
    name: 'Jimoh Kabiru Adinoyi',
    role: 'Cloud computing',
    bio: 'Dedicated to becoming a certified cloud computing engineer.',
  },
  {
    name: 'Ogidi Ifunanya Linda',
    role: 'Cloud computing',
    bio: 'Working towards becoming a certified Cloud Computing Engineer.',
  },
  {
    name: 'Jeffrey Umulor',
    role: 'Cloud engineering',
    bio: 'Cloud engineer in-training.',
  },
  {
    name: 'Abuachi Uzoma Mc-David',
    role: 'Cloud engineering',
    bio: 'Working towards becoming a certified Cloud Engineer.',
  },
  {
    name: 'Akah Hilary Erunke',
    role: 'Networking & security',
    bio: 'Aspiring Cloud Networking & Security Engineer.',
  },
  {
    name: 'Olubiyi Blessed',
    role: 'Software engineering',
    bio: 'Software engineering student with experience in web application development and cloud computing.',
  },
  {
    name: 'Wisdom Ayonitemi',
    role: 'Cloud computing',
    bio: 'Passionate about cloud computing and working towards becoming a certified Cloud Computing Engineer.',
  },
]

function initials(fullName) {
  const parts = fullName.replace(/-/g, ' ').split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '··'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Team() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">the team</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Built by nine.
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-emerald-50/70">
        PostureScan is a capstone project from the TechCrush Cloud &amp; DevOps cohort.
        Engineering, infrastructure, security, design — every part of it was built by
        someone on this list.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((m) => (
          <article key={m.name} className="ps-card flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-display text-base font-semibold text-emerald-400"
                style={{ boxShadow: 'inset 0 0 0 1.5px rgba(16,185,129,0.35)' }}
                aria-hidden="true"
              >
                {initials(m.name)}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold tracking-tight">{m.name}</h2>
                <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-400/85">
                  {m.role}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-emerald-50/70">
              {m.bio}
              {m.bioLink && (
                <a
                  href={m.bioLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ps-link"
                >
                  {m.bioLink.label}
                </a>
              )}
              {m.bioLink && '.'}
            </p>
          </article>
        ))}
      </div>

      <div className="ps-card mt-12 p-8">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Built across disciplines.
        </h2>
        <p className="mt-3 max-w-3xl text-emerald-50/70">
          PostureScan grades external web security — TLS, headers, cookies, DNS,
          redirects, mixed content. None of that is one-person work. The shape of
          the product — which checks to include, how to mask hostnames without
          breaking trust, what a stranger sees the first time they hit{' '}
          <span className="font-mono text-emerald-300">/dashboard</span> — came
          from nine people arguing through every default. Every claim PostureScan
          makes has been questioned by someone who would know.
        </p>
      </div>
    </div>
  )
}
