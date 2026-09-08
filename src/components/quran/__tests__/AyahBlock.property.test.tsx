/**
 * Property-based tests for AyahBlock component.
 *
 * These complement the example-based tests in AyahBlock.test.tsx by asserting
 * the text/structure invariants hold across a wide space of arbitrary inputs
 * (arbitrary Arabic, translation, transliteration, and ayah numbering).
 *
 * Framework: fast-check (min 100 runs per property).
 *
 * AyahActionBar is mocked: it pulls in the audio player, tafsir view, and
 * several Radix primitives exercised by their own tests. Mocking keeps each
 * render deterministic and focused on AyahBlock's layout/typography contract.
 *
 * Requirements: 5.6, 9.2, 9.7, 9.8, 16.7, 21.4
 */

import { render } from '@testing-library/react'
import fc from 'fast-check'
import { AyahBlock } from '../AyahBlock'
import type { AyahPair, QuranAyah } from '@/types/quran.types'

jest.mock('../AyahActionBar', () => ({
  AyahActionBar: () => <div data-testid="ayah-action-bar" />,
}))

const MIN_RUNS = 100

// Minimal QuranAyah factory — only `text` is read by AyahBlock; the rest
// satisfy the type.
function makeAyah(text: string): QuranAyah {
  return {
    number: 1,
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
    surah: {
      number: 2,
      name: 'البقرة',
      englishName: 'Al-Baqarah',
      englishNameTranslation: 'The Cow',
      numberOfAyahs: 286,
      revelationType: 'Medinan',
    },
    numberInSurah: 1,
    juz: 1,
    manzil: 1,
    page: 1,
    ruku: 1,
    hizbQuarter: 1,
    sajda: false,
  }
}

function makePair(fields: {
  arabic: string
  translation: string
  transliteration: string
  numberInSurah: number
  globalNumber: number
}): AyahPair {
  return {
    numberInSurah: fields.numberInSurah,
    globalNumber: fields.globalNumber,
    arabic: makeAyah(fields.arabic),
    transliteration: makeAyah(fields.transliteration),
    translation: makeAyah(fields.translation),
  }
}

const baseProps = {
  surahName: 'Al-Baqarah',
  reciter: 'ar.alafasy' as const,
  isFavorited: () => false,
  addFavorite: jest.fn(async () => true),
  removeFavorite: jest.fn(async () => true),
  getBookmark: () => undefined,
  saveBookmark: jest.fn(async () => true),
  deleteBookmark: jest.fn(async () => true),
}

// Generators
// - Text fields: full unicode strings so Arabic script, diacritics, punctuation
//   and Latin transliteration are all in the input space.
// - Non-empty text: guarantees a value the DOM actually renders as text.
// - Numbers: constrained to realistic Quran ranges (surah 1-114, ayah 1-286).
const nonEmptyText = fc.string({ minLength: 1, unit: 'binary' })
const surahNumber = fc.integer({ min: 1, max: 114 })
const ayahNumber = fc.integer({ min: 1, max: 286 })
const globalNumber = fc.integer({ min: 1, max: 6236 })

// Returns the block's paragraphs. AyahBlock renders, in order:
//   [0] ayah number, [1] Arabic, [2] translation, [3] transliteration (opt).
function paragraphsOf(container: HTMLElement): HTMLParagraphElement[] {
  return Array.from(container.querySelectorAll('p'))
}

describe('AyahBlock — property-based', () => {
  // Feature: quran-reading-experience-redesign, Property 7: Ayah text and numbering preserved verbatim (Validates: 5.6, 9.2, 9.8, 21.4)
  it('Property 7: renders Arabic, translation, and number text verbatim for any input', () => {
    fc.assert(
      fc.property(
        nonEmptyText,
        nonEmptyText,
        nonEmptyText,
        surahNumber,
        ayahNumber,
        globalNumber,
        (arabic, translation, transliteration, surah, ayah, global) => {
          const { container, unmount } = render(
            <AyahBlock
              ayahPair={makePair({
                arabic,
                translation,
                transliteration,
                numberInSurah: ayah,
                globalNumber: global,
              })}
              surahNumber={surah}
              {...baseProps}
            />
          )

          try {
            const ps = paragraphsOf(container)
            // number, arabic, translation, transliteration
            expect(ps).toHaveLength(4)

            // Verbatim: nothing added, dropped, transformed, or truncated.
            expect(ps[0].textContent).toBe(`${surah}:${ayah}`)
            expect(ps[1].textContent).toBe(arabic)
            expect(ps[2].textContent).toBe(translation)
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: MIN_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 8: Transliteration omitted when absent (Validates: 9.7)
  it('Property 8: transliteration element is present iff transliteration text is non-empty', () => {
    fc.assert(
      fc.property(
        nonEmptyText,
        nonEmptyText,
        // Either empty (absent) or arbitrary non-empty transliteration.
        fc.oneof(fc.constant(''), nonEmptyText),
        surahNumber,
        ayahNumber,
        globalNumber,
        (arabic, translation, transliteration, surah, ayah, global) => {
          const { container, unmount } = render(
            <AyahBlock
              ayahPair={makePair({
                arabic,
                translation,
                transliteration,
                numberInSurah: ayah,
                globalNumber: global,
              })}
              surahNumber={surah}
              {...baseProps}
            />
          )

          try {
            const ps = paragraphsOf(container)
            const hasTransliteration = transliteration.length > 0
            // 3 paragraphs (number, Arabic, translation) when absent, 4 when present.
            expect(ps).toHaveLength(hasTransliteration ? 4 : 3)
            if (hasTransliteration) {
              expect(ps[3].textContent).toBe(transliteration)
            }
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: MIN_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 9: Reading order Arabic → translation → transliteration (Validates: 16.7)
  it('Property 9: Arabic precedes translation precedes transliteration in DOM order', () => {
    fc.assert(
      fc.property(
        nonEmptyText,
        nonEmptyText,
        nonEmptyText, // transliteration present so all three participate in ordering
        surahNumber,
        ayahNumber,
        globalNumber,
        (arabic, translation, transliteration, surah, ayah, global) => {
          const { container, unmount } = render(
            <AyahBlock
              ayahPair={makePair({
                arabic,
                translation,
                transliteration,
                numberInSurah: ayah,
                globalNumber: global,
              })}
              surahNumber={surah}
              {...baseProps}
            />
          )

          try {
            const ps = paragraphsOf(container)
            const arabicEl = ps[1]
            const translationEl = ps[2]
            const transliterationEl = ps[3]

            // Arabic comes before translation.
            expect(
              arabicEl.compareDocumentPosition(translationEl) &
                Node.DOCUMENT_POSITION_FOLLOWING
            ).toBeTruthy()
            // Translation comes before transliteration.
            expect(
              translationEl.compareDocumentPosition(transliterationEl) &
                Node.DOCUMENT_POSITION_FOLLOWING
            ).toBeTruthy()
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: MIN_RUNS }
    )
  })
})
