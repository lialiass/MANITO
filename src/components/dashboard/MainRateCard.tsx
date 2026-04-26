import type { MonthStats } from '../../lib/calculations'

// ------------------------------------------------------------
// Jauge circulaire (anneau SVG)
// Tourne de -90° pour démarrer en haut.
// ------------------------------------------------------------

interface RingGaugeProps {
  value: number       // valeur actuelle (ex: 18.7)
  max: number         // valeur max de la jauge (ex: 30)
  color: string       // couleur HEX du remplissage
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
}

function RingGauge({ value, max, color, size = 148, strokeWidth = 11, children }: RingGaugeProps) {
  const cx = size / 2
  const cy = size / 2
  const r  = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct       = Math.min(Math.max(value / max, 0), 1)
  const dashOffset = circumference * (1 - pct)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Piste de fond */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#1a2d4a"
          strokeWidth={strokeWidth}
        />
        {/* Arc de progression */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      {/* Contenu centré */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {children}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Sous-composant : une ligne de stat sous la jauge
// ------------------------------------------------------------

function StatPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-slate-500 text-[10px] uppercase tracking-widest">{label}</p>
      <p className="text-white text-sm font-bold tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-slate-600 text-[10px]">{sub}</p>}
    </div>
  )
}

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface MainRateCardProps {
  monthStats: MonthStats
  referenceRatePercent: number
  monthLabel: string
}

// ------------------------------------------------------------
// Composant principal
// ------------------------------------------------------------

export default function MainRateCard({ monthStats, referenceRatePercent, monthLabel }: MainRateCardProps) {
  const currentRate = monthStats.avgServiceRatePercent
  const gap         = monthStats.monthlyGapMins
  const hasData     = monthStats.daysCount > 0

  // Couleur dynamique basée sur l'écart
  const gaugeColor  = !hasData       ? '#1e3560'
    : gap > 0      ? '#10b981'  // vert  — disponible
    : gap > -60    ? '#f59e0b'  // orange — proche limite
    :                '#ef4444'  // rouge  — dépassement

  const rateTextColor = !hasData       ? 'text-slate-600'
    : gap > 0      ? 'text-emerald-400'
    : gap > -60    ? 'text-amber-400'
    :                'text-red-400'

  // Écart en points
  const diffPts = hasData ? currentRate - referenceRatePercent : null
  const diffDisplay = diffPts !== null
    ? `${diffPts > 0 ? '+' : ''}${diffPts.toFixed(1)} pt${Math.abs(diffPts) >= 2 ? 's' : ''}`
    : '—'

  // Status textuel
  const statusLabel = !hasData       ? 'Aucune donnée'
    : gap > 60     ? 'Bien en avance'
    : gap > 0      ? 'Dans les temps'
    : gap > -60    ? 'Proche du seuil'
    :                'Seuil dépassé'

  // Max jauge = 1.5 × référence
  const gaugeMax = referenceRatePercent * 1.5

  return (
    <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-3xl p-5 overflow-hidden relative">
      {/* Halo de fond coloré */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 40%, ${gaugeColor}, transparent 70%)` }}
      />

      {/* Label mois + statut */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Taux de service</p>
          <p className="text-slate-600 text-[11px] capitalize mt-0.5">{monthLabel}</p>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{
            color: gaugeColor,
            backgroundColor: `${gaugeColor}18`,
            border: `1px solid ${gaugeColor}35`,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Jauge centrée */}
      <div className="flex justify-center mb-5 relative z-10">
        <RingGauge
          value={hasData ? currentRate : 0}
          max={gaugeMax}
          color={gaugeColor}
        >
          {/* Valeur centrale */}
          <p className={`text-3xl font-black tabular-nums leading-none ${rateTextColor}`}>
            {hasData ? `${currentRate.toFixed(1)}%` : '—'}
          </p>
          <p className="text-slate-600 text-[10px] uppercase tracking-wider mt-0.5">TxService</p>
        </RingGauge>
      </div>

      {/* Ligne de stats sous la jauge */}
      <div className="flex items-center justify-around border-t border-[#1a2d4a] pt-4 relative z-10">
        <StatPill
          label="Référence"
          value={`${referenceRatePercent.toFixed(1)} %`}
        />

        <div className="w-px h-8 bg-[#1a2d4a]" />

        <StatPill
          label="Écart"
          value={diffDisplay}
          sub={diffPts !== null && diffPts > 0 ? 'au-dessus' : diffPts !== null && diffPts < 0 ? 'en dessous' : undefined}
        />

        <div className="w-px h-8 bg-[#1a2d4a]" />

        <StatPill
          label="Jours"
          value={hasData ? String(monthStats.daysCount) : '—'}
          sub={hasData ? 'saisis' : undefined}
        />
      </div>
    </div>
  )
}
