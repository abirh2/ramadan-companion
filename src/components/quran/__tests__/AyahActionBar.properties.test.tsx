/**
 * Property-based tests for AyahActionBar.
 *
 * Feature: quran-reading-experience-redesign
 *   - Property 13: Favorite and bookmark toggles round-trip (Requirements 10.8, 10.9).
 *   - Property 14: Every ayah action exposes a state-reflecting accessible label
 *     (Requirement 10.11).
 *
 * Uses the project's property-based library, fast-check, at a minimum of 100
 * iterations per property. AyahAudioPlayer and TafsirView are mocked so the
 * render is deterministic, following the mock/navigator patterns established in
 * AyahActionBar.test.tsx.
 */

import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import fc from 'fast-check'
import { AyahActionBar } from '../AyahActionBar'
import type { QuranFavoriteData, BookmarkData } from '@/types/quran.types'

// -----------------------------------------------------------------------------
// Mock the listen control. The real AyahAudioPlayer is covered by its own test;
// here it is a stable stand-in carrying an accessible "listen" name.
// -----------------------------------------------------------------------------
jest.mock('../AyahAudioPlayer', () => ({
  AyahAudioPlayer: ({ globalAyahNumber }: { globalAyahNumber: number }) => (
    <button type="button" aria-label="Play recitation" data-testid="listen">
      listen {globalAyahNumber}
    </button>
  ),
}))

// -----------------------------------------------------------------------------
// Mock TafsirView. It only renders when opened; irrelevant to these properties.
// -----------------------------------------------------------------------------
jest.mock('../TafsirView', () => ({
  TafsirView: ({ open }: { open: boolean }) =>
    open ? <div data-testid="tafsir-view">tafsir</div> : null,
}))

// jsdom exposes navigator.clipboard as a read-only getter, so it must be
// redefined rather than assigned. A stub keeps copy/share handlers from
// throwing while the properties exercise favorite/bookmark and labels.
function installNavigatorStub() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  })
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: undefined,
  })
}

interface HarnessArgs {
  surahNumber: number
  ayahNumber: number
  globalNumber: number
  initialFavorited: boolean
  initialBookmarked: boolean
  spies: {
    addFavorite: jest.Mock
    removeFavorite: jest.Mock
    saveBookmark: jest.Mock
    deleteBookmark: jest.Mock
  }
}

/**
 * Stateful harness that owns the per-ayah favorite and bookmark state in React
 * state and passes toggle handlers that update it, mirroring how the parent
 * reader drives these controlled toggles. Updating the state re-renders
 * AyahActionBar with fresh `isFavorited` / `getBookmark` results, so the round
 * trip is observable through the accessible name — exactly what Property 13
 * asserts. The passed spies let tests confirm the correct handler was called.
 */
function ActionBarHarness({
  surahNumber,
  ayahNumber,
  globalNumber,
  initialFavorited,
  initialBookmarked,
  spies,
}: HarnessArgs) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [bookmark, setBookmark] = useState<BookmarkData | undefined>(
    initialBookmarked
      ? { user_id: 'u1', surah_number: surahNumber, ayah_number: ayahNumber }
      : undefined
  )

  return (
    <AyahActionBar
      surahNumber={surahNumber}
      surahName="Al-Baqarah"
      ayahNumber={ayahNumber}
      globalNumber={globalNumber}
      arabicText="اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ"
      translationText="God: there is no deity save Him"
      reciter="ar.alafasy"
      isFavorited={() => favorited}
      addFavorite={async (data: QuranFavoriteData) => {
        spies.addFavorite(data)
        setFavorited(true)
        return true
      }}
      removeFavorite={async (n: number) => {
        spies.removeFavorite(n)
        setFavorited(false)
        return true
      }}
      getBookmark={() => bookmark}
      saveBookmark={async (s: number, a: number) => {
        spies.saveBookmark(s, a)
        setBookmark({ user_id: 'u1', surah_number: s, ayah_number: a })
        return true
      }}
      deleteBookmark={async (s: number) => {
        spies.deleteBookmark(s)
        setBookmark(undefined)
        return true
      }}
    />
  )
}

function makeSpies() {
  return {
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    saveBookmark: jest.fn(),
    deleteBookmark: jest.fn(),
  }
}

// Arbitraries: valid-shaped surah/ayah/global numbers and initial toggle states.
const surahArb = fc.integer({ min: 1, max: 114 })
const ayahArb = fc.integer({ min: 1, max: 286 })
const globalArb = fc.integer({ min: 1, max: 6236 })
const boolArb = fc.boolean()

