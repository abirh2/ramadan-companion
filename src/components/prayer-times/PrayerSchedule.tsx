'use client'

import type { PrayerName } from '@/types/prayer-tracking.types'
import { ScheduleHeader } from './ScheduleHeader'
import { PrayerScheduleRow } from './PrayerScheduleRow'
import type { PrayerRowViewModel } from './prayerRowViewModel'

interface ScheduleHeaderProps {
  gregorianDate: string
  hijriDate: string | null
  hijriUnavailable: boolean
  onOpenDatePicker: () => void
}

interface PrayerScheduleProps {
  header: ScheduleHeaderProps
  rows: PrayerRowViewModel[]
  showCompletion: boolean
  onToggle: (name: PrayerName) => void
  formatTime: (t: string) => string
}

/**
 * The prayer schedule presented as a single calm grouped surface rather than a
 * stack of per-prayer cards (R3.10, R8.3).
 *
 * The surface uses `surface-grouped` semantic tokens (`radius-grouped`,
 * 1px `border-subtle`) so light and dark modes both re-theme through the token
 * system. `overflow-hidden` clips the integrated `ScheduleHeader` and the
 * divider-separated rows to the rounded corners, giving one coherent schedule
 * without card chrome.
 *
 * The `ScheduleHeader` (Gregorian + Hijri + "Other Dates") renders at the top,
 * inside the same surface. The six ordered `rows` map to `PrayerScheduleRow`
 * children; each row owns its own internal padding and `border-subtle` divider,
 * and the final row receives `isLast` so no trailing divider is drawn (R3.1,
 * R8.1, R8.2). There is deliberately no per-prayer wrapper element (R17.9).
 */
export function PrayerSchedule({
  header,
  rows,
  showCompletion,
  onToggle,
  formatTime,
}: PrayerScheduleProps) {
  return (
    <section className="overflow-hidden rounded-grouped border border-border-subtle bg-surface-grouped">
      <ScheduleHeader
        gregorianDate={header.gregorianDate}
        hijriDate={header.hijriDate}
        hijriUnavailable={header.hijriUnavailable}
        onOpenDatePicker={header.onOpenDatePicker}
      />

      {rows.map((row, index) => (
        <PrayerScheduleRow
          key={row.name}
          row={row}
          showCompletion={showCompletion}
          onToggle={onToggle}
          formatTime={formatTime}
          isLast={index === rows.length - 1}
        />
      ))}
    </section>
  )
}
