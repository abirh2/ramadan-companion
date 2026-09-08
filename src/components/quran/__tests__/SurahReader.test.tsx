/**
 * Tests for SurahReader component — states and composition wiring.
 *
 * Scope (task 11.2): loading / error / offline states surfaced via the
 * `useFullSurah` hook (rendered with semantic tokens), the compose order of
 * ReaderHeader → ReadingControlsBar → ayah list, and the wiring of every
 * preserved capability control (audio + reciter, translation, tafsir, bookmark,
 * favorite, copy, share, go-to-ayah, go-to-bookmark).
 *
 * Deep-link specifics (in-range scroll, out-of-range range message) are covered
 * by the GoToAyah / deep-link tests (task 9.3) and are intentionally NOT
 * asserted here.
 *
 * Requirements: 17.1, 17.2, 17.3, 17.4, 19.4, 19.5, 20.1
 *
 * The three composed children (ReaderHeader, ReadingControlsBar, AyahBlock) are
 * mocked. Each is exercised by its own suite; mocking them here keeps the
 * compose-order / prop-wiring contract tractable and lets us assert the exact
 * props SurahReader hands down (which is where "every capability is wired"
 * lives) without pulling in Radix sheets, the audio element, and the tafsir
 * view.
 */

import { render, screen } from '@testing-library/react'
import { SurahReader } from '../SurahReader'
import { DEFAULT_RECITER } from '@/lib/quranAudio'
import type { SurahMetadata } from '@/lib/quranData'
import type { AyahPair, FullSurahResponse, QuranAyah, QuranSurah, BookmarkData } from '@/types/quran.types'

// jsdom does not implement scrollIntoView; the reader calls it inside effects.
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn()
})

// ---- useFullSurah mock (loading / error / success variants) ----------------
const mockSetTranslation = jest.fn()
let fullSurahState: {
  surahData: FullSurahResponse | null
  loading: boolean
  error: string | null
  translation: string
}

jest.mock('@/hooks/useFullSurah', () => ({
  useFullSurah: () => ({
    ...fullSurahState,
    setTranslation: mockSetTranslation,
    refetch: jest.fn(),
  }),
}))

// ---- useQuranBookmarks mock -------------------------------------------------
const mockGetBookmark = jest.fn<BookmarkData | undefined, [number]>()
const mockSaveBookmark = jest.fn(async () => true)
const mockDeleteBookmark = jest.fn(async () => true)

jest.mock('@/hooks/useQuranBookmarks', () => ({
  useQuranBookmarks: () => ({
    getBookmark: mockGetBookmark,
    saveBookmark: mockSaveBookmark,
    deleteBookmark: mockDeleteBookmark,
  }),
}))

// ---- useQuranBrowserFavorites mock -----------------------------------------
const mockIsFavorited = jest.fn(() => false)
const mockAddFavorite = jest.fn(async () => true)
const mockRemoveFavorite = jest.fn(async () => true)

jest.mock('@/hooks/useQuranBrowserFavorites', () => ({
  useQuranBrowserFavorites: () => ({
    isFavorited: mockIsFavorited,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
  }),
}))

// ---- Child component mocks: record render order + received props -----------
// A shared registry the mocks push into so tests can assert compose order and
// the exact props each child was given.
type Rendered = { name: string; props: Record<string, unknown> }
const rendered: Rendered[] = []

jest.mock('../ReaderHeader', () => ({
  ReaderHeader: (props: Record<string, unknown>) => {
    rendered.push({ name: 'ReaderHeader', props })
    return <div data-testid="reader-header" data-order={rendered.length} />
  },
}))

jest.mock('../ReadingControlsBar', () => ({
  ReadingControlsBar: (props: Record<string, unknown>) => {
    rendered.push({ name: 'ReadingControlsBar', props })
    return <div data-testid="reading-controls-bar" data-order={rendered.length} />
  },
}))

jest.mock('../AyahBlock', () => ({
  AyahBlock: (props: Record<string, unknown>) => {
    rendered.push({ name: 'AyahBlock', props })
    return (
      <div
        data-testid="ayah-block"
        data-order={rendered.length}
        data-ayah={String(props.isActive ? 'active' : 'inactive')}
      />
    )
  },
}))

// ---- Fixtures ---------------------------------------------------------------
const metadata: SurahMetadata = {
  number: 1,
  arabicName: 'الفاتحة',
  englishName: 'Al-Fatihah',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
}

const surah: QuranSurah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatihah',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
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
    arabic: makeAyah(`arabic-${numberInSurah}`, numberInSurah),
    transliteration: makeAyah(`translit-${numberInSurah}`, numberInSurah),
    translation: makeAyah(`translation-${numberInSurah}`, numberInSurah),
  }
}

