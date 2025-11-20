/**
 * Tests for useTafsir hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { useTafsir } from '../useTafsir'

// Mock fetch
global.fetch = jest.fn()

const mockTafsirListResponse = {
  tafsirs: [
    {
      id: 169,
      name: 'Ibn Kathir (Abridged)',
      author_name: 'Hafiz Ibn Kathir',
      slug: 'en-tafisr-ibn-kathir',
      language_name: 'english',
      translated_name: {
        name: 'Ibn Kathir (Abridged)',
        language_name: 'english',
      },
    },
    {
      id: 16,
      name: 'Tafsir Muyassar',
      author_name: 'المیسر',
      slug: 'ar-tafsir-muyassar',
      language_name: 'arabic',
      translated_name: {
        name: 'Tafsir Muyassar',
        language_name: 'english',
      },
    },
  ],
}

const mockTafsirContentResponse = {
  tafsir: {
    verses: { '2:255': { id: 262 } },
    resource_id: 169,
    resource_name: 'Ibn Kathir (Abridged)',
    language_id: 38,
    slug: 'en-tafisr-ibn-kathir',
    translated_name: {
      name: 'Ibn Kathir (Abridged)',
      language_name: 'english',
    },
    text: '<h2>The Virtue of Ayat Al-Kursi</h2><p>This is Ayat Al-Kursi.</p>',
  },
}

describe('useTafsir', () => {
  let mockSessionStorage: { [key: string]: string } = {}

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    
    // Mock sessionStorage
    mockSessionStorage = {}
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockSessionStorage[key] = value
        }),
        clear: jest.fn(() => {
          mockSessionStorage = {}
        }),
      },
      writable: true,
    })
  })

  it('fetches tafsir list on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    expect(result.current.tafsirLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    expect(result.current.tafsirs).toHaveLength(2)
    expect(result.current.tafsirs[0].name).toBe('Ibn Kathir (Abridged)')
    expect(result.current.tafsirError).toBeNull()
  })

  it('handles tafsir list fetch error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    expect(result.current.tafsirs).toHaveLength(0)
    expect(result.current.tafsirError).toContain('Failed to fetch tafsir list')
  })

  it('fetches tafsir content for specific ayah', async () => {
    // Mock tafsir list fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    // Mock tafsir content fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirContentResponse,
    })

    await act(async () => {
      await result.current.fetchTafsirContent(2, 255)
    })

    await waitFor(() => {
      expect(result.current.contentLoading).toBe(false)
    })

    expect(result.current.tafsirContent).not.toBeNull()
    expect(result.current.tafsirContent?.resource_name).toBe('Ibn Kathir (Abridged)')
    expect(result.current.tafsirContent?.text).toContain('The Virtue of Ayat Al-Kursi')
    expect(result.current.contentError).toBeNull()
  })

  it('handles tafsir content fetch error', async () => {
    // Mock tafsir list fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    // Mock tafsir content fetch error
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await act(async () => {
      await result.current.fetchTafsirContent(2, 255)
    })

    await waitFor(() => {
      expect(result.current.contentLoading).toBe(false)
    })

    expect(result.current.tafsirContent).toBeNull()
    expect(result.current.contentError).toContain('Tafsir not available')
  })

  it('changes selected tafsir ID', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    expect(result.current.selectedTafsirId).toBe(169) // Default: Ibn Kathir

    act(() => {
      result.current.setSelectedTafsirId(16) // Change to Tafsir Muyassar
    })

    expect(result.current.selectedTafsirId).toBe(16)
  })

  it('clears content when clearContent is called', async () => {
    // Mock tafsir list fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    // Mock tafsir content fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirContentResponse,
    })

    await act(async () => {
      await result.current.fetchTafsirContent(2, 255)
    })

    await waitFor(() => {
      expect(result.current.tafsirContent).not.toBeNull()
    })

    // Clear content
    act(() => {
      result.current.clearContent()
    })

    expect(result.current.tafsirContent).toBeNull()
    expect(result.current.contentError).toBeNull()
  })

  it('refetches content when selected tafsir changes', async () => {
    // Mock tafsir list fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    // Mock first tafsir content fetch (Ibn Kathir)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirContentResponse,
    })

    await act(async () => {
      await result.current.fetchTafsirContent(2, 255)
    })

    await waitFor(() => {
      expect(result.current.contentLoading).toBe(false)
    })

    expect(fetch).toHaveBeenCalledWith('/api/quran/tafsirs/169/2/255')

    // Change tafsir selection
    act(() => {
      result.current.setSelectedTafsirId(16)
    })

    // Mock second tafsir content fetch (Tafsir Muyassar)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tafsir: { ...mockTafsirContentResponse.tafsir, resource_id: 16 },
      }),
    })

    await act(async () => {
      await result.current.fetchTafsirContent(2, 255)
    })

    await waitFor(() => {
      expect(result.current.contentLoading).toBe(false)
    })

    expect(fetch).toHaveBeenCalledWith('/api/quran/tafsirs/16/2/255')
  })

  it('persists selected tafsir to sessionStorage', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    expect(result.current.selectedTafsirId).toBe(169) // Default

    // Change tafsir selection
    act(() => {
      result.current.setSelectedTafsirId(168)
    })

    expect(result.current.selectedTafsirId).toBe(168)
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('selectedTafsirId', '168')
  })

  it('loads selected tafsir from sessionStorage on mount', async () => {
    // Pre-populate sessionStorage
    mockSessionStorage['selectedTafsirId'] = '16'

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    // After mount effect runs, should load from sessionStorage
    await waitFor(() => {
      expect(result.current.selectedTafsirId).toBe(16)
    })

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })
  })

  it('syncs selected tafsir from sessionStorage when syncFromStorage is called', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTafsirListResponse,
    })

    const { result } = renderHook(() => useTafsir())

    await waitFor(() => {
      expect(result.current.tafsirLoading).toBe(false)
    })

    expect(result.current.selectedTafsirId).toBe(169) // Default

    // Simulate another component changing the selection in sessionStorage
    mockSessionStorage['selectedTafsirId'] = '168'

    // Sync from storage
    act(() => {
      result.current.syncFromStorage()
    })

    expect(result.current.selectedTafsirId).toBe(168)
  })
})

