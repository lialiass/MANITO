import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DayEntry } from '../lib/calculations'
import { supabase, rowToDayEntry } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'

// ============================================================
// MANITO — Store des journées de travail
//
// Stratégie de persistance :
//   • localStorage (via Zustand persist) = cache local immédiat
//   • Supabase = source de vérité distante (si l'utilisateur est connecté)
//
// Toutes les mutations font d'abord une mise à jour optimiste
// en local, puis synchronisent avec Supabase en arrière-plan.
// ============================================================

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface DaysStore {
  days:        DayEntry[]

  /** Ajoute une journée. Upsert Supabase si connecté (unique par date). */
  addDay:      (entry: Omit<DayEntry, 'id'>) => void

  /** Met à jour une journée par son id. */
  updateDay:   (id: string, updates: Partial<Omit<DayEntry, 'id'>>) => void

  /** Supprime une journée par son id. */
  removeDay:   (id: string) => void

  /** Vide toutes les journées (déconnexion). */
  clearAll:    () => void

  /**
   * Charge les journées depuis Supabase après connexion.
   * Effectue une migration automatique si Supabase est vide
   * et que des données locales existent (première connexion).
   */
  loadDaysFromSupabase: (userId: string) => Promise<void>
}

// ------------------------------------------------------------
// Helper : obtenir l'utilisateur connecté depuis useAuthStore
// (sans créer de dépendance circulaire — getState() ne s'abonne pas)
// ------------------------------------------------------------

function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null
}

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------

export const useDaysStore = create<DaysStore>()(
  persist(
    (set, get) => ({
      days: [],

      // ── Ajout ──────────────────────────────────────────────
      addDay: (entry) => {
        const tempId = crypto.randomUUID()

        // 1. Mise à jour locale optimiste
        //    Remplace toute entrée existante pour la même date
        //    (cohérence avec la contrainte unique Supabase)
        set((state) => ({
          days: [
            ...state.days.filter((d) => d.date !== entry.date),
            { ...entry, id: tempId },
          ],
        }))

        // 2. Sync Supabase en arrière-plan
        const userId = getCurrentUserId()
        if (!userId) return

        void (async () => {
          const { data } = await supabase
            .from('daily_entries')
            .upsert(
              {
                user_id:      userId,
                date:         entry.date,
                start_time:   entry.startTime,
                end_time:     entry.endTime,
                driving_mins: entry.drivingMins,
                work_mins:    entry.workMins,
              },
              { onConflict: 'user_id,date' }
            )
            .select('*')
            .single()

          if (data) {
            // Remplace l'id temporaire par l'id Supabase
            set((state) => ({
              days: state.days.map((d) =>
                d.id === tempId ? rowToDayEntry(data) : d
              ),
            }))
          }
        })()
      },

      // ── Modification ───────────────────────────────────────
      updateDay: (id, updates) => {
        // 1. Mise à jour locale optimiste
        set((state) => ({
          days: state.days.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }))

        // 2. Sync Supabase
        const userId = getCurrentUserId()
        if (!userId) return

        void (async () => {
          const remoteUpdates: Record<string, unknown> = {}
          if (updates.date        !== undefined) remoteUpdates.date         = updates.date
          if (updates.startTime   !== undefined) remoteUpdates.start_time   = updates.startTime
          if (updates.endTime     !== undefined) remoteUpdates.end_time     = updates.endTime
          if (updates.drivingMins !== undefined) remoteUpdates.driving_mins = updates.drivingMins
          if (updates.workMins    !== undefined) remoteUpdates.work_mins    = updates.workMins

          await supabase
            .from('daily_entries')
            .update(remoteUpdates)
            .eq('id', id)
            .eq('user_id', userId)
        })()
      },

      // ── Suppression ────────────────────────────────────────
      removeDay: (id) => {
        // 1. Suppression locale optimiste
        set((state) => ({
          days: state.days.filter((d) => d.id !== id),
        }))

        // 2. Sync Supabase
        const userId = getCurrentUserId()
        if (!userId) return

        void (async () => {
          await supabase
            .from('daily_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
        })()
      },

      // ── Vider (déconnexion) ────────────────────────────────
      clearAll: () => set({ days: [] }),

      // ── Chargement depuis Supabase après connexion ─────────
      loadDaysFromSupabase: async (userId) => {
        const localDays = get().days

        // ── Migration douce (première connexion) ─────────────
        // Si Supabase est vide mais localStorage contient des données,
        // on pousse les données locales vers Supabase.
        const { count } = await supabase
          .from('daily_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (count === 0 && localDays.length > 0) {
          await supabase
            .from('daily_entries')
            .upsert(
              localDays.map((d) => ({
                user_id:      userId,
                date:         d.date,
                start_time:   d.startTime,
                end_time:     d.endTime,
                driving_mins: d.drivingMins,
                work_mins:    d.workMins,
              })),
              { onConflict: 'user_id,date' }
            )
        }

        // ── Chargement ────────────────────────────────────────
        const { data, error } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true })

        if (!error && data) {
          set({ days: data.map(rowToDayEntry) })
        }
      },
    }),
    { name: 'manito-days' }
  )
)
