import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useDaysStore } from '../store/useDaysStore'
import { useRateForYear } from '../store/useSettingsStore'
import { type DayEntry } from '../lib/calculations'
import {
  currentMonthKey,
  prevMonthKey,
  nextMonthKey,
  formatMonthKey,
  isCurrentOrFutureMonth,
  getWeekKey,
} from '../lib/dateUtils'
import MonthSummary from '../components/history/MonthSummary'
import WeekGroup    from '../components/history/WeekGroup'
import EditModal    from '../components/history/EditModal'

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------

export default function Historique() {
  const { days, removeDay } = useDaysStore()

  // ── Sélecteur de mois ─────────────────────────────────────
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const monthYear = parseInt(monthKey.slice(0, 4), 10)
  const referenceRatePercent = useRateForYear(monthYear)

  const canGoNext = !isCurrentOrFutureMonth(monthKey)

  // ── Filtrage des journées du mois ─────────────────────────
  const monthEntries = useMemo(
    () => days.filter((d) => d.date.startsWith(monthKey)),
    [days, monthKey]
  )

  // ── Regroupement par semaine ISO ──────────────────────────
  // Chaque groupe : { weekKey, entries (triées par date asc) }
  const weekGroups = useMemo(() => {
    const map: Record<string, DayEntry[]> = {}

    for (const entry of monthEntries) {
      const key = getWeekKey(entry.date)
      if (!map[key]) map[key] = []
      map[key].push(entry)
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b)) // semaines croissantes
      .map(([weekKey, entries]) => ({
        weekKey,
        entries: [...entries].sort((a, b) => a.date.localeCompare(b.date)),
      }))
  }, [monthEntries])

  // ── Modal d'édition ───────────────────────────────────────
  const [editingEntry, setEditingEntry] = useState<DayEntry | null>(null)

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">

        {/* ── Titre + sélecteur de mois ──────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Historique</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {monthEntries.length === 0
                ? 'Aucune journée'
                : `${monthEntries.length} journée${monthEntries.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* ── Sélecteur mois ─────────────────────────────── */}
        <div className="flex items-center justify-between bg-[#0e1628] border border-[#1a2d4a] rounded-2xl px-4 py-3">
          {/* Mois précédent */}
          <button
            onClick={() => setMonthKey(prevMonthKey(monthKey))}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#162440] transition-colors active:scale-95"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Label mois courant */}
          <span className="text-white font-semibold text-sm capitalize">
            {formatMonthKey(monthKey)}
          </span>

          {/* Mois suivant — désactivé si mois courant */}
          <button
            onClick={() => !canGoNext ? undefined : setMonthKey(nextMonthKey(monthKey))}
            disabled={!canGoNext}
            className={`p-1.5 rounded-xl transition-colors active:scale-95 ${
              canGoNext
                ? 'text-slate-400 hover:text-white hover:bg-[#162440]'
                : 'text-slate-700 cursor-not-allowed'
            }`}
            aria-label="Mois suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* ── Résumé du mois ─────────────────────────────── */}
        <MonthSummary entries={monthEntries} referenceRatePercent={referenceRatePercent} />

        {/* ── État vide ──────────────────────────────────── */}
        {monthEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="bg-[#0e1628] border border-[#1a2d4a] p-4 rounded-2xl">
              <CalendarDays size={28} className="text-slate-700" />
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Aucune journée pour{' '}
              <span className="capitalize">{formatMonthKey(monthKey)}</span>
            </p>
            <p className="text-slate-600 text-xs text-center px-8">
              Saisissez des journées depuis l'onglet Saisie.
            </p>
          </div>
        )}

        {/* ── Groupes par semaine ────────────────────────── */}
        {weekGroups.map(({ weekKey, entries }) => (
          <WeekGroup
            key={weekKey}
            weekKey={weekKey}
            entries={entries}
            referenceRatePercent={referenceRatePercent}
            onEdit={setEditingEntry}
            onDelete={removeDay}
          />
        ))}

      </div>

      {/* ── Modal d'édition (hors flux) ────────────────────── */}
      {editingEntry && (
        <EditModal
          key={editingEntry.id}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  )
}
