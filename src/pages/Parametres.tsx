import { ChevronRight, User, Euro, Clock, Bell, Shield, Info } from 'lucide-react'

// Ligne de paramètre
interface SettingRowProps {
  icon: React.ReactNode
  label: string
  value?: string
  danger?: boolean
}

function SettingRow({ icon, label, value, danger }: SettingRowProps) {
  return (
    <button className="w-full flex items-center justify-between py-3.5 px-0 border-b border-[#1a2d4a] last:border-0 active:opacity-70 transition-opacity">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-500/10 text-red-400' : 'bg-[#162440] text-slate-400'}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-slate-500 text-xs">{value}</span>}
        <ChevronRight size={15} className="text-slate-600" />
      </div>
    </button>
  )
}

// Groupe de paramètres
interface SettingGroupProps {
  title: string
  children: React.ReactNode
}

function SettingGroup({ title, children }: SettingGroupProps) {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 px-1">{title}</p>
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl px-4">
        {children}
      </div>
    </div>
  )
}

export default function Parametres() {
  return (
    <div className="space-y-5">

      {/* Titre */}
      <div>
        <h2 className="text-white text-xl font-bold">Paramètres</h2>
        <p className="text-slate-500 text-sm mt-0.5">Configuration de l'application</p>
      </div>

      {/* Profil chauffeur (placeholder) */}
      <div className="bg-[#0e1628] border border-[#1a2d4a] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#162440] border border-[#1a2d4a] flex items-center justify-center">
          <User size={24} className="text-slate-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Chauffeur</p>
          <p className="text-slate-500 text-xs mt-0.5">Profil non configuré</p>
        </div>
        <ChevronRight size={16} className="text-slate-600" />
      </div>

      {/* Groupe Taux & Objectifs */}
      <SettingGroup title="Taux & Objectifs">
        <SettingRow
          icon={<Euro size={16} />}
          label="Taux horaire"
          value="Non défini"
        />
        <SettingRow
          icon={<Euro size={16} />}
          label="Taux cible mensuel"
          value="Non défini"
        />
      </SettingGroup>

      {/* Groupe Temps réglementaires */}
      <SettingGroup title="Temps réglementaires">
        <SettingRow
          icon={<Clock size={16} />}
          label="Durée max conduite journalière"
          value="9h00"
        />
        <SettingRow
          icon={<Clock size={16} />}
          label="Amplitude max journalière"
          value="13h00"
        />
      </SettingGroup>

      {/* Groupe Notifications */}
      <SettingGroup title="Notifications">
        <SettingRow
          icon={<Bell size={16} />}
          label="Rappels de saisie"
          value="Désactivé"
        />
      </SettingGroup>

      {/* Groupe Application */}
      <SettingGroup title="Application">
        <SettingRow
          icon={<Shield size={16} />}
          label="Données & confidentialité"
        />
        <SettingRow
          icon={<Info size={16} />}
          label="À propos de MANITO"
          value="v0.1.0"
        />
      </SettingGroup>

      <p className="text-center text-slate-700 text-xs pb-2">
        MANITO — Suivi conducteur · v0.1.0
      </p>

    </div>
  )
}
