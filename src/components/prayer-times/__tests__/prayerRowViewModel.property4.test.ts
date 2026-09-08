import { buildPrayerRows, isPrayerNow } from '../prayerRowViewModel'
import type { PrayerTime } from '@/types/ramadan.types'

/**
 * Property-based test for the "Now window" 15-minute rule.
 *
 * No property-testing library (e.g. fast-check) is present in package.json, so
 * per the design's Testing Strategy we use lightweight generated inputs inside
 * Jest — a seeded PRNG driving >= 100 iterations — without adding any new
 * dependency. Reuses the mulberry32 generator style established in
 * prayerRowViewModel.property1.test.ts.
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

/** Base calendar day used for all `now` values (arbitrary; time is what matters). */
const BASE_YEAR = 2024
const BASE_MONTH = 2 // March (0-indexed)
const BASE_DAY = 15

const FIFTEEN_MIN_MS = 15 * 60 * 1000

/** Build a Date on the base day at the given hours/minutes (+ optional ms offset). */
function clockAt(hours: number, minutes: number, offsetMs = 0): Date {
  const d = new Date(BASE_YEAR, BASE_MONTH, BASE_DAY, hours, minutes, 0, 0)
  return new Date(d.getTime() + offsetMs)
}

/** Prayer time as an "HH:MM" string. */
function hhmm(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Reference oracle: the intended rule. The row is `now` iff the current clock
 * time t is at or after the prayer time T and within 15 minutes:
 * 0 <= (t - T) <= 15 minutes. Matching the function contract, T is projected
 * onto the same calendar day as `now` (the schedule and the clock share a day).
 */
function expectedNow(prayerHours: number, prayerMinutes: number, now: Date): boolean {
  const prayerDate = new Date(now)
  prayerDate.setHours(prayerHours, prayerMinutes, 0, 0)
  const diff = now.getTime() - prayerDate.getTime()
  return diff >= 0 && diff <= FIFTEEN_MIN_MS
}

const ITERATIONS = 300

describe('prayerRowViewModel — Now window (15-minute rule)', () => {
  it('Feature: prayer-times-redesign, Property 4: For any prayer time T and any clock time t, the row is `now` if and only if 0 <= (t - T) <= 15 minutes. Validates: Requirements 17.4, 3.7', () => {
    const rand = mulberry32(0x51ed270b)

    for (let i = 0; i < ITERATIONS; i++) {
      // Random prayer time T.
      const pHours = Math.floor(rand() * 24)
      const pMinutes = Math.floor(rand() * 60)
      const prayerTime = hhmm(pHours, pMinutes)

      // Choose a clock time t. Bias generation toward the window region so we
      // exercise both sides of both boundaries, not just far-away times.
      const prayerMs = clockAt(pHours, pMinutes).getTime()
      // Offset in [-5min, +20min] around T, at second granularity.
      const offsetSec = Math.floor(rand() * (25 * 60)) - 5 * 60
      const now = new Date(prayerMs + offsetSec * 1000)

      const actual = isPrayerNow(prayerTime, now)
      const expected = expectedNow(pHours, pMinutes, now)

      const context = `iteration ${i}, T=${prayerTime}, offsetSec=${offsetSec}, now=${now.toISOString()}`
      expect({ context, now: actual }).toEqual({ context, now: expected })

      // The row-level state must agree with isPrayerNow: whenever isPrayerNow is
      // true the corresponding row's state is exactly 'now', and vice versa.
      // Distinct times for the other rows so only the Fajr row exercises T.
      const prayerTimes: PrayerTime = {
        Fajr: prayerTime,
        Sunrise: hhmm((pHours + 12) % 24, pMinutes),
        Dhuhr: hhmm((pHours + 1) % 24, pMinutes),
        Asr: hhmm((pHours + 2) % 24, pMinutes),
        Maghrib: hhmm((pHours + 3) % 24, pMinutes),
        Isha: hhmm((pHours + 4) % 24, pMinutes),
      }

      const rows = buildPrayerRows(prayerTimes, null, now)
      const fajrRow = rows.find((r) => r.name === 'Fajr')!
      if (actual) {
        expect(fajrRow.state).toBe('now')
      } else {
        expect(fajrRow.state).not.toBe('now')
      }
    }
  })

  it('Feature: prayer-times-redesign, Property 4 (boundaries): T-ε is not now, T is now, T+15min is now, T+15min+ε is not now. Validates: Requirements 17.4, 3.7', () => {
    // A representative prayer time in the middle of the day so all boundary
    // offsets stay on the same calendar day.
    const pHours = 13
    const pMinutes = 30
    const prayerTime = hhmm(pHours, pMinutes) // "13:30"

    // t = T - ε  -> not now (before the window opens)
    expect(isPrayerNow(prayerTime, clockAt(pHours, pMinutes, -1))).toBe(false)

    // t = T  -> now (window opens exactly at T, diff = 0)
    expect(isPrayerNow(prayerTime, clockAt(pHours, pMinutes, 0))).toBe(true)

    // t = T + 15min  -> now (inclusive upper boundary, diff = 15min exactly)
    expect(isPrayerNow(prayerTime, clockAt(pHours, pMinutes, FIFTEEN_MIN_MS))).toBe(true)

    // t = T + 15min + ε  -> not now (just past the window)
    expect(
      isPrayerNow(prayerTime, clockAt(pHours, pMinutes, FIFTEEN_MIN_MS + 1)),
    ).toBe(false)

    // Same boundaries verified at the row level through buildPrayerRows (Fajr row).
    const prayerTimes: PrayerTime = {
      Fajr: prayerTime,
      Sunrise: hhmm((pHours + 6) % 24, pMinutes),
      Dhuhr: hhmm((pHours + 1) % 24, pMinutes),
      Asr: hhmm((pHours + 2) % 24, pMinutes),
      Maghrib: hhmm((pHours + 3) % 24, pMinutes),
      Isha: hhmm((pHours + 4) % 24, pMinutes),
    }

    const stateAt = (offsetMs: number) =>
      buildPrayerRows(prayerTimes, null, clockAt(pHours, pMinutes, offsetMs)).find(
        (r) => r.name === 'Fajr',
      )!.state

    expect(stateAt(-1)).not.toBe('now')
    expect(stateAt(0)).toBe('now')
    expect(stateAt(FIFTEEN_MIN_MS)).toBe('now')
    expect(stateAt(FIFTEEN_MIN_MS + 1)).not.toBe('now')
  })
})
