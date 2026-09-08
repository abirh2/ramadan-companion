import {
  buildPrayerRows,
  getTimeUntil,
  isPrayerNow,
} from '../prayerRowViewModel'
import type { PrayerTime } from '@/types/ramadan.types'
import type { DailyPrayerCompletion } from '@/types/prayer-tracking.types'

/**
 * Property-based test for the pure `buildPrayerRows` view-model derivation.
 *
 * No property-testing library (e.g. fast-check) is present in package.json, so
 * per the design's Testing Strategy we use lightweight generated inputs inside
 * Jest — a seeded PRNG driving >= 100 iterations over `prayerTimes` and clock
 * times — without adding any new dependency. This reuses the mulberry32
 * seeded-PRNG generation approach established in
 * `prayerRowViewModel.property1.test.ts`.
 */

// Deterministic, seedable PRNG (mulberry32) so failures are reproducible.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Format minutes-from-midnight to a valid "HH:MM" time string. */
function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Generate a valid, realistically-ordered `prayerTimes` value: six ascending,
 * spaced times across the day (Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha).
 *
 * Ordered + spaced (each gap strictly greater than the 15-minute Now window)
 * mirrors real prayer schedules and keeps the Now/Up-next invariants
 * well-defined: no two prayers can share the Now window.
 */
function randomPrayerTimes(rand: () => number): PrayerTime {
  // Start Fajr between 03:00 and 05:59.
  let cursor = 180 + Math.floor(rand() * 180)
  // Each subsequent time is at least 30 min after the previous (> 15-min Now
  // window), plus a random slack, while staying within the day.
  const gap = () => 30 + Math.floor(rand() * 150)

  const fajr = cursor
  cursor += gap()
  const sunrise = cursor
  cursor += gap()
  const dhuhr = cursor
  cursor += gap()
  const asr = cursor
  cursor += gap()
  const maghrib = cursor
  cursor += gap()
  const isha = Math.min(cursor, 23 * 60 + 59)

  return {
    Fajr: minutesToTime(fajr),
    Sunrise: minutesToTime(sunrise),
    Dhuhr: minutesToTime(dhuhr),
    Asr: minutesToTime(asr),
    Maghrib: minutesToTime(maghrib),
    Isha: minutesToTime(isha),
  }
}

/** Generate a random `todayCompletion` value (or null). */
function randomCompletion(rand: () => number): DailyPrayerCompletion | null {
  if (rand() < 0.2) return null
  return {
    date: '2024-03-15',
    fajr_completed: rand() < 0.5,
    dhuhr_completed: rand() < 0.5,
    asr_completed: rand() < 0.5,
    maghrib_completed: rand() < 0.5,
    isha_completed: rand() < 0.5,
    totalCompleted: 0,
    completionRate: 0,
  }
}

/** Generate a random clock time on the same fixed day as the prayer times. */
function randomNow(rand: () => number): Date {
  const d = new Date(2024, 2, 15, 0, 0, 0, 0)
  d.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60), 0, 0)
  return d
}

// The prayers considered for the "up next" indicator, in schedule order
// (Sunrise excluded — it is a non-prayer marker).
const UP_NEXT_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
const ITERATIONS = 200

describe('prayerRowViewModel — buildPrayerRows', () => {
  it('Feature: prayer-times-redesign, Property 2: For any valid prayerTimes and any clock time, at most one prayer row is `now`, the `upnext` row (when present) is the earliest not-yet-passed prayer, and no row is both `now` and `upnext`. Validates: Requirements 3.4, 3.7, 17.3, 17.4', () => {
    const rand = mulberry32(0x1234abcd)

    for (let i = 0; i < ITERATIONS; i++) {
      const prayerTimes = randomPrayerTimes(rand)
      const completion = randomCompletion(rand)
      const now = randomNow(rand)

      const rows = buildPrayerRows(prayerTimes, completion, now)

      const context = () =>
        `iteration ${i}, prayerTimes=${JSON.stringify(prayerTimes)}, now=${now.toISOString()}, states=${JSON.stringify(
          rows.map((r) => ({ name: r.name, state: r.state })),
        )}`

      // --- Invariant A: at most one prayer row is `now`. ---
      const nowRows = rows.filter((r) => r.state === 'now')
      expect(nowRows.length).toBeLessThanOrEqual(1)

      // --- Invariant B: no row is both `now` and `upnext`. ---
      // These are mutually exclusive states in a single `state` field, so this
      // holds structurally, but assert it explicitly against the intent: a row
      // whose state is `now` is never also reported as `upnext` and vice versa.
      for (const row of rows) {
        const isNow = row.state === 'now'
        const isUpNext = row.state === 'upnext'
        expect(isNow && isUpNext).toBe(false)
      }

      // --- Invariant C: at most one `upnext` row. ---
      const upNextRows = rows.filter((r) => r.state === 'upnext')
      expect(upNextRows.length).toBeLessThanOrEqual(1)

      // --- Invariant D: the `upnext` row, when present, is the earliest ---
      // prayer whose time has not yet passed (and that is not itself `now`).
      //
      // Compute, independently of the module, the earliest prayer that is
      // strictly in the future (time > now) — this is exactly the prayer the
      // module promotes to `upnext` unless that prayer is currently `now`.
      // A prayer is strictly future when it is not-yet-passed (getTimeUntil
      // non-null) and not currently in the Now window (isPrayerNow false).
      const earliestStrictlyFuture = UP_NEXT_ORDER.find((name) => {
        const time = prayerTimes[name as keyof PrayerTime]
        return getTimeUntil(time, now) !== null && !isPrayerNow(time, now)
      })

      // The "up next" prayer the module targets: the earliest strictly-future
      // prayer today, or — when every prayer has already passed — tomorrow's
      // Fajr (the documented wraparound in getUpNextPrayer).
      const expectedUpNextName = earliestStrictlyFuture ?? 'Fajr'

      if (upNextRows.length === 1) {
        // The single upnext row must be the module's target up-next prayer,
        // and it must not itself be in the `now` state.
        expect(upNextRows[0].name).toBe(expectedUpNextName)
        expect(isPrayerNow(upNextRows[0].time, now)).toBe(false)
      } else {
        // No `upnext` row means the module's target up-next prayer was instead
        // claimed by the `now` state (mutual exclusion between now and upnext).
        const targetRow = rows.find((r) => r.name === expectedUpNextName)!
        expect(targetRow.state).toBe('now')
      }

      // Informative failure context if any invariant above regresses.
      if (nowRows.length > 1 || upNextRows.length > 1) {
        throw new Error(`Property 2 violated at ${context()}`)
      }
    }
  })
})
