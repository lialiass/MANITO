// ============================================================
// MANITO — Store d'authentification (Supabase Auth)
// Gère uniquement la session et les actions auth.
// La synchronisation des données après connexion
// est orchestrée par App.tsx via des useEffect.
// ============================================================

import { create } from 'zustand'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface AuthStore {
  user:    User    | null
  session: Session | null
  loading: boolean

  /**
   * À appeler une seule fois au montage de l'app (useEffect dans App.tsx).
   * Restaure la session existante et écoute les changements d'état.
   */
  initializeAuth: () => Promise<void>

  signUp:  (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn:  (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------

export const useAuthStore = create<AuthStore>()((set) => ({
  user:    null,
  session: null,
  loading: true,   // true jusqu'à ce qu'on ait vérifié la session initiale

  // ── Initialisation ───────────────────────────────────────
  initializeAuth: async () => {
    // Écoute les changements (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED...)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user:    session?.user ?? null,
        loading: false,
      })
    })

    // Récupération synchrone de la session en cours (nécessaire si
    // onAuthStateChange tarde à se déclencher, ex. SSR / cold start)
    const { data: { session } } = await supabase.auth.getSession()
    set({
      session,
      user:    session?.user ?? null,
      loading: false,
    })
  },

  // ── Inscription ──────────────────────────────────────────
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  },

  // ── Connexion ────────────────────────────────────────────
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  },

  // ── Déconnexion ──────────────────────────────────────────
  // App.tsx détecte user === null et vide les stores de données.
  signOut: async () => {
    await supabase.auth.signOut()
  },
}))
