import { Clock, CalendarDays, ChevronRight } from 'lucide-react'

// Composant champ de saisie placeholder
interface FieldRowProps {
  label: string
  placeholder: string
  icon: React.ReactNode
}

function FieldRow({ label, placeholder, icon }: FieldRowProps) {
  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-[#162440] p-2.5 rounded-xl text-slate-400">
          {icon}
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-slate-600 text-sm mt-0.5">{placeholder}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-600" />
    </div>
  )
}

export default function Saisie() {
  return (
    <div className="space-y-5">

      {/* Titre */}
      <div>
        <h2 className="text-white text-xl font-bold">Nouvelle saisie</h2>
        <p className="text-slate-500 text-sm mt-0.5">Enregistrez les données de votre journée</p>
      </div>

      {/* Date sélectionnée */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-3">
        <div className="bg-blue-500/20 p-2.5 rounded-xl">
          <CalendarDays size={18} className="text-blue-400" />
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider">Date</p>
          <p className="text-white font-semibold text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Champs de temps */}
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 px-1">Temps de travail</p>
        <div className="space-y-3">
          <FieldRow
            label="Temps de conduite"
            placeholder="Appuyez pour saisir"
            icon={<Clock size={18} />}
          />
          <FieldRow
            label="Temps annexe"
            placeholder="Appuyez pour saisir"
            icon={<Clock size={18} />}
          />
          <FieldRow
            label="Amplitude"
            placeholder="Appuyez pour saisir"
            icon={<Clock size={18} />}
          />
        </div>
      </div>

      {/* Récapitulatif calculé (placeholder) */}
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4 space-y-3">
        <p className="text-slate-400 text-xs uppercase tracking-wider">Récapitulatif calculé</p>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Temps de service</span>
          <span className="text-slate-600 text-sm font-semibold">--:--</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Taux journalier estimé</span>
          <span className="text-slate-600 text-sm font-semibold">— €</span>
        </div>
      </div>

      {/* Bouton de validation (placeholder) */}
      <button
        disabled
        className="w-full bg-blue-600 disabled:bg-[#162440] disabled:text-slate-600 text-white font-semibold py-4 rounded-2xl text-sm transition-all duration-200 cursor-not-allowed"
      >
        Enregistrer la journée
      </button>

      <p className="text-center text-slate-600 text-xs">
        La saisie sera activée en Phase 2
      </p>

    </div>
  )
}
