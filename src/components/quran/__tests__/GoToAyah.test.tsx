/**
 * Tests for the GoToAyah control and SurahReader deep-link handling.
 *
 * Requirement 13 (Go-to-Ayah and Deep Links):
 * - 13.1 The control accepts a positive integer within 1..N.
 * - 13.2 A valid submission navigates to `/quran/{surah}?ayah={n}`.
 * - 13.3 On deep-link navigation the target ayah is marked active and scrolled
 *   into view within 1000ms.
 * - 13.4 Non-numeric / non-integer / <1 / >N input is rejected: the reader does
 *   not navigate, keeps position, and shows the "1 to N" range message.
 * - 13.5 A deep link with an in-range `ayah` opens the surah and scrolls the
 *   ayah into view.
 * - 13.6 A deep link with an out-of-range `ayah` opens at ayah 1 and shows the
 *   valid-range message.
 * - 13.7 The control uses editorial styling rather than default browser
 *   form-input styling, preserving the navigation and validation behavior.
 *
 * GoToAyah: next/navigation `useRouter` is mocked so navigation is asserted via
 * a `push` spy without a real router.
 *
 * SurahReader deep-link: the data/persistence hooks (useFullSurah,
 * useQuranBookmarks, useQuranBrowserFavorites) are mocked so the reader renders
 * synchronously with a deterministic surah. AyahActionBar is mocked because it
 * pulls in the audio player, tafsir view, and Radix primitives that are
 * exercised by their own suites. `Element.prototype.scrollIntoView` is not
 * implemented in jsdom, so it is stubbed with a spy to assert the scroll call.
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { GoToAyah } from '../GoToAyah'
import { SurahReader } from '../SurahReader'
import type { SurahMetadata } from '@/lib/quranData'
import type {
  AyahPair,
  FullSurahResponse,
  QuranAyah,
  QuranSurah,
} from '@/types/quran.types'

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
    surah,
    numberInSurah: 1,
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
    arabic: makeAyah(`ARABIC-${numberInSurah}`),
    transliteration: makeAyah(`TRANSLIT-${numberInSurah}`),
    translation: makeAyah(`Translation ${numberInSurah}`),
  }
}

function makeSurahData(): FullSurahResponse {
  return {
    surah,
    ayahs: Array.from({ length: metadata.numberOfAyahs }, (_, i) =>
      makePair(i + 1)
    ),
    translation: 'en.asad',
  }
}

function mockLoadedSurah() {
  useFullSurahMock.mockReturnValue({
    surahData: makeSurahData(),
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
  return container.querySelector('article[data-active="true"]')
}

let scrollIntoViewMock: jest.Mock

beforeEach(() => {
  pushMock.mockClear()
  useFullSurahMock.mockReset()
  // jsdom does not implement scrollIntoView; stub it so the reader's scroll
  // effect can run and be asserted.
  scrollIntoViewMock = jest.fn()
  Element.prototype.scrollIntoView = scrollIntoViewMock
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('GoToAyah', () => {
  it('keeps both direct controls at the mobile touch-target minimum', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)

    expect(screen.getByLabelText(/go to ayah, from/i)).toHaveClass('min-h-touch')
    expect(screen.getByRole('button', { name: /go to ayah/i })).toHaveClass('size-touch')
  })

  it('navigates to /quran/{surah}?ayah={n} when a valid in-range integer is submitted (Req 13.1, 13.2)', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)

    const input = screen.getByLabelText(/go to ayah, from/i)
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: /go to ayah/i }))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/quran/1?ayah=5')
    // No error message on valid input.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('navigates on the boundary values 1 and N (Req 13.1, 13.2)', () => {
    render(<GoToAyah surahNumber={2} totalAyahs={286} />)
    const input = screen.getByLabelText(/go to ayah, from/i)
    const go = screen.getByRole('button', { name: /go to ayah/i })

    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(go)
    fireEvent.change(input, { target: { value: '286' } })
    fireEvent.click(go)

    expect(pushMock).toHaveBeenNthCalledWith(1, '/quran/2?ayah=1')
    expect(pushMock).toHaveBeenNthCalledWith(2, '/quran/2?ayah=286')
  })

  it('submits with the Enter key (Req 13.2)', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)
    const input = screen.getByLabelText(/go to ayah, from/i)

    fireEvent.change(input, { target: { value: '3' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(pushMock).toHaveBeenCalledWith('/quran/1?ayah=3')
  })

  it('rejects an out-of-range value (> N): shows the "1 to N" message and does not navigate (Req 13.4)', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)
    const input = screen.getByLabelText(/go to ayah, from/i)

    fireEvent.change(input, { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: /go to ayah/i }))

    expect(pushMock).not.toHaveBeenCalled()
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Enter a number from 1 to 7.')
  })

  it('rejects zero and negative-like values without navigating (Req 13.4)', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)
    const input = screen.getByLabelText(/go to ayah, from/i)
    const go = screen.getByRole('button', { name: /go to ayah/i })

    fireEvent.change(input, { target: { value: '0' } })
    fireEvent.click(go)
    expect(pushMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number from 1 to 7.')

    // A leading '-' is not matched by the integer pattern → rejected.
    fireEvent.change(input, { target: { value: '-3' } })
    fireEvent.click(go)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects non-numeric and non-integer input without navigating (Req 13.4)', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)
    const input = screen.getByLabelText(/go to ayah, from/i)
    const go = screen.getByRole('button', { name: /go to ayah/i })

    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.click(go)
    expect(pushMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()

    fireEvent.change(input, { target: { value: '2.5' } })
    fireEvent.click(go)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('marks the input invalid and clears the message once the user edits toward a valid value (Req 13.4)', () => {
    render(<GoToAyah surahNumber={1} totalAyahs={7} />)
    const input = screen.getByLabelText(/go to ayah, from/i)

    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.click(screen.getByRole('button', { name: /go to ayah/i }))
    expect(input).toHaveAttribute('aria-invalid', 'true')

    // Editing clears the stale message.
    fireEvent.change(input, { target: { value: '3' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('renders an editorial, token-styled control rather than a default browser number input (Req 13.7)', () => {
    const { container } = render(<GoToAyah surahNumber={1} totalAyahs={7} />)
    const input = screen.getByLabelText(/go to ayah, from/i) as HTMLInputElement

    // Not a native spinner/number input; text input with numeric input mode.
    expect(input.type).toBe('text')
    expect(input).toHaveAttribute('inputMode', 'numeric')

    // Token typography and a transparent, border-less field (editorial styling).
    expect(input.className).toMatch(/type-body/)
    expect(input.className).toMatch(/bg-transparent/)
    expect(input.className).toMatch(/border-0/)

    // The submit affordance is a rounded, token-colored button, not a form submit.
    const go = screen.getByRole('button', { name: /go to ayah/i })
    expect(go).toHaveAttribute('type', 'button')
    expect(go.className).toMatch(/rounded-control-sm/)

    // The field wrapper uses the semantic surface + control-radius treatment.
    const wrapper = container.querySelector('.rounded-control')
    expect(wrapper).not.toBeNull()
  })
})

describe('SurahReader deep-link handling', () => {
  it('opens the surah, marks the in-range deep-link ayah active, and scrolls it into view within 1000ms (Req 13.3, 13.5)', () => {
    mockLoadedSurah()

    const { container } = render(
      <SurahReader surahNumber={1} surahMetadata={metadata} ayahParam="4" />
    )

    // The 4th ayah article carries the active treatment.
    const active = getActiveArticle(container)
    expect(active).not.toBeNull()
    expect(active).toHaveTextContent('1:4')

    // Only one ayah is active.
    expect(container.querySelectorAll('article[data-active="true"]')).toHaveLength(1)

    // The scroll effect fires within 1000ms (component schedules at 300ms).
    expect(scrollIntoViewMock).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(scrollIntoViewMock).toHaveBeenCalled()
    expect(scrollIntoViewMock).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center' })
    )

    // No out-of-range message for a valid deep link.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('opens at ayah 1 with the valid-range message when the deep-link ayah is out of range (Req 13.6)', () => {
    mockLoadedSurah()

    const { container } = render(
      <SurahReader surahNumber={1} surahMetadata={metadata} ayahParam="99" />
    )

    // Out-of-range → no active verse, opened at the top of the surah.
    expect(getActiveArticle(container)).toBeNull()

    // The valid-range message is surfaced.
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(
      'That ayah does not exist in this surah. Enter a number from 1 to 7.'
    )
  })

  it('treats a non-numeric deep-link ayah as out of range: opens at ayah 1 with the range message (Req 13.6)', () => {
    mockLoadedSurah()

    const { container } = render(
      <SurahReader surahNumber={1} surahMetadata={metadata} ayahParam="abc" />
    )

    expect(getActiveArticle(container)).toBeNull()
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number from 1 to 7.')
  })

  it('treats a non-integer deep-link ayah as out of range (Req 13.6)', () => {
    mockLoadedSurah()

    const { container } = render(
      <SurahReader surahNumber={1} surahMetadata={metadata} ayahParam="2.5" />
    )

    expect(getActiveArticle(container)).toBeNull()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows no active verse and no range message when no deep-link ayah is present (Req 13.5, 13.6)', () => {
    mockLoadedSurah()

    const { container } = render(
      <SurahReader surahNumber={1} surahMetadata={metadata} />
    )

    expect(getActiveArticle(container)).toBeNull()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('marks the boundary ayah N active for an in-range deep link (Req 13.5)', () => {
    mockLoadedSurah()

    const { container } = render(
      <SurahReader surahNumber={1} surahMetadata={metadata} ayahParam="7" />
    )

    const active = getActiveArticle(container)
    expect(active).not.toBeNull()
    expect(active).toHaveTextContent('1:7')
  })
})
