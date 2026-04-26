import { useState } from 'react'
import {
  Percent,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Shield,
} from 'lucide-react'
import {
  useSettingsStore,
  useRateForYear,
  type AnnualRate,
} from '../store/useSettingsStore'
import { useDaysStore } from '../store/useDaysStore'
import { DEFAULT_REFERENCE_RATE_PERCENT } from '../lib/constants'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const THIS_YEAR = new Date().getFullYear()

// ------------------------------------------------------------
// Sous-composant : ligne d'un taux annuel
// ------------------------------------------------------------

interface RateRowProps {
  rate: AnnualRate
  isCurrentYear: boolean
  onEdit: (rate: AnnualRate) => void
  onDelete: (year: number) => void
}

function RateRow({ rate, isCurrentYear, onEdit, onDelete }: RateRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (confirmingDelete) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-[#1a2d4a]/60 last:border-0 gap-3">
        <p className="text-white text-sm flex-1">
          Supprimer le taux <span className="font-bold">{rate.year}</span> ?
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmingDelete(false)}
            className="px-3 py-1.5 rounded-lg bg-[#162440] text-slate-300 text-xs font-medium border border-[#1a2d4a] active:opacity-70"
          >
            Annuler
          </button>
          <button
            onClick={() => onDelete(rate.year)}
            className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-xs font-semibold active:opacity-70"
          >
            Supprimer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1a2d4a]/60 last:border-0">
      <div className="flex items-center gap-3">
        {/* Badge année */}
        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${
          isCurrentYear
            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
            : 'bg-[#162440] text-slate-400 border border-[#1e3560]'
        }`}>
          {rate.year}
          {isCurrentYear && (
            <span className="ml-1.5 text-blue-400/70 font-normal">•</span>
          )}
        </div>
        <span className="text-white text-sm font-semibold tabular-nums">
          {rate.referenceRatePercent} %
        </span>
        {isCurrentYear && (
          <span className="text-slate-600 text-[10px]">en cours</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(rate)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
          aria-label="Modifier"
        >
          <Pencil size={13} />
        </button>
        {/* On ne peut pas supprimer l'année en cours */}
        {!isCurrentYear && (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Sous-composant : formulaire d'ajout / édition
// ------------------------------------------------------------

interface RateFormProps {
  editingYear: number | null   // null = ajout, number = édition
  initialRate: number
  existingYears: number[]
  onSave: (year: number, rate: number) => void
  onCancel: () => void
}

function RateForm({ editingYear, initialRate, existingYears, onSave, onCancel }: RateFormProps) {
  const [year, setYear]   = useState(editingYear !== null ? String(editingYear) : '')
  const [rate, setRate]   = useState(String(initialRate))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    const y = parseInt(year, 10)
    const r = parseFloat(rate)

    if (!year || isNaN(y) || y < 2000 || y > 2100)
      errs.year = 'Année invalide (ex : 2025)'

    if (editingYear === null && existingYears.includes(y))
      errs.year = `Un taux existe déjà pour ${y}`

    if (!rate || isNaN(r) || r <= 0 || r >= 100)
      errs.rate = 'Le taux doit être entre 1 et 99 %'

    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave(parseInt(year, 10), parseFloat(rate))
  }

  const isEditing = editingYear !== null

  return (
    <div className="bg-[#111e35] border border-blue-500/25 rounded-2xl p-4 space-y-3">
      <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
        {isEditing ? `Modifier le taux ${editingYear}` : 'Ajouter un taux annuel'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Année */}
        <div>
          <label className="text-slate-500 text-xs block mb-1.5">Année</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={year}
            placeholder="2025"
            disabled={isEditing}
            onChange={(e) => {
              setYear(e.target.value.replace(/\D/g, ''))
              setErrors((p) => ({ ...p, year: '' }))
            }}
            className={`w-full bg-[#080d1a] text-white border rounded-xl px-3 py-3 text-sm font-bold tabular-nums text-center focus:border-blue-500/60 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              errors.year ? 'border-red-500/60' : 'border-[#1a2d4a]'
            }`}
          />
          {errors.year && (
            <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle size={10} />{errors.year}
            </p>
          )}
        </div>

        {/* Taux */}
        <div>
          <label className="text-slate-500 text-xs block mb-1.5">Taux de référence</label>
          <div className={`flex items-center bg-[#080d1a] border rounded-xl px-3 focus-within:border-blue-500/60 transition-colors ${
            errors.rate ? 'border-red-500/60' : 'border-[#1a2d4a]'
          }`}>
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              placeholder="20"
              onChange={(e) => {
                setRate(e.target.value.replace(/[^0-9.]/g, ''))
                setErrors((p) => ({ ...p, rate: '' }))
              }}
              className="flex-1 bg-transparent text-white py-3 text-sm font-bold tabular-nums text-center focus:outline-none"
            />
            <span className="text-slate-500 text-sm">%</span>
          </div>
          {errors.rate && (
            <p className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle size={10} />{errors.rate}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-[#162440] text-slate-300 text-sm font-medium border border-[#1a2d4a] active:opacity-70 transition-opacity"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold active:opacity-80 transition-all"
        >
          {isEditing ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------

export default function Parametres() {
  const { annualRates, setRateForYear, removeRateForYear } = useSettingsStore()
  const { clearAll } = useDaysStore()
  const currentRate = useRateForYear(THIS_YEAR)

  // ── État du formulaire ────────────────────────────────────
  // null = formulaire masqué, -1 = ajout, n = édition de l'année n
  const [formMode, setFormMode] = useState<null | 'add' | number>(null)

  // ── Feedback ─────────────────────────────────────────────
  const [feedback, setFeedback] = useState<string | null>(null)

  // ── Confirmation reset données ────────────────────────────
  const [confirmReset, setConfirmReset] = useState(false)

  // ── Helpers ──────────────────────────────────────────────
  function showFeedback(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  function handleSave(year: number, rate: number) {
    setRateForYear(year, rate)
    setFormMode(null)
    showFeedback(
      formMode === 'add'
        ? `Taux ${year} ajouté (${rate} %)`
        : `Taux ${year} mis à jour (${rate} %)`
    )
  }

  function handleDelete(year: number) {
    removeRateForYear(year)
    showFeedback(`Taux ${year} supprimé`)
  }

  function handleEdit(rate: AnnualRate) {
    setFormMode(rate.year)
  }

  function handleResetAll() {
    clearAll()
    setConfirmReset(false)
    showFeedback('Toutes les journées ont été supprimées')
  }

  // ── Rates triés par année décroissante ────────────────────
  const sortedRates = [...annualRates].sort((a, b) => b.year - a.year)
  const existingYears = annualRates.map((r) => r.year)

  // Taux initial pour le formulaire d'édition
  const editingRate = typeof formMode === 'number'
    ? (annualRates.find((r) => r.year === formMode)?.referenceRatePercent ?? DEFAULT_REFERENCE_RATE_PERCENT)
    : DEFAULT_REFERENCE_RATE_PERCENT

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Titre ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-white text-xl font-bold">Paramètres</h2>
        <p className="text-slate-500 text-sm mt-0.5">Configuration de MANITO</p>
      </div>

      {/* ── Feedback ───────────────────────────────────────── */}
      {feedback && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-sm">{feedback}</p>
        </div>
      )}

      {/* ── Carte résumé taux actuel ────────────────────────── */}
      <div className="bg-blue-600/10 border border-blue-500/25 rounded-2xl px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/15 p-2.5 rounded-xl">
            <Percent size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Taux de référence {THIS_YEAR}</p>
            <p className="text-white text-lg font-black tabular-nums">{currentRate} %</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-600 text-[10px] uppercase tracking-wide">Coefficient</p>
          <p className="text-slate-400 text-sm font-bold tabular-nums">
            ×{(100 / currentRate - 1).toFixed(2)}
          </p>
        </div>
      </div>

      {/* ── Section taux annuels ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">
            Taux annuels
          </p>
          {formMode === null && (
            <button
              onClick={() => setFormMode('add')}
              className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors active:opacity-70"
            >
              <Plus size={13} />
              Ajouter
            </button>
          )}
        </div>

        {/* Note explicative */}
        <div className="flex items-start gap-2 bg-[#080d1a] border border-[#1a2d4a] rounded-xl px-3 py-2.5 mb-3">
          <Info size={12} className="text-slate-600 mt-0.5 shrink-0" />
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Chaque journée utilise le taux configuré pour son année.
            Si aucun taux n'est défini pour une année, la valeur par défaut ({DEFAULT_REFERENCE_RATE_PERCENT} %) s'applique.
          </p>
        </div>

        {/* Formulaire ajout / édition */}
        {formMode !== null && (
          <div className="mb-3">
            <RateForm
              editingYear={typeof formMode === 'number' ? formMode : null}
              initialRate={editingRate}
              existingYears={existingYears}
              onSave={handleSave}
              onCancel={() => setFormMode(null)}
            />
          </div>
        )}

        {/* Liste des taux */}
        <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl px-4">
          {sortedRates.length === 0 ? (
            <p className="text-slate-600 text-sm py-4 text-center">
              Aucun taux configuré.
            </p>
          ) : (
            sortedRates.map((r) => (
              <RateRow
                key={r.year}
                rate={r}
                isCurrentYear={r.year === THIS_YEAR}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Section Application ─────────────────────────────── */}
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-3 px-1">
          Application
        </p>
        <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl px-4">

          {/* Version */}
          <div className="flex items-center justify-between py-3.5 border-b border-[#1a2d4a]">
            <div className="flex items-center gap-3">
              <div className="bg-[#162440] p-2 rounded-xl">
                <Info size={14} className="text-slate-400" />
              </div>
              <span className="text-white text-sm font-medium">À propos de MANITO</span>
            </div>
            <span className="text-slate-500 text-xs">v0.6.0</span>
          </div>

          {/* Confidentialité */}
          <div className="flex items-center justify-between py-3.5 border-b border-[#1a2d4a]">
            <div className="flex items-center gap-3">
              <div className="bg-[#162440] p-2 rounded-xl">
                <Shield size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Données locales</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Toutes les données restent sur votre appareil
                </p>
              </div>
            </div>
          </div>

          {/* Zone de danger — Réinitialiser */}
          <div className="py-3.5">
            {confirmReset ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm">
                    Supprimer <span className="font-bold">toutes</span> les journées ?
                    Cette action est irréversible.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#162440] text-slate-300 text-sm font-medium border border-[#1a2d4a] active:opacity-70"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="flex-1 py-2.5 rounded-xl bg-red-600/80 text-white text-sm font-semibold active:opacity-70"
                  >
                    Tout supprimer
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center gap-3 active:opacity-70 transition-opacity"
              >
                <div className="bg-red-500/10 p-2 rounded-xl">
                  <X size={14} className="text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-red-400 text-sm font-medium">Réinitialiser les données</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Supprimer toutes les journées enregistrées
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-slate-700 text-xs pb-2">
        MANITO — Suivi conducteur · v0.6.0
      </p>

    </div>
  )
}
