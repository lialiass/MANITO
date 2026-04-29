// ============================================================
// MANITO — Store du profil utilisateur
//
// Gère uniquement le pseudo (display_name).
// Email et created_at sont lus directement depuis useAuthStore().user
// car ils viennent de auth.users (pas besoin de les dupliquer).
//
// Pas de persist localStorage : le profil est toujours chargé
// depuis Supabase au login.
// ============================================================

import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface ProfileStore {
  /** Pseudo de l'utilisateur — null si non défini */
  displayName: string | null

  /**
   * Charge le profil depuis Supabase.
   * Crée un profil vide si inexistant (ex. utilisateur créé
   * avant la mise en place du trigger).
   */
  loadProfile: (userId: string) => Promise<void>

  /**
   * Met à jour le pseudo en local ET dans Supabase.
   * Retourne { error } si l'opération échoue.
   */
  updateDisplayName: (
    userId: string,
    name: string
  ) => Promise<{ error: string | null }>

  /** Vide le profil en mémoire (à appeler au logout). */
  clearProfile: () => void
}

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------

export const useProfileStore = create<ProfileStore>()((set) => ({
  displayName: null,

  // ── Chargement ────────────────────────────────────────────
  loadProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    if (!error && data) {
      set({ displayName: data.display_name ?? null })
      return
    }

    // Profil absent (utilisateur créé avant le trigger) → on le crée
    if (error?.code === 'PGRST116') {
      const { data: created } = await supabase
        .from('profiles')
        .upsert({ id: userId }, { onConflict: 'id' })
        .select('display_name')
        .single()

      set({ displayName: created?.display_name ?? null })
    }
  },

  // ── Mise à jour du pseudo ─────────────────────────────────
  updateDisplayName: async (userId, name) => {
    // 1. Mise à jour locale optimiste
    set({ displayName: name })

    // 2. Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, display_name: name },
        { onConflict: 'id' }
      )

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  },

  // ── Nettoyage (logout) ────────────────────────────────────
  clearProfile: () => set({ displayName: null }),
}))
