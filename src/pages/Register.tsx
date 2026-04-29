import { useState } from 'react'
import { Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface RegisterProps {
  onSwitchToLogin: () => void
}

// ------------------------------------------------------------
// Composant
// ------------------------------------------------------------

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const { signUp } = useAuthStore()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)
  const [loading,   setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password || !password2) {
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

    const { error: authError } = await signUp(email.trim(), password)

    if (authError) {
      setError(
        authError.message.includes('already registered') || authError.message.includes('already been registered')
          ? 'Un compte existe déjà avec cet email.'
          : authError.message
      )
      setLoading(false)
    } else {
      // Succès — certains projets Supabase demandent confirmation email
      setSuccess(true)
      setLoading(false)
    }
  }

  // ── Vue succès ───────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center px-5">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Compte créé !</h2>
            <p className="text-slate-400 text-sm mt-2">
              Vérifiez votre boîte mail pour confirmer votre adresse,
              puis connectez-vous.
            </p>
          </div>
          <button
            onClick={onSwitchToLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    )
  }

  // ── Vue formulaire ───────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#070d1f] flex flex-col px-5">

      {/* Zone haute — logo */}
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
        <h2 className="text-white text-xl font-bold mb-1">Créer un compte</h2>
        <p className="text-slate-500 text-sm mb-6">Vos données seront synchronisées en toute sécurité</p>

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-3 mb-4">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Email */}
          <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Mail size={14} className="text-slate-500" />
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Email</label>
            </div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              placeholder="conducteur@example.com"
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              className="w-full bg-[#080d1a] text-white border border-[#1a2d4a] rounded-xl px-4 py-3 text-sm focus:border-blue-500/70 focus:outline-none transition-colors placeholder:text-slate-700"
            />
          </div>

          {/* Mot de passe */}
          <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Lock size={14} className="text-slate-500" />
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Mot de passe</label>
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
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Confirmer</label>
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
                Création…
              </>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {/* Lien connexion */}
        <p className="text-center text-slate-500 text-sm mt-6 mb-8">
          Déjà un compte ?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
          >
            Se connecter
          </button>
        </p>
      </div>

    </div>
  )
}
