import { PlusCircle, Clock, Activity, TrendingUp } from 'lucide-react'
import { minutesToReadable, type DayEntry, type DayStats } from '../../lib/calculations'

interface TodayCardProps {
  todayEntry:   DayEntry | undefined
  todayStats:   DayStats | null
  onAddDay:     () => void
}

function MetricBadge({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#080d1a] rounded-xl px-3 py-2.5 flex-1 text-center">
      <p className="text-slate-600 text-[10px] uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}

export default function TodayCard({ todayEntry, todayStats, onAddDay }: TodayCardProps) {
  const hasData = Boolean(todayEntry && todayStats)

  if (!hasData) {
    return (
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-5 flex flex-col items-center gap-4 text-center">
        <div className="bg-[#162440] p-3.5 rounded-2xl">
          <Clock size={22} className="text-slate-500" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Aucune saisie aujourd'hui</p>
          <p className="text-slate-500 text-xs mt-1">Enregistrez votre journée pour mettre à jour le tableau de bord.</p>
        </div>
        <button
          onClick={onAddDay}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors active:scale-95"
        >
          <PlusCircle size={16} />
          Ajouter la journée
        </button>
      </div>
    )
  }

  const s   = todayStats!
  const e   = todayEntry!
  const gap = s.gapMins
  const gapColor   = gap > 0 ? 'text-emerald-400' : gap < 0 ? 'text-red-400' : 'text-slate-400'
  const gapDisplay = `${gap >= 0 ? '+' : ''}${minutesToReadable(gap)}`

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-semibold text-sm">Aujourd'hui</p>
        <span className="text-slate-500 text-xs tabular-nums">
          {e.startTime} → {e.endTime}
        </span>
      </div>

      {/* Métriques principales — 3 badges */}
      <div className="flex gap-2 mb-2.5">
        <MetricBadge
          label="Conduite"
          value={minutesToReadable(e.drivingMins)}
        />
        <MetricBadge
          label="Service"
          value={minutesToReadable(s.serviceMins)}
        />
        <MetricBadge
          label="Amplitude"
          value={s.amplitudeMins !== null ? minutesToReadable(s.amplitudeMins) : '—'}
        />
      </div>

      {/* Ligne secondaire : TxAmp + écart */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center justify-between bg-[#080d1a] rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className="text-slate-600" />
            <span className="text-slate-500 text-xs">TxAmp</span>
          </div>
          <span className="text-white text-xs font-bold tabular-nums">
            {s.amplitudeRatePercent !== null
              ? `${s.amplitudeRatePercent.toFixed(1)} %`
              : '—'}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-between bg-[#080d1a] rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-slate-600" />
            <span className="text-slate-500 text-xs">Écart</span>
          </div>
          <span className={`text-xs font-bold tabular-nums ${gapColor}`}>
            {gapDisplay}
          </span>
        </div>
      </div>
    </div>
  )
}
