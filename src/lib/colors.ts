// ============================================================
// MANITAUX — Utilitaires de couleur pour les taux
// ============================================================

// ──────────────────────────────────────────────────────────────
// Seuils originaux : TxService journalier / calcul live / impression
//   VERT   : TxService < 20 %  (objectif atteint)
//   ORANGE : 20 % ≤ TxService < 27 %
//   ROUGE  : TxService ≥ 27 %
// ──────────────────────────────────────────────────────────────

export const TX_SEUIL_ORANGE = 20
export const TX_SEUIL_RED    = 27

/**
 * Classe Tailwind `text-*` pour le TxService journalier.
 * Utilisé dans Saisie, EditModal, impression, analyse.
 */
export function txServiceTextColor(txService: number): string {
  if (txService < TX_SEUIL_ORANGE) return 'text-emerald-400'
  if (txService < TX_SEUIL_RED)    return 'text-amber-400'
  return 'text-red-400'
}

/**
 * Couleur HEX pour le TxService journalier.
 * Utilisé dans les SVG, styles inline, impression.
 */
export function txServiceHexColor(txService: number): string {
  if (txService < TX_SEUIL_ORANGE) return '#10b981'
  if (txService < TX_SEUIL_RED)    return '#f59e0b'
  return '#ef4444'
}

// ──────────────────────────────────────────────────────────────
// Seuils "sweet spot" : TxService mensuel moyen
// (écran d'accueil + résumé du mois dans l'historique)
//
//   ROUGE  : < 14 % ou > 26 %  (hors plage acceptable)
//   ORANGE : 14–18 % ou 20–26 % (hors plage optimale)
//   VERT   : 18–20 %            (plage optimale cible)
// ──────────────────────────────────────────────────────────────

export const TX_OPT_WARN_LOW   = 14
export const TX_OPT_GREEN_LOW  = 18
export const TX_OPT_GREEN_HIGH = 20
export const TX_OPT_WARN_HIGH  = 26

/**
 * Classe Tailwind `text-*` pour le TxService mensuel moyen.
 * Utilisé dans MainRateCard et MonthSummary.
 */
export function txServiceOptimalTextColor(txService: number): string {
  if (txService < TX_OPT_WARN_LOW)                                      return 'text-red-400'
  if (txService < TX_OPT_GREEN_LOW)                                     return 'text-amber-400'
  if (txService <= TX_OPT_GREEN_HIGH)                                   return 'text-emerald-400'
  if (txService <= TX_OPT_WARN_HIGH)                                    return 'text-amber-400'
  return 'text-red-400'
}

/**
 * Couleur HEX pour le TxService mensuel moyen.
 * Utilisé dans les SVG et styles inline.
 */
export function txServiceOptimalHexColor(txService: number): string {
  if (txService < TX_OPT_WARN_LOW)   return '#ef4444'
  if (txService < TX_OPT_GREEN_LOW)  return '#f59e0b'
  if (txService <= TX_OPT_GREEN_HIGH) return '#10b981'
  if (txService <= TX_OPT_WARN_HIGH)  return '#f59e0b'
  return '#ef4444'
}

// ──────────────────────────────────────────────────────────────
// Seuil TxAmp (taux d'amplitude = service / amplitude)
//   VERT  : ≥ 75 %  (temps de service bien occupé)
//   ROUGE : < 75 %  (trop de temps mort)
// ──────────────────────────────────────────────────────────────

export const TX_AMP_GREEN = 75

/**
 * Classe Tailwind `text-*` pour le TxAmp.
 * Utilisé dans le résumé du mois (historique).
 */
export function txAmpTextColor(txAmp: number): string {
  return txAmp >= TX_AMP_GREEN ? 'text-emerald-400' : 'text-red-400'
}
