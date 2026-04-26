// ============================================================
// MANITO — Utilitaires de dates
// Toutes les manipulations de dates passent par ici.
// ============================================================

import {
  parseISO,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  addMonths,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'

// ------------------------------------------------------------
// CLÉS DE MOIS (format "yyyy-MM")
// ------------------------------------------------------------

/** Retourne le mois courant au format "yyyy-MM". */
export function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM')
}

/** "2026-04" → "2026-03" */
export function prevMonthKey(monthKey: string): string {
  return format(subMonths(parseISO(`${monthKey}-01`), 1), 'yyyy-MM')
}

/** "2026-04" → "2026-05" */
export function nextMonthKey(monthKey: string): string {
  return format(addMonths(parseISO(`${monthKey}-01`), 1), 'yyyy-MM')
}

/** "2026-04" → "avril 2026" */
export function formatMonthKey(monthKey: string): string {
  return format(parseISO(`${monthKey}-01`), 'MMMM yyyy', { locale: fr })
}

/** True si le mois donné est le mois courant ou ultérieur. */
export function isCurrentOrFutureMonth(monthKey: string): boolean {
  return monthKey >= currentMonthKey()
}

// ------------------------------------------------------------
// CLÉS DE SEMAINE (format "yyyy-Www")
// ------------------------------------------------------------

/**
 * Retourne la clé ISO de semaine d'une date.
 * Utilise l'année ISO (getISOWeekYear) pour gérer correctement
 * la semaine 53 de décembre qui appartient à l'année suivante.
 *
 * "2026-04-27" → "2026-W17"
 */
export function getWeekKey(dateStr: string): string {
  const d = parseISO(dateStr)
  const year = getISOWeekYear(d)
  const week = getISOWeek(d)
  return `${year}-W${String(week).padStart(2, '0')}`
}

/**
 * Retourne le libellé d'une semaine à partir de sa clé et d'une date
 * appartenant à cette semaine.
 *
 * "2026-W17", "2026-04-22" → "Semaine 17 · lun. 20 – dim. 26 avr."
 */
export function formatWeekLabel(weekKey: string, anyDateInWeek: string): string {
  const weekNum = parseInt(weekKey.split('-W')[1], 10)
  const d       = parseISO(anyDateInWeek)
  const start   = startOfISOWeek(d)
  const end     = endOfISOWeek(d)

  const sameMonth =
    format(start, 'MM', { locale: fr }) === format(end, 'MM', { locale: fr })

  const range = sameMonth
    ? `${format(start, 'd', { locale: fr })}–${format(end, 'd MMM', { locale: fr })}`
    : `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM', { locale: fr })}`

  return `Semaine ${weekNum} · ${range}`
}

// ------------------------------------------------------------
// FORMATAGE DE JOURS
// ------------------------------------------------------------

/**
 * Formate une date ISO en jour court lisible.
 * "2026-04-27" → "lun. 27 avr."
 */
export function formatDayShort(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE d MMM', { locale: fr })
}

/**
 * Formate une date ISO en jour long.
 * "2026-04-27" → "lundi 27 avril"
 */
export function formatDayLong(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE d MMMM', { locale: fr })
}
