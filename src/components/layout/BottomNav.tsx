import { LayoutDashboard, PlusCircle, History, BarChart2, Settings } from 'lucide-react'
import type { Page } from '../../App'

interface NavItem {
  id: Page
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Accueil',    Icon: LayoutDashboard },
  { id: 'saisie',      label: 'Saisie',     Icon: PlusCircle      },
  { id: 'historique',  label: 'Historique', Icon: History         },
  { id: 'analyse',     label: 'Analyse',    Icon: BarChart2       },
  { id: 'parametres',  label: 'Réglages',   Icon: Settings        },
]

interface BottomNavProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
      {/* Gradient pour que le contenu derrière ne transparaisse pas brutalement */}
      <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-[#080d1a] to-transparent pointer-events-none" />

      <div className="bg-[#0e1628] border-t border-[#1a2d4a] px-1 pt-2 pb-safe">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = currentPage === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95"
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Indicateur actif — barre en haut */}
                <span
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                    active ? 'w-6 bg-blue-400' : 'w-0 bg-transparent'
                  }`}
                />

                {/* Fond actif */}
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-blue-500/10" />
                )}

                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.7}
                  className={`transition-colors duration-200 ${
                    active ? 'text-blue-400' : 'text-slate-500'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    active ? 'text-blue-400' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
