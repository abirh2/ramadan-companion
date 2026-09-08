/**
 * Property-based tests (task 14.2) — Indicator + reachability properties.
 *
 * Guardrail: tests only. No component under test is modified.
 *
 * Uses the project's fast-check integration (pinned devDependency) driving a
 * minimum of 100 iterations per property. Each property is a single
 * property-based test tagged with the feature + property text.
 *
 * Property 6: Bookmark/favorite indicators reflect their data sources
 *   (Validates: Requirements 3.1, 3.2, 3.3).
 * Property 20: Every preserved capability remains reachable
 *   (Validates: Requirements 19.1–19.7).
 *
 * NOTE / KNOWN LIMITATION (Property 6, favorite indicator):
 *   `SurahList` currently hardcodes `isFavorited={false}` for every row, so the
 *   browser-level favorite indicator is not wired to a real favorite data
 *   source. Property 6 therefore tests the favorite indicator where it IS
 *   data-driven: at the `SurahRow` level (prop-driven `isFavorited`). The
 *   bookmark indicator is data-driven at the list level (via the
 *   `useQuranBookmarks` data source) and is tested there for both `SurahList`
 *   and `JuzList`. This mirrors the actual data flow rather than asserting a
 *   capability the list does not yet wire.
 */

import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import fc from 'fast-check'
import type { SurahMetadata } from '@/lib/quranData'
import { SURAHS, JUZ_DATA, getSurahByNumber } from '@/lib/quranData'
import type { BookmarkData } from '@/types/quran.types'
import { SurahRow } from '../SurahRow'
import { SurahList } from '../SurahList'
import { JuzRow } from '../JuzRow'
import { JuzList } from '../JuzList'
import { SurahSelector } from '../SurahSelector'

// Mock next/link to a plain anchor (established project pattern) so rows expose
// a real anchor with an href and an accessible name.
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

// Mock the bookmarks hook so list-level bookmark indicators are driven by a
// controllable data source (this IS the data source Property 6/20 assert against).
const mockGetBookmark = jest.fn<BookmarkData | undefined, [number]>()
jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    getBookmark: mockGetBookmark,
    saveBookmark: jest.fn(),
    deleteBookmark: jest.fn(),
    bookmarks: [],
    loading: false,
    error: null,
    clearAll: jest.fn(),
    refetch: jest.fn(),
  }),
}))

const buildBookmark = (surahNumber: number, ayahNumber = 1): BookmarkData => ({
  user_id: 'test-user',
  surah_number: surahNumber,
  ayah_number: ayahNumber,
})

const FC_RUNS = 120

