import { GRADE_COLORS } from '../lib/grade.js'

export default function GradeCard({ hostname, score, grade, scannedAt, children }) {
  const palette = GRADE_COLORS[grade] || GRADE_COLORS.F
  return (
    <div
      className="ps-card relative overflow-hidden p-8"
      style={{ boxShadow: `0 0 0 1px ${palette.ring}33, 0 24px 64px -24px ${palette.ring}40` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: palette.ring }}
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
            posture report
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">{hostname}</h1>
          {scannedAt && (
            <p className="text-sm text-emerald-50/50">
              Scanned {new Date(scannedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div
            className="grade-pill h-28 w-28 rounded-3xl text-7xl animate-score-pop"
            style={{
              color: palette.text,
              background: palette.bg,
              boxShadow: `inset 0 0 0 2px ${palette.ring}66`,
            }}
          >
            {grade}
          </div>
          <div>
            <div className="font-display text-5xl font-extrabold leading-none animate-score-pop" style={{ animationDelay: '120ms' }}>{score}</div>
            <div className="mt-1 text-sm text-emerald-50/60">out of 100</div>
            <div className="mt-2 text-xs font-medium uppercase tracking-wider"
                 style={{ color: palette.text }}>
              {palette.label}
            </div>
          </div>
        </div>
      </div>

      {children && <div className="relative mt-6 border-t border-border-subtle/60 pt-6">{children}</div>}
    </div>
  )
}