describe('AyahActionBar — property-based', () => {
  beforeEach(() => {
    installNavigatorStub()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  // Feature: quran-reading-experience-redesign, Property 13: For any initial favorite or bookmark state, activating the corresponding toggle changes the state and updates the control to reflect it, and activating it again restores the original state.
  it('round-trips the favorite and bookmark toggles for any initial state (Property 13)', async () => {
    await fc.assert(
      fc.asyncProperty(
        surahArb,
        ayahArb,
        globalArb,
        boolArb,
        boolArb,
        async (surahNumber, ayahNumber, globalNumber, initialFavorited, initialBookmarked) => {
          const user = userEvent.setup()
          const spies = makeSpies()

          const { unmount } = render(
            <ActionBarHarness
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              globalNumber={globalNumber}
              initialFavorited={initialFavorited}
              initialBookmarked={initialBookmarked}
              spies={spies}
            />
          )

          // --- Favorite round-trip ---------------------------------------
          // The control reflects the initial favorite state.
          const favName = initialFavorited ? /^favorited$/i : /^favorite$/i
          expect(
            screen.getByRole('button', { name: favName })
          ).toHaveAttribute('aria-pressed', String(initialFavorited))

          // First activation flips the state and calls the matching handler.
          await user.click(screen.getByRole('button', { name: favName }))
          if (initialFavorited) {
            await waitFor(() =>
              expect(spies.removeFavorite).toHaveBeenCalledWith(globalNumber)
            )
          } else {
            await waitFor(() =>
              expect(spies.addFavorite).toHaveBeenCalledTimes(1)
            )
            expect(spies.addFavorite.mock.calls[0][0]).toMatchObject({
              ayahNumber: globalNumber,
              numberInSurah: ayahNumber,
              surahNumber,
            })
          }

          // The control re-renders to reflect the toggled state.
          const toggledFavName = initialFavorited ? /^favorite$/i : /^favorited$/i
          await waitFor(() =>
            expect(
              screen.getByRole('button', { name: toggledFavName })
            ).toHaveAttribute('aria-pressed', String(!initialFavorited))
          )

          // Second activation restores the original state.
          await user.click(screen.getByRole('button', { name: toggledFavName }))
          await waitFor(() =>
            expect(
              screen.getByRole('button', { name: favName })
            ).toHaveAttribute('aria-pressed', String(initialFavorited))
          )

          // --- Bookmark round-trip ---------------------------------------
          const bmName = initialBookmarked ? /^bookmarked$/i : /^bookmark$/i
          expect(
            screen.getByRole('button', { name: bmName })
          ).toHaveAttribute('aria-pressed', String(initialBookmarked))

          await user.click(screen.getByRole('button', { name: bmName }))
          if (initialBookmarked) {
            await waitFor(() =>
              expect(spies.deleteBookmark).toHaveBeenCalledWith(surahNumber)
            )
          } else {
            await waitFor(() =>
              expect(spies.saveBookmark).toHaveBeenCalledWith(surahNumber, ayahNumber)
            )
          }

          const toggledBmName = initialBookmarked ? /^bookmark$/i : /^bookmarked$/i
          await waitFor(() =>
            expect(
              screen.getByRole('button', { name: toggledBmName })
            ).toHaveAttribute('aria-pressed', String(!initialBookmarked))
          )

          // Toggle back restores the original bookmark state.
          await user.click(screen.getByRole('button', { name: toggledBmName }))
          await waitFor(() =>
            expect(
              screen.getByRole('button', { name: bmName })
            ).toHaveAttribute('aria-pressed', String(initialBookmarked))
          )

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  }, 120000)

  // Feature: quran-reading-experience-redesign, Property 14: For any ayah action control (listen, favorite, copy, bookmark, tafsir, share, and More), a non-empty accessible label is present, and for toggle actions the label differs between the on and off states.
  it('exposes a non-empty accessible label for every action, differing per state for toggles (Property 14)', async () => {
    await fc.assert(
      fc.asyncProperty(
        surahArb,
        ayahArb,
        globalArb,
        boolArb,
        boolArb,
        async (surahNumber, ayahNumber, globalNumber, initialFavorited, initialBookmarked) => {
          const user = userEvent.setup()
          const spies = makeSpies()

          const { unmount } = render(
            <ActionBarHarness
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              globalNumber={globalNumber}
              initialFavorited={initialFavorited}
              initialBookmarked={initialBookmarked}
              spies={spies}
            />
          )

          // Directly-visible controls: listen, favorite, copy, bookmark, More.
          const listen = screen.getByTestId('listen')
          const favControl = screen.getByRole('button', {
            name: initialFavorited ? /^favorited$/i : /^favorite$/i,
          })
          const copyControl = screen.getByRole('button', { name: /copy ayah/i })
          const bmControl = screen.getByRole('button', {
            name: initialBookmarked ? /^bookmarked$/i : /^bookmark$/i,
          })
          const moreControl = screen.getByRole('button', { name: /more actions/i })

          const directControls = [listen, favControl, copyControl, bmControl, moreControl]
          for (const control of directControls) {
            const name =
              control.getAttribute('aria-label') ??
              control.textContent?.trim() ??
              ''
            expect(name.length).toBeGreaterThan(0)
          }

          // Overflow controls (tafsir, share) live behind More.
          await user.click(moreControl)
          const sheet = await screen.findByRole('dialog')
          const tafsirControl = within(sheet).getByRole('button', {
            name: /read tafsir/i,
          })
          const shareControl = within(sheet).getByRole('button', {
            name: /share ayah/i,
          })
          for (const control of [tafsirControl, shareControl]) {
            expect((control.getAttribute('aria-label') ?? '').length).toBeGreaterThan(0)
          }

          // Toggle actions expose a state-reflecting label: the favorite and
          // bookmark labels differ between their on and off states.
          const favOn = 'Favorited'
          const favOff = 'Favorite'
          expect(favOn).not.toBe(favOff)
          const bmOn = 'Bookmarked'
          const bmOff = 'Bookmark'
          expect(bmOn).not.toBe(bmOff)

          // The rendered favorite/bookmark label matches the initial state.
          expect(favControl.getAttribute('aria-label')).toBe(
            initialFavorited ? favOn : favOff
          )
          expect(bmControl.getAttribute('aria-label')).toBe(
            initialBookmarked ? bmOn : bmOff
          )

          unmount()
        }
      ),
      { numRuns: 100 }
    )
  }, 120000)
})