// A surah with a non-empty Arabic name and controllable metadata.
function surahArb(): fc.Arbitrary<SurahMetadata> {
  return fc.record({
    number: fc.integer({ min: 1, max: 114 }),
    arabicName: fc.constantFrom('سُورَةُ البَقَرَةِ', 'الفاتحة', ''),
    englishName: fc.constantFrom('Al-Baqara', 'Al-Faatiha', 'An-Nas'),
    englishNameTranslation: fc.constantFrom('The Cow', 'The Opening', 'Mankind'),
    numberOfAyahs: fc.integer({ min: 1, max: 286 }),
    revelationType: fc.constantFrom<'Meccan' | 'Medinan'>('Meccan', 'Medinan'),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetBookmark.mockReturnValue(undefined)
})

// ============================================================================
// Property 6 — Bookmark/favorite indicators reflect their data sources
// ============================================================================
describe('Property 6 — indicators reflect their data sources', () => {
  // Feature: quran-reading-experience-redesign, Property 6: Bookmark/favorite indicators reflect their data sources (Validates: 3.1, 3.2, 3.3).
  it('SurahRow shows the favorite indicator iff isFavorited and the bookmark indicator iff a bookmark is present', () => {
    fc.assert(
      fc.property(surahArb(), fc.boolean(), fc.boolean(), (surah, favorited, hasBookmark) => {
        cleanup()
        render(
          <SurahRow
            surah={surah}
            isFavorited={favorited}
            bookmark={hasBookmark ? buildBookmark(surah.number) : undefined}
          />
        )

        // Favorite indicator present exactly when the favorite data says so.
        expect(!!screen.queryByLabelText('Favorited')).toBe(favorited)
        // Bookmark indicator present exactly when a bookmark is supplied.
        expect(!!screen.queryByLabelText('Bookmarked')).toBe(hasBookmark)
      }),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 6: Bookmark/favorite indicators reflect their data sources (Validates: 3.1, 3.2, 3.3).
  it('SurahList renders exactly one bookmark indicator per surah reported as bookmarked by the data source', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 114 }), { minLength: 0, maxLength: 6 }),
        (bookmarkedNumbers) => {
          cleanup()
          const bookmarkedSet = new Set(bookmarkedNumbers)
          mockGetBookmark.mockImplementation((n: number) =>
            bookmarkedSet.has(n) ? buildBookmark(n) : undefined
          )

          render(<SurahList searchQuery="" />)

          // Every surah renders; the count of bookmark indicators equals the
          // number of surahs the data source reports as bookmarked.
          const indicators = screen.queryAllByLabelText('Bookmarked')
          expect(indicators).toHaveLength(bookmarkedSet.size)
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 6: Bookmark/favorite indicators reflect their data sources (Validates: 3.1, 3.2, 3.3).
  it('JuzRow shows the bookmark indicator iff a bookmark is present for its start surah', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: JUZ_DATA.length - 1 }),
        fc.boolean(),
        (juzIndex, hasBookmark) => {
          cleanup()
          const juz = JUZ_DATA[juzIndex]
          render(
            <JuzRow
              juz={juz}
              startSurah={getSurahByNumber(juz.startSurah)}
              endSurah={getSurahByNumber(juz.endSurah)}
              bookmark={hasBookmark ? buildBookmark(juz.startSurah, juz.startAyah) : undefined}
            />
          )

          expect(!!screen.queryByLabelText(/Bookmarked/i)).toBe(hasBookmark)
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 6: Bookmark/favorite indicators reflect their data sources (Validates: 3.1, 3.2, 3.3).
  it('JuzList renders a bookmark indicator only for Juz rows whose start surah is bookmarked', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 114 }), { minLength: 0, maxLength: 5 }),
        (bookmarkedSurahs) => {
          cleanup()
          const bookmarkedSet = new Set(bookmarkedSurahs)
          mockGetBookmark.mockImplementation((surahNumber: number) =>
            bookmarkedSet.has(surahNumber) ? buildBookmark(surahNumber) : undefined
          )

          render(<JuzList />)

          const expectedCount = JUZ_DATA.filter((juz) =>
            bookmarkedSet.has(juz.startSurah)
          ).length
          expect(screen.queryAllByLabelText(/Bookmarked/i)).toHaveLength(expectedCount)
        }
      ),
      { numRuns: FC_RUNS }
    )
  })
})

