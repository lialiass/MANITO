// ============================================================
// MANITO — Constantes globales de l'application
// ============================================================

/**
 * Taux de référence par défaut, utilisé comme fallback lorsqu'aucun
 * taux n'a été configuré pour une année donnée dans useSettingsStore.
 *
 * coefficient = 100 / DEFAULT_REFERENCE_RATE_PERCENT - 1
 * Exemple : 20 % → coefficient 4
 */
export const DEFAULT_REFERENCE_RATE_PERCENT = 20
