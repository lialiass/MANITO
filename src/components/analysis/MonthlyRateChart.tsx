import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { ChartDataPoint } from '../../pages/Analyse'

interface MonthlyRateChartProps {
  data:                  ChartDataPoint[]
  referenceRatePercent:  number
}

// ── Tooltip personnalisé ──────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value ?? 0
  return (
    <div className="bg-[#0d1526] border border-[#1e3560] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">Jour {label}</p>
      <p className="text-blue-300 font-bold">{val.toFixed(2)} %</p>
    </div>
  )
}

// ── État vide ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-[180px] flex flex-col items-center justify-center gap-2">
      <p className="text-slate-600 text-sm">Aucune donnée pour ce mois.</p>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────

export default function MonthlyRateChart({ data, referenceRatePercent }: MonthlyRateChartProps) {
  const maxY = data.length
    ? Math.ceil(Math.max(...data.map((d) => d.txService), referenceRatePercent) / 5) * 5 + 5
    : 40

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Taux de service journalier</p>
          <p className="text-slate-500 text-xs mt-0.5">TxService % — jour par jour</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-blue-400 inline-block rounded-full" />
            <span className="text-slate-500">Réel</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] border-t border-dashed border-amber-400 inline-block" />
            <span className="text-slate-500">Objectif {referenceRatePercent} %</span>
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 6, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTxService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a2d4a"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, maxY]}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={34}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e3560', strokeWidth: 1 }} />

            {/* Ligne objectif */}
            <ReferenceLine
              y={referenceRatePercent}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />

            <Area
              type="monotone"
              dataKey="txService"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradTxService)"
              dot={{ fill: '#3b82f6', r: 2.5, strokeWidth: 0 }}
              activeDot={{ fill: '#60a5fa', r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
