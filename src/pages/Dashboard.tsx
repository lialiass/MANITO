import { Clock, TrendingUp, Activity, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// Composant carte de statistique
interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  accent?: boolean
}

function StatCard({ label, value, sub, icon, trend, accent }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-3 ${
      accent
        ? 'bg-blue-600/10 border-blue-500/30'
        : 'bg-[#0e1628] border-[#1a2d4a]'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className={`p-2 rounded-xl ${accent ? 'bg-blue-500/20 text-blue-400' : 'bg-[#162440] text-slate-400'}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-blue-300' : 'text-white'}`}>
          {value}
        </p>
        {sub && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <ArrowUpRight size={13} className="text-emerald-400" />}
            {trend === 'down' && <ArrowDownRight size={13} className="text-red-400" />}
            <span className={`text-xs ${
              trend === 'up' ? 'text-emerald-400' :
              trend === 'down' ? 'text-red-400' :
              'text-slate-500'
            }`}>{sub}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant ligne de résumé rapide
function QuickRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#1a2d4a] last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-5">

      {/* Titre de section */}
      <div>
        <h2 className="text-white text-xl font-bold">Tableau de bord</h2>
        <p className="text-slate-500 text-sm mt-0.5">Résumé de la journée en cours</p>
      </div>

      {/* Cartes principales — 2 colonnes */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Taux du jour"
          value="— €"
          sub="Aucune saisie"
          icon={<TrendingUp size={16} />}
          accent
        />
        <StatCard
          label="Temps conduite"
          value="--:--"
          sub="Aujourd'hui"
          icon={<Clock size={16} />}
        />
        <StatCard
          label="Amplitude"
          value="--:--"
          sub="Aujourd'hui"
          icon={<Activity size={16} />}
        />
        <StatCard
          label="Ce mois"
          value="— €"
          sub="0 jours saisis"
          icon={<CalendarDays size={16} />}
        />
      </div>

      {/* Résumé de la semaine */}
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-1">Semaine en cours</h3>
        <p className="text-slate-500 text-xs mb-4">Aucune donnée pour l'instant</p>
        <QuickRow label="Jours travaillés" value="0 / 5" />
        <QuickRow label="Total conduite" value="0h00" />
        <QuickRow label="Total service" value="0h00" />
        <QuickRow label="Taux cumulé" value="0,00 €" />
      </div>

      {/* Écart taux */}
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Écart taux mensuel</p>
          <p className="text-white text-xl font-bold">— €</p>
          <p className="text-slate-500 text-xs mt-1">vs. taux cible mensuel</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#162440] flex items-center justify-center">
          <TrendingUp size={20} className="text-slate-500" />
        </div>
      </div>

    </div>
  )
}
