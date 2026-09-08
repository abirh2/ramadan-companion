'use client'

import { Check, Circle, Sunrise } from 'lucide-react'
import type { PrayerName } from '@/types/prayer-tracking.types'
import type { PrayerRowViewModel } from './prayerRowViewModel'

interface PrayerScheduleRowProps {
  row: PrayerRowViewModel
  showCompletion: boolean
  onToggle: (name: PrayerName) => void
  formatTime: (t: string) => string
  isLast: boolean
}

/**
 * Presentational row for one prayer schedule entry within the grouped
 * PrayerSchedule surface.
 *
 * State is always conveyed by text and/or icon in addition to color, never by
 * color alone (R10.1):
 * - `passed`  — reduced emphasis (secondary/tertiary text) with a trailing
 *   "Passed" label; name + time keep >= 4.5:1 contrast.
 * - `upnext`  — `bg-teal-muted` tint, a teal indicator dot, the text "Up next",
 *   and the remaining countdown from `row.timeUntil`.
 * - `now`     — a "Now" indicator (text + filled `Check`-adjacent dot) using
 *   `success`/`teal` tokens rather than a hard-coded green background.
 * - `future`  — the remaining time from `row.timeUntil` (e.g. "in 2h 10m").
 *
 * Sunrise (a non-prayer row) gets a quieter treatment with the `Sunrise` icon
 * and no completion control. Imsak is rendered inside the Fajr row from
 * `row.imsak`. The completion toggle appears only for prayer rows when
 * `showCompletion` is true; its checked state is conveyed by a `Check` icon and
 * an accessible label, not color alone.
 *
 * Styling is token-only so light and dark modes both re-theme.
 */
export function PrayerScheduleRow({
  row,
  showCompletion,
  onToggle,
  formatTime,
  isLast,
}: PrayerScheduleRowProps) {
  const divider = isLast ? '' : 'border-b border-border-subtle'

  // --- Sunrise: quieter non-prayer marker, no completion control (R3.2) ---
  if (!row.isPrayer) {
    return (
      <div
        className={`flex min-h-touch items-center gap-3 px-4 py-4 sm:px-5 ${divider}`}
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center text-text-tertiary"
          aria-hidden="true"
        >
          <Sunrise className="size-5" />
        </span>
        <span className="type-body-secondary min-w-0 flex-1 text-text-tertiary">
          {row.name}
        </span>
        <span className="type-body-secondary tabular-nums text-text-tertiary">
          {formatTime(row.time)}
        </span>
      </div>
    )
  }

  // --- Prayer rows ---
  const isNow = row.state === 'now'
  const isUpNext = row.state === 'upnext'
  const isPassed = row.state === 'passed'

  // State tint on the row background — teal-muted for now/upnext (R3.4, R3.7).
  const rowTint = isNow || isUpNext ? 'bg-teal-muted' : ''

  // Passed rows use reduced emphasis but keep the name AND time at >= 4.5:1
  // against the row background (R3.3). Both stay on `text-text-secondary`
  // rather than dropping the time to `text-text-tertiary`, which sits at the
  // 4.5:1 boundary on the light `surface-grouped` background.
  const nameClass = isPassed ? 'text-text-secondary' : 'text-text-primary'
  const timeClass = isPassed ? 'text-text-secondary' : 'text-text-secondary'

  return (
    <div
      className={`flex min-h-touch items-center gap-3 px-4 py-4 sm:px-5 ${rowTint} ${divider}`}
    >
      {showCompletion ? (
        <button
          type="button"
          onClick={() => onToggle(row.name as PrayerName)}
          aria-pressed={row.completed}
          aria-label={
            row.completed
              ? `${row.name} marked complete`
              : `Mark ${row.name} complete`
          }
          className={`flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
            row.completed
              ? 'text-success'
              : 'text-text-tertiary hover:text-teal'
          }`}
        >
          {row.completed ? (
            <Check className="size-5" aria-hidden="true" />
          ) : (
            <Circle className="size-5" aria-hidden="true" />
          )}
        </button>
      ) : (
        <span className="min-h-touch min-w-touch shrink-0" aria-hidden="true" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`type-body font-medium ${nameClass}`}>
            {row.name}
          </span>

          {isNow ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 type-caption font-semibold text-success">
              <Check className="size-3" aria-hidden="true" />
              Now
            </span>
          ) : null}

          {isUpNext ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 type-caption font-semibold text-teal">
              <Circle
                className="size-2 fill-current"
                aria-hidden="true"
              />
              Up next
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={`type-caption tabular-nums ${timeClass}`}>
            {formatTime(row.time)}
          </span>
          {row.imsak ? (
            <>
              <span className="type-caption text-text-tertiary" aria-hidden="true">
                &middot;
              </span>
              <span className="type-caption text-text-tertiary">
                Imsak {formatTime(row.imsak)}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {isPassed ? (
          <span className="type-caption text-text-tertiary">Passed</span>
        ) : row.timeUntil ? (
          <span
            className={`type-caption tabular-nums ${
              isNow || isUpNext ? 'text-teal' : 'text-text-secondary'
            }`}
          >
            {row.timeUntil}
          </span>
        ) : null}
      </div>
    </div>
  )
}