const successData: FullSurahResponse = {
  surah,
  ayahs: [makePair(1), makePair(2)],
  translation: 'en.asad',
}

function renderReader(ayahParam?: string) {
  return render(
    <SurahReader surahNumber={1} surahMetadata={metadata} ayahParam={ayahParam} />
  )
}

beforeEach(() => {
  rendered.length = 0
  jest.clearAllMocks()
  mockGetBookmark.mockReturnValue(undefined)
  mockIsFavorited.mockReturnValue(false)
})

// ============================================================================
// Loading / error / offline states (Req 17.1, 17.2, 17.3, 17.4)
// ============================================================================
describe('SurahReader — loading / error / offline states', () => {
  it('presents a loading state while the surah content is loading (Req 17.1)', () => {
    fullSurahState = { surahData: null, loading: true, error: null, translation: 'en.asad' }
    renderReader()

    expect(screen.getByText(/loading surah/i)).toBeInTheDocument()
    // No composed content while loading.
    expect(screen.queryByTestId('reader-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ayah-block')).not.toBeInTheDocument()
  })

  it('renders the loading state with semantic tokens, not hard-coded colors (Req 17.4)', () => {
    fullSurahState = { surahData: null, loading: true, error: null, translation: 'en.asad' }
    const { container } = renderReader()

    const message = screen.getByText(/loading surah/i)
    // Semantic token class present; no raw Tailwind color literals.
    expect(message.className).toMatch(/text-secondary/)
    expect(container.innerHTML).not.toMatch(/text-\[#|bg-\[#/)
  })

  it('presents an error state when loading the surah content fails (Req 17.2)', () => {
    fullSurahState = {
      surahData: null,
      loading: false,
      error: 'Failed to fetch surah: 500',
      translation: 'en.asad',
    }
    renderReader()

    expect(screen.getByText(/error loading surah/i)).toBeInTheDocument()
    expect(screen.getByText(/failed to fetch surah: 500/i)).toBeInTheDocument()
    expect(screen.queryByTestId('ayah-block')).not.toBeInTheDocument()
  })

  it('renders the error state with semantic destructive token (Req 17.4)', () => {
    fullSurahState = {
      surahData: null,
      loading: false,
      error: 'network error',
      translation: 'en.asad',
    }
    const { container } = renderReader()

    const message = screen.getByText(/error loading surah/i)
    expect(message.className).toMatch(/text-destructive/)
    expect(container.innerHTML).not.toMatch(/text-\[#|bg-\[#/)
  })

  it('surfaces an offline/failed-fetch condition through the error state (Req 17.3)', () => {
    // Offline behavior is preserved via useFullSurah: an offline fetch rejects
    // and the hook exposes it as `error`, which the reader renders as the
    // error state. A network-failure message stands in for the offline path.
    fullSurahState = {
      surahData: null,
      loading: false,
      error: 'Failed to fetch',
      translation: 'en.asad',
    }
    renderReader()

    expect(screen.getByText(/error loading surah/i)).toBeInTheDocument()
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument()
  })

  it('renders nothing composed when there is no data and no loading/error (defensive)', () => {
    fullSurahState = { surahData: null, loading: false, error: null, translation: 'en.asad' }
    renderReader()

    expect(screen.queryByTestId('reader-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('reading-controls-bar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ayah-block')).not.toBeInTheDocument()
  })
})

// ============================================================================
// Composition order (Req 20.1)
// ============================================================================
describe('SurahReader — composition order', () => {
  beforeEach(() => {
    fullSurahState = { surahData: successData, loading: false, error: null, translation: 'en.asad' }
  })

  it('composes header, then controls bar, then ayah blocks in order', () => {
    renderReader()

    // Registry order reflects React render order top-to-bottom.
    const names = rendered.map((r) => r.name)
    expect(names[0]).toBe('ReaderHeader')
    expect(names[1]).toBe('ReadingControlsBar')
    expect(names.slice(2)).toEqual(['AyahBlock', 'AyahBlock'])
  })

  it('renders one AyahBlock per ayah in the surah data', () => {
    renderReader()
    expect(screen.getAllByTestId('ayah-block')).toHaveLength(2)
  })

  it('places the controls bar before the first ayah block in the DOM (no vertical stacking above ayahs is a separate concern)', () => {
    renderReader()
    const controls = screen.getByTestId('reading-controls-bar')
    const firstAyah = screen.getAllByTestId('ayah-block')[0]
    expect(
      controls.compareDocumentPosition(firstAyah) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})

// ============================================================================
// Capability wiring (Req 19.4, 19.5)
// ============================================================================
describe('SurahReader — preserved capability wiring', () => {
  beforeEach(() => {
    fullSurahState = { surahData: successData, loading: false, error: null, translation: 'en.asad' }
  })

  function propsFor(name: string): Record<string, unknown> {
    const entry = rendered.find((r) => r.name === name)
    if (!entry) throw new Error(`${name} was not rendered`)
    return entry.props
  }

  it('passes translation state and setter to the controls bar (translation selection) (Req 19.4)', () => {
    renderReader()
    const props = propsFor('ReadingControlsBar')
    expect(props.translation).toBe('en.asad')
    expect(props.onTranslationChange).toBe(mockSetTranslation)
  })

  it('passes reciter state and setter to the controls bar, defaulting to DEFAULT_RECITER (reciter selection) (Req 19.4)', () => {
    renderReader()
    const props = propsFor('ReadingControlsBar')
    expect(props.reciter).toBe(DEFAULT_RECITER)
    expect(typeof props.onReciterChange).toBe('function')
  })

  it('wires go-to-ayah via surahNumber + totalAyahs on the controls bar (Req 19.5)', () => {
    renderReader()
    const props = propsFor('ReadingControlsBar')
    expect(props.surahNumber).toBe(1)
    expect(props.totalAyahs).toBe(metadata.numberOfAyahs)
  })

  it('wires go-to-bookmark: passes the current bookmark and an onGoToBookmark handler (Req 19.5)', () => {
    const bookmark: BookmarkData = {
      user_id: 'u1',
      surah_number: 1,
      ayah_number: 5,
    }
    mockGetBookmark.mockReturnValue(bookmark)

    renderReader()
    const props = propsFor('ReadingControlsBar')
    expect(props.bookmark).toEqual(bookmark)
    expect(typeof props.onGoToBookmark).toBe('function')
    // The bookmark is looked up for the current surah.
    expect(mockGetBookmark).toHaveBeenCalledWith(1)
  })

  it('wires per-ayah audio by passing the selected reciter to each AyahBlock (audio) (Req 19.4)', () => {
    renderReader()
    const blocks = rendered.filter((r) => r.name === 'AyahBlock')
    expect(blocks).toHaveLength(2)
    for (const block of blocks) {
      expect(block.props.reciter).toBe(DEFAULT_RECITER)
    }
  })

  it('wires favorite capability by passing favorite callbacks to each AyahBlock (Req 19.5)', () => {
    renderReader()
    const block = rendered.find((r) => r.name === 'AyahBlock')!
    expect(block.props.isFavorited).toBe(mockIsFavorited)
    expect(block.props.addFavorite).toBe(mockAddFavorite)
    expect(block.props.removeFavorite).toBe(mockRemoveFavorite)
  })

  it('wires bookmark capability by passing bookmark callbacks to each AyahBlock (Req 19.5)', () => {
    renderReader()
    const block = rendered.find((r) => r.name === 'AyahBlock')!
    expect(block.props.getBookmark).toBe(mockGetBookmark)
    expect(block.props.saveBookmark).toBe(mockSaveBookmark)
    expect(block.props.deleteBookmark).toBe(mockDeleteBookmark)
  })

  it('wires copy / share / tafsir capability by handing each AyahBlock the ayah pair and identity it needs (Req 19.5)', () => {
    // Copy, share, and tafsir are owned by AyahBlock's action bar; SurahReader
    // must supply the ayah content and surah identity that those actions build
    // from (copy string, share payload, tafsir lookup).
    renderReader()
    const blocks = rendered.filter((r) => r.name === 'AyahBlock')
    blocks.forEach((block, index) => {
      expect(block.props.ayahPair).toEqual(successData.ayahs[index])
      expect(block.props.surahNumber).toBe(1)
      expect(block.props.surahName).toBe(metadata.englishName)
    })
  })

  it('marks the deep-linked ayah active and leaves others inactive (active-verse wiring) (Req 19.5)', () => {
    renderReader('2')
    const blocks = rendered.filter((r) => r.name === 'AyahBlock')
    expect(blocks[0].props.isActive).toBe(false)
    expect(blocks[1].props.isActive).toBe(true)
  })

  it('marks the first ayah as isFirst so it draws no leading divider', () => {
    renderReader()
    const blocks = rendered.filter((r) => r.name === 'AyahBlock')
    expect(blocks[0].props.isFirst).toBe(true)
    expect(blocks[1].props.isFirst).toBe(false)
  })
})

// ============================================================================
// Scope boundary — reader is driven only by its own hooks/props (Req 20.1)
// ============================================================================
describe('SurahReader — header wiring', () => {
  it('passes the surah data and metadata down to the header (Req 20.1)', () => {
    fullSurahState = { surahData: successData, loading: false, error: null, translation: 'en.asad' }
    renderReader()

    const headerEntry = rendered.find((r) => r.name === 'ReaderHeader')!
    expect(headerEntry.props.surah).toEqual(successData.surah)
    expect(headerEntry.props.metadata).toEqual(metadata)
  })
})
