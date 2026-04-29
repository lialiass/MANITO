// ============================================================
// MANITO — Page ResetPassword
//
// Affichée quand l'utilisateur clique sur le lien de
// réinitialisation reçu par email.
//
// Supabase envoie un token dans le hash de l'URL :
//   /reset-password#access_token=TOKEN&type=recovery
//
// onAuthStateChange (initializeAuth) consume ce hash et
// ouvre une session de type "recovery" → user !== null.
// On appelle alors updateUser({ password }) pour changer
// le mot de passe, puis signOut() pour clore la session.
// ============================================================

import { useState } from 'react'
import { Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'

// ------------------------------------------------------------
// Composant
// ------------------------------------------------------------

export default function ResetPassword() {
  const { loading: authLoading, user } = useAuthStore()

  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)

  // Auth initialisée mais aucune session → token invalide / expiré
  const tokenInvalid = !authLoading && !user

  // ── Navigation vers la page de connexion ─────────────────
  function goToLogin() {
    window.location.replace('/')
  }

  // ── Soumission ────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!password || !password2) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== password2) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes('same password')
          ? 'Le nouveau mot de passe doit être différent de l\'ancien.'
          : 'Une erreur est survenue. Le lien est peut-être expiré.'
      )
      setLoading(false)
      return
    }

    // Ferme la session de récupération
    await supabase.auth.signOut()
    setSuccess(true)
    setLoading(false)
  }

  // ── Splash pendant init de l'auth ─────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    )
  }

  // ── Token invalide / expiré ───────────────────────────────
  if (tokenInvalid) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full text-center space-y-5">

          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 mx-auto">
            <span className="text-white text-2xl font-black tracking-tight">M</span>
          </div>

          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>

          <div>
            <h2 className="text-white text-xl font-bold">Mot de passe confirmé</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
          </div>

          <button
            onClick={goToLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
          >
            Retour à la connexion
          </button>

        </div>
      </div>
    )
  }

  // ── Succès ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full text-center space-y-5">

          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 mx-auto">
            <span className="text-white text-2xl font-black tracking-tight">M</span>
          </div>

          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>

          <div>
            <h2 className="text-white text-xl font-bold">Mot de passe mis à jour !</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Votre mot de passe a été changé avec succès.
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
          </div>

          <button
            onClick={goToLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
          >
            Se connecter
          </button>

        </div>
      </div>
    )
  }

  // ── Formulaire ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070d1f] flex flex-col px-5">

      {/* Logo */}
      <div className="flex flex-col items-center justify-end flex-1 pb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <span className="text-white text-2xl font-black tracking-tight">M</span>
          </div>
          <div className="text-center">
            <h1 className="text-white text-3xl font-black tracking-tight">MANITO</h1>
            <p className="text-slate-500 text-sm mt-1">Suivi conducteur</p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex flex-col justify-start pt-6 max-w-sm w-full mx-auto">
        <h2 className="text-white text-xl font-bold mb-1">Nouveau mot de passe</h2>
        <p className="text-slate-500 text-sm mb-6">Choisissez un mot de passe sécurisé (8 caractères min.)</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-3 mb-4">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Nouveau mot de passe */}
          <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Lock size={14} className="text-slate-500" />
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Nouveau mot de passe
              </label>
            </div>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              placeholder="8 caractères minimum"
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              className="w-full bg-[#080d1a] text-white border border-[#1a2d4a] rounded-xl px-4 py-3 text-sm focus:border-blue-500/70 focus:outline-none transition-colors placeholder:text-slate-700"
            />
          </div>

          {/* Confirmation */}
          <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Lock size={14} className="text-slate-500" />
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Confirmer
              </label>
            </div>
            <input
              type="password"
              autoComplete="new-password"
              value={password2}
              placeholder="Répétez le mot de passe"
              onChange={(e) => { setPassword2(e.target.value); setError(null) }}
              className="w-full bg-[#080d1a] text-white border border-[#1a2d4a] rounded-xl px-4 py-3 text-sm focus:border-blue-500/70 focus:outline-none transition-colors placeholder:text-slate-700"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-sm transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mise à jour…
              </>
            ) : (
              'Changer mon mot de passe'
            )}
          </button>

        </form>

        <p className="text-center mt-6 mb-8">
          <button
            onClick={goToLogin}
            className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
          >
            ← Retour à la connexion
          </button>
        </p>
      </div>

    </div>
  )
}
