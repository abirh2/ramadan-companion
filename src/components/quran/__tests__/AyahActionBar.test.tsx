/**
 * Tests for AyahActionBar
 *
 * Covers Requirement 10 (Ayah Actions): exactly six actions with a single
 * shared icon treatment (no outline pills), a labeled "More" overflow that
 * keeps listen directly visible, state-reflecting accessible names, the 2s
 * copied state, native-share vs clipboard fallback, favorite/bookmark
 * round-trip, and tafsir opening.
 *
 * TafsirView and AyahAudioPlayer are mocked so the render is deterministic and
 * so we can observe when tafsir opens and that the listen control is present.
 */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AyahActionBar } from '../AyahActionBar'
import type {
  QuranFavoriteData,
  BookmarkData,
} from '@/types/quran.types'

// -----------------------------------------------------------------------------
// Mock the listen control. AyahActionBar composes AyahAudioPlayer as the
// "listen" action; the real component is covered by its own test. Here we only
// need a stable, identifiable stand-in that carries an accessible "listen"
// name so overflow behavior (listen stays visible) can be asserted.
// -----------------------------------------------------------------------------
jest.mock('../AyahAudioPlayer', () => ({
  AyahAudioPlayer: ({ globalAyahNumber }: { globalAyahNumber: number }) => (
    <button type="button" aria-label="Play recitation" data-testid="listen">
      listen {globalAyahNumber}
    </button>
  ),
}))

// -----------------------------------------------------------------------------
// Mock TafsirView. It only renders when opened, so a visible marker lets us
// assert the tafsir action opened the reading view.
// -----------------------------------------------------------------------------
jest.mock('../TafsirView', () => ({
  TafsirView: ({ open }: { open: boolean }) =>
    open ? <div data-testid="tafsir-view">tafsir</div> : null,
}))

// -----------------------------------------------------------------------------
// Test props. Favorite/bookmark state is driven by simple mock callbacks so a
// toggle round-trip can be observed through the accessible name and the calls.
// -----------------------------------------------------------------------------
function makeProps(
  overrides: Partial<React.ComponentProps<typeof AyahActionBar>> = {}
) {
  const addFavorite = jest.fn<Promise<boolean>, [QuranFavoriteData]>(() =>
    Promise.resolve(true)
  )
  const removeFavorite = jest.fn<Promise<boolean>, [number]>(() =>
    Promise.resolve(true)
  )
  const saveBookmark = jest.fn<Promise<boolean>, [number, number]>(() =>
    Promise.resolve(true)
  )
  const deleteBookmark = jest.fn<Promise<boolean>, [number]>(() =>
    Promise.resolve(true)
  )

  const props = {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 255,
    globalNumber: 262,
    arabicText: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ',
    translationText: 'God: there is no deity save Him',
    reciter: 'ar.alafasy' as const,
    isFavorited: jest.fn(() => false),
    addFavorite,
    removeFavorite,
    getBookmark: jest.fn<BookmarkData | undefined, [number]>(() => undefined),
    saveBookmark,
    deleteBookmark,
    ...overrides,
  }

  return props
}

/**
 * Opens the mobile "More" overflow sheet and returns the sheet dialog element.
 * The default (no matchMedia) path renders the bottom Sheet, so tafsir and
 * share live inside it.
 */
async function openMore(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /more actions/i }))
  return screen.findByRole('dialog')
}

/**
 * Installs a mock clipboard (and optional share) on navigator. navigator's
 * properties are read-only getters in jsdom, so they must be redefined rather
 * than assigned. Returns the mock functions for assertions.
 */
function mockNavigator({ withShare }: { withShare: boolean }) {
  const writeText = jest.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  let share: jest.Mock | undefined
  if (withShare) {
    share = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    })
  } else {
    // Remove any native share so the clipboard fallback path runs.
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
  }

  return { writeText, share }
}

