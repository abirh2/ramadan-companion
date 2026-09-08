/**
 * Tests for ReadingControlsBar + ControlSheet and the wrapped selectors
 * (TranslationSelector / ReciterSelector).
 *
 * Task 8.4 — validates Requirements 6.1, 6.2, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9,
 * 6.10, 6.11, 7.2, 7.3, 7.4, 7.5, 8.1, 8.3, 8.4.
 *
 * Presentation-only guardrail: these tests assert behavior of the redesigned
 * presentation layer without modifying components, hooks, lib, or types.
 */

import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReadingControlsBar } from '../ReadingControlsBar'
import { ControlSheet } from '../ControlSheet'
import { TranslationSelector } from '../TranslationSelector'
import { ReciterSelector } from '../ReciterSelector'
import { QURAN_TRANSLATIONS } from '@/types/quran.types'
import { AVAILABLE_RECITERS, DEFAULT_RECITER } from '@/lib/quranAudio'

/**
 * Matches an option whose accessible name contains the given text. Option names
 * for translations concatenate the translation name and its description, and
 * reciter names may contain regex-special characters, so we compare on plain
 * substring text rather than a constructed regex.
 */
const optionWithText = (text: string) => (_name: string, el: Element) =>
  el.getAttribute('role') === 'option' && (el.textContent ?? '').includes(text)

// --- useAuth mock: lets each test set the authenticated user -----------------
const mockUser: { current: { id: string } | null } = { current: null }
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser.current }),
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

beforeEach(() => {
  jest.clearAllMocks()
  mockUser.current = null
  localStorage.clear()
})

function renderBar(overrides: Partial<React.ComponentProps<typeof ReadingControlsBar>> = {}) {
  const props = {
    translation: 'en.sahih' as const,
    onTranslationChange: jest.fn(),
    reciter: DEFAULT_RECITER,
    onReciterChange: jest.fn(),
    surahNumber: 2,
    totalAyahs: 286,
    bookmark: null,
    onGoToBookmark: jest.fn(),
    ...overrides,
  }
  render(<ReadingControlsBar {...props} />)
  return props
}

describe('ReadingControlsBar — inline controls with visible text labels', () => {
  it('renders translation and reciter chips inline with persistent visible text labels (6.1, 6.2, 6.4, 6.5, 6.6)', () => {
    renderBar({ translation: 'en.sahih' })

    // Persistent visible text labels on each chip.
    const translationChip = screen.getByRole('button', { name: /translation:/i })
    const reciterChip = screen.getByRole('button', { name: /reciter:/i })

    expect(translationChip).toBeInTheDocument()
    expect(reciterChip).toBeInTheDocument()

    // The label text is visible in the DOM (not hidden behind an unlabeled affordance).
    expect(within(translationChip).getByText(/translation:/i)).toBeVisible()
    expect(within(reciterChip).getByText(/reciter:/i)).toBeVisible()

    // Chip shows the currently selected translation name.
    const selected = QURAN_TRANSLATIONS.find((t) => t.id === 'en.sahih')!
    expect(within(translationChip).getByText(selected.name)).toBeVisible()
  })

  it('shows the currently selected reciter name in the reciter chip label (6.5)', () => {
    renderBar({ reciter: DEFAULT_RECITER })
    const reciter = AVAILABLE_RECITERS.find((r) => r.identifier === DEFAULT_RECITER)!
    const reciterChip = screen.getByRole('button', { name: /reciter:/i })
    expect(within(reciterChip).getByText(reciter.englishName)).toBeVisible()
  })

  it('renders the go-to-ayah control inline and, when a bookmark exists, a go-to-bookmark control', () => {
    const onGoToBookmark = jest.fn()
    renderBar({ bookmark: { ayah_number: 42 } as never, onGoToBookmark })

    expect(screen.getByRole('button', { name: /go to ayah/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /go to bookmarked ayah 42/i })
    ).toBeInTheDocument()
  })

  it('omits the go-to-bookmark control when no bookmark exists', () => {
    renderBar({ bookmark: null })
    expect(
      screen.queryByRole('button', { name: /go to bookmark/i })
    ).not.toBeInTheDocument()
  })
})

