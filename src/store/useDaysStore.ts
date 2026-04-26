import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DayEntry } from '../lib/calculations'

// ------------------------------------------------------------
// Store Zustand — journées de travail
//
// Persisté automatiquement dans localStorage via la clé "manito-days".
// Chaque journée reçoit un id unique généré à l'ajout.
// ------------------------------------------------------------

interface DaysStore {
  days: DayEntry[]

  /** Ajoute une nouvelle journée. L'id est généré automatiquement. */
  addDay: (entry: Omit<DayEntry, 'id'>) => void

  /** Modifie une journée existante par son id. */
  updateDay: (id: string, updates: Partial<Omit<DayEntry, 'id'>>) => void

  /** Supprime une journée par son id. */
  removeDay: (id: string) => void

  /** Vide toutes les journées (utile pour les tests). */
  clearAll: () => void
}

export const useDaysStore = create<DaysStore>()(
  persist(
    (set) => ({
      days: [],

      addDay: (entry) =>
        set((state) => ({
          days: [
            ...state.days,
            { ...entry, id: crypto.randomUUID() },
          ],
        })),

      updateDay: (id, updates) =>
        set((state) => ({
          days: state.days.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),

      removeDay: (id) =>
        set((state) => ({
          days: state.days.filter((d) => d.id !== id),
        })),

      clearAll: () => set({ days: [] }),
    }),
    {
      name: 'manito-days', // clé localStorage
    }
  )
)
