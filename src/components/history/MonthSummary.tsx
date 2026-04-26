import { useMemo } from 'react'
import { calcMonthStats, minutesToReadable, type DayEntry } from '../../lib/calculations'

interface MonthSummaryProps {
  entries: DayEntry[]
  referenceRatePercent: number
}

export default function MonthSummary({ entries, referenceRatePercent }: MonthSummaryProps) {
  const stats = useMemo(
    () => calcMonthStats(entries, referenceRatePercent),
    [entries, referenceRatePercent]
  )

  const gapColor   = stats.monthlyGapMins >= 0 ? 'text-emerald-400' : 'text-red-400'
  const gapBg      = stats.monthlyGapMins >= 0 ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-red-500/10 border-red-500/25'
  const gapDisplay = `${stats.monthlyGapMins >= 0 ? '+' : ''}${minutesToReadable(stats.monthlyGapMins)}`

  if (entries.length === 0) {
    return (
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Résumé du mois</p>
        <p className="text-slate-600 text-sm">Aucune journée saisie pour ce mois.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl overflow-hidden">
      {/* En-tête avec écart mensuel mis en avant */}
      <div className={`border-b border-[#1a2d4a] px-4 py-3 flex items-center justify-between ${gapBg}`}>
        <div>
          <p className="text-slate-400 text-[11px] uppercase tracking-wider">Résumé du mois</p>
          <p className="text-white text-xs mt-0.5">
            {stats.daysCount} jour{stats.daysCount > 1 ? 's' : ''} travaillé{stats.daysCount > 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[10px] uppercase tracking-wide">Écart mensuel</p>
          <p className={`text-xl font-bold tabular-nums ${gapColor}`}>{gapDisplay}</p>
        </div>
      </div>

      {/* Grille de stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <SummaryItem label="Conduite totale"  value={minutesToReadable(stats.totalDrivingMins)} />
        <SummaryItem label="Travail total"    value={minutesToReadable(stats.totalWorkMins)} />
        <SummaryItem label="Service total"    value={minutesToReadable(stats.totalServiceMins)} />
        <SummaryItem
          label="Amplitude totale"
          value={stats.totalAmplitudeMins > 0 ? minutesToReadable(stats.totalAmplitudeMins) : '—'}
        />
        <SummaryItem
          label="TxAmp moyen"
          value={stats.avgAmplitudeRatePercent > 0
            ? `${stats.avgAmplitudeRatePercent.toFixed(2)} %`
            : '—'}
        />
        <SummaryItem
          label="TxService moyen"
          value={stats.avgServiceRatePercent > 0
            ? `${stats.avgServiceRatePercent.toFixed(2)} %`
            : '—'}
        />
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#080d1a] rounded-xl px-3 py-2.5">
      <p className="text-slate-600 text-[10px] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-white text-sm font-bold tabular-nums">{value}</p>
    </div>
  )
}
