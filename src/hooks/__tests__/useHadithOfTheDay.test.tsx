import { renderHook, waitFor } from '@testing-library/react'
import { useHadithOfTheDay } from '../useHadithOfTheDay'
import type { DailyHadithResponse } from '@/types/hadith.types'

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('useHadithOfTheDay', () => {
  const mockHadithResponse: DailyHadithResponse = {
    hadithEnglish: 'The reward of deeds depends upon the intentions.',
    hadithUrdu: 'تمام اعمال کا دارومدار نیت پر ہے',
    hadithArabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
    narrator: "Narrated 'Umar bin Al-Khattab",
    book: 'Sahih Bukhari',
    bookSlug: 'sahih-bukhari',
    chapter: 'Belief',
    hadithNumber: '1',
    status: 'Sahih',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockHadithResponse,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch daily hadith on mount', async () => {
    const { result } = renderHook(() => useHadithOfTheDay())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.hadithEnglish).toBe(mockHadithResponse.hadithEnglish)
    expect(result.current.hadithArabic).toBe(mockHadithResponse.hadithArabic)
    expect(result.current.narrator).toBe(mockHadithResponse.narrator)
    expect(result.current.book).toBe(mockHadithResponse.book)
    expect(result.current.hadithNumber).toBe(mockHadithResponse.hadithNumber)
    expect(result.current.status).toBe(mockHadithResponse.status)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useHadithOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.hadithEnglish).toBeNull()
  })

  it('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useHadithOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch daily hadith')
  })

  it('should update language preference', async () => {
    const { result } = renderHook(() => useHadithOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.selectedLanguage).toBe('english')

    // Test language change
    await result.current.setLanguage('urdu')

    expect(global.fetch).toHaveBeenCalledWith('/api/hadith?language=urdu')
  })
})

