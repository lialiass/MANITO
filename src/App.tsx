import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import Layout      from './components/layout/Layout'
import Dashboard   from './pages/Dashboard'
import Saisie      from './pages/Saisie'
import Historique  from './pages/Historique'
import Analyse     from './pages/Analyse'
import Parametres  from './pages/Parametres'
import Login       from './pages/Login'
import Register    from './pages/Register'

import { useAuthStore }     from './store/useAuthStore'
import { useDaysStore }     from './store/useDaysStore'
import { useSettingsStore } from './store/useSettingsStore'
import { useProfileStore }  from './store/useProfileStore'

// Type central de navigation — exporté pour être utilisé dans les composants enfants
export type Page = 'dashboard' | 'saisie' | 'historique' | 'analyse' | 'parametres'

// ------------------------------------------------------------
// Écran de chargement initial (vérification session Supabase)
// ------------------------------------------------------------

function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#070d1f] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
        <span className="text-white text-2xl font-black tracking-tight">M</span>
      </div>
      <Loader2 size={20} className="text-blue-500 animate-spin" />
    </div>
  )
}

// ------------------------------------------------------------
// Application principale (utilisateur connecté)
// ------------------------------------------------------------

function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  function renderPage(page: Page) {
    switch (page) {
      case 'dashboard':  return <Dashboard onNavigate={setCurrentPage} />
      case 'saisie':     return <Saisie />
      case 'historique': return <Historique />
      case 'analyse':    return <Analyse />
      case 'parametres': return <Parametres />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage(currentPage)}
    </Layout>
  )
}

// ------------------------------------------------------------
// Composant racine
// ------------------------------------------------------------

export default function App() {
  const { user, loading, initializeAuth }                     = useAuthStore()
  const { loadDaysFromSupabase,     clearAll: clearDays }     = useDaysStore()
  const { loadSettingsFromSupabase, clearAll: clearSettings } = useSettingsStore()
  const { loadProfile,              clearProfile }            = useProfileStore()

  // Vue courante du flux d'authentification
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  // ── Initialisation unique de l'auth Supabase ────────────
  useEffect(() => {
    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Chargement des données après connexion ──────────────
  // Se déclenche à chaque changement d'userId (connexion / switch de compte)
  useEffect(() => {
    if (user) {
      loadDaysFromSupabase(user.id)
      loadSettingsFromSupabase(user.id)
      loadProfile(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── Nettoyage isolé après déconnexion ───────────────────
  // Garantit qu'un utilisateur B ne voit jamais les données de A.
  useEffect(() => {
    if (!user && !loading) {
      clearDays()
      clearSettings()
      clearProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  // ── Splash screen pendant la vérification de session ────
  if (loading) return <SplashScreen />

  // ── Flux d'authentification ──────────────────────────────
  if (!user) {
    if (authView === 'login') {
      return <Login onSwitchToRegister={() => setAuthView('register')} />
    }
    return <Register onSwitchToLogin={() => setAuthView('login')} />
  }

  // ── Application principale ───────────────────────────────
  return <MainApp />
}
