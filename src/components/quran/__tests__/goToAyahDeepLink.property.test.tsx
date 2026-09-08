/**
 * Property-based tests for go-to-ayah submission and deep-link handling.
 *
 * These complement the example-based tests in GoToAyah.test.tsx by asserting
 * the accept-exactly-the-valid-range invariant holds across a wide space of
 * arbitrary inputs: arbitrary surah ayah counts N, and arbitrary submitted /
 * deep-link values (valid ints in range, ints out of range, 0/negatives,
 * non-integers like "2.5", and non-numeric strings).
 *
 * Framework: fast-check (min 100 runs per property).
 *
 * GoToAyah: next/navigation `useRouter` is mocked so navigation is asserted via
 * a `push` spy without a real router.
 *
 * SurahReader deep-link: the data/persistence hooks (useFullSurah,
 * useQuranBookmarks, useQuranBrowserFavorites) are mocked so the reader renders
 * synchronously with a deterministic surah. AyahActionBar is mocked because it
 * pulls in the audio player, tafsir view, and Radix primitives exercised by
 * their own suites. `Element.prototype.scrollIntoView` is not implemented in
 * jsdom, so it is stubbed with a spy to assert the scroll call.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import fc from 'fast-check'
import { GoToAyah } from '../GoToAyah'
import { SurahReader } from '../SurahReader'
import type { SurahMetadata } from '@/lib/quranData'
import type {
  AyahPair,
  FullSurahResponse,
  QuranAyah,
  QuranSurah,
} from '@/types/quran.types'

const MIN_RUNS = 100

// --- next/navigation mock (GoToAyah navigation) ---------------------------
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// --- Quran data/persistence hook mocks (SurahReader deep-link) -------------
const useFullSurahMock = jest.fn()
jest.mock('@/hooks/useFullSurah', () => ({
  useFullSurah: () => useFullSurahMock(),
}))

jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    getBookmark: () => undefined,
    saveBookmark: jest.fn(async () => true),
    deleteBookmark: jest.fn(async () => true),
  }),
}))

jest.mock('@/hooks/useQuranBrowserFavorites', () => ({
  useQuranBrowserFavorites: () => ({
    isFavorited: () => false,
    addFavorite: jest.fn(async () => true),
    removeFavorite: jest.fn(async () => true),
  }),
}))

// AyahActionBar is mocked away — its audio/tafsir/Radix internals are covered
// by their own tests and are irrelevant to deep-link active-state / scrolling.
jest.mock('../AyahActionBar', () => ({
  AyahActionBar: () => <div data-testid="ayah-action-bar" />,
}))

// --- Fixtures --------------------------------------------------------------

const surah: QuranSurah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatihah',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
}

function makeMetadata(number: number, totalAyahs: number): SurahMetadata {
  return {
    number,
    arabicName: 'الفاتحة',
    englishName: 'Al-Fatihah',
    englishNameTranslation: 'The Opening',
    numberOfAyahs: totalAyahs,
    revelationType: 'Meccan',
  }
}

function makeAyah(text: string, numberInSurah: number): QuranAyah {
  return {
    number: numberInSurah,
    text,
    edition: {
      identifier: 'quran-uthmani',
      language: 'ar',
      name: 'القرآن الكريم',
      englishName: 'Quran',
      format: 'text',
      type: 'quran',
      direction: 'rtl',
    },
    surah,
    numberInSurah,
    juz: 1,
    manzil: 1,
    page: 1,
    ruku: 1,
    hizbQuarter: 1,
    sajda: false,
  }
}

function makePair(numberInSurah: number): AyahPair {
  return {
    numberInSurah,
    globalNumber: numberInSurah,
    arabic: makeAyah(`ARABIC-${numberInSurah}`, numberInSurah),
    transliteration: makeAyah(`TRANSLIT-${numberInSurah}`, numberInSurah),
    translation: makeAyah(`Translation ${numberInSurah}`, numberInSurah),
  }
}

function mockLoadedSurah(totalAyahs: number) {
  const surahData: FullSurahResponse = {
    surah,
    ayahs: Array.from({ length: totalAyahs }, (_, i) => makePair(i + 1)),
    translation: 'en.asad',
  }
  useFullSurahMock.mockReturnValue({
    surahData,
    loading: false,
    error: null,
    translation: 'en.asad',
    setTranslation: jest.fn(),
    refetch: jest.fn(),
  })
}

// The active AyahBlock renders its own `article` with a left-rule + tint.
// Locate the active article by that primary left-border marker.
function getActiveArticle(container: HTMLElement): HTMLElement | null {
  return container.querySelector('article.border-l-primary')
}

// --- Arbitraries -----------------------------------------------------------

// Surah size N: realistic Quran range 1..286, capped at 300 per task note so
// generated ayah counts stay reasonable to render.
const totalAyahsArb = fc.integer({ min: 1, max: 300 })

// A valid submitted value: an integer in 1..N, rendered as its decimal string.
// The generator is constrained to the surah's own range so the "valid" branch
// is exercised across the whole space, not just small values.
function validValueArb(totalAyahs: number) {
  return fc.integer({ min: 1, max: totalAyahs }).map((n) => ({
    raw: String(n),
    n,
  }))
}

// An invalid submitted value: out of range integers (0, negatives, > N),
// non-integers ("2.5"), and non-numeric strings ("abc", "", whitespace).
function invalidValueArb(totalAyahs: number) {
  return fc.oneof(
    // Zero and negatives.
    fc.constant('0'),
    fc.integer({ min: -1000, max: -1 }).map(String),
    // Strictly greater than N.
    fc.integer({ min: totalAyahs + 1, max: totalAyahs + 1000 }).map(String),
    // Non-integer decimals (in and out of range magnitude).
    fc
      .tuple(fc.integer({ min: 0, max: totalAyahs + 5 }), fc.integer({ min: 1, max: 99 }))
      .map(([whole, frac]) => `${whole}.${frac}`),
    // Non-numeric strings that contain no bare integer.
    fc
      .string({ unit: 'binary' })
      .filter((s) => !/^\s*\d+\s*$/.test(s)),
    // Numeric strings with sign/whitespace noise the strict /^\d+$/ rejects.
    fc.integer({ min: 1, max: totalAyahs }).map((n) => `+${n}`)
  )
}

describe('GoToAyah / SurahReader — go-to-ayah and deep-link range (property-based)', () => {
  beforeEach(() => {
    pushMock.mockClear()
    useFullSurahMock.mockReset()
  })

  // Feature: quran-reading-experience-redesign, Property 15: Go-to-ayah and deep links accept exactly the valid range (Validates: 13.1–13.6)
  it('Property 15: go-to-ayah navigates for exactly the in-range integers', () => {
    // Valid branch: any integer in 1..N navigates to /quran/{surah}?ayah={n}
    // and shows no range message.
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 114 }),
        totalAyahsArb.chain((totalAyahs) =>
          fc.record({
            totalAyahs: fc.constant(totalAyahs),
            value: validValueArb(totalAyahs),
          })
        ),
        (surahNumber, { totalAyahs, value }) => {
          pushMock.mockClear()
          const { unmount } = render(
            <GoToAyah surahNumber={surahNumber} totalAyahs={totalAyahs} />
          )
          try {
            const input = screen.getByLabelText(/go to ayah, from/i)
            fireEvent.change(input, { target: { value: value.raw } })
            fireEvent.click(screen.getByRole('button', { name: /go to ayah/i }))

            expect(pushMock).toHaveBeenCalledTimes(1)
            expect(pushMock).toHaveBeenCalledWith(
              `/quran/${surahNumber}?ayah=${value.n}`
            )
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: MIN_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 15: Go-to-ayah and deep links accept exactly the valid range (Validates: 13.1–13.6)
  it('Property 15: go-to-ayah rejects out-of-range / non-integer / non-numeric input without navigating and shows the 1 to N message', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 114 }),
        totalAyahsArb.chain((totalAyahs) =>
          fc.record({
            totalAyahs: fc.constant(totalAyahs),
            raw: invalidValueArb(totalAyahs),
          })
        ),
        (surahNumber, { totalAyahs, raw }) => {
          pushMock.mockClear()
          const { unmount } = render(
            <GoToAyah surahNumber={surahNumber} totalAyahs={totalAyahs} />
          )
          try {
            const input = screen.getByLabelText(/go to ayah, from/i)
            fireEvent.change(input, { target: { value: raw } })
            fireEvent.click(screen.getByRole('button', { name: /go to ayah/i }))

            // No navigation on invalid input.
            expect(pushMock).not.toHaveBeenCalled()
            // The valid-range "1 to N" message is surfaced.
            const alert = screen.getByRole('alert')
            expect(alert).toHaveTextContent(
              `Enter a number from 1 to ${totalAyahs}.`
            )
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: MIN_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 15: Go-to-ayah and deep links accept exactly the valid range (Validates: 13.1–13.6)
  it('Property 15: an in-range deep-link ayah marks that ayah active and scrolls it into view', () => {
    jest.useFakeTimers()
    const scrollIntoViewMock = jest.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock

    try {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 114 }),
          // Keep N modest here so each iteration renders a bounded ayah list.
          fc.integer({ min: 1, max: 40 }).chain((totalAyahs) =>
            fc.record({
              totalAyahs: fc.constant(totalAyahs),
              ayah: fc.integer({ min: 1, max: totalAyahs }),
            })
          ),
          (surahNumber, { totalAyahs, ayah }) => {
            scrollIntoViewMock.mockClear()
            mockLoadedSurah(totalAyahs)
            const { container, unmount } = render(
              <SurahReader
                surahNumber={surahNumber}
                surahMetadata={makeMetadata(surahNumber, totalAyahs)}
                ayahParam={String(ayah)}
              />
            )
            try {
              // Exactly one ayah is marked active, and it is the target ayah.
              const active = getActiveArticle(container)
              expect(active).not.toBeNull()
              expect(active).toHaveTextContent(`${surahNumber}:${ayah}`)
              expect(
                container.querySelectorAll('article.border-l-primary')
              ).toHaveLength(1)

              // No out-of-range message for a valid deep link.
              expect(screen.queryByRole('alert')).not.toBeInTheDocument()

              // The scroll effect fires within 1000ms (scheduled at 300ms).
              act(() => {
                jest.advanceTimersByTime(1000)
              })
              expect(scrollIntoViewMock).toHaveBeenCalled()
              expect(scrollIntoViewMock).toHaveBeenCalledWith(
                expect.objectContaining({ block: 'center' })
              )
            } finally {
              unmount()
            }
          }
        ),
        { numRuns: MIN_RUNS }
      )
    } finally {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    }
  })

  // Feature: quran-reading-experience-redesign, Property 15: Go-to-ayah and deep links accept exactly the valid range (Validates: 13.1–13.6)
  it('Property 15: a non-integer / out-of-range / non-numeric deep-link ayah opens at ayah 1 with the valid-range message', () => {
    jest.useFakeTimers()
    Element.prototype.scrollIntoView = jest.fn()

    try {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 114 }),
          fc.integer({ min: 1, max: 40 }).chain((totalAyahs) =>
            fc.record({
              totalAyahs: fc.constant(totalAyahs),
              raw: invalidValueArb(totalAyahs),
            })
          ),
          (surahNumber, { totalAyahs, raw }) => {
            // Skip values that are only invalid because of leading/trailing
            // whitespace around a bare integer — SurahReader trims before the
            // strict integer test, so a whitespace-wrapped in-range integer is
            // a valid deep link and belongs in the other property.
            const trimmed = raw.trim()
            fc.pre(
              !(/^\d+$/.test(trimmed) &&
                Number(trimmed) >= 1 &&
                Number(trimmed) <= totalAyahs)
            )

            mockLoadedSurah(totalAyahs)
            const { container, unmount } = render(
              <SurahReader
                surahNumber={surahNumber}
                surahMetadata={makeMetadata(surahNumber, totalAyahs)}
                ayahParam={raw}
              />
            )
            try {
              // Opened at ayah 1: no active verse.
              expect(getActiveArticle(container)).toBeNull()
              // The valid-range message is surfaced.
              const alert = screen.getByRole('alert')
              expect(alert).toHaveTextContent(
                `Enter a number from 1 to ${totalAyahs}.`
              )
            } finally {
              unmount()
            }
          }
        ),
        { numRuns: MIN_RUNS }
      )
    } finally {
      jest.runOnlyPendingTimers()
      jest.useRealTimers()
    }
  })
})