describe('AyahActionBar', () => {
  afterEach(() => {
    jest.clearAllMocks()
    // Guard against a fake-timer test leaking real-timer state into the next.
    jest.useRealTimers()
  })

  // Requirement 10.1 / 10.5: exactly six actions — listen, favorite, copy,
  // bookmark plus the two overflow actions (tafsir, share) reachable through
  // More. Listen stays directly visible in the row.
  it('exposes exactly six actions with listen kept directly visible', async () => {
    const user = userEvent.setup()
    render(<AyahActionBar {...makeProps()} />)

    // Four controls are directly visible in the row: listen, favorite, copy,
    // bookmark, and the labeled More control.
    expect(screen.getByRole('button', { name: /play recitation/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /^favorite$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy ayah/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^bookmark$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /more actions/i })).toBeInTheDocument()

    // The remaining two actions live behind More.
    const sheet = await openMore(user)
    expect(within(sheet).getByRole('button', { name: /read tafsir/i })).toBeInTheDocument()
    expect(within(sheet).getByRole('button', { name: /share ayah/i })).toBeInTheDocument()

    // Six distinct actions total: listen, favorite, copy, bookmark, tafsir, share.
    expect(screen.getByTestId('listen')).toBeInTheDocument()
  })

  // Requirement 10.2: actions share one icon treatment (ghost icon buttons),
  // never a row of outline pill buttons.
  it('renders icon controls with no outline pill styling', () => {
    render(<AyahActionBar {...makeProps()} />)

    for (const name of [/^favorite$/i, /copy ayah/i, /^bookmark$/i, /more actions/i]) {
      const button = screen.getByRole('button', { name })
      const classes = button.getAttribute('class') ?? ''
      // Not a pill: no full rounding.
      expect(classes).not.toContain('rounded-full')
      // Not the outline variant: no bordered-input treatment. (Focus-ring
      // border utilities like `focus-visible:border-ring` are allowed.)
      expect(classes).not.toContain('border-input')
      // Icon-only controls carry an svg marked decorative.
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })

  // Requirement 10.4 / 10.5: at narrow width the overflow collapses the extra
  // actions into a labeled More control while listen stays visible.
  it('keeps listen visible while tafsir and share collapse behind More', async () => {
    const user = userEvent.setup()
    render(<AyahActionBar {...makeProps()} />)

    // Listen is directly in the row, tafsir/share are not until More opens.
    expect(screen.getByTestId('listen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /read tafsir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /share ayah/i })).not.toBeInTheDocument()

    const more = screen.getByRole('button', { name: /more actions/i })
    expect(more).toHaveAttribute('aria-label', 'More actions')

    const sheet = await openMore(user)
    // Listen is still present after opening the overflow sheet.
    expect(screen.getByTestId('listen')).toBeInTheDocument()
    expect(within(sheet).getByRole('button', { name: /read tafsir/i })).toBeInTheDocument()
  })

  // Requirement 10.6: copy writes the ayah string, shows a 2s copied state,
  // then reverts. Fake timers drive the 2000ms window.
  it('shows a copied state for 2 seconds then reverts', async () => {
    const { writeText } = mockNavigator({ withShare: false })
    jest.useFakeTimers()

    render(<AyahActionBar {...makeProps()} />)

    // fireEvent keeps activation synchronous under fake timers; flush the
    // awaited clipboard write (a microtask) so the copied state applies.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy ayah/i }))
      await Promise.resolve()
    })

    // The copied state is reflected in the accessible name, and the copied
    // string carries the Arabic text and the "Quran S:A (name)" attribution.
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toContain('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ')
    expect(writeText.mock.calls[0][0]).toContain('Quran 2:255 (Al-Baqarah)')

    // Just short of 2s the control still shows "Copied".
    act(() => {
      jest.advanceTimersByTime(1999)
    })
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument()

    // At 2s the control reverts to its default "Copy ayah" state.
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: /copy ayah/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument()

    jest.useRealTimers()
  })

  // Requirement 10.7: share uses navigator.share when available.
  it('invokes native share when navigator.share is available', async () => {
    const user = userEvent.setup()
    const { share, writeText } = mockNavigator({ withShare: true })

    render(<AyahActionBar {...makeProps()} />)

    const sheet = await openMore(user)
    await user.click(within(sheet).getByRole('button', { name: /share ayah/i }))

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    const shared = share!.mock.calls[0][0]
    expect(shared.title).toBe('Quran 2:255')
    expect(shared.text).toContain('God: there is no deity save Him')
    // Native share path does not fall back to the clipboard.
    expect(writeText).not.toHaveBeenCalled()
  })

  // Requirement 10.7: without navigator.share, share falls back to copying the
  // link to the clipboard.
  it('falls back to clipboard when native share is unavailable', async () => {
    const user = userEvent.setup()
    const { writeText } = mockNavigator({ withShare: false })
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<AyahActionBar {...makeProps()} />)

    const sheet = await openMore(user)
    await user.click(within(sheet).getByRole('button', { name: /share ayah/i }))

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toContain('/quran/2?ayah=255')

    alertSpy.mockRestore()
  })

  // Requirement 10.8 / 10.11: favorite toggles round-trip. Starting unfavorited,
  // activating calls addFavorite; when already favorited, activating calls
  // removeFavorite. The accessible name reflects current state.
  it('round-trips the favorite toggle and reflects state in the accessible name', async () => {
    const user = userEvent.setup()

    // Unfavorited: label is "Favorite" and activating adds a favorite.
    const addProps = makeProps({ isFavorited: jest.fn(() => false) })
    const { unmount } = render(<AyahActionBar {...addProps} />)
    const favButton = screen.getByRole('button', { name: /^favorite$/i })
    expect(favButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(favButton)
    await waitFor(() => expect(addProps.addFavorite).toHaveBeenCalledTimes(1))
    expect(
      (addProps.addFavorite as jest.Mock).mock.calls[0][0]
    ).toMatchObject({
      ayahNumber: 262,
      numberInSurah: 255,
      surahNumber: 2,
    })
    unmount()

    // Favorited: label is "Favorited" and activating removes the favorite.
    const removeProps = makeProps({ isFavorited: jest.fn(() => true) })
    render(<AyahActionBar {...removeProps} />)
    const favoritedButton = screen.getByRole('button', { name: /^favorited$/i })
    expect(favoritedButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(favoritedButton)
    await waitFor(() => expect(removeProps.removeFavorite).toHaveBeenCalledWith(262))
  })

  // Requirement 10.9 / 10.11: bookmark toggles round-trip. A matching bookmark
  // means the label is "Bookmarked" and activating deletes; no matching
  // bookmark means "Bookmark" and activating saves.
  it('round-trips the bookmark toggle and reflects state in the accessible name', async () => {
    const user = userEvent.setup()

    // No bookmark for this ayah: label is "Bookmark" and activating saves.
    const saveProps = makeProps({ getBookmark: jest.fn(() => undefined) })
    const { unmount } = render(<AyahActionBar {...saveProps} />)
    const bookmarkButton = screen.getByRole('button', { name: /^bookmark$/i })
    expect(bookmarkButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(bookmarkButton)
    await waitFor(() => expect(saveProps.saveBookmark).toHaveBeenCalledWith(2, 255))
    unmount()

    // Bookmark points at this ayah: label is "Bookmarked" and activating deletes.
    const bookmark: BookmarkData = {
      user_id: 'u1',
      surah_number: 2,
      ayah_number: 255,
    }
    const deleteProps = makeProps({ getBookmark: jest.fn(() => bookmark) })
    render(<AyahActionBar {...deleteProps} />)
    const bookmarkedButton = screen.getByRole('button', { name: /^bookmarked$/i })
    expect(bookmarkedButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(bookmarkedButton)
    await waitFor(() => expect(deleteProps.deleteBookmark).toHaveBeenCalledWith(2))
  })

  // Requirement 10.10: the tafsir action opens the tafsir reading view.
  it('opens the tafsir view when the tafsir action is activated', async () => {
    const user = userEvent.setup()
    render(<AyahActionBar {...makeProps()} />)

    expect(screen.queryByTestId('tafsir-view')).not.toBeInTheDocument()

    const sheet = await openMore(user)
    await user.click(within(sheet).getByRole('button', { name: /read tafsir/i }))

    await waitFor(() =>
      expect(screen.getByTestId('tafsir-view')).toBeInTheDocument()
    )
  })
})
