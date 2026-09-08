/**
 * Tests for JuzRow / JuzList components
 *
 * Covers the editorial Juz view of the Quran Browser:
 * - Row Link href points to `/quran/{startSurah}?ayah={startAyah}` (Req 1.10, 19.2)
 * - Juz entries render in ascending Juz number order (Req 1.4)
 * - Bookmark indicator reflects the data source (Req 3.3)
 * - Rows expose a >=44px touch target (Req 16.4)
 * - Rows have accessible names for navigation (Req 19.2)
 */

import { render, screen, within } from '@testing-library/react'
import { JuzRow } from '../JuzRow'
import { JuzList } from '../JuzList'
import { JUZ_DATA, getSurahByNumber } from '@/lib/quranData'
import type { BookmarkData } from '@/types/quran.types'

// Mock useQuranBookmarks so JuzList's bookmark state is deterministic
const mockGetBookmark = jest.fn()

jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    bookmarks: [],
    loading: false,
    error: null,
    getBookmark: mockGetBookmark,
    saveBookmark: jest.fn(),
    deleteBookmark: jest.fn(),
    clearAll: jest.fn(),
    refetch: jest.fn(),
  }),
}))

const makeBookmark = (surahNumber: number, ayahNumber: number): BookmarkData => ({
  user_id: 'test-user',
  surah_number: surahNumber,
  ayah_number: ayahNumber,
})

describe('JuzRow', () => {
  const juz = JUZ_DATA[0] // { number: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 }
  const startSurah = getSurahByNumber(juz.startSurah)
  const endSurah = getSurahByNumber(juz.endSurah)

  it('renders a Link to /quran/{startSurah}?ayah={startAyah}', () => {
    render(<JuzRow juz={juz} startSurah={startSurah} endSurah={endSurah} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      `/quran/${juz.startSurah}?ayah=${juz.startAyah}`
    )
  })

  it('exposes an accessible name that identifies the Juz and range', () => {
    render(<JuzRow juz={juz} startSurah={startSurah} endSurah={endSurah} />)

    const link = screen.getByRole('link')
    // Accessible name is derived from the row's visible text content
    expect(link).toHaveAccessibleName(/Juz 1/i)
    expect(link).toHaveAccessibleName(new RegExp(startSurah!.englishName, 'i'))
    expect(link).toHaveAccessibleName(new RegExp(endSurah!.englishName, 'i'))
  })

  it('provides a touch target of at least 44px via the min-h-touch token', () => {
    render(<JuzRow juz={juz} startSurah={startSurah} endSurah={endSurah} />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('min-h-touch')
  })

  it('does not render a bookmark indicator when no bookmark exists', () => {
    render(<JuzRow juz={juz} startSurah={startSurah} endSurah={endSurah} />)

    expect(screen.queryByLabelText(/Bookmarked/i)).not.toBeInTheDocument()
  })

  it('renders a bookmark indicator when a bookmark is provided', () => {
    render(
      <JuzRow
        juz={juz}
        startSurah={startSurah}
        endSurah={endSurah}
        bookmark={makeBookmark(juz.startSurah, 5)}
      />
    )

    expect(screen.getByLabelText(/Bookmarked/i)).toBeInTheDocument()
  })

  it('renders the start/end surah range text', () => {
    render(<JuzRow juz={juz} startSurah={startSurah} endSurah={endSurah} />)

    const link = screen.getByRole('link')
    expect(
      within(link).getByText(
        new RegExp(`${juz.startSurah}:${juz.startAyah}`)
      )
    ).toBeInTheDocument()
    expect(
      within(link).getByText(new RegExp(`${juz.endSurah}:${juz.endAyah}`))
    ).toBeInTheDocument()
  })
})

describe('JuzList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetBookmark.mockReturnValue(undefined)
  })

  it('renders all Juz entries from JUZ_DATA', () => {
    render(<JuzList />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(JUZ_DATA.length)
  })

  it('renders Juz entries in ascending Juz number order', () => {
    render(<JuzList />)

    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))

    const expectedHrefs = JUZ_DATA.map(
      (juz) => `/quran/${juz.startSurah}?ayah=${juz.startAyah}`
    )
    expect(hrefs).toEqual(expectedHrefs)
  })

  it('links each row to /quran/{startSurah}?ayah={startAyah}', () => {
    render(<JuzList />)

    const links = screen.getAllByRole('link')
    JUZ_DATA.forEach((juz, index) => {
      expect(links[index]).toHaveAttribute(
        'href',
        `/quran/${juz.startSurah}?ayah=${juz.startAyah}`
      )
    })
  })

  it('shows a bookmark indicator only for rows whose start surah is bookmarked', () => {
    // Bookmark the start surah of Juz 1 only
    const bookmarkedSurah = JUZ_DATA[0].startSurah
    mockGetBookmark.mockImplementation((surahNumber: number) =>
      surahNumber === bookmarkedSurah
        ? makeBookmark(bookmarkedSurah, 3)
        : undefined
    )

    render(<JuzList />)

    // getBookmark is queried per row using the Juz's start surah
    expect(mockGetBookmark).toHaveBeenCalledWith(bookmarkedSurah)

    const indicators = screen.getAllByLabelText(/Bookmarked/i)
    // Only Juz entries whose startSurah matches the bookmarked surah show the indicator
    const expectedCount = JUZ_DATA.filter(
      (juz) => juz.startSurah === bookmarkedSurah
    ).length
    expect(indicators).toHaveLength(expectedCount)
  })

  it('renders no bookmark indicators when there are no bookmarks', () => {
    mockGetBookmark.mockReturnValue(undefined)

    render(<JuzList />)

    expect(screen.queryByLabelText(/Bookmarked/i)).not.toBeInTheDocument()
  })
})
