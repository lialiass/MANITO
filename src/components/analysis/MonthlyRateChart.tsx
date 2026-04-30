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

// ── Composant légende — grille fixe [trait | texte] ──────────
// grid-cols-[28px_1fr] : trait toujours à la même position X,
// texte toujours aligné au même point de départ.

function LegendItem({
  colorClass,
  label,
  dashed = false,
}: {
  colorClass: string
  label: string
  dashed?: boolean
}) {
  return (
    <div className="grid grid-cols-[28px_1fr] items-center gap-2">
      <span
        className={[
          'block w-7 h-0 border-t-2',
          dashed ? 'border-dashed' : 'border-solid',
          colorClass,
        ].join(' ')}
      />
      <span className="text-slate-500 text-[10px] whitespace-nowrap">{label}</span>
    </div>
  )
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

  // Afficher uniquement les jours pairs (2, 4, 6…) sur l'axe X
  const evenTicks = data.filter((_, i) => i % 2 === 1).map((d) => d.label)

  return (
    <div className="bg-[#0e1628] border border-[#162030] rounded-2xl p-4">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Taux de service journalier</p>
          <p className="text-slate-500 text-xs mt-0.5">TxService % — jour par jour</p>
        </div>
        <div className="flex flex-col gap-2">
          <LegendItem colorClass="border-blue-400"  label="Réel" />
          <LegendItem colorClass="border-amber-400" label={`Objectif ${referenceRatePercent} %`} dashed />
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTxService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#142035" vertical={false} />
            <XAxis
              dataKey="label"
              ticks={evenTicks}
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
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e3560', strokeWidth: 1 }} />

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
