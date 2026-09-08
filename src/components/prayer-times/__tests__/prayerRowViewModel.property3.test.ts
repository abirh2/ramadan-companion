import { buildPrayerRows } from '../prayerRowViewModel'
import type { PrayerTime } from '@/types/ramadan.types'
import type { DailyPrayerCompletion } from '@/types/prayer-tracking.types'

/**
 * Property-based test for the pure `buildPrayerRows` view-model derivation.
 *
 * No property-testing library (e.g. fast-check) is present in package.json, so
 * per the design's Testing Strategy we use lightweight generated inputs inside
 * Jest — a seeded PRNG driving >= 100 iterations over valid `prayerTimes`
 * values and clock times — without adding any new dependency. This mirrors the
 * generation approach established in `prayerRowViewModel.property1.test.ts`.
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

const VALID_STATES = ['passed', 'now', 'upnext', 'future'] as const
const ITERATIONS = 200

/**
 * Derive the human-readable, non-color signal a row would render from its
 * view-model fields alone. Returns null when no signal can be derived, which is
 * itself a property violation for prayer rows.
 *
 * This encodes the design's mapping:
 *   passed → "Passed" (timeUntil is null)
 *   now    → "Now"
 *   upnext → "Up next"
 *   future → a remaining-time string (timeUntil, e.g. "in 2h 10m")
 */
function derivableSignal(row: {
  state: (typeof VALID_STATES)[number]
  timeUntil: string | null
}): string | null {
  switch (row.state) {
    case 'passed':
      // Passed rows carry no remaining time; they render the label "Passed".
      return row.timeUntil === null ? 'Passed' : null
    case 'now':
      return 'Now'
    case 'upnext':
      return 'Up next'
    case 'future':
      // Future rows expose a non-null remaining-time string.
      return typeof row.timeUntil === 'string' && row.timeUntil.length > 0
        ? row.timeUntil
        : null
    default:
      return null
  }
}

describe('prayerRowViewModel — buildPrayerRows', () => {
  it('Feature: prayer-times-redesign, Property 3: For any prayer row, its state is exactly one of passed | now | upnext | future, and a corresponding text/icon signal is derivable ("Passed", "Now", "Up next", or a remaining-time string). Validates: Requirements 3.3, 3.4, 3.5, 3.7, 3.8, 10.1', () => {
    const rand = mulberry32(0x517cc1b7)

    for (let i = 0; i < ITERATIONS; i++) {
      const prayerTimes = randomPrayerTimes(rand)
      const completion = randomCompletion(rand)
      const now = randomNow(rand)

      const rows = buildPrayerRows(prayerTimes, completion, now)

      const context = () =>
        `iteration ${i}, prayerTimes=${JSON.stringify(prayerTimes)}, now=${now.toISOString()}`

      for (const row of rows) {
        // State is exactly one of the four partition values (total partition).
        expect(VALID_STATES).toContain(row.state)

        // A corresponding non-color signal is derivable from the view model.
        const signal = derivableSignal(row)
        expect(signal).not.toBeNull()

        // The signal is a non-empty string in every case.
        expect(typeof signal).toBe('string')
        expect((signal as string).length).toBeGreaterThan(0)

        // Cross-check the state → signal mapping explicitly for prayer rows.
        if (row.isPrayer) {
          switch (row.state) {
            case 'passed':
              // "Passed" is derived precisely when timeUntil is null (R3.3, R3.5).
              expect(row.timeUntil).toBeNull()
              expect(signal).toBe('Passed')
              break
            case 'now':
              expect(signal).toBe('Now') // R3.7, R10.1
              break
            case 'upnext':
              expect(signal).toBe('Up next') // R3.4, R10.1
              break
            case 'future':
              // Future rows expose a remaining-time string (R3.8).
              expect(row.timeUntil).not.toBeNull()
              expect(signal).toBe(row.timeUntil)
              break
          }
        }

        if (signal === null) {
          throw new Error(
            `Property 3 violated: no derivable signal for state="${row.state}" (row=${row.name}) at ${context()}`,
          )
        }
      }
    }
  })
})
