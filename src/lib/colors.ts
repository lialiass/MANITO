// ============================================================
// MANITO — Utilitaires de couleur pour le TxService
//
// Seuils métier :
//   VERT   : TxService < 20%  (objectif atteint)
//   ORANGE : 20% ≤ TxService < 27%  (proche du seuil)
//   ROUGE  : TxService ≥ 27%  (seuil dépassé)
//
// Ces fonctions sont utilisées dans tous les composants qui
// affichent un TxService coloré (Dashboard, Analyse, Saisie…).
// ============================================================

export const TX_SEUIL_ORANGE = 20
export const TX_SEUIL_RED    = 27

/**
 * Retourne une classe Tailwind `text-*` en fonction du TxService.
 * Usage : `<span className={txServiceTextColor(txService)}>…</span>`
 */
export function txServiceTextColor(txService: number): string {
  if (txService < TX_SEUIL_ORANGE) return 'text-emerald-400'
  if (txService < TX_SEUIL_RED)    return 'text-amber-400'
  return 'text-red-400'
}

/**
 * Retourne une couleur HEX en fonction du TxService.
 * Usage : SVG stroke/fill, inline `style={{ color }}`, etc.
 */
export function txServiceHexColor(txService: number): string {
  if (txService < TX_SEUIL_ORANGE) return '#10b981'
  if (txService < TX_SEUIL_RED)    return '#f59e0b'
  return '#ef4444'
}
