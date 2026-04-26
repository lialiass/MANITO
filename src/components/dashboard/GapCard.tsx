import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { minutesToReadable, type MonthStats } from '../../lib/calculations'

interface GapCardProps {
  monthStats: MonthStats
}

export default function GapCard({ monthStats }: GapCardProps) {
  const gap     = monthStats.monthlyGapMins
  const hasData = monthStats.daysCount > 0

  // Couleur et icône
  const isPositive = gap > 0
  const isNeutral  = gap === 0

  const color  = !hasData ? 'text-slate-600'
    : isPositive            ? 'text-emerald-400'
    : isNeutral             ? 'text-slate-400'
    : gap > -60             ? 'text-amber-400'
    :                         'text-red-400'

  const bg     = !hasData ? 'bg-[#0e1628] border-[#1a2d4a]'
    : isPositive            ? 'bg-emerald-500/5 border-emerald-500/20'
    : isNeutral             ? 'bg-[#0e1628] border-[#1a2d4a]'
    : gap > -60             ? 'bg-amber-500/5 border-amber-500/20'
    :                         'bg-red-500/5 border-red-500/20'

  const label  = !hasData  ? 'Aucune donnée'
    : isPositive            ? 'Disponible'
    : isNeutral             ? 'Dans le taux'
    : gap > -60             ? 'Proche du seuil'
    :                         'Dépassement'

  const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown

  const gapDisplay = hasData
    ? `${gap >= 0 ? '+' : ''}${minutesToReadable(gap)}`
    : '—'

  return (
    <div className={`rounded-2xl p-4 border ${bg}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-[11px] uppercase tracking-widest font-medium leading-tight">
          Écart mensuel<br />cumulé
        </p>
        <Icon size={16} className={color} />
      </div>

      <p className={`text-3xl font-black tabular-nums leading-none ${color}`}>
        {gapDisplay}
      </p>

      <p className={`text-xs font-medium mt-1.5 ${color} opacity-80`}>{label}</p>
    </div>
  )
}
