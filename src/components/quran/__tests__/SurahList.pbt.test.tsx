/**
 * Property-based tests for the Quran Browser list/search (task 14.1).
 *
 * Feature: quran-reading-experience-redesign
 * Guardrail: TESTS ONLY. Components under test are not modified.
 *
 * Runner: Jest + fast-check (no special integration needed — fast-check runs
 * inside any test runner). Each property runs a minimum of 100 iterations.
 *
 * Covered properties (from design.md → Correctness Properties):
 * - Property 1: Surahs render in ascending order (Validates: 1.3)
 * - Property 2: Search membership matches the preserved predicate (Validates: 2.2, 2.4, 19.3)
 * - Property 3: Rows are divider-separated with no leading/trailing divider (Validates: 1.5, 9.1)
 * - Property 4: Each Surah row shows its own source fields (Validates: 1.6)
 * - Property 5: Arabic name shown exactly when present (Validates: 1.7, 1.8)
 */

import { render, screen, within, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import type { SurahMetadata } from '@/lib/quranData'
import { SURAHS } from '@/lib/quranData'
import type { BookmarkData } from '@/types/quran.types'
import { SurahRow } from '../SurahRow'
import { SurahList } from '../SurahList'

// Mock next/link to a plain anchor (established project pattern).
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock the bookmarks hook — indicators are irrelevant to these properties.
const mockGetBookmark = jest.fn<BookmarkData | undefined, [number]>()
jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    getBookmark: mockGetBookmark,
  }),
}))

const NUM_RUNS = 100

/**
 * The preserved search predicate, copied verbatim from SurahList so the test
 * asserts against the *specified* behavior rather than re-deriving it loosely.
 * (Case-insensitive match on English name, translated meaning, or number.)
 */
function preservedPredicate(surah: SurahMetadata, rawQuery: string): boolean {
  const query = rawQuery.toLowerCase()
  return (
    surah.englishName.toLowerCase().includes(query) ||
    surah.englishNameTranslation.toLowerCase().includes(query) ||
    surah.number.toString().includes(query)
  )
}

function expectedMatches(rawQuery: string): SurahMetadata[] {
  if (!rawQuery.trim()) return SURAHS
  return SURAHS.filter((s) => preservedPredicate(s, rawQuery))
}

/** All rendered row hrefs, in DOM order, as the surah numbers they target. */
function renderedSurahNumbers(): number[] {
  return screen
    .queryAllByRole('link')
    .map((a) => a.getAttribute('href') ?? '')
    .map((href) => Number(href.replace('/quran/', '')))
}

beforeEach(() => {
  mockGetBookmark.mockReset()
  mockGetBookmark.mockReturnValue(undefined)
})

afterEach(() => {
  cleanup()
})

/**
 * A query arbitrary that meaningfully exercises the search space:
 * - the empty query,
 * - fragments drawn from real surah fields (so matches are non-trivial),
 * - arbitrary short strings (including no-match and case variants).
 */
const queryArb = fc.oneof(
  fc.constant(''),
  fc.constantFrom(
    ...SURAHS.flatMap((s) => [
      s.englishName,
      s.englishName.slice(0, 3),
      s.englishNameTranslation,
      s.englishNameTranslation.slice(0, 3),
      s.number.toString(),
    ])
  ),
  fc.string({ maxLength: 6 })
)

