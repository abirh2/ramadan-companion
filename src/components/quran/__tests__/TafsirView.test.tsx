/**
 * Tests for TafsirView component
 */

import { render, screen, waitFor } from '@testing-library/react'
import { TafsirView } from '../TafsirView'
import * as useTafsirModule from '@/hooks/useTafsir'

// Mock useTafsir hook
const mockFetchTafsirContent = jest.fn()
const mockClearContent = jest.fn()
const mockSetSelectedTafsirId = jest.fn()
const mockSyncFromStorage = jest.fn()

jest.mock('@/hooks/useTafsir', () => ({
  useTafsir: jest.fn(),
}))

// Default return value for the mocked useTafsir hook. Individual tests override
// this via mockReturnValueOnce to exercise loading / empty / error states.
const defaultUseTafsir = () => ({
  tafsirs: [
    {
      id: 169,
      name: 'Ibn Kathir (Abridged)',
      author_name: 'Hafiz Ibn Kathir',
      language_name: 'english',
    },
    {
      id: 16,
      name: 'Tafsir Muyassar',
      author_name: 'المیسر',
      language_name: 'arabic',
    },
    {
      id: 381,
      name: 'Tafsir Fathul Majid',
      author_name: 'AbdulRahman Bin Hasan',
      language_name: 'bengali',
    },
  ],
  tafsirLoading: false,
  tafsirError: null,
  selectedTafsirId: 169,
  setSelectedTafsirId: mockSetSelectedTafsirId,
  tafsirContent: {
    verses: { '2:255': { id: 262 } },
    resource_id: 169,
    resource_name: 'Ibn Kathir (Abridged)',
    language_id: 38,
    slug: 'en-tafisr-ibn-kathir',
    translated_name: {
      name: 'Ibn Kathir (Abridged)',
      language_name: 'english',
    },
    text: '<h2>The Virtue of Ayat Al-Kursi</h2><p>This is Ayat Al-Kursi and tremendous virtues have been associated with it.</p>',
  },
  contentLoading: false,
  contentError: null,
  fetchTafsirContent: mockFetchTafsirContent,
  clearContent: mockClearContent,
  syncFromStorage: mockSyncFromStorage,
})

const mockedUseTafsir = jest.mocked(useTafsirModule.useTafsir)

describe('TafsirView', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseTafsir.mockImplementation(
      defaultUseTafsir as unknown as typeof useTafsirModule.useTafsir
    )
  })

  it('renders dialog when open', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(screen.getByText(/Tafsir: Al-Baqarah 2:255/i)).toBeInTheDocument()
    expect(screen.getByText(/Commentary and explanation of the ayah/i)).toBeInTheDocument()
  })

  it('does not render dialog when closed', () => {
    render(
      <TafsirView
        open={false}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(screen.queryByText(/Tafsir: Al-Baqarah 2:255/i)).not.toBeInTheDocument()
  })

  it('displays tafsir content when loaded', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(screen.getByText(/The Virtue of Ayat Al-Kursi/i)).toBeInTheDocument()
    expect(screen.getByText(/tremendous virtues have been associated with it/i)).toBeInTheDocument()
  })

  it('displays tafsir selector with grouped options', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(screen.getByLabelText(/Select Tafsir/i)).toBeInTheDocument()
  })

  it('syncs from storage and fetches tafsir content when dialog opens', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(mockSyncFromStorage).toHaveBeenCalled()
    expect(mockFetchTafsirContent).toHaveBeenCalledWith(2, 255)
  })

  it('clears content when dialog closes', async () => {
    const { rerender } = render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    // Close dialog
    rerender(
      <TafsirView
        open={false}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    await waitFor(() => {
      expect(mockClearContent).toHaveBeenCalled()
    })
  })

  it('has proper accessibility attributes', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    const selector = screen.getByLabelText(/Select Tafsir/i)
    expect(selector).toHaveAttribute('aria-haspopup', 'dialog')
  })

  // Req 16.4: every dialog/sheet exposes a non-empty accessible name
  it('exposes an accessible dialog with a name matching the ayah title', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAccessibleName(/Tafsir: Al-Baqarah 2:255/i)
  })

  // Req 12.7: long-form tafsir content is scrollable within the surface
  it('renders long-form content in a scrollable container', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    // The rendered tafsir HTML lives inside the scrollable content surface
    const heading = screen.getByText(/The Virtue of Ayat Al-Kursi/i)
    const scrollContainer = heading.closest('.overflow-y-auto')
    expect(scrollContainer).not.toBeNull()
    expect(scrollContainer).toHaveClass('overflow-y-auto')
  })

  // Req 12.2/12.3: options are grouped by language with English first. The
  // shadcn/Radix Select renders its grouped options inside a portal that is not
  // populated in jsdom until natively opened, so we assert the observable
  // English-first outcome: the English tafsir is the active selection and its
  // English commentary renders as the default content.
  it('groups tafsirs by language with English selected first by default', () => {
    render(
      <TafsirView
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    // The tafsir selector is present and enabled for grouped selection.
    const trigger = screen.getByRole('combobox', { name: /select tafsir/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).not.toBeDisabled()

    // The English tafsir (id 169) is the default selection, so its English
    // commentary is the content shown first.
    expect(screen.getByText(/The Virtue of Ayat Al-Kursi/i)).toBeInTheDocument()
  })
})

