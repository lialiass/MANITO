// ============================================================
// MANITO — Client Supabase
// Toute communication avec Supabase passe par ce fichier.
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[MANITAUX] Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes.\n' +
    'L\'application fonctionne en mode local uniquement jusqu\'à configuration du .env'
  )
}

/**
 * Client Supabase partagé.
 * Si les variables ne sont pas définies, le client est créé avec
 * des valeurs fictives — les appels réseau échoueront silencieusement
 * et l'app reste utilisable en mode 100 % local.
 */
export const supabase = createClient(
  supabaseUrl     ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key'
)

// ------------------------------------------------------------
// Helpers de mapping local ↔ Supabase
// ------------------------------------------------------------

import type { DayEntry } from './calculations'
import type { AnnualRate } from '../store/useSettingsStore'

/** Convertit une ligne Supabase (daily_entries) en DayEntry local. */
export function rowToDayEntry(row: {
  id:           string
  date:         string
  start_time:   string
  end_time:     string
  driving_mins: number
  work_mins:    number
}): DayEntry {
  return {
    id:          row.id,
    date:        row.date,
    startTime:   row.start_time.slice(0, 5),  // "08:00:00" → "08:00"
    endTime:     row.end_time.slice(0, 5),
    drivingMins: row.driving_mins,
    workMins:    row.work_mins,
  }
}

/** Convertit un AnnualRate local en ligne Supabase (annual_settings). */
export function rowToAnnualRate(row: {
  year:           number
  reference_rate: number | string
}): AnnualRate {
  return {
    year:                 row.year,
    referenceRatePercent: parseFloat(String(row.reference_rate)),
  }
}
