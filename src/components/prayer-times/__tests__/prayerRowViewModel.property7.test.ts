import { buildPrayerRows } from '../prayerRowViewModel'
import type { PrayerTime } from '@/types/ramadan.types'
import type { DailyPrayerCompletion } from '@/types/prayer-tracking.types'

/**
 * Property-based test for the pure `buildPrayerRows` view-model derivation.
 *
 * No property-testing library (e.g. fast-check) is present in package.json, so
 * per the design's Testing Strategy we use lightweight generated inputs inside
 * Jest — a seeded PRNG driving >= 100 iterations over `todayCompletion` values
 * — without adding any new dependency. This mirrors the generation approach
 * established in `prayerRowViewModel.property1.test.ts`.
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

/**
 * Generate a random `todayCompletion` value, biased so ~20% of iterations
 * exercise the `null` case (all completed flags must derive to false).
 */
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

const ITERATIONS = 200

describe('prayerRowViewModel — buildPrayerRows', () => {
  it('Feature: prayer-times-redesign, Property 7: For any todayCompletion value, each prayer row\'s completed flag equals the corresponding {name}_completed flag, and Sunrise never carries a completion control. Validates: Requirements 3.2, 3.9, 13.1', () => {
    const rand = mulberry32(0x1b873593)

    let sawNull = false
    let sawNonNull = false

    for (let i = 0; i < ITERATIONS; i++) {
      const prayerTimes = randomPrayerTimes(rand)
      const completion = randomCompletion(rand)
      const now = randomNow(rand)

      if (completion === null) sawNull = true
      else sawNonNull = true

      const rows = buildPrayerRows(prayerTimes, completion, now)

      const context = () =>
        `iteration ${i}, completion=${JSON.stringify(completion)}, now=${now.toISOString()}`

      for (const row of rows) {
        if (row.name === 'Sunrise') {
          // Sunrise is a non-prayer schedule marker: it carries no completion
          // control and its completed flag is always false regardless of input.
          expect(row.isPrayer).toBe(false)
          expect(row.completed).toBe(false)
          continue
        }

        // Every prayer row's completed flag mirrors the corresponding
        // `{name}_completed` flag from todayCompletion, and is false when the
        // completion record is null.
        const expected =
          completion === null
            ? false
            : Boolean(
                completion[
                  `${row.name.toLowerCase()}_completed` as keyof DailyPrayerCompletion
                ],
              )

        if (row.completed !== expected) {
          throw new Error(
            `Property 7 violated: ${row.name}.completed=${row.completed} expected ${expected} at ${context()}`,
          )
        }
        expect(row.completed).toBe(expected)
      }
    }

    // Confirm the generator exercised both the null and non-null branches so
    // the null case (all completed false) is genuinely covered.
    expect(sawNull).toBe(true)
    expect(sawNonNull).toBe(true)
  })
})
