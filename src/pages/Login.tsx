import { useState } from 'react'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface LoginProps {
  onSwitchToRegister: () => void
}

// ------------------------------------------------------------
// Composant
// ------------------------------------------------------------

export default function Login({ onSwitchToRegister }: LoginProps) {
  const { signIn } = useAuthStore()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: authError } = await signIn(email.trim(), password)

    if (authError) {
      setError(
        authError.message.includes('Invalid login credentials')
          ? 'Email ou mot de passe incorrect.'
          : authError.message.includes('Email not confirmed')
            ? 'Veuillez confirmer votre email avant de vous connecter.'
            : authError.message
      )
      setLoading(false)
    }
    // Si succès : App.tsx détecte user !== null et affiche l'app
  }

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
        <h2 className="text-white text-xl font-bold mb-1">Connexion</h2>
        <p className="text-slate-500 text-sm mb-6">Accédez à votre espace conducteur</p>

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
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Email
              </label>
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
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Mot de passe
              </label>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
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
                Connexion…
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Lien inscription */}
        <p className="text-center text-slate-500 text-sm mt-6 mb-8">
          Pas encore de compte ?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
          >
            Créer un compte
          </button>
        </p>
      </div>

    </div>
  )
}
