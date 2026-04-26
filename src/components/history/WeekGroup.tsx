import { useMemo } from 'react'
import { calcMonthStats, minutesToReadable, type DayEntry } from '../../lib/calculations'
import { formatWeekLabel } from '../../lib/dateUtils'
import DayCard from './DayCard'

interface WeekGroupProps {
  weekKey: string
  entries: DayEntry[]
  referenceRatePercent: number
  onEdit:   (entry: DayEntry) => void
  onDelete: (id: string) => void
}

export default function WeekGroup({ weekKey, entries, referenceRatePercent, onEdit, onDelete }: WeekGroupProps) {
  // Totaux de la semaine via calcMonthStats (même logique que le mois)
  const total = useMemo(
    () => calcMonthStats(entries, referenceRatePercent),
    [entries, referenceRatePercent]
  )

  const weekLabel = formatWeekLabel(weekKey, entries[0].date)
  const gapColor  = total.monthlyGapMins >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className="space-y-2">
      {/* ── En-tête de semaine ──────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          {weekLabel}
        </p>
        <p className="text-slate-600 text-xs">
          {entries.length} jour{entries.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Journées ────────────────────────────────────────── */}
      {entries.map((entry) => (
        <DayCard
          key={entry.id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* ── Total de la semaine ─────────────────────────────── */}
      <div className="bg-[#111e35] border border-[#1e3560] rounded-2xl px-4 py-3 ml-2 border-l-2 border-l-blue-600/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-blue-300/70 text-[11px] font-semibold uppercase tracking-wider">
            Total semaine
          </p>
          <p className={`text-xs font-bold tabular-nums ${gapColor}`}>
            Écart {total.monthlyGapMins >= 0 ? '+' : ''}{minutesToReadable(total.monthlyGapMins)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-1">
          <StatCell label="Conduite" value={minutesToReadable(total.totalDrivingMins)} />
          <StatCell label="Travail"  value={minutesToReadable(total.totalWorkMins)} />
          <StatCell label="Service"  value={minutesToReadable(total.totalServiceMins)} />
          <StatCell
            label="Amplitude"
            value={total.totalAmplitudeMins > 0 ? minutesToReadable(total.totalAmplitudeMins) : '—'}
          />
          <StatCell
            label="TxAmp moy."
            value={total.avgAmplitudeRatePercent > 0
              ? `${total.avgAmplitudeRatePercent.toFixed(1)} %`
              : '—'}
          />
          <StatCell
            label="TxService"
            value={total.avgServiceRatePercent > 0
              ? `${total.avgServiceRatePercent.toFixed(1)} %`
              : '—'}
          />
        </div>
      </div>
    </div>
  )
}

// Cellule de stat dans le total
function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-600 text-[10px] uppercase tracking-wide">{label}</p>
      <p className="text-slate-300 text-xs font-bold tabular-nums">{value}</p>
    </div>
  )
}
