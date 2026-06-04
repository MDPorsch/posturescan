import { useEffect, useState } from 'react'
import { SCAN_STEPS } from '../lib/scan.js'

/**
 * Visual progress strip. Pass `done` (boolean) once the actual scan returns
 * to snap every step to complete; otherwise the steps animate forward on
 * their own timer so the user sees motion even while the synchronous backend
 * request is in flight.
 */
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
    <ol className="space-y-3">
      {SCAN_STEPS.map((label, i) => {
        const state = done || i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <li
            key={label}
            className="flex items-center gap-3 animate-rise"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              className={[
                'flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition',
                state === 'done'   && 'border-emerald-500 bg-emerald-500 text-slate-950',
                state === 'active' && 'border-emerald-500 bg-slate-900 text-emerald-400 animate-pulse-emerald',
                state === 'idle'   && 'border-border-subtle text-emerald-50/30',
              ].filter(Boolean).join(' ')}
            >
              {state === 'done' ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (i + 1)}
            </span>
            <span
              className={[
                'font-body text-sm tracking-tight transition',
                state === 'done'   && 'text-emerald-50',
                state === 'active' && 'text-emerald-100',
                state === 'idle'   && 'text-emerald-50/40',
              ].filter(Boolean).join(' ')}
            >
              {label}{state === 'active' && '…'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
