import { useEffect, useState } from 'react'
import { SCAN_STEPS } from '../lib/scan.js'

// Tiny inline icons per category — keeps the component free of any icon-library dep.
const ICONS = [
  // resolve domain — globe
  <path key="globe" d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zm0 0c2 2 3 5 3 9s-1 7-3 9m0-18c-2 2-3 5-3 9s1 7 3 9M3 12h18" />,
  // tls — shield with check
  <path key="shield" d="M12 3l8 3v6c0 5-4 8-8 9c-4-1-8-4-8-9V6l8-3zM9 12l2 2 4-4" />,
  // headers — list
  <path key="list" d="M4 7h16M4 12h16M4 17h10" />,
  // cookies — circle with dots
  <g key="cookie"><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none"/><circle cx="14" cy="9" r="0.8" fill="currentColor" stroke="none"/><circle cx="11" cy="14" r="0.8" fill="currentColor" stroke="none"/></g>,
  // redirects — arrow loop
  <path key="redirect" d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 0 0-9 3" />,
  // dns — server stack
  <g key="dns"><rect x="4" y="5" width="16" height="5" rx="1" /><rect x="4" y="13" width="16" height="5" rx="1" /><circle cx="8" cy="7.5" r="0.6" fill="currentColor" stroke="none"/><circle cx="8" cy="15.5" r="0.6" fill="currentColor" stroke="none"/></g>,
  // http version — bolt
  <path key="bolt" d="M13 3L5 13h6l-1 8l8-11h-6z" />,
  // mixed content — overlapping squares
  <g key="mixed"><rect x="4" y="4" width="11" height="11" rx="1" /><rect x="9" y="9" width="11" height="11" rx="1" /></g>,
  // compute — sparkles / processor
  <g key="cpu"><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></g>,
]

export default function ScanProgress({ done = false }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (done) {
      setCurrent(SCAN_STEPS.length)
      return
    }
    const id = setInterval(() => {
      setCurrent((c) => (c < SCAN_STEPS.length - 1 ? c + 1 : c))
    }, 650)
    return () => clearInterval(id)
  }, [done])

  return (
    <ol className="space-y-2.5">
      {SCAN_STEPS.map((label, i) => {
        const state = done || i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <li
            key={label}
            className="flex items-center gap-3.5 animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              className={[
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition',
                state === 'done'   && 'border-emerald-500 bg-emerald-500/15 text-emerald-400',
                state === 'active' && 'border-emerald-500 bg-emerald-500/10 text-emerald-300 animate-pulse-emerald',
                state === 'idle'   && 'border-border-subtle text-emerald-50/25',
              ].filter(Boolean).join(' ')}
            >
              {state === 'done' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8 L7 12 L13 4" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[i] || ICONS[ICONS.length - 1]}
                </svg>
              )}
            </span>

            <div className="flex flex-1 items-center justify-between">
              <span
                className={[
                  'font-body text-sm tracking-tight transition',
                  state === 'done'   && 'text-emerald-50',
                  state === 'active' && 'text-emerald-100',
                  state === 'idle'   && 'text-emerald-50/35',
                ].filter(Boolean).join(' ')}
              >
                {label}
              </span>

              {state === 'active' && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                  running
                </span>
              )}
              {state === 'done' && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-500/60">
                  done
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
