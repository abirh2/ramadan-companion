/**
 * Property-based tests for TranslationSelector / ReciterSelector persistence
 * and control-set behavior.
 *
 * Task 14.4 — Correctness Properties 10, 11, 12.
 *   Property 10: Translation selection persists to the fixed keys
 *                (Validates: 6.9, 7.2, 7.3, 7.4, 20.4).
 *   Property 11: Reciter selection is never persisted (Validates: 6.10, 8.4).
 *   Property 12: Controls offer the full sets and the reciter default
 *                (Validates: 7.5, 8.1, 8.3).
 *
 * Presentation/test-only guardrail: these tests assert existing behavior of the
 * selectors without modifying components, hooks, lib, or types. They use
 * fast-check (the project's property-based testing library) with a minimum of
 * 100 iterations each.
 */

import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import fc from 'fast-check'
import { TranslationSelector } from '../TranslationSelector'
import { ReciterSelector } from '../ReciterSelector'
import {
  QURAN_TRANSLATIONS,
  QuranTranslationId,
  QuranReciterId,
} from '@/types/quran.types'
import { AVAILABLE_RECITERS, DEFAULT_RECITER } from '@/lib/quranAudio'

/**
 * Matches an option whose accessible name contains the given text. Translation
 * option names concatenate the translation name and its description, so we
 * compare on plain substring text rather than a constructed regex.
 */
const optionWithText = (text: string) => (_name: string, el: Element) =>
  el.getAttribute('role') === 'option' && (el.textContent ?? '').includes(text)

// --- useAuth mock: lets each iteration set the authenticated user ------------
const mockUser: { current: { id: string } | null } = { current: null }
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser.current }),
  useOptionalAuth: () => ({ user: mockUser.current }),
}))

// --- Supabase client mock: captures profile writes ---------------------------
const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })
const mockUpdate = jest.fn(() => ({ eq: mockEq }))
const mockFrom = jest.fn(() => ({ update: mockUpdate }))
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}))

// jsdom does not implement the pointer/scroll APIs Radix Select relies on.
// Stub them so the real Select can open and receive an item selection.
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = jest.fn(() => false)
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = jest.fn()
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = jest.fn()
  }
})

/** Reset shared mock/global state between iterations. */
function resetState() {
  jest.clearAllMocks()
  mockUser.current = null
  localStorage.clear()
  cleanup()
}

// Generators over the fixed control sets.
const translationIdArb = fc.constantFrom(
  ...QURAN_TRANSLATIONS.map((t) => t.id)
)
const reciterIdArb = fc.constantFrom(
  ...AVAILABLE_RECITERS.map((r) => r.identifier as QuranReciterId)
)

// These property tests each run 100 iterations that render Radix Select
// overlays, which is slower than the 5s default. Give the suite headroom so
// timing (not correctness) never flakes the run.
jest.setTimeout(30000)

