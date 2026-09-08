'use client'

import type { ReactNode } from 'react'
import { Settings, BookOpen, MapPin } from 'lucide-react'
import {
  CALCULATION_METHODS,
  MADHABS,
  type CalculationMethodId,
  type MadhabId,
  type LocationData,
} from '@/types/ramadan.types'
import { SettingsRow } from './SettingsRow'

interface PreferencesSectionProps {
  calculationMethodLabel: string
  madhabLabel: string
  locationLabel: string | null
  onEditCalculationMethod: () => void
  onEditMadhab: () => void
  onEditLocation: () => void
  notifications: ReactNode
}

/**
 * Pure label-derivation helpers.
 *
 * These reuse the `CALCULATION_METHODS` / `MADHABS` lookup logic that
 * previously lived inside `CompactPreferencesCard` (which this section
 * replaces). They contain no settings logic — they only turn the current
 * preference ids into human-readable labels. `page.tsx` derives the labels
 * with these helpers and passes the resulting strings to `PreferencesSection`.
 */
export function deriveCalculationMethodLabel(method: CalculationMethodId): string {
  return CALCULATION_METHODS.find((m) => m.id === method)?.name ?? 'Unknown'
}

export function deriveMadhabLabel(madhab: MadhabId): string {
  const match = MADHABS.find((m) => m.id === madhab)
  if (!match) return 'Unknown'
  const primaryDescription = match.description.split(',')[0]
  return `${match.name} (${primaryDescription})`
}

export function deriveLocationLabel(location: LocationData | null): string | null {
  return location?.city ?? null
}

/**
 * Grouped preferences settings list rendered on a `surface-grouped` surface.
 *
 * Shows Calculation Method, Madhab, and Location rows (via `SettingsRow`),
 * followed by the `notifications` node as the last entry. Tapping a row
 * invokes the matching `onEdit*` handler (which opens the existing
 * `PreferencesDetailModal`); this section changes no settings logic.
 * When `locationLabel` is null/empty, Location renders a muted
 * "No location selected" placeholder. Styling is token-only so light and
 * dark modes both re-theme.
 */
export function PreferencesSection({
  calculationMethodLabel,
  madhabLabel,
  locationLabel,
  onEditCalculationMethod,
  onEditMadhab,
  onEditLocation,
  notifications,
}: PreferencesSectionProps) {
  const hasLocation = Boolean(locationLabel && locationLabel.trim().length > 0)

  return (
    <div className="surface-grouped overflow-hidden">
      <SettingsRow
        label="Calculation Method"
        value={calculationMethodLabel}
        onPress={onEditCalculationMethod}
        icon={<Settings className="size-4" />}
      />

      <SettingsRow
        label="Madhab"
        value={madhabLabel}
        onPress={onEditMadhab}
        icon={<BookOpen className="size-4" />}
      />

      <SettingsRow
        label="Location"
        value={hasLocation ? (locationLabel as string) : 'No location selected'}
        placeholder={!hasLocation}
        onPress={onEditLocation}
        icon={<MapPin className="size-4" />}
      />

      {notifications}
    </div>
  )
}
