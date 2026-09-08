// Pure prayer-row state-derivation module.
//
// This module moves the render-time derivation that previously lived inline in
// `src/app/times/page.tsx` into a pure, testable module. It introduces NO new
// business logic: every calculation preserves the exact semantics of the
// original page helpers (`formatTime`, `getTimeUntil`, `isPrayerNow`,
// `getUpNextPrayer`, `getImsakTime`). The only change is that the time-dependent
// helpers take an explicit clock (`now: Date`) instead of calling `new Date()`
// internally, which is what makes them pure.

import type { PrayerTime } from '@/types/ramadan.types'
import type { DailyPrayerCompletion } from '@/types/prayer-tracking.types'

/**
 * The state of a single prayer schedule row.
 * - `passed`  — the prayer time is in the past (getTimeUntil === null).
 * - `now`     — current clock time is within the Now window (prayer time → +15min).
 * - `upnext`  — the earliest not-yet-passed prayer that is not currently `now`.
 * - `future`  — a not-yet-passed prayer that is neither `now` nor `upnext`.
 */
export type PrayerRowState = 'passed' | 'now' | 'upnext' | 'future'

/**
 * Derived, render-time view model for one prayer schedule row. Not persisted.
 */
export interface PrayerRowViewModel {
  name: string
  /** "HH:MM" source time; formatted for display by the presentation layer. */
  time: string
  /** false for Sunrise (the only non-prayer row). */
  isPrayer: boolean
  state: PrayerRowState
  /** "in 1h 20m" style string for future rows; null once the time has passed. */
  timeUntil: string | null
  /** Mirrors the corresponding `{name}_completed` flag from todayCompletion. */
  completed: boolean
  /** Present only on the Fajr row (10 minutes before Fajr). */
  imsak?: string
}

// Fixed schedule order. Sunrise is the only non-prayer entry.
const SCHEDULE: ReadonlyArray<{ name: string; isPrayer: boolean }> = [
  { name: 'Fajr', isPrayer: true },
  { name: 'Sunrise', isPrayer: false },
  { name: 'Dhuhr', isPrayer: true },
  { name: 'Asr', isPrayer: true },
  { name: 'Maghrib', isPrayer: true },
  { name: 'Isha', isPrayer: true },
]

// Prayers considered for the "up next" indicator (Sunrise excluded), in order.
const UP_NEXT_ORDER: ReadonlyArray<keyof PrayerTime> = [
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
]

/**
 * Format a "HH:MM" time string to 12-hour display, e.g. "4:36 PM".
 * Pure; identical semantics to the original page `formatTime`.
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Compute the human-readable time until a prayer relative to `now`, or null if
 * the prayer time has already passed today.
 * Pure equivalent of the original page `getTimeUntil` (which used `new Date()`).
 */
export function getTimeUntil(timeString: string, now: Date): string | null {
  const [hours, minutes] = timeString.split(':').map(Number)
  const prayerTime = new Date(now)
  prayerTime.setHours(hours, minutes, 0, 0)

  if (prayerTime.getTime() < now.getTime()) {
    return null // Prayer has passed
  }

  const diff = prayerTime.getTime() - now.getTime()
  const hoursUntil = Math.floor(diff / (1000 * 60 * 60))
  const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hoursUntil > 0) {
    return `in ${hoursUntil}h ${minutesUntil}m`
  } else if (minutesUntil > 0) {
    return `in ${minutesUntil}m`
  } else {
    return 'now'
  }
}

/**
 * Whether a prayer is happening NOW: current time is at or after the prayer
 * time, and within 15 minutes of it (Now window = prayer time → +15min).
 * Pure equivalent of the original page `isPrayerNow`.
 */
export function isPrayerNow(prayerTime: string, now: Date): boolean {
  const [hours, minutes] = prayerTime.split(':').map(Number)
  const prayerDate = new Date(now)
  prayerDate.setHours(hours, minutes, 0, 0)

  const timeDiff = now.getTime() - prayerDate.getTime()
  return timeDiff >= 0 && timeDiff <= 15 * 60 * 1000
}

