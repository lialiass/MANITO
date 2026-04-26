import { useState, useMemo } from 'react'
import { Pencil, Trash2, AlertTriangle, Clock, Activity } from 'lucide-react'
import { calcDayStats, minutesToReadable, type DayEntry } from '../../lib/calculations'
import { formatDayShort } from '../../lib/dateUtils'
import { useRateForYear } from '../../store/useSettingsStore'

interface DayCardProps {
  entry: DayEntry
  onEdit:   (entry: DayEntry) => void
  onDelete: (id: string) => void
}

export default function DayCard({ entry, onEdit, onDelete }: DayCardProps) {
  const [confirming, setConfirming] = useState(false)

  const entryYear = parseInt(entry.date.slice(0, 4), 10)
  const referenceRatePercent = useRateForYear(entryYear)

  const stats = useMemo(
    () => calcDayStats(entry, referenceRatePercent),
    [entry, referenceRatePercent]
  )

  const gapPositive = stats.gapMins >= 0
  const gapColor    = gapPositive ? 'text-emerald-400' : 'text-red-400'
  const gapDisplay  = `${gapPositive ? '+' : ''}${minutesToReadable(stats.gapMins)}`

  // ── Vue confirmation suppression ──────────────────────────
  if (confirming) {
    return (
      <div className="bg-[#0e1628] border border-red-500/40 rounded-2xl p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-white text-sm font-medium">
            Supprimer le{' '}
            <span className="capitalize">{formatDayShort(entry.date)}</span> ?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-2.5 rounded-xl bg-[#162440] text-slate-300 text-sm font-medium border border-[#1a2d4a] active:opacity-70 transition-opacity"
          >
            Annuler
          </button>
          <button
            onClick={() => onDelete(entry.id!)}
            className="flex-1 py-2.5 rounded-xl bg-red-600/80 text-white text-sm font-semibold active:opacity-70 transition-opacity"
          >
            Supprimer
          </button>
        </div>
      </div>
    )
  }

  // ── Vue normale ────────────────────────────────────────────
  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* Ligne 1 : date + actions */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-white text-sm font-semibold capitalize">
          {formatDayShort(entry.date)}
        </p>
        <div className="flex items-center gap-1">
          {/* Écart (badge coloré) */}
          <span className={`text-xs font-bold tabular-nums mr-1 ${gapColor}`}>
            {gapDisplay}
          </span>
          {/* Modifier */}
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
            aria-label="Modifier"
          >
            <Pencil size={13} />
          </button>
          {/* Supprimer */}
          <button
            onClick={() => setConfirming(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Ligne 2 : métriques principales */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={11} className="text-slate-600" />
          <span className="font-semibold text-white tabular-nums">
            {minutesToReadable(entry.drivingMins)}
          </span>
          {' '}conduite
        </span>

        <span className="text-slate-700 text-xs">·</span>

        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="font-semibold text-white tabular-nums">
            {minutesToReadable(stats.serviceMins)}
          </span>
          {' '}service
        </span>

        <span className="text-slate-700 text-xs">·</span>

        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Activity size={11} className="text-slate-600" />
          <span className="font-semibold text-white tabular-nums">
            {stats.amplitudeMins !== null
              ? minutesToReadable(stats.amplitudeMins)
              : '—'}
          </span>
          {' '}amp.
        </span>
      </div>

      {/* Ligne 3 : détails secondaires */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1a2d4a]/60">
        <span className="text-slate-600 text-[11px] tabular-nums">
          {entry.startTime} → {entry.endTime}
        </span>
        <span className="text-slate-600 text-[11px]">
          TxAmp{' '}
          <span className="text-slate-500">
            {stats.amplitudeRatePercent !== null
              ? `${stats.amplitudeRatePercent.toFixed(1)} %`
              : '—'}
          </span>
        </span>
      </div>
    </div>
  )
}
