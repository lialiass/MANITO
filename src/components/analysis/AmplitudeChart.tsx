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

// Seuils réglementaires
const RECOMMENDED_AMPLITUDE_MINS = 780   // 13h — recommandé (santé)
const MAX_LEGAL_AMPLITUDE_MINS   = 900   // 15h — max légal

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
  const hasAmpData = data.some((d) => d.amplitudeMins !== null)

  const chartData = data.map((d) => ({
    ...d,
    amplitudeMins: d.amplitudeMins ?? 0,
  }))

  const maxAmp = chartData.length
    ? Math.max(...chartData.map((d) => d.amplitudeMins), MAX_LEGAL_AMPLITUDE_MINS)
    : MAX_LEGAL_AMPLITUDE_MINS
  const yMax = Math.ceil(maxAmp / 60) * 60 + 60

  // Afficher uniquement les jours pairs (2, 4, 6…) sur l'axe X
  const evenTicks = data.filter((_, i) => i % 2 === 1).map((d) => d.label)

  return (
    <div className="bg-[#0e1628] border border-[#162030] rounded-2xl p-4">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Amplitude journalière</p>
          <p className="text-slate-500 text-xs mt-0.5">Durée entre prise et fin de service</p>
        </div>
        {/* Légende — grille fixe pour alignement parfait */}
        <div className="flex flex-col gap-2">
          <LegendItem colorClass="border-cyan-400"  label="Amplitude" />
          <LegendItem colorClass="border-amber-400" label="Recommandé 13h" dashed />
          <LegendItem colorClass="border-red-400"   label="Max légal 15h"  dashed />
        </div>
      </div>

      {!hasAmpData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={165}>
          <AreaChart data={chartData} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAmplitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
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
              domain={[0, yMax]}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={yFormatter}
              width={34}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e3560', strokeWidth: 1 }} />

            {/* Amplitude recommandée (13h) */}
            <ReferenceLine
              y={RECOMMENDED_AMPLITUDE_MINS}
              stroke="#f59e0b"
              strokeOpacity={0.65}
              strokeDasharray="5 4"
              strokeWidth={1.5}
            />
            {/* Limite légale (15h) */}
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