/**
 * The next upcoming prayer name for the "UP NEXT" indicator. Returns the first
 * prayer whose time is still in the future; if all have passed, returns 'Fajr'
 * (tomorrow's Fajr).
 * Pure equivalent of the original page `getUpNextPrayer`.
 */
export function getUpNextPrayer(prayerTimes: PrayerTime, now: Date): string {
  for (const prayer of UP_NEXT_ORDER) {
    const [hours, minutes] = prayerTimes[prayer].split(':').map(Number)
    const prayerDate = new Date(now)
    prayerDate.setHours(hours, minutes, 0, 0)

    if (prayerDate.getTime() > now.getTime()) {
      return prayer
    }
  }

  // If all prayers have passed, next is tomorrow's Fajr.
  return 'Fajr'
}

/**
 * Imsak time (10 minutes before Fajr) as an "HH:MM" string.
 * Pure equivalent of the original page `getImsakTime` (which used `new Date()`).
 */
export function getImsakTime(fajrTime: string, now: Date): string {
  const [hours, minutes] = fajrTime.split(':').map(Number)
  const fajrDate = new Date(now)
  fajrDate.setHours(hours, minutes, 0, 0)
  fajrDate.setMinutes(fajrDate.getMinutes() - 10)
  return `${String(fajrDate.getHours()).padStart(2, '0')}:${String(fajrDate.getMinutes()).padStart(2, '0')}`
}

/**
 * Build the six-entry ordered rows array (Fajr, Sunrise, Dhuhr, Asr, Maghrib,
 * Isha) from prayer times, today's completion record, and a clock time.
 *
 * State rule (exactly today's logic, reorganized):
 *   isPrayerNow(time)                       → 'now'
 *   else name === getUpNextPrayer() && !now → 'upnext'
 *   else getTimeUntil(time) === null        → 'passed'
 *   else                                    → 'future'
 *
 * Sunrise is always a non-prayer row with no completion control. Imsak appears
 * only on the Fajr row. `completed` mirrors the `{name}_completed` flag.
 *
 * Returns an empty array when `prayerTimes` is null (matching the page's prior
 * behavior of rendering no rows without prayer times).
 */
export function buildPrayerRows(
  prayerTimes: PrayerTime | null,
  todayCompletion: DailyPrayerCompletion | null,
  now: Date,
): PrayerRowViewModel[] {
  if (!prayerTimes) return []

  const upNext = getUpNextPrayer(prayerTimes, now)

  return SCHEDULE.map(({ name, isPrayer }) => {
    const time = prayerTimes[name as keyof PrayerTime]

    // Non-prayer rows (Sunrise) carry no state derivation, no completion, and
    // no timeUntil — they are simply schedule markers.
    if (!isPrayer) {
      return {
        name,
        time,
        isPrayer: false,
        state: 'passed' as PrayerRowState,
        timeUntil: null,
        completed: false,
      }
    }

    const nowFlag = isPrayerNow(time, now)
    const timeUntil = getTimeUntil(time, now)

    let state: PrayerRowState
    if (nowFlag) {
      state = 'now'
    } else if (name === upNext) {
      state = 'upnext'
    } else if (timeUntil === null) {
      state = 'passed'
    } else {
      state = 'future'
    }

    const completed = todayCompletion
      ? Boolean(
          todayCompletion[
            `${name.toLowerCase()}_completed` as keyof DailyPrayerCompletion
          ],
        )
      : false

    const row: PrayerRowViewModel = {
      name,
      time,
      isPrayer: true,
      state,
      timeUntil,
      completed,
    }

    if (name === 'Fajr') {
      row.imsak = getImsakTime(prayerTimes.Fajr, now)
    }

    return row
  })
}