// ============================================================================
// Property 20 — Every preserved capability remains reachable
// ============================================================================
// Reachability is asserted pragmatically in jsdom at the level each capability
// entry point is owned:
//   - Surah navigation (19.1): every surah row is an activatable Link to its
//     own /quran/{number} route with a non-empty accessible name.
//   - Juz navigation (19.2): every Juz row is an activatable Link to
//     /quran/{startSurah}?ayah={startAyah}.
//   - Search (19.3): the browser exposes a labelled search input that filters
//     the list and can be cleared to restore reachability of all 114 surahs.
// (Reader-side capabilities 19.4–19.7 are wiring-verified in SurahReader.test.tsx.)
describe('Property 20 — every preserved capability remains reachable', () => {
  // Feature: quran-reading-experience-redesign, Property 20: Every preserved capability remains reachable (Validates: 19.1–19.7).
  it('every Surah is reachable via an activatable row Link to its own /quran/{number} route (Surah navigation, 19.1)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: SURAHS.length - 1 }), (idx) => {
        cleanup()
        const surah = SURAHS[idx]
        render(<SurahRow surah={surah} isFavorited={false} />)

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', `/quran/${surah.number}`)
        // Reachable = has a non-empty accessible name assistive tech can target.
        expect(link).toHaveAccessibleName(new RegExp(surah.englishName, 'i'))
      }),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 20: Every preserved capability remains reachable (Validates: 19.1–19.7).
  it('the full Surah list keeps all 114 routes reachable regardless of bookmark data source state (Surah navigation, 19.1)', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 114 }), { minLength: 0, maxLength: 8 }),
        (bookmarkedNumbers) => {
          cleanup()
          const bookmarkedSet = new Set(bookmarkedNumbers)
          mockGetBookmark.mockImplementation((n: number) =>
            bookmarkedSet.has(n) ? buildBookmark(n) : undefined
          )

          render(<SurahList searchQuery="" />)

          const links = screen.getAllByRole('link')
          expect(links).toHaveLength(114)
          // Each of the 114 surahs remains reachable at its own route.
          const hrefs = links.map((l) => l.getAttribute('href'))
          expect(hrefs).toEqual(SURAHS.map((s) => `/quran/${s.number}`))
        }
      ),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 20: Every preserved capability remains reachable (Validates: 19.1–19.7).
  it('every Juz is reachable via an activatable row Link preserving the existing Juz navigation target (Juz navigation, 19.2)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: JUZ_DATA.length - 1 }), (idx) => {
        cleanup()
        const juz = JUZ_DATA[idx]
        render(
          <JuzRow
            juz={juz}
            startSurah={getSurahByNumber(juz.startSurah)}
            endSurah={getSurahByNumber(juz.endSurah)}
          />
        )

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute(
          'href',
          `/quran/${juz.startSurah}?ayah=${juz.startAyah}`
        )
        expect(link).toHaveAccessibleName(new RegExp(`Juz ${juz.number}\\b`, 'i'))
      }),
      { numRuns: FC_RUNS }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 20: Every preserved capability remains reachable (Validates: 19.1–19.7).
  it('Surah search stays reachable: a labelled input filters to the matching subset and clearing restores all 114 rows (Search, 19.3)', () => {
    // Query strings drawn from real surah data so the preserved case-insensitive
    // predicate (name / meaning / number) yields a deterministic expected subset.
    const queryArb = fc.oneof(
      fc.constantFrom('baqara', 'THE', 'opening', 'an-nas', 'nas', 'zzzznomatch'),
      fc.integer({ min: 1, max: 114 }).map((n) => String(n))
    )

    fc.assert(
      fc.property(queryArb, (query) => {
        cleanup()
        render(<SurahSelector />)
        const search = screen.getByRole('textbox', {
          name: /search surahs/i,
        }) as HTMLInputElement

        // Reachability baseline: all 114 surahs reachable before searching.
        expect(screen.getAllByRole('link')).toHaveLength(114)

        // Set the query via a change event; the controlled input re-filters.
        fireEvent.change(search, { target: { value: query } })

        // The filtered set equals the preserved predicate applied to SURAHS.
        const q = query.toLowerCase()
        const expected = SURAHS.filter(
          (s) =>
            s.englishName.toLowerCase().includes(q) ||
            s.englishNameTranslation.toLowerCase().includes(q) ||
            s.number.toString().includes(q)
        )

        if (expected.length === 0) {
          expect(screen.queryAllByRole('link')).toHaveLength(0)
          expect(
            screen.getByText(/No surahs found matching/i)
          ).toBeInTheDocument()
        } else {
          expect(screen.getAllByRole('link')).toHaveLength(expected.length)
        }

        // Clearing the search restores reachability of all 114 surahs.
        fireEvent.change(search, { target: { value: '' } })
        expect(screen.getAllByRole('link')).toHaveLength(114)
      }),
      { numRuns: FC_RUNS }
    )
  })
})
