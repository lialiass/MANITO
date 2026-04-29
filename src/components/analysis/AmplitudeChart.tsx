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
import { minutesToReadable } from '../../lib/calculations'
import type { ChartDataPoint } from '../../pages/Analyse'

interface AmplitudeChartProps {
  data: ChartDataPoint[]
}

// Amplitude max légale : 13h = 780 min
const MAX_LEGAL_AMPLITUDE_MINS = 780

// ── Tooltip ───────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number | null }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value ?? null

  return (
    <div className="bg-[#0d1526] border border-[#1e3560] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">Jour {label}</p>
      <p className="text-cyan-300 font-bold">
        {val !== null ? minutesToReadable(val) : '—'}
      </p>
    </div>
  )
}

// ── Formateur axe Y ───────────────────────────────────────────

function yFormatter(mins: number): string {
  if (mins === 0) return '0'
  const h = Math.floor(mins / 60)
  return `${h}h`
}

// ── État vide ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-[165px] flex items-center justify-center">
      <p className="text-slate-600 text-sm">Aucune donnée pour ce mois.</p>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────

export default function AmplitudeChart({ data }: AmplitudeChartProps) {
  // Filtrer les données avec amplitude nulle (journées sans horaires complets)
  const hasAmpData = data.some((d) => d.amplitudeMins !== null)

  // Données adaptées : null → 0 pour recharts (on affichera null comme absent)
  const chartData = data.map((d) => ({
    ...d,
    amplitudeMins: d.amplitudeMins ?? 0,
  }))

  const maxAmp = chartData.length
    ? Math.max(...chartData.map((d) => d.amplitudeMins), MAX_LEGAL_AMPLITUDE_MINS)
    : MAX_LEGAL_AMPLITUDE_MINS
  const yMax = Math.ceil(maxAmp / 60) * 60 + 60

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Amplitude journalière</p>
          <p className="text-slate-500 text-xs mt-0.5">Durée entre prise et fin de service</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] bg-cyan-400 inline-block rounded-full" />
            <span className="text-slate-500">Amplitude</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[2px] border-t border-dashed border-red-400/60 inline-block" />
            <span className="text-slate-500">Max légal 13h</span>
          </span>
        </div>
      </div>

      {!hasAmpData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={165}>
          <AreaChart data={chartData} margin={{ top: 6, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAmplitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, yMax]}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={yFormatter}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e3560', strokeWidth: 1 }} />

            {/* Limite légale */}
            <ReferenceLine
              y={MAX_LEGAL_AMPLITUDE_MINS}
              stroke="#ef4444"
              strokeOpacity={0.5}
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />

            <Area
              type="monotone"
              dataKey="amplitudeMins"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#gradAmplitude)"
              dot={{ fill: '#06b6d4', r: 2.5, strokeWidth: 0 }}
              activeDot={{ fill: '#67e8f9', r: 4, strokeWidth: 0 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
