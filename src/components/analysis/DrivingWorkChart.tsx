import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { minutesToReadable } from '../../lib/calculations'
import type { ChartDataPoint } from '../../pages/Analyse'

interface DrivingWorkChartProps {
  data: ChartDataPoint[]
}

// ── Tooltip ───────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1526] border border-[#1e3560] rounded-xl px-3 py-2.5 text-xs shadow-xl space-y-1">
      <p className="text-slate-400 mb-1">Jour {label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm inline-block"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-slate-400">{p.name}</span>
          </span>
          <span className="font-bold" style={{ color: p.color }}>
            {minutesToReadable(p.value)}
          </span>
        </div>
      ))}
      <div className="border-t border-[#1a2d4a] pt-1 mt-1 flex items-center justify-between">
        <span className="text-slate-500">Service</span>
        <span className="text-white font-bold">
          {minutesToReadable((payload[0]?.value ?? 0) + (payload[1]?.value ?? 0))}
        </span>
      </div>
    </div>
  )
}

// ── Formateur axe Y ───────────────────────────────────────────

function yFormatter(mins: number): string {
  if (mins === 0) return '0'
  const h = Math.floor(mins / 60)
  return h > 0 ? `${h}h` : `${mins}m`
}

// ── État vide ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-[175px] flex items-center justify-center">
      <p className="text-slate-600 text-sm">Aucune donnée pour ce mois.</p>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────

export default function DrivingWorkChart({ data }: DrivingWorkChartProps) {
  const maxMins = data.length
    ? Math.max(...data.map((d) => d.drivingMins + d.workMins), 60)
    : 480
  const yMax = Math.ceil(maxMins / 60) * 60

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-sm">Conduite & travail annexe</p>
          <p className="text-slate-500 text-xs mt-0.5">Répartition du temps de service</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-500">Conduite</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" />
            <span className="text-slate-500">Travail</span>
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={data} margin={{ top: 6, right: 4, left: -10, bottom: 0 }} barCategoryGap="30%">
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
              width={30}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />

            {/* Conduite (fond) */}
            <Bar
              dataKey="drivingMins"
              name="Conduite"
              stackId="service"
              fill="#3b82f6"
              fillOpacity={0.85}
              radius={[0, 0, 0, 0]}
            />
            {/* Travail annexe (dessus) */}
            <Bar
              dataKey="workMins"
              name="Travail"
              stackId="service"
              fill="#8b5cf6"
              fillOpacity={0.85}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
