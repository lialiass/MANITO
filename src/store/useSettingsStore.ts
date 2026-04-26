import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_REFERENCE_RATE_PERCENT } from '../lib/constants'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type AnnualRate = {
  year: number
  referenceRatePercent: number
}

interface SettingsStore {
  annualRates: AnnualRate[]

  /** Ajoute ou met à jour le taux d'une année. */
  setRateForYear: (year: number, rate: number) => void

  /** Supprime la config d'une année (retombe sur DEFAULT). */
  removeRateForYear: (year: number) => void
}

// ------------------------------------------------------------
// Store Zustand — persisté sous la clé "manito-settings"
// ------------------------------------------------------------

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      annualRates: [
        {
          year: new Date().getFullYear(),
          referenceRatePercent: DEFAULT_REFERENCE_RATE_PERCENT,
        },
      ],

      setRateForYear: (year, rate) =>
        set((s) => {
          const exists = s.annualRates.some((r) => r.year === year)
          if (exists) {
            return {
              annualRates: s.annualRates.map((r) =>
                r.year === year ? { ...r, referenceRatePercent: rate } : r
              ),
            }
          }
          return {
            annualRates: [...s.annualRates, { year, referenceRatePercent: rate }],
          }
        }),

      removeRateForYear: (year) =>
        set((s) => ({
          annualRates: s.annualRates.filter((r) => r.year !== year),
        })),
    }),
    { name: 'manito-settings' }
  )
)

// ------------------------------------------------------------
// Fonctions utilitaires exportées
// ------------------------------------------------------------

/**
 * Fonction pure — utilisée dans les endroits non-hook
 * (ex : calculs batch, tests).
 */
export function getRateForYear(annualRates: AnnualRate[], year: number): number {
  return (
    annualRates.find((r) => r.year === year)?.referenceRatePercent ??
    DEFAULT_REFERENCE_RATE_PERCENT
  )
}

/**
 * Hook réactif — se re-rend quand annualRates change.
 * ⚠️  Ne sélectionne PAS la fonction getRateForYear du store
 *     (les références de fonctions ne déclenchent pas de re-render).
 */
export function useRateForYear(year: number): number {
  return useSettingsStore((s) => getRateForYear(s.annualRates, year))
}
