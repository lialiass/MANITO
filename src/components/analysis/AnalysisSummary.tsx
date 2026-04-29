import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react'
import { minutesToReadable, type MonthStats } from '../../lib/calculations'
import { formatDayShort } from '../../lib/dateUtils'
import type { ChartDataPoint } from '../../pages/Analyse'

interface AnalysisSummaryProps {
  monthStats:            MonthStats
  chartData:             ChartDataPoint[]
  referenceRatePercent:  number
}

interface SummaryTileProps {
  icon:     React.ReactNode
  label:    string
  value:    string
  sub?:     string
  color?:   string
  accent?:  string
}

function SummaryTile({ icon, label, value, sub, color = 'text-white', accent = 'bg-[#162440]' }: SummaryTileProps) {
  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-3.5 flex flex-col gap-2.5">
      <div className={`${accent} p-2 rounded-xl self-start`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] uppercase tracking-wide">{label}</p>
        <p className={`text-lg font-black tabular-nums leading-tight ${color}`}>{value}</p>
        {sub && <p className="text-slate-600 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AnalysisSummary({ monthStats, chartData, referenceRatePercent }: AnalysisSummaryProps) {
  if (chartData.length === 0) {
    return (
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4 text-center py-6">
        <p className="text-slate-500 text-sm">Aucune donnée pour ce mois.</p>
        <p className="text-slate-600 text-xs mt-1">Saisissez des journées pour voir l'analyse.</p>
      </div>
    )
  }

  // Jours au-dessus / en-dessous du taux cible
  const daysAbove = chartData.filter((d) => d.txService >= referenceRatePercent).length
  const daysBelow = chartData.length - daysAbove

  // Meilleure et pire journée (par écart)
  const bestDay  = chartData.reduce((a, b) => (b.gapMins > a.gapMins ? b : a))
  const worstDay = chartData.reduce((a, b) => (b.gapMins < a.gapMins ? b : a))

  const bestGapColor  = bestDay.gapMins  >= 0 ? 'text-emerald-400' : 'text-red-400'
  const worstGapColor = worstDay.gapMins >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* TxService moyen */}
      <SummaryTile
        icon={<Target size={15} className="text-blue-400" />}
        label="TxService moyen"
        value={`${monthStats.avgServiceRatePercent.toFixed(1)} %`}
        sub={`Objectif : ${referenceRatePercent} %`}
        color={monthStats.avgServiceRatePercent >= referenceRatePercent ? 'text-emerald-400' : 'text-red-400'}
        accent="bg-blue-500/10"
      />

      {/* Jours / objectif */}
      <SummaryTile
        icon={<Award size={15} className="text-amber-400" />}
        label="Objectif atteint"
        value={`${daysAbove} / ${chartData.length}`}
        sub={`${daysBelow} en dessous`}
        color="text-white"
        accent="bg-amber-500/10"
      />

      {/* Meilleure journée */}
      <SummaryTile
        icon={<TrendingUp size={15} className="text-emerald-400" />}
        label="Meilleure journée"
        value={`${bestDay.gapMins >= 0 ? '+' : ''}${minutesToReadable(bestDay.gapMins)}`}
        sub={formatDayShort(bestDay.dateISO)}
        color={bestGapColor}
        accent="bg-emerald-500/10"
      />

      {/* Journée la plus difficile */}
      <SummaryTile
        icon={<TrendingDown size={15} className="text-red-400" />}
        label="Journée difficile"
        value={`${worstDay.gapMins >= 0 ? '+' : ''}${minutesToReadable(worstDay.gapMins)}`}
        sub={formatDayShort(worstDay.dateISO)}
        color={worstGapColor}
        accent="bg-red-500/10"
      />
    </div>
  )
}
