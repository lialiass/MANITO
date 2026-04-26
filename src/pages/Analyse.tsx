import { BarChart2, TrendingUp, PieChart, Calendar } from 'lucide-react'

// Carte de graphique placeholder
interface ChartPlaceholderProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  height?: string
}

function ChartPlaceholder({ title, subtitle, icon, height = 'h-36' }: ChartPlaceholderProps) {
  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm">{title}</p>
          <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
        </div>
        <div className="bg-[#162440] p-2.5 rounded-xl text-slate-400">
          {icon}
        </div>
      </div>
      {/* Zone graphique placeholder */}
      <div className={`${height} rounded-xl bg-[#080d1a] border border-[#1a2d4a] flex flex-col items-center justify-center gap-2`}>
        <div className="text-slate-700">{icon}</div>
        <p className="text-slate-600 text-xs">Disponible en Phase 3</p>
      </div>
    </div>
  )
}

// Résumé statistique rapide
interface StatRowProps {
  label: string
  value: string
  color?: string
}

function StatRow({ label, value, color = 'text-white' }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1a2d4a] last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}

export default function Analyse() {
  return (
    <div className="space-y-5">

      {/* Titre */}
      <div>
        <h2 className="text-white text-xl font-bold">Analyse</h2>
        <p className="text-slate-500 text-sm mt-0.5">Visualisez vos performances</p>
      </div>

      {/* Sélecteur de période (placeholder) */}
      <div className="flex gap-2">
        {['Semaine', 'Mois', 'Année'].map((p, i) => (
          <button
            key={p}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
              i === 1
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-[#0e1628] border-[#1a2d4a] text-slate-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Graphiques placeholder */}
      <ChartPlaceholder
        title="Taux journalier"
        subtitle="Évolution sur le mois"
        icon={<TrendingUp size={18} />}
        height="h-40"
      />

      <ChartPlaceholder
        title="Répartition du temps"
        subtitle="Conduite vs. annexe"
        icon={<PieChart size={18} />}
        height="h-32"
      />

      {/* Stats résumé */}
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-slate-400" />
          <p className="text-white font-semibold text-sm">Statistiques du mois</p>
        </div>
        <StatRow label="Jours travaillés" value="0" />
        <StatRow label="Meilleur taux journalier" value="— €" color="text-emerald-400" />
        <StatRow label="Taux moyen journalier" value="— €" />
        <StatRow label="Total conduite" value="0h00" />
        <StatRow label="Amplitude moyenne" value="0h00" />
      </div>

      {/* Graphique mensuel placeholder */}
      <ChartPlaceholder
        title="Suivi mensuel"
        subtitle="Comparaison mois par mois"
        icon={<BarChart2 size={18} />}
        height="h-36"
      />

    </div>
  )
}
