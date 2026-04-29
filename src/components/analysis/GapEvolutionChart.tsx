import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { minutesToReadable } from '../../lib/calculations'
import type { ChartDataPoint } from '../../pages/Analyse'

interface GapEvolutionChartProps {
  data: ChartDataPoint[]
}

// ── Tooltip ───────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const val   = payload[0]?.value ?? 0
  const color = val >= 0 ? 'text-emerald-400' : 'text-red-400'
  const sign  = val >= 0 ? '+' : ''
  return (
    <div className="bg-[#0d1526] border border-[#1e3560] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">Jour {label}</p>
      <p className={`font-bold ${color}`}>
        {sign}{minutesToReadable(val)}
      </p>
    </div>
  )
}

// ── État vide ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-[170px] flex items-center justify-center">
      <p className="text-slate-600 text-sm">Aucune donnée pour ce mois.</p>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────

export default function GapEvolutionChart({ data }: GapEvolutionChartProps) {
  // Bornes symétriques pour l'axe Y
  const absMax = data.length
    ? Math.max(...data.map((d) => Math.abs(d.gapMins)), 30)
    : 60
  const yMax = Math.ceil(absMax / 30) * 30 + 15

  // Formateur d'axe Y : affiche en heures abrégées
  function yFormatter(mins: number) {
    if (mins === 0) return '0'
    const h = Math.floor(Math.abs(mins) / 60)
    const m = Math.abs(mins) % 60
    if (h === 0) return `${mins < 0 ? '-' : ''}${m}m`
    return `${mins < 0 ? '-' : ''}${h}h`
  }

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Écart journalier au taux</p>
          <p className="text-slate-500 text-xs mt-0.5">Positif = disponible · Négatif = surchargé</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70 inline-block" />
            <span className="text-slate-500">Excédent</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 inline-block" />
            <span className="text-slate-500">Déficit</span>
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={data} margin={{ top: 6, right: 4, left: -10, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[-yMax, yMax]}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={yFormatter}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={0} stroke="#2d4a7a" strokeWidth={1.5} />

            <Bar dataKey="gapMins" radius={[3, 3, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.gapMins >= 0 ? '#10b981' : '#ef4444'}
                  fillOpacity={0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
