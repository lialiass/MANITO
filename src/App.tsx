import { useState } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Saisie from './pages/Saisie'
import Historique from './pages/Historique'
import Analyse from './pages/Analyse'
import Parametres from './pages/Parametres'

// Type central de navigation — exporté pour être utilisé dans les composants enfants
export type Page = 'dashboard' | 'saisie' | 'historique' | 'analyse' | 'parametres'

function renderPage(page: Page) {
  switch (page) {
    case 'dashboard':  return <Dashboard />
    case 'saisie':     return <Saisie />
    case 'historique': return <Historique />
    case 'analyse':    return <Analyse />
    case 'parametres': return <Parametres />
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage(currentPage)}
    </Layout>
  )
}
