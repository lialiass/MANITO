import type { ReactNode } from 'react'
import BottomNav from './BottomNav'
import type { Page } from '../../App'

interface LayoutProps {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    /*
     * Conteneur principal : centré, max 448px (taille écran mobile standard),
     * fond bleu nuit, hauteur plein écran.
     */
    <div className="min-h-screen bg-[#080d1a] flex flex-col max-w-md mx-auto relative overflow-x-hidden">

      {/* ── En-tête ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#080d1a]/95 backdrop-blur-sm border-b border-[#1a2d4a] px-5 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg tracking-widest">MANITO</h1>
          <p className="text-slate-500 text-[11px] -mt-0.5">Suivi conducteur</p>
        </div>

        {/* Badge mois courant */}
        <div className="bg-[#111e35] border border-[#1a2d4a] rounded-lg px-3 py-1.5">
          <span className="text-slate-400 text-xs font-medium">
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* ── Contenu de la page ──────────────────────────────── */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-28 px-4 pt-5">
        {children}
      </main>

      {/* ── Navigation basse ────────────────────────────────── */}
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  )
}
