// ============================================================
// MANITO — Fichier central de calculs
// Ce fichier contiendra toute la logique métier de l'application.
// Les fonctions seront complétées phase par phase.
// ============================================================

// ------------------------------------------------------------
// TYPES DE BASE
// ------------------------------------------------------------

/** Représente les données d'une journée de travail */
export interface JourneeData {
  id?: string
  date: string                  // format ISO: "2024-01-15"
  tempsConducte: number         // en minutes
  tempsAnnexe: number           // en minutes (autres tâches rémunérées)
  amplitude: number             // en minutes (1ère prise → fin de service)
  tauxJournalier?: number       // en €
}

/** Données calculées à partir d'une journée */
export interface JourneeCalculee extends JourneeData {
  tempsService: number          // conduite + annexe
  tauxJournalier: number
}

/** Résumé d'une semaine */
export interface ResumeSemaine {
  numeroSemaine: number
  totalConduite: number         // en minutes
  totalService: number          // en minutes
  totalAmplitude: number        // en minutes
  totalTaux: number             // en €
  nombreJours: number
}

/** Résumé d'un mois */
export interface ResumeMois {
  mois: number                  // 1–12
  annee: number
  totalConduite: number
  totalService: number
  totalTaux: number
  nombreJours: number
  tauxMoyen: number             // taux moyen journalier
}

// ------------------------------------------------------------
// UTILITAIRES DE TEMPS
// ------------------------------------------------------------

/**
 * Convertit des minutes en format "HH:MM"
 * Exemple : 150 → "02:30"
 */
export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : ''
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Convertit "HH:MM" en minutes
 * Exemple : "02:30" → 150
 */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

/**
 * Formate des minutes en texte lisible
 * Exemple : 150 → "2h30"
 */
export function minutesToReadable(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : ''
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h${String(m).padStart(2, '0')}`
}

// ------------------------------------------------------------
// CALCULS JOURNALIERS
// ------------------------------------------------------------

/**
 * Calcule le temps de service = conduite + annexe
 */
export function calcTempsService(conduite: number, annexe: number): number {
  return conduite + annexe
}

/**
 * Calcule le taux journalier brut
 * (logique exacte à affiner en phase suivante selon la convention)
 */
export function calcTauxJournalier(tempsService: number, tauxHoraire: number): number {
  return Math.round((tempsService / 60) * tauxHoraire * 100) / 100
}

/**
 * Calcule et retourne une journée complète avec tous les champs dérivés
 */
export function calcJournee(
  data: JourneeData,
  tauxHoraire: number
): JourneeCalculee {
  const tempsService = calcTempsService(data.tempsConducte, data.tempsAnnexe)
  const tauxJournalier = calcTauxJournalier(tempsService, tauxHoraire)
  return { ...data, tempsService, tauxJournalier }
}

// ------------------------------------------------------------
// CALCULS PÉRIODIQUES
// ------------------------------------------------------------

/**
 * Calcule le taux mensuel total
 */
export function calcTauxMensuel(journees: JourneeCalculee[]): number {
  return Math.round(
    journees.reduce((acc, j) => acc + j.tauxJournalier, 0) * 100
  ) / 100
}

/**
 * Calcule l'écart entre taux réel et taux cible
 * Positif = au-dessus du cible, négatif = en dessous
 */
export function calcEcartTaux(tauxReel: number, tauxCible: number): number {
  return Math.round((tauxReel - tauxCible) * 100) / 100
}

/**
 * Calcule le résumé d'un ensemble de journées (semaine ou mois)
 */
export function calcResumePeriode(journees: JourneeCalculee[]): {
  totalConduite: number
  totalService: number
  totalAmplitude: number
  totalTaux: number
  nombreJours: number
  tauxMoyen: number
} {
  const totalConduite = journees.reduce((a, j) => a + j.tempsConducte, 0)
  const totalService = journees.reduce((a, j) => a + j.tempsService, 0)
  const totalAmplitude = journees.reduce((a, j) => a + j.amplitude, 0)
  const totalTaux = calcTauxMensuel(journees)
  const nombreJours = journees.length
  const tauxMoyen = nombreJours > 0
    ? Math.round((totalTaux / nombreJours) * 100) / 100
    : 0

  return { totalConduite, totalService, totalAmplitude, totalTaux, nombreJours, tauxMoyen }
}