describe('ControlSheet — sheet from ui/sheet, accessible name, focus behavior', () => {
  it('opens a labelled dialog and moves focus into the sheet on open (6.3, 6.7, 6.8)', async () => {
    const user = userEvent.setup()
    renderBar()

    // No dialog before opening.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /translation:/i }))

    // Sheet appears with an accessible name.
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName(/translation/i)

    // Focus moves into the sheet (Radix focus trap).
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
  })

  it('returns focus to the trigger when the sheet closes (6.7)', async () => {
    const user = userEvent.setup()
    renderBar()

    const trigger = screen.getByRole('button', { name: /translation:/i })
    await user.click(trigger)
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('renders the wrapped TranslationSelector inside the sheet (6.3)', async () => {
    const user = userEvent.setup()
    renderBar()

    await user.click(screen.getByRole('button', { name: /translation:/i }))
    const dialog = await screen.findByRole('dialog')

    // The existing selector (a combobox) is rendered as-is inside the sheet.
    expect(within(dialog).getByRole('combobox')).toBeInTheDocument()
  })
})

describe('ControlSheet — open-failure path preserves selections and shows an indication (6.11)', () => {
  it('surfaces an inline indication and leaves children/selections unchanged when the body throws', () => {
    const Boom = () => {
      throw new Error('sheet body failed to render')
    }
    // Silence the expected React error-boundary console noise.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ControlSheet open onOpenChange={jest.fn()} title="Reading settings">
        <Boom />
      </ControlSheet>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/could not be shown/i)
    expect(alert).toHaveTextContent(/selections are\s+unchanged/i)

    // The dialog itself still renders with its accessible name; the bar stays operable.
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/reading settings/i)

    spy.mockRestore()
  })
})

describe('TranslationSelector — persistence and offered set (6.9, 7.2, 7.3, 7.4, 7.5)', () => {
  it('offers exactly the QURAN_TRANSLATIONS set as options (7.5)', async () => {
    const user = userEvent.setup()
    render(
      <TranslationSelector
        currentTranslation="en.sahih"
        onTranslationChange={jest.fn()}
      />
    )

    await user.click(screen.getByRole('combobox'))

    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(QURAN_TRANSLATIONS.length)
    for (const t of QURAN_TRANSLATIONS) {
      expect(screen.getByRole('option', { name: optionWithText(t.name) })).toBeInTheDocument()
    }
  })

  it('writes the selected id to localStorage["quran_translation"] and calls onChange (7.2, 6.9)', async () => {
    const user = userEvent.setup()
    const onTranslationChange = jest.fn()
    // Unauthenticated: only localStorage should be written, no Supabase call.
    mockUser.current = null

    render(
      <TranslationSelector
        currentTranslation="en.sahih"
        onTranslationChange={onTranslationChange}
      />
    )

    const target = QURAN_TRANSLATIONS.find((t) => t.id !== 'en.sahih')!

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: optionWithText(target.name) }))

    await waitFor(() => {
      expect(localStorage.getItem('quran_translation')).toBe(target.id)
    })
    expect(onTranslationChange).toHaveBeenCalledWith(target.id)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('updates profiles.quran_translation via Supabase when authenticated (7.3, 7.4)', async () => {
    const user = userEvent.setup()
    mockUser.current = { id: 'user-123' }

    render(
      <TranslationSelector
        currentTranslation="en.sahih"
        onTranslationChange={jest.fn()}
      />
    )

    const target = QURAN_TRANSLATIONS.find((t) => t.id !== 'en.sahih')!

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: optionWithText(target.name) }))

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('profiles')
    })
    expect(mockUpdate).toHaveBeenCalledWith({ quran_translation: target.id })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
    // localStorage is still written alongside the profile.
    expect(localStorage.getItem('quran_translation')).toBe(target.id)
  })
})

describe('ReciterSelector — offered set, default, and no persistence (8.1, 8.3, 8.4)', () => {
  it('offers exactly the AVAILABLE_RECITERS set as options (8.1)', async () => {
    const user = userEvent.setup()
    render(
      <ReciterSelector
        currentReciter={DEFAULT_RECITER}
        onReciterChange={jest.fn()}
      />
    )

    await user.click(screen.getByRole('combobox'))

    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(AVAILABLE_RECITERS.length)
    for (const r of AVAILABLE_RECITERS) {
      // Reciter option accessible name is exactly the englishName.
      expect(screen.getByRole('option', { name: r.englishName })).toBeInTheDocument()
    }
  })

  it('reflects DEFAULT_RECITER as the current value (8.3)', () => {
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
  })

  it('selecting a reciter is session-local only: no localStorage or profile writes (8.4)', async () => {
    const user = userEvent.setup()
    const onReciterChange = jest.fn()
    mockUser.current = { id: 'user-123' }

    render(
      <ReciterSelector
        currentReciter={DEFAULT_RECITER}
        onReciterChange={onReciterChange}
      />
    )

    const target = AVAILABLE_RECITERS.find(
      (r) => r.identifier !== DEFAULT_RECITER
    )!

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: target.englishName }))

    expect(onReciterChange).toHaveBeenCalledWith(target.identifier)
    // No persistence side effects for the reciter.
    expect(localStorage.length).toBe(0)
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