describe('SurahList — browser list/search properties (fast-check)', () => {
  // Feature: quran-reading-experience-redesign, Property 1: For any search query (including the empty query), the Surah numbers displayed in the Quran Browser form a strictly ascending subsequence of 1..114, with no surah reordered relative to SURAHS.
  it('Property 1: rendered surahs are in strictly ascending order (Validates: 1.3)', () => {
    fc.assert(
      fc.property(queryArb, (query) => {
        render(<SurahList searchQuery={query} />)
        try {
          const numbers = renderedSurahNumbers()

          // Strictly ascending.
          for (let i = 1; i < numbers.length; i++) {
            expect(numbers[i]).toBeGreaterThan(numbers[i - 1])
          }

          // A subsequence of SURAHS' own order (which is 1..114 ascending):
          // filtering the source list by membership must reproduce the exact
          // rendered order, proving nothing was reordered.
          const displayedSet = new Set(numbers)
          const orderFromSource = SURAHS.map((s) => s.number).filter((n) =>
            displayedSet.has(n)
          )
          expect(numbers).toEqual(orderFromSource)
        } finally {
          cleanup()
        }
      }),
      { numRuns: NUM_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 2: For any search query string, the set of Surahs displayed equals SURAHS filtered by the existing case-insensitive predicate (English name, translated meaning, or number contains the query).
  it('Property 2: displayed set equals the preserved predicate filter (Validates: 2.2, 2.4, 19.3)', () => {
    fc.assert(
      fc.property(queryArb, (query) => {
        render(<SurahList searchQuery={query} />)
        try {
          const displayed = renderedSurahNumbers().sort((a, b) => a - b)
          const expected = expectedMatches(query)
            .map((s) => s.number)
            .sort((a, b) => a - b)
          expect(displayed).toEqual(expected)
        } finally {
          cleanup()
        }
      }),
      { numRuns: NUM_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 3: For any filtered subset of N >= 1 Surah rows, the grouped surface renders exactly N-1 dividers, with no divider before the first row and none after the last.
  it('Property 3: exactly N-1 dividers, none leading or trailing (Validates: 1.5, 9.1)', () => {
    // Restrict to queries that yield at least one row (N >= 1).
    const nonEmptyResultQuery = queryArb.filter(
      (q) => expectedMatches(q).length >= 1
    )

    fc.assert(
      fc.property(nonEmptyResultQuery, (query) => {
        const { container } = render(<SurahList searchQuery={query} />)
        try {
          const rows = screen.getAllByRole('link')
          const n = rows.length
          expect(n).toBeGreaterThanOrEqual(1)

          // Dividers are the hairline top borders applied to every row after
          // the first. Count elements carrying the divider class.
          const dividers = container.querySelectorAll('.border-t')
          expect(dividers.length).toBe(n - 1)

          // The first row wrapper must NOT carry the divider (no leading rule).
          const rowWrappers = Array.from(
            container.querySelectorAll('.surface-grouped > div')
          )
          expect(rowWrappers.length).toBe(n)
          expect(rowWrappers[0].className).not.toContain('border-t')
          // Every subsequent wrapper carries exactly one divider; the last
          // wrapper is a row (not a trailing divider element).
          for (let i = 1; i < rowWrappers.length; i++) {
            expect(rowWrappers[i].className).toContain('border-t')
          }
        } finally {
          cleanup()
        }
      }),
      { numRuns: NUM_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 4: For any Surah in SURAHS, its rendered row contains that Surah's number, English name, translated meaning, revelation type, and ayah count, each equal to the corresponding SURAHS field.
  it('Property 4: each row shows its own source fields verbatim (Validates: 1.6)', () => {
    const surahArb = fc.constantFrom(...SURAHS)

    fc.assert(
      fc.property(surahArb, (surah) => {
        render(<SurahRow surah={surah} isFavorited={false} />)
        try {
          const link = screen.getByRole('link')
          expect(link).toHaveAttribute('href', `/quran/${surah.number}`)

          // Use getAllByText: some surahs have an English name equal to their
          // translated meaning (e.g. "Muhammad"), which legitimately produces
          // two matching text nodes. The property is presence of each field,
          // not uniqueness.
          expect(
            within(link).getAllByText(String(surah.number)).length
          ).toBeGreaterThanOrEqual(1)
          expect(
            within(link).getAllByText(surah.englishName).length
          ).toBeGreaterThanOrEqual(1)
          expect(
            within(link).getAllByText(surah.englishNameTranslation).length
          ).toBeGreaterThanOrEqual(1)
          // Revelation type and ayah count render as sibling text fragments
          // in one metadata line; assert against its normalized text content.
          const metaText = link.textContent ?? ''
          expect(metaText).toContain(surah.revelationType)
          expect(metaText).toContain(`${surah.numberOfAyahs} Ayahs`)
        } finally {
          cleanup()
        }
      }),
      { numRuns: NUM_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 5: For any Surah, the Arabic-name element is present in its row iff the Surah's Arabic name is non-empty; when present it is rendered with the Arabic font and RTL direction, and when absent no placeholder or reserved Arabic-name space is rendered.
  it('Property 5: Arabic name shown exactly when present, RTL when shown (Validates: 1.7, 1.8)', () => {
    // Generate surahs with and without an Arabic name (empty / whitespace-only
    // count as absent per the component's trim() check).
    const base = fc.constantFrom(...SURAHS)
    const arabicNameArb = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.constantFrom('سُورَةُ البَقَرَةِ', 'سُورَةُ ٱلْفَاتِحَةِ', 'الإخلاص')
    )

    fc.assert(
      fc.property(base, arabicNameArb, (surah, arabicName) => {
        const withName: SurahMetadata = { ...surah, arabicName }
        const { container } = render(
          <SurahRow surah={withName} isFavorited={false} />
        )
        try {
          const rtlEl = container.querySelector('[dir="rtl"]')
          const present = arabicName.trim().length > 0

          if (present) {
            expect(rtlEl).not.toBeNull()
            expect(rtlEl).toHaveTextContent(arabicName)
            // Arabic font utility + RTL direction + lang="ar".
            expect(rtlEl?.className).toContain('type-arabic')
            expect(rtlEl).toHaveAttribute('lang', 'ar')
          } else {
            // Absent: no RTL element and no reserved Arabic-name space.
            expect(rtlEl).toBeNull()
            expect(container.querySelector('.type-arabic')).toBeNull()
          }
        } finally {
          cleanup()
        }
      }),
      { numRuns: NUM_RUNS }
    )
  })
})
