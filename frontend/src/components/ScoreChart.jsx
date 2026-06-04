import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

export default function ScoreChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="ps-card p-8 text-center text-sm text-emerald-50/50">
        No scan history yet — run a scan to start tracking.
      </div>
    )
  }

  const data = [...history]
    .reverse()
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.score,
      grade: s.grade,
    }))

  return (
    <div className="ps-card p-6">
      <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">Score over time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1A3022" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="date" stroke="#7B8B82" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} stroke="#7B8B82" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#0F1A22', border: '1px solid #1A3022', borderRadius: 8 }}
              labelStyle={{ color: '#A7F3D0' }}
              itemStyle={{ color: '#F0FDF4' }}
              formatter={(v, _n, p) => [`${v} (${p.payload.grade})`, 'Score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#scoreFill)"
              activeDot={{ r: 5, fill: '#10B981', stroke: '#0B1219', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
