import { Medal, TrendingDown } from 'lucide-react'
import { minutesToReadable } from '../../lib/calculations'
import { formatDayShort } from '../../lib/dateUtils'
import type { ChartDataPoint } from '../../pages/Analyse'

interface DayRankingCardProps {
  chartData: ChartDataPoint[]
}

// ── Ligne d'un jour classé ────────────────────────────────────

interface RankRowProps {
  rank:      number
  point:     ChartDataPoint
  variant:   'best' | 'worst'
}

function RankRow({ rank, point, variant }: RankRowProps) {
  const isBest     = variant === 'best'
  const gapPositive = point.gapMins >= 0
  const gapColor   = gapPositive ? 'text-emerald-400' : 'text-red-400'
  const gapDisplay = `${gapPositive ? '+' : ''}${minutesToReadable(point.gapMins)}`

  // Médaille uniquement pour le top 1
  const rankColors = isBest
    ? ['text-amber-400', 'text-slate-400', 'text-orange-600']
    : ['text-red-500',  'text-red-400',  'text-red-300']

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1a2d4a]/50 last:border-0">
      <div className="flex items-center gap-3">
        {/* Rang */}
        <span className={`text-xs font-bold tabular-nums w-4 ${rankColors[rank - 1] ?? 'text-slate-600'}`}>
          #{rank}
        </span>
        {/* Date */}
        <div>
          <p className="text-white text-sm font-semibold capitalize">
            {formatDayShort(point.dateISO)}
          </p>
          <p className="text-slate-600 text-[10px] mt-0.5 tabular-nums">
            TxService {point.txService.toFixed(1)} %
          </p>
        </div>
      </div>

      {/* Écart */}
      <div className="text-right">
        <span className={`text-sm font-bold tabular-nums ${gapColor}`}>
          {gapDisplay}
        </span>
      </div>
    </div>
  )
}

// ── Section (meilleures ou pires) ────────────────────────────

interface RankSectionProps {
  title:    string
  icon:     React.ReactNode
  rows:     ChartDataPoint[]
  variant:  'best' | 'worst'
  accent:   string
}

function RankSection({ title, icon, rows, variant, accent }: RankSectionProps) {
  return (
    <div>
      <div className={`flex items-center gap-2 px-4 py-2.5 ${accent} border-b border-[#1a2d4a]`}>
        {icon}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-4">
        {rows.map((p, i) => (
          <RankRow key={p.dateISO} rank={i + 1} point={p} variant={variant} />
        ))}
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────

export default function DayRankingCard({ chartData }: DayRankingCardProps) {
  if (chartData.length === 0) {
    return (
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4">
        <p className="text-white font-semibold text-sm mb-1">Classement des journées</p>
        <p className="text-slate-600 text-sm">Aucune donnée pour ce mois.</p>
      </div>
    )
  }

  const MAX_SHOWN = Math.min(3, chartData.length)

  // Tri par écart décroissant (meilleures = plus grand écart positif)
  const sorted = [...chartData].sort((a, b) => b.gapMins - a.gapMins)
  const bestDays  = sorted.slice(0, MAX_SHOWN)
  const worstDays = sorted.slice(-MAX_SHOWN).reverse()   // pires = fin du tableau

  // Si toutes les journées tiennent dans MAX_SHOWN, on peut avoir des doublons
  // On déduplique dans ce cas
  const worstFiltered = worstDays.filter(
    (w) => !bestDays.some((b) => b.dateISO === w.dateISO)
  )

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a2d4a] bg-[#111e35]">
        <p className="text-white font-semibold text-sm">Classement des journées</p>
        <p className="text-slate-500 text-xs mt-0.5">
          Top {MAX_SHOWN} · basé sur l'écart au taux
        </p>
      </div>

      {/* Meilleures journées */}
      <RankSection
        title="Meilleures journées"
        icon={<Medal size={13} className="text-amber-400" />}
        rows={bestDays}
        variant="best"
        accent="bg-emerald-500/5"
      />

      {/* Journées difficiles — uniquement si pas de redondance */}
      {worstFiltered.length > 0 && (
        <RankSection
          title="Journées difficiles"
          icon={<TrendingDown size={13} className="text-red-400" />}
          rows={worstFiltered}
          variant="worst"
          accent="bg-red-500/5"
        />
      )}
    </div>
  )
}
