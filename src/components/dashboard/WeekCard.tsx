import { minutesToReadable, type MonthStats } from '../../lib/calculations'

interface WeekCardProps {
  weekStats: MonthStats
}

function WeekRow({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a2d4a]/60 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}

export default function WeekCard({ weekStats }: WeekCardProps) {
  const hasData   = weekStats.daysCount > 0
  const gap       = weekStats.monthlyGapMins
  const gapColor  = gap > 0 ? 'text-emerald-400' : gap < 0 ? 'text-red-400' : 'text-slate-400'
  const gapDisplay = `${gap >= 0 ? '+' : ''}${minutesToReadable(gap)}`

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-semibold text-sm">Semaine en cours</p>
        <span className="text-slate-500 text-xs">
          {hasData ? `${weekStats.daysCount} j` : '—'}
        </span>
      </div>

      {hasData ? (
        <>
          <WeekRow label="Conduite" value={minutesToReadable(weekStats.totalDrivingMins)} />
          <WeekRow label="Travail annexe" value={minutesToReadable(weekStats.totalWorkMins)} />
          <WeekRow label="Service total"  value={minutesToReadable(weekStats.totalServiceMins)} />
          <WeekRow
            label="TxService moyen"
            value={weekStats.avgServiceRatePercent > 0
              ? `${weekStats.avgServiceRatePercent.toFixed(1)} %`
              : '—'}
          />
          <WeekRow
            label="Écart semaine"
            value={gapDisplay}
            color={gapColor}
          />
        </>
      ) : (
        <p className="text-slate-600 text-sm">Aucune saisie cette semaine.</p>
      )}
    </div>
  )
}