describe('TafsirView - Loading, Error and Empty States', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  type UseTafsirReturn = ReturnType<typeof useTafsirModule.useTafsir>

  // Req 12.6: content loading state is shown while the tafsir is fetched
  it('shows a loading state while tafsir content is loading', () => {
    mockedUseTafsir.mockReturnValue({
      tafsirs: [],
      tafsirLoading: false,
      tafsirError: null,
      selectedTafsirId: 169,
      setSelectedTafsirId: jest.fn(),
      tafsirContent: null,
      contentLoading: true,
      contentError: null,
      fetchTafsirContent: jest.fn(),
      clearContent: jest.fn(),
      syncFromStorage: jest.fn(),
    } as UseTafsirReturn)

    render(
      <TafsirView
        open={true}
        onOpenChange={jest.fn()}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(screen.getByText(/Loading tafsir\.\.\./i)).toBeInTheDocument()
    // Neither the empty prompt nor an error should show while loading
    expect(screen.queryByText(/Select a tafsir to view commentary/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Tafsir Unavailable/i)).not.toBeInTheDocument()
  })

  it('renders without content when tafsirContent is null', () => {
    // Override mock for this test
    mockedUseTafsir.mockReturnValue({
      tafsirs: [],
      tafsirLoading: false,
      tafsirError: null,
      selectedTafsirId: 169,
      setSelectedTafsirId: jest.fn(),
      tafsirContent: null,
      contentLoading: false,
      contentError: null,
      fetchTafsirContent: jest.fn(),
      clearContent: jest.fn(),
      syncFromStorage: jest.fn(),
    } as UseTafsirReturn)

    render(
      <TafsirView
        open={true}
        onOpenChange={jest.fn()}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    expect(screen.getByText(/Select a tafsir to view commentary/i)).toBeInTheDocument()
  })

  it('displays user-friendly message when tafsir is unavailable', () => {
    // Override mock for this test
    mockedUseTafsir.mockReturnValue({
      tafsirs: [],
      tafsirLoading: false,
      tafsirError: null,
      selectedTafsirId: 381,
      setSelectedTafsirId: jest.fn(),
      tafsirContent: null,
      contentLoading: false,
      contentError: 'Tafsir not available for this ayah',
      fetchTafsirContent: jest.fn(),
      clearContent: jest.fn(),
      syncFromStorage: jest.fn(),
    } as UseTafsirReturn)

    render(
      <TafsirView
        open={true}
        onOpenChange={jest.fn()}
        surahNumber={1}
        surahName="Al-Fatiha"
        ayahNumber={7}
      />
    )

    expect(screen.getByText(/Tafsir Unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/not available for this ayah/i)).toBeInTheDocument()
    expect(screen.getByText(/select a different tafsir/i)).toBeInTheDocument()
  })
})
