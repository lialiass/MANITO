import { useState, useMemo } from 'react'
import { CheckCircle2, AlertCircle, Clock, CalendarDays, Zap } from 'lucide-react'
import { calcDayStats, minutesToReadable } from '../lib/calculations'
import { useDaysStore } from '../store/useDaysStore'
import { useRateForYear } from '../store/useSettingsStore'
import { txServiceTextColor } from '../lib/colors'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// ------------------------------------------------------------
// Sous-composant : saisie d'une durée (heures + minutes)
// ------------------------------------------------------------

interface DurationInputProps {
  label: string
  hours: string
  minutes: string
  onHoursChange: (v: string) => void
  onMinutesChange: (v: string) => void
  error?: string
}

function DurationInput({
  label,
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  error,
}: DurationInputProps) {
  // Filtre : chiffres uniquement, clamp sur blur
  function handleHours(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits === '' || parseInt(digits, 10) <= 23) onHoursChange(digits)
  }
  function handleMinutes(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits === '' || parseInt(digits, 10) <= 59) onMinutesChange(digits)
  }

  return (
    <div
      className={`bg-[#0e1628] border rounded-2xl p-4 ${
        error ? 'border-red-500/50' : 'border-[#1a2d4a]'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-slate-500" />
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Heures */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-[#080d1a] border border-[#1a2d4a] rounded-xl flex items-center justify-center gap-1.5 px-3 py-3 focus-within:border-blue-500/70 transition-colors">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={hours}
              placeholder="00"
              onChange={(e) => handleHours(e.target.value)}
              className="w-full bg-transparent text-white text-2xl font-bold text-center focus:outline-none placeholder:text-slate-700"
            />
          </div>
          <span className="text-slate-600 text-xs">heures</span>
        </div>

        <span className="text-slate-600 text-xl font-light pb-4">:</span>

        {/* Minutes */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-[#080d1a] border border-[#1a2d4a] rounded-xl flex items-center justify-center gap-1.5 px-3 py-3 focus-within:border-blue-500/70 transition-colors">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={minutes}
              placeholder="00"
              onChange={(e) => handleMinutes(e.target.value)}
              className="w-full bg-transparent text-white text-2xl font-bold text-center focus:outline-none placeholder:text-slate-700"
            />
          </div>
          <span className="text-slate-600 text-xs">minutes</span>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2.5">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------
// Sous-composant : ligne de résultat dans le preview
// ------------------------------------------------------------

interface ResultLineProps {
  label: string
  value: string
  color?: string
}

function ResultLine({ label, value, color = 'text-white' }: ResultLineProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1a2d4a]/70 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------

export default function Saisie() {
  const { addDay } = useDaysStore()

  // ── État du formulaire ────────────────────────────────────
  const [date, setDate]           = useState(todayISO())

  // ── Taux de référence selon l'année de la date saisie ────
  const dateYear = parseInt(date.slice(0, 4), 10) || new Date().getFullYear()
  const referenceRatePercent = useRateForYear(dateYear)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')
  const [drivingH, setDrivingH]   = useState('')
  const [drivingM, setDrivingM]   = useState('')
  const [workH, setWorkH]         = useState('')
  const [workM, setWorkM]         = useState('')

  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [saved, setSaved]     = useState(false)

  // ── Valeurs dérivées ──────────────────────────────────────
  const drivingMins = (parseInt(drivingH, 10) || 0) * 60 + (parseInt(drivingM, 10) || 0)
  const workMins    = (parseInt(workH, 10) || 0) * 60 + (parseInt(workM, 10) || 0)

  // ── Calcul live ───────────────────────────────────────────
  // S'active dès qu'on a les horaires ET au moins un temps de conduite
  const stats = useMemo(() => {
    if (!startTime || !endTime || drivingMins <= 0) return null
    return calcDayStats(
      { drivingMins, workMins, startTime, endTime },
      referenceRatePercent
    )
  }, [drivingMins, workMins, startTime, endTime])

  // ── Validation ────────────────────────────────────────────
  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}

    if (!date)
      errs.date = 'La date est requise'
    if (!startTime)
      errs.startTime = 'L\'heure de début est requise'
    if (!endTime)
      errs.endTime = 'L\'heure de fin est requise'
    if (startTime && endTime && endTime <= startTime)
      errs.endTime = 'L\'heure de fin doit être après l\'heure de début'
    if (drivingMins <= 0)
      errs.drivingMins = 'Le temps de conduite doit être supérieur à 0'

    return errs
  }

  // ── Soumission ────────────────────────────────────────────
  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    addDay({ date, startTime, endTime, drivingMins, workMins })

    // Reset du formulaire
    setDate(todayISO())
    setStartTime('')
    setEndTime('')
    setDrivingH('')
    setDrivingM('')
    setWorkH('')
    setWorkM('')
    setErrors({})

    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  // ── Rendu ─────────────────────────────────────────────────

  // Couleur TxService (seuils : <20% vert, <27% orange, ≥27% rouge)
  const txServiceColor = stats ? txServiceTextColor(stats.serviceRatePercent) : 'text-slate-400'

  // Couleur et texte de l'écart
  const gapColor = stats
    ? stats.gapMins > 0
      ? 'text-emerald-400'
      : stats.gapMins < 0
        ? 'text-red-400'
        : 'text-slate-400'
    : 'text-slate-400'

  const gapDisplay = stats
    ? `${stats.gapSign === '+' ? '+' : ''}${minutesToReadable(stats.gapMins)}`
    : '—'

  return (
    <div className="space-y-4">

      {/* Titre */}
      <div>
        <h2 className="text-white text-xl font-bold">Nouvelle saisie</h2>
        <p className="text-slate-500 text-sm mt-0.5">Enregistrez votre journée de travail</p>
      </div>

      {/* Bannière de succès */}
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-sm font-medium">Journée enregistrée avec succès !</p>
        </div>
      )}

      {/* ── Date ──────────────────────────────────────── */}
      <div className={`bg-[#0e1628] border rounded-2xl p-4 ${errors.date ? 'border-red-500/50' : 'border-[#1a2d4a]'}`}>
        <div className="flex items-center gap-2 mb-2.5">
          <CalendarDays size={14} className="text-slate-500" />
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Date
          </label>
        </div>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
          className="w-full bg-[#080d1a] text-white border border-[#1a2d4a] rounded-xl px-4 py-3 text-sm focus:border-blue-500/70 focus:outline-none transition-colors"
        />
        {errors.date && (
          <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
            <AlertCircle size={12} />{errors.date}
          </p>
        )}
      </div>

      {/* ── Horaires ──────────────────────────────────── */}
      <div className={`bg-[#0e1628] border rounded-2xl p-4 ${
        (errors.startTime || errors.endTime) ? 'border-red-500/50' : 'border-[#1a2d4a]'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-slate-500" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Horaires de service</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Début */}
          <div>
            <label className="text-slate-500 text-xs block mb-1.5">Prise de service</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setErrors(p => ({ ...p, startTime: '' })) }}
              className={`w-full bg-[#080d1a] text-white border rounded-xl px-3 py-3 text-sm focus:border-blue-500/70 focus:outline-none transition-colors ${
                errors.startTime ? 'border-red-500/60' : 'border-[#1a2d4a]'
              }`}
            />
            {errors.startTime && (
              <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle size={11} />{errors.startTime}
              </p>
            )}
          </div>

          {/* Fin */}
          <div>
            <label className="text-slate-500 text-xs block mb-1.5">Fin de service</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setErrors(p => ({ ...p, endTime: '' })) }}
              className={`w-full bg-[#080d1a] text-white border rounded-xl px-3 py-3 text-sm focus:border-blue-500/70 focus:outline-none transition-colors ${
                errors.endTime ? 'border-red-500/60' : 'border-[#1a2d4a]'
              }`}
            />
            {errors.endTime && (
              <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle size={11} />{errors.endTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Temps de conduite ─────────────────────────── */}
      <DurationInput
        label="Temps de conduite"
        hours={drivingH}
        minutes={drivingM}
        onHoursChange={(v) => { setDrivingH(v); setErrors(p => ({ ...p, drivingMins: '' })) }}
        onMinutesChange={setDrivingM}
        error={errors.drivingMins}
      />

      {/* ── Temps de travail annexe ───────────────────── */}
      <DurationInput
        label="Temps de travail annexe"
        hours={workH}
        minutes={workM}
        onHoursChange={setWorkH}
        onMinutesChange={setWorkM}
      />

      {/* ── Calcul live ───────────────────────────────── */}
      {stats ? (
        <div className="bg-blue-600/10 border border-blue-500/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={13} className="text-blue-400" />
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Calcul en direct</p>
          </div>
          <p className="text-slate-500 text-[11px] mb-3">Taux de référence : {referenceRatePercent} %</p>

          <ResultLine
            label="Temps de service"
            value={minutesToReadable(stats.serviceMins)}
          />
          <ResultLine
            label="Amplitude"
            value={stats.amplitudeMins !== null ? minutesToReadable(stats.amplitudeMins) : '—'}
          />
          <ResultLine
            label="TxService (annexe / service)"
            value={`${stats.serviceRatePercent.toFixed(2)} %`}
            color={txServiceColor}
          />
          <ResultLine
            label="TxAmp (service / amplitude)"
            value={
              stats.amplitudeRatePercent !== null
                ? `${stats.amplitudeRatePercent.toFixed(2)} %`
                : '—'
            }
          />
          <ResultLine
            label={`Écart au taux (réf. ${referenceRatePercent} %)`}
            value={gapDisplay}
            color={gapColor}
          />
        </div>
      ) : (
        <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={13} className="text-slate-600" />
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Calcul en direct</p>
          </div>
          <p className="text-slate-600 text-sm">
            Renseignez les horaires et le temps de conduite pour voir le calcul.
          </p>
        </div>
      )}

      {/* ── Bouton de validation ──────────────────────── */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98]"
      >
        Enregistrer la journée
      </button>

    </div>
  )
}
