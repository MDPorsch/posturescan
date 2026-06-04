import { useState } from 'react'
import { STATUS_COLORS } from '../lib/grade.js'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }
  return (
    <button onClick={onCopy} className="ps-btn-ghost px-3 py-1.5 text-xs">
      {copied ? 'Copied' : 'Copy fix'}
    </button>
  )
}

export default function CheckResult({ result }) {
  const color = STATUS_COLORS[result.status] || STATUS_COLORS.info
  return (
    <article className="ps-card animate-rise p-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-2.5 w-2.5 rounded-full"
              style={{ background: color }}
              aria-hidden="true"
            />
            <h3 className="font-display text-base font-semibold tracking-tight">
              {result.check_key.replace(/_/g, ' ')}
            </h3>
          </div>
          {result.observed_value && (
            <p className="mt-1.5 break-words font-mono text-xs text-emerald-50/60">
              {result.observed_value}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: `${color}22`, color }}
          >
            {result.status}
          </span>
          {result.score_impact !== 0 && (
            <span className="font-mono text-xs text-emerald-50/40">
              {result.score_impact > 0 ? '+' : ''}{result.score_impact}
            </span>
          )}
        </div>
      </header>

      {result.remediation && result.status !== 'pass' && (
        <div className="mt-4 rounded-xl border border-border-subtle/60 bg-slate-950/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
              How to fix
            </p>
            <CopyButton text={result.remediation} />
          </div>
          <p className="font-body text-sm leading-relaxed text-emerald-50/85">
            {result.remediation}
          </p>
        </div>
      )}
    </article>
  )
}
