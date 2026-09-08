/**
 * RTL tests for SurahRow / SurahList / SurahSelector (task 2.5)
 *
 * Guardrail: tests only. Components under test are not modified.
 *
 * Covers:
 * - Whole-row Link href `/quran/{number}` (Req 1.6, 1.11)
 * - Row shows required source fields verbatim (Req 1.6, 1.9)
 * - Arabic name present iff non-empty, with dir="rtl" (Req 1.7, 1.8)
 * - Bookmark/favorite indicators reflect data sources (Req 3.1, 3.2)
 * - 44px touch targets via --spacing-touch (Req 1.11)
 * - Accessible names on interactive controls (Req 16.4)
 * - Empty-search message + clearing restores all 114 rows (Req 2.3, 2.4)
 */

import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { SurahMetadata } from '@/lib/quranData'
import { SURAHS } from '@/lib/quranData'
import type { BookmarkData } from '@/types/quran.types'
import { SurahRow } from '../SurahRow'
import { SurahList } from '../SurahList'
import { SurahSelector } from '../SurahSelector'

// Mock next/link to a plain anchor (established project pattern)
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

// Mock the bookmarks hook so SurahList's bookmark indicators are controllable.
const mockGetBookmark = jest.fn<BookmarkData | undefined, [number]>()
jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    getBookmark: mockGetBookmark,
  }),
}))

const buildBookmark = (surahNumber: number): BookmarkData => ({
  user_id: 'test-user',
  surah_number: surahNumber,
  ayah_number: 1,
})

const sampleSurah: SurahMetadata = {
  number: 2,
  arabicName: 'سُورَةُ البَقَرَةِ',
  englishName: 'Al-Baqara',
  englishNameTranslation: 'The Cow',
  numberOfAyahs: 286,
  revelationType: 'Medinan',
}

describe('SurahRow', () => {
  it('renders the whole row as a Link to /quran/{number}', () => {
    render(<SurahRow surah={sampleSurah} isFavorited={false} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/quran/2')
  })

  it('shows the required source fields verbatim', () => {
    render(<SurahRow surah={sampleSurah} isFavorited={false} />)

    const link = screen.getByRole('link')
    expect(within(link).getByText('2')).toBeInTheDocument()
    expect(within(link).getByText('Al-Baqara')).toBeInTheDocument()
    expect(within(link).getByText('The Cow')).toBeInTheDocument()
    expect(
      within(link).getByText('Medinan · 286 Ayahs')
    ).toBeInTheDocument()
  })

  it('renders the Arabic name with dir="rtl" when non-empty', () => {
    render(<SurahRow surah={sampleSurah} isFavorited={false} />)

    const arabic = screen.getByText('سُورَةُ البَقَرَةِ')
    expect(arabic).toBeInTheDocument()
    expect(arabic).toHaveAttribute('dir', 'rtl')
  })

  it('omits the Arabic name entirely when empty', () => {
    const noArabic: SurahMetadata = { ...sampleSurah, arabicName: '' }
    const { container } = render(
      <SurahRow surah={noArabic} isFavorited={false} />
    )

    // No element with dir="rtl" should be rendered when arabicName is empty
    expect(container.querySelector('[dir="rtl"]')).toBeNull()
  })

  it('omits the Arabic name when it is only whitespace', () => {
    const wsArabic: SurahMetadata = { ...sampleSurah, arabicName: '   ' }
    const { container } = render(
      <SurahRow surah={wsArabic} isFavorited={false} />
    )

    expect(container.querySelector('[dir="rtl"]')).toBeNull()
  })

  it('shows the favorite indicator only when favorited', () => {
    const { rerender } = render(
      <SurahRow surah={sampleSurah} isFavorited={false} />
    )
    expect(screen.queryByLabelText('Favorited')).not.toBeInTheDocument()

    rerender(<SurahRow surah={sampleSurah} isFavorited={true} />)
    expect(screen.getByLabelText('Favorited')).toBeInTheDocument()
  })

  it('shows the bookmark indicator only when a bookmark is present', () => {
    const { rerender } = render(
      <SurahRow surah={sampleSurah} isFavorited={false} />
    )
    expect(screen.queryByLabelText('Bookmarked')).not.toBeInTheDocument()

    rerender(
      <SurahRow
        surah={sampleSurah}
        isFavorited={false}
        bookmark={buildBookmark(2)}
      />
    )
    expect(screen.getByLabelText('Bookmarked')).toBeInTheDocument()
  })

  it('meets the 44px touch target via --spacing-touch', () => {
    render(<SurahRow surah={sampleSurah} isFavorited={false} />)

    const link = screen.getByRole('link')
    expect(link.className).toContain('min-h-[var(--spacing-touch)]')
  })
})

describe('SurahList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetBookmark.mockReturnValue(undefined)
  })

  it('renders all 114 surah rows when the search query is empty', () => {
    render(<SurahList searchQuery="" />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(SURAHS.length)
    expect(links).toHaveLength(114)
  })

  it('links each row to its own /quran/{number} route', () => {
    render(<SurahList searchQuery="" />)

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/quran/1')
    expect(links[113]).toHaveAttribute('href', '/quran/114')
  })

  it('reflects the bookmark data source for matching rows only', () => {
    // Only surah 1 is bookmarked
    mockGetBookmark.mockImplementation((n: number) =>
      n === 1 ? buildBookmark(1) : undefined
    )

    render(<SurahList searchQuery="" />)

    expect(screen.getAllByLabelText('Bookmarked')).toHaveLength(1)
  })

  it('filters rows by the preserved case-insensitive predicate', () => {
    render(<SurahList searchQuery="baqara" />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/quran/2')
  })

  it('shows the empty-result message when nothing matches', () => {
    render(<SurahList searchQuery="zzzznomatch" />)

    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(
      screen.getByText(/No surahs found matching "zzzznomatch"/i)
    ).toBeInTheDocument()
  })
})

describe('SurahSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetBookmark.mockReturnValue(undefined)
  })

  it('renders an accessible search control', () => {
    render(<SurahSelector />)

    const search = screen.getByRole('textbox', { name: /search surahs/i })
    expect(search).toBeInTheDocument()
  })

  it('shows the empty-search message when a query matches nothing, then restores all 114 rows when cleared', async () => {
    const user = userEvent.setup()
    render(<SurahSelector />)

    const search = screen.getByRole('textbox', { name: /search surahs/i })

    // Initially all 114 rows
    expect(screen.getAllByRole('link')).toHaveLength(114)

    // Type a query with no matches -> empty message, no rows
    await user.type(search, 'zzzznomatch')
    expect(
      screen.getByText(/No surahs found matching "zzzznomatch"/i)
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)

    // Clear the search -> all 114 rows restored
    await user.clear(search)
    expect(screen.getAllByRole('link')).toHaveLength(114)
    expect(
      screen.queryByText(/No surahs found matching/i)
    ).not.toBeInTheDocument()
  })

  it('narrows results as the user types a matching query', async () => {
    const user = userEvent.setup()
    render(<SurahSelector />)

    const search = screen.getByRole('textbox', { name: /search surahs/i })
    await user.type(search, 'baqara')

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/quran/2')
  })
})