describe('TranslationSelector / ReciterSelector — persistence & control-set properties', () => {
  // Feature: quran-reading-experience-redesign, Property 10: Translation selection persists to the fixed keys
  // For any translation id in QURAN_TRANSLATIONS, selecting it writes that id to
  // localStorage['quran_translation'] and, when authenticated, updates
  // profiles.quran_translation with that id, matching the pre-redesign persistence exactly.
  // Validates: Requirements 6.9, 7.2, 7.3, 7.4, 20.4
  it('Property 10: translation selection persists to the fixed keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        translationIdArb,
        fc.boolean(),
        async (targetId, authenticated) => {
          resetState()
          mockUser.current = authenticated ? { id: 'user-123' } : null

          // Start from a different translation so selecting `targetId` is a change.
          const startId = (QURAN_TRANSLATIONS.find((t) => t.id !== targetId)
            ?.id ?? targetId) as QuranTranslationId
          const onTranslationChange = jest.fn()
          const user = userEvent.setup()

          render(
            <TranslationSelector
              currentTranslation={startId}
              onTranslationChange={onTranslationChange}
            />
          )

          const target = QURAN_TRANSLATIONS.find((t) => t.id === targetId)!

          await user.click(screen.getByRole('combobox'))
          await user.click(
            await screen.findByRole('option', {
              name: optionWithText(target.name),
            })
          )

          // localStorage is always written with the selected id.
          await waitFor(() => {
            expect(localStorage.getItem('quran_translation')).toBe(targetId)
          })
          expect(onTranslationChange).toHaveBeenCalledWith(targetId)

          if (authenticated) {
            // The profile write targets profiles.quran_translation for this user.
            await waitFor(() => {
              expect(mockFrom).toHaveBeenCalledWith('profiles')
            })
            expect(mockUpdate).toHaveBeenCalledWith({
              quran_translation: targetId,
            })
            expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
          } else {
            // Unauthenticated: no profile write, only localStorage.
            expect(mockFrom).not.toHaveBeenCalled()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 11: Reciter selection is never persisted
  // For any reciter id in AVAILABLE_RECITERS, selecting it updates only session-local
  // state and produces no write to localStorage and no write to the user profiles
  // record for the reciter.
  // Validates: Requirements 6.10, 8.4
  it('Property 11: reciter selection is never persisted', async () => {
    await fc.assert(
      fc.asyncProperty(
        reciterIdArb,
        fc.boolean(),
        async (targetId, authenticated) => {
          resetState()
          // Even when authenticated, no persistence should occur for the reciter.
          mockUser.current = authenticated ? { id: 'user-123' } : null

          const startId = (AVAILABLE_RECITERS.find(
            (r) => r.identifier !== targetId
          )?.identifier ?? targetId) as QuranReciterId
          const onReciterChange = jest.fn()
          const user = userEvent.setup()

          render(
            <ReciterSelector
              currentReciter={startId}
              onReciterChange={onReciterChange}
            />
          )

          const target = AVAILABLE_RECITERS.find(
            (r) => r.identifier === targetId
          )!

          await user.click(screen.getByRole('combobox'))
          await user.click(
            await screen.findByRole('option', {
              name: target.englishName,
            })
          )

          // Session-local update only.
          expect(onReciterChange).toHaveBeenCalledWith(targetId)
          // No persistence side effects: no localStorage, no profile write.
          expect(localStorage.length).toBe(0)
          expect(mockFrom).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: quran-reading-experience-redesign, Property 12: Controls offer the full sets and the reciter default
  // The translation control offers exactly the ids in QURAN_TRANSLATIONS, and the
  // reciter control offers exactly the ids in AVAILABLE_RECITERS and resolves to
  // DEFAULT_RECITER when no reciter has been selected in the session.
  // Validates: Requirements 7.5, 8.1, 8.3
  it('Property 12: controls offer the full sets and the reciter default', async () => {
    await fc.assert(
      fc.asyncProperty(
        translationIdArb,
        reciterIdArb,
        async (currentTranslation, currentReciter) => {
          resetState()
          const user = userEvent.setup()

          // --- Translation control offers exactly QURAN_TRANSLATIONS ---------
          render(
            <TranslationSelector
              currentTranslation={currentTranslation}
              onTranslationChange={jest.fn()}
            />
          )
          await user.click(screen.getByRole('combobox'))
          const translationOptions = await screen.findAllByRole('option')
          expect(translationOptions).toHaveLength(QURAN_TRANSLATIONS.length)
          for (const t of QURAN_TRANSLATIONS) {
            expect(
              screen.getByRole('option', { name: optionWithText(t.name) })
            ).toBeInTheDocument()
          }
          cleanup()

          // --- Reciter control offers exactly AVAILABLE_RECITERS -------------
          render(
            <ReciterSelector
              currentReciter={currentReciter}
              onReciterChange={jest.fn()}
            />
          )
          await user.click(screen.getByRole('combobox'))
          const reciterOptions = await screen.findAllByRole('option')
          expect(reciterOptions).toHaveLength(AVAILABLE_RECITERS.length)
          for (const r of AVAILABLE_RECITERS) {
            expect(
              screen.getByRole('option', { name: r.englishName })
            ).toBeInTheDocument()
          }
          cleanup()

          // --- Reciter resolves to DEFAULT_RECITER with no session selection --
          render(
            <ReciterSelector
              currentReciter={DEFAULT_RECITER}
              onReciterChange={jest.fn()}
            />
          )
          const defaultReciter = AVAILABLE_RECITERS.find(
            (r) => r.identifier === DEFAULT_RECITER
          )!
          expect(screen.getByRole('combobox')).toHaveTextContent(
            defaultReciter.englishName
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
