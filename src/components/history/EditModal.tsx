import { useState, useMemo, useEffect } from 'react'
import { X, Zap, AlertCircle, Clock, CalendarDays } from 'lucide-react'
import { calcDayStats, minutesToReadable, type DayEntry } from '../../lib/calculations'
import { useDaysStore } from '../../store/useDaysStore'
import { useRateForYear } from '../../store/useSettingsStore'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function minsToH(mins: number): string {
  const h = Math.floor(mins / 60)
  return h > 0 ? String(h) : ''
}
function minsToM(mins: number): string {
  const m = mins % 60
  return m > 0 ? String(m) : ''
}

// ------------------------------------------------------------
// Sous-composant : saisie d'une durée (heures + minutes)
// Logique identique à Saisie.tsx — à extraire en composant partagé
// lors d'une prochaine phase de refactoring.
// ------------------------------------------------------------

interface DurationInputProps {
  label: string
  hours: string
  minutes: string
  onHoursChange: (v: string) => void
  onMinutesChange: (v: string) => void
  error?: string
}

function DurationInput({ label, hours, minutes, onHoursChange, onMinutesChange, error }: DurationInputProps) {
  function handleHours(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits === '' || parseInt(digits, 10) <= 23) onHoursChange(digits)
  }
  function handleMinutes(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits === '' || parseInt(digits, 10) <= 59) onMinutesChange(digits)
  }

  return (
    <div className={`bg-[#080d1a] border rounded-xl p-3 ${error ? 'border-red-500/50' : 'border-[#1a2d4a]'}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Clock size={12} className="text-slate-600" />
        <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full bg-[#0e1628] border border-[#1a2d4a] rounded-lg flex items-center justify-center px-2 py-2 focus-within:border-blue-500/60 transition-colors">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={hours}
              placeholder="00"
              onChange={(e) => handleHours(e.target.value)}
              className="w-full bg-transparent text-white text-xl font-bold text-center focus:outline-none placeholder:text-slate-700"
            />
          </div>
          <span className="text-slate-700 text-[10px]">h</span>
        </div>
        <span className="text-slate-700 text-lg font-light pb-4">:</span>
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full bg-[#0e1628] border border-[#1a2d4a] rounded-lg flex items-center justify-center px-2 py-2 focus-within:border-blue-500/60 transition-colors">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={minutes}
              placeholder="00"
              onChange={(e) => handleMinutes(e.target.value)}
              className="w-full bg-transparent text-white text-xl font-bold text-center focus:outline-none placeholder:text-slate-700"
            />
          </div>
          <span className="text-slate-700 text-[10px]">min</span>
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-red-400 text-[11px] mt-1.5">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------
// Sous-composant : ligne de résultat live
// ------------------------------------------------------------

function ResultLine({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a2d4a]/60 last:border-0">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-xs font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}

// ------------------------------------------------------------
// Props du modal
// ------------------------------------------------------------

interface EditModalProps {
  entry: DayEntry
  onClose: () => void
}

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------

export default function EditModal({ entry, onClose }: EditModalProps) {
  const { updateDay } = useDaysStore()

  // ── État du formulaire (pré-rempli depuis l'entrée) ────────
  const [date,       setDate]       = useState(entry.date)

  // ── Taux de référence selon l'année de la date en cours ───
  const dateYear = parseInt(date.slice(0, 4), 10) || new Date().getFullYear()
  const referenceRatePercent = useRateForYear(dateYear)
  const [startTime,  setStartTime]  = useState(entry.startTime)
  const [endTime,    setEndTime]    = useState(entry.endTime)
  const [drivingH,   setDrivingH]   = useState(minsToH(entry.drivingMins))
  const [drivingM,   setDrivingM]   = useState(minsToM(entry.drivingMins))
  const [workH,      setWorkH]      = useState(minsToH(entry.workMins))
  const [workM,      setWorkM]      = useState(minsToM(entry.workMins))
  const [errors,     setErrors]     = useState<Record<string, string>>({})

  // Bloquer le scroll du body pendant que le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Valeurs dérivées ──────────────────────────────────────
  const drivingMins = (parseInt(drivingH, 10) || 0) * 60 + (parseInt(drivingM, 10) || 0)
  const workMins    = (parseInt(workH, 10) || 0) * 60 + (parseInt(workM, 10) || 0)

  // ── Calcul live ───────────────────────────────────────────
  const stats = useMemo(() => {
    if (!startTime || !endTime || drivingMins <= 0) return null
    return calcDayStats({ drivingMins, workMins, startTime, endTime }, referenceRatePercent)
  }, [drivingMins, workMins, startTime, endTime])

  // ── Validation ────────────────────────────────────────────
  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!date)                                      errs.date       = 'Date requise'
    if (!startTime)                                 errs.startTime  = 'Heure de début requise'
    if (!endTime)                                   errs.endTime    = 'Heure de fin requise'
    if (startTime && endTime && endTime <= startTime) errs.endTime  = 'La fin doit être après le début'
    if (drivingMins <= 0)                           errs.drivingMins = 'Conduite > 0 requis'
    return errs
  }

  // ── Sauvegarde ────────────────────────────────────────────
  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    updateDay(entry.id!, { date, startTime, endTime, drivingMins, workMins })
    onClose()
  }

  // ── Écart display ─────────────────────────────────────────
  const gapColor   = stats ? (stats.gapMins >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-500'
  const gapDisplay = stats
    ? `${stats.gapMins >= 0 ? '+' : ''}${minutesToReadable(stats.gapMins)}`
    : '—'

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay sombre */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel du bas */}
      <div className="relative bg-[#0e1628] rounded-t-3xl border-t border-[#1a2d4a] max-h-[92vh] overflow-y-auto scrollbar-hide max-w-md mx-auto w-full">
        {/* Poignée */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#1a2d4a] rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-bold">Modifier la journée</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-[#162440] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Date ─────────────────────────────────────── */}
          <div className={`bg-[#080d1a] border rounded-xl p-3 ${errors.date ? 'border-red-500/50' : 'border-[#1a2d4a]'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarDays size={12} className="text-slate-600" />
              <label className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Date</label>
            </div>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
              className="w-full bg-[#0e1628] text-white border border-[#1a2d4a] rounded-lg px-3 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none transition-colors"
            />
            {errors.date && <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.date}</p>}
          </div>

          {/* ── Horaires ─────────────────────────────────── */}
          <div className={`bg-[#080d1a] border rounded-xl p-3 ${(errors.startTime || errors.endTime) ? 'border-red-500/50' : 'border-[#1a2d4a]'}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={12} className="text-slate-600" />
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Horaires</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 text-[10px] block mb-1">Début</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setErrors(p => ({ ...p, startTime: '' })) }}
                  className={`w-full bg-[#0e1628] text-white border rounded-lg px-2 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none transition-colors ${errors.startTime ? 'border-red-500/60' : 'border-[#1a2d4a]'}`}
                />
                {errors.startTime && <p className="text-red-400 text-[10px] mt-0.5">{errors.startTime}</p>}
              </div>
              <div>
                <label className="text-slate-600 text-[10px] block mb-1">Fin</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setErrors(p => ({ ...p, endTime: '' })) }}
                  className={`w-full bg-[#0e1628] text-white border rounded-lg px-2 py-2.5 text-sm focus:border-blue-500/60 focus:outline-none transition-colors ${errors.endTime ? 'border-red-500/60' : 'border-[#1a2d4a]'}`}
                />
                {errors.endTime && <p className="text-red-400 text-[10px] mt-0.5">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* ── Durées ───────────────────────────────────── */}
          <DurationInput
            label="Conduite"
            hours={drivingH} minutes={drivingM}
            onHoursChange={(v) => { setDrivingH(v); setErrors(p => ({ ...p, drivingMins: '' })) }}
            onMinutesChange={setDrivingM}
            error={errors.drivingMins}
          />
          <DurationInput
            label="Travail annexe"
            hours={workH} minutes={workM}
            onHoursChange={setWorkH}
            onMinutesChange={setWorkM}
          />

          {/* ── Calcul live ──────────────────────────────── */}
          {stats ? (
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} className="text-blue-400" />
                <p className="text-blue-300 text-[11px] font-semibold uppercase tracking-wider">Calcul en direct</p>
              </div>
              <ResultLine label="Service"   value={minutesToReadable(stats.serviceMins)} />
              <ResultLine label="Amplitude" value={stats.amplitudeMins !== null ? minutesToReadable(stats.amplitudeMins) : '—'} />
              <ResultLine label="TxAmp"     value={stats.amplitudeRatePercent !== null ? `${stats.amplitudeRatePercent.toFixed(2)} %` : '—'} />
              <ResultLine label="Écart"     value={gapDisplay} color={gapColor} />
            </div>
          ) : (
            <div className="bg-[#080d1a] border border-[#1a2d4a] rounded-xl p-3">
              <p className="text-slate-600 text-xs">Renseignez les horaires et la conduite pour voir le calcul.</p>
            </div>
          )}

          {/* ── Actions ──────────────────────────────────── */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-[#162440] text-slate-300 font-medium text-sm border border-[#1a2d4a] active:opacity-70 transition-opacity"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm active:opacity-80 transition-opacity"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
