import { buildPrayerRows } from '../prayerRowViewModel'
import type { PrayerTime } from '@/types/ramadan.types'
import type { DailyPrayerCompletion } from '@/types/prayer-tracking.types'

/**
 * Property-based test for the pure `buildPrayerRows` view-model derivation.
 *
 * No property-testing library (e.g. fast-check) is present in package.json, so
 * per the design's Testing Strategy we use lightweight generated inputs inside
 * Jest — a seeded PRNG driving >= 100 iterations over valid `prayerTimes`
 * values — without adding any new dependency.
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

/** Generate a random valid "HH:MM" time string. */
function randomTime(rand: () => number): string {
  const hours = Math.floor(rand() * 24)
  const minutes = Math.floor(rand() * 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Generate a valid `prayerTimes` value with random valid "HH:MM" times. */
function randomPrayerTimes(rand: () => number): PrayerTime {
  return {
    Fajr: randomTime(rand),
    Sunrise: randomTime(rand),
    Dhuhr: randomTime(rand),
    Asr: randomTime(rand),
    Maghrib: randomTime(rand),
    Isha: randomTime(rand),
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

/** Generate a random clock time on an arbitrary day. */
function randomNow(rand: () => number): Date {
  const d = new Date(2024, 2, 15, 0, 0, 0, 0)
  d.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60), 0, 0)
  return d
}

const EXPECTED_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
const ITERATIONS = 200

describe('prayerRowViewModel — buildPrayerRows', () => {
  it('Feature: prayer-times-redesign, Property 1: For any valid prayerTimes value, the derived rows array contains exactly six entries in the order Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, with Sunrise the only non-prayer entry. Validates: Requirements 3.1, 3.2, 3.10', () => {
    const rand = mulberry32(0x9e3779b9)

    for (let i = 0; i < ITERATIONS; i++) {
      const prayerTimes = randomPrayerTimes(rand)
      const completion = randomCompletion(rand)
      const now = randomNow(rand)

      const rows = buildPrayerRows(prayerTimes, completion, now)

      const context = () =>
        `iteration ${i}, prayerTimes=${JSON.stringify(prayerTimes)}, now=${now.toISOString()}`

      // Exactly six entries.
      expect(rows).toHaveLength(6)

      // Exact order Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha.
      expect(rows.map((r) => r.name)).toEqual(EXPECTED_ORDER)

      // Sunrise is the only non-prayer entry.
      const nonPrayerNames = rows.filter((r) => !r.isPrayer).map((r) => r.name)
      expect(nonPrayerNames).toEqual(['Sunrise'])

      // Every entry that is not Sunrise is a prayer entry.
      for (const row of rows) {
        if (row.name === 'Sunrise') {
          expect(row.isPrayer).toBe(false)
        } else {
          expect(row.isPrayer).toBe(true)
        }
      }

      // Sanity: informative failure context if any invariant above regresses.
      if (rows.length !== 6 || nonPrayerNames.length !== 1) {
        throw new Error(`Property 1 violated at ${context()}`)
      }
    }
  })
})
