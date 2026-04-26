import { CalendarDays, ChevronRight, Clock } from 'lucide-react'

// Entrée de journée (placeholder visuel)
interface JourneeItemProps {
  date: string
  conduite: string
  taux: string
  isPlaceholder?: boolean
}

function JourneeItem({ date, conduite, taux, isPlaceholder }: JourneeItemProps) {
  return (
    <div className={`bg-[#0e1628] border rounded-2xl p-4 flex items-center justify-between transition-opacity ${
      isPlaceholder ? 'border-[#1a2d4a] opacity-30' : 'border-[#1a2d4a]'
    }`}>
      <div className="flex items-center gap-3">
        <div className="bg-[#162440] p-2.5 rounded-xl">
          <CalendarDays size={16} className="text-slate-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{date}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={11} className="text-slate-500" />
            <p className="text-slate-500 text-xs">{conduite}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-blue-400 text-sm font-bold">{taux}</span>
        <ChevronRight size={14} className="text-slate-600" />
      </div>
    </div>
  )
}

// Entête de groupe (semaine)
function WeekHeader({ label }: { label: string }) {
  return (
    <p className="text-slate-500 text-xs uppercase tracking-wider px-1 pt-2">{label}</p>
  )
}

export default function Historique() {
  return (
    <div className="space-y-4">

      {/* Titre */}
      <div>
        <h2 className="text-white text-xl font-bold">Historique</h2>
        <p className="text-slate-500 text-sm mt-0.5">Vos journées enregistrées</p>
      </div>

      {/* Filtres (placeholder) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['Ce mois', 'Mois dernier', '3 mois'].map((f, i) => (
          <button
            key={f}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
              i === 0
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-[#0e1628] border-[#1a2d4a] text-slate-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Contenu vide avec placeholders visuels */}
      <div className="space-y-3">
        <WeekHeader label="Cette semaine" />
        <div className="flex flex-col items-center justify-center py-8 bg-[#0e1628] border border-[#1a2d4a] rounded-2xl gap-2">
          <CalendarDays size={32} className="text-slate-700" />
          <p className="text-slate-500 text-sm font-medium">Aucune journée saisie</p>
          <p className="text-slate-600 text-xs text-center px-6">
            Commencez par saisir une journée depuis l'onglet Saisie
          </p>
        </div>

        {/* Aperçu visuel de ce que ça ressemblera */}
        <WeekHeader label="Exemple (aperçu)" />
        <JourneeItem date="Lundi 21 avr." conduite="7h30 de conduite" taux="— €" isPlaceholder />
        <JourneeItem date="Mardi 22 avr." conduite="6h45 de conduite" taux="— €" isPlaceholder />
        <JourneeItem date="Mercredi 23 avr." conduite="8h00 de conduite" taux="— €" isPlaceholder />
      </div>

    </div>
  )
}
