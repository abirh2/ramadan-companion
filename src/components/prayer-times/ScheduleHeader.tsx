'use client'

import { Calendar } from 'lucide-react'

interface ScheduleHeaderProps {
  gregorianDate: string
  hijriDate: string | null
  hijriUnavailable: boolean
  onOpenDatePicker: () => void
}

/**
 * Header region rendered inside the PrayerSchedule grouped surface (not a
 * separate date card).
 *
 * The Gregorian date is always shown in `type-section-title`. The Hijri date is
 * shown in `type-body-secondary` when present; when `hijriUnavailable` is true a
 * small "Hijri date unavailable" indicator is shown in
 * `type-caption text-text-tertiary` while the Gregorian date stays visible.
 *
 * The trailing "Other Dates" control is a `min-h-touch` button with a `Calendar`
 * icon and a visible label that calls `onOpenDatePicker` to open the existing
 * date selector. Styling is token-only so light and dark modes both re-theme.
 */
export function ScheduleHeader({
  gregorianDate,
  hijriDate,
  hijriUnavailable,
  onOpenDatePicker,
}: ScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="type-section-title truncate text-text-primary">{gregorianDate}</p>

        {hijriUnavailable ? (
          <p className="type-caption text-text-tertiary">Hijri date unavailable</p>
        ) : hijriDate ? (
          <p className="type-body-secondary truncate text-text-secondary">{hijriDate}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenDatePicker}
        className="flex min-h-touch shrink-0 items-center gap-2 rounded-control px-3 py-2 text-text-secondary transition-colors hover:bg-surface-grouped hover:text-teal active:bg-teal-muted"
      >
        <Calendar className="size-4 shrink-0" aria-hidden="true" />
        <span className="type-body-secondary">Other Dates</span>
      </button>
    </div>
  )
}
