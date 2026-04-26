import { minutesToReadable, type MonthStats } from '../../lib/calculations'

interface TotalsCardProps {
  monthStats: MonthStats
  monthLabel: string
}

interface TotalItemProps {
  label: string
  value: string
  accent?: boolean
}

function TotalItem({ label, value, accent }: TotalItemProps) {
  return (
    <div className="bg-[#080d1a] rounded-xl px-3 py-2.5">
      <p className="text-slate-600 text-[10px] uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${accent ? 'text-blue-300' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

export default function TotalsCard({ monthStats, monthLabel }: TotalsCardProps) {
  const hasData = monthStats.daysCount > 0

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-semibold text-sm">Totaux du mois</p>
        <span className="text-slate-500 text-xs capitalize">{monthLabel}</span>
      </div>

      {hasData ? (
        <div className="grid grid-cols-2 gap-2">
          <TotalItem
            label="Conduite"
            value={minutesToReadable(monthStats.totalDrivingMins)}
          />
          <TotalItem
            label="Travail annexe"
            value={minutesToReadable(monthStats.totalWorkMins)}
          />
          <TotalItem
            label="Service"
            value={minutesToReadable(monthStats.totalServiceMins)}
            accent
          />
          <TotalItem
            label="Amplitude"
            value={monthStats.totalAmplitudeMins > 0
              ? minutesToReadable(monthStats.totalAmplitudeMins)
              : '—'}
          />
          <TotalItem
            label="Jours saisis"
            value={`${monthStats.daysCount} j`}
          />
          <TotalItem
            label="TxAmp moyen"
            value={monthStats.avgAmplitudeRatePercent > 0
              ? `${monthStats.avgAmplitudeRatePercent.toFixed(1)} %`
              : '—'}
          />
        </div>
      ) : (
        <p className="text-slate-600 text-sm">Aucune journée saisie.</p>
      )}
    </div>
  )
}
