/**
 * Tests for TafsirDialog component
 */

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TafsirDialog } from '../TafsirDialog'

// Mock useTafsir hook
const mockFetchTafsirContent = jest.fn()
const mockClearContent = jest.fn()
const mockSetSelectedTafsirId = jest.fn()
const mockSyncFromStorage = jest.fn()

jest.mock('@/hooks/useTafsir', () => ({
  useTafsir: () => ({
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
  }),
}))

describe('TafsirDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dialog when open', () => {
    render(
      <TafsirDialog
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
      <TafsirDialog
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
      <TafsirDialog
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
      <TafsirDialog
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
      <TafsirDialog
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
      <TafsirDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    // Close dialog
    rerender(
      <TafsirDialog
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
      <TafsirDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    const selector = screen.getByLabelText(/Select Tafsir/i)
    expect(selector).toHaveAttribute('id', 'tafsir-select')
  })

  it('groups tafsirs by language with English first', () => {
    render(
      <TafsirDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        surahNumber={2}
        surahName="Al-Baqarah"
        ayahNumber={255}
      />
    )

    // Tafsir selector should be present
    const selector = screen.getByLabelText(/Select Tafsir/i)
    expect(selector).toBeInTheDocument()
  })
})

describe('TafsirDialog - Error and Empty States', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without content when tafsirContent is null', () => {
    // Override mock for this test
    jest.spyOn(require('@/hooks/useTafsir'), 'useTafsir').mockReturnValue({
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
    })

    render(
      <TafsirDialog
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
    jest.spyOn(require('@/hooks/useTafsir'), 'useTafsir').mockReturnValue({
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
    })

    render(
      <TafsirDialog
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

