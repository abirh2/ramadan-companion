import { renderHook, waitFor } from '@testing-library/react'
import { useQuranOfTheDay } from '../useQuranOfTheDay'
import type { DailyQuranResponse } from '@/types/quran.types'

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

describe('useQuranOfTheDay', () => {
  const mockQuranResponse: DailyQuranResponse = {
    arabic: {
      number: 262,
      text: 'ٱللَّهُ لَاۤ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَیُّ ٱلۡقَیُّومُۚ',
      edition: {
        identifier: 'quran-uthmani',
        language: 'ar',
        name: 'القرآن الكريم',
        englishName: 'Quran Uthmani',
        format: 'text',
        type: 'quran',
        direction: 'rtl',
      },
      surah: {
        number: 2,
        name: 'سُورَةُ البَقَرَةِ',
        englishName: 'Al-Baqara',
        englishNameTranslation: 'The Cow',
        numberOfAyahs: 286,
        revelationType: 'Medinan',
      },
      numberInSurah: 255,
      juz: 3,
      manzil: 1,
      page: 42,
      ruku: 35,
      hizbQuarter: 17,
      sajda: false,
    },
    translation: {
      number: 262,
      text: 'GOD - there is no deity save Him, the Ever-Living...',
      edition: {
        identifier: 'en.asad',
        language: 'en',
        name: 'Asad',
        englishName: 'Muhammad Asad',
        format: 'text',
        type: 'translation',
        direction: 'ltr',
      },
      surah: {
        number: 2,
        name: 'سُورَةُ البَقَرَةِ',
        englishName: 'Al-Baqara',
        englishNameTranslation: 'The Cow',
        numberOfAyahs: 286,
        revelationType: 'Medinan',
      },
      numberInSurah: 255,
      juz: 3,
      manzil: 1,
      page: 42,
      ruku: 35,
      hizbQuarter: 17,
      sajda: false,
    },
    surah: {
      number: 2,
      name: 'سُورَةُ البَقَرَةِ',
      englishName: 'Al-Baqara',
      englishNameTranslation: 'The Cow',
      numberOfAyahs: 286,
      revelationType: 'Medinan',
    },
    ayahNumber: 262,
    numberInSurah: 255,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockQuranResponse,
    })
  })

  it('should fetch daily ayah on mount', async () => {
    const { result } = renderHook(() => useQuranOfTheDay())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.arabic).toEqual(mockQuranResponse.arabic)
    expect(result.current.translation).toEqual(mockQuranResponse.translation)
    expect(result.current.surah).toEqual(mockQuranResponse.surah)
    expect(result.current.ayahNumber).toBe(262)
    expect(result.current.error).toBeNull()
  })

  it('should use default translation (en.asad)', async () => {
    const { result } = renderHook(() => useQuranOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/quran?translation=en.asad')
  })

  it('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useQuranOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.arabic).toBeNull()
  })

  it('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useQuranOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('should allow changing translation', async () => {
    const { result } = renderHook(() => useQuranOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Change translation
    result.current.setTranslation('en.sahih')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/quran?translation=en.sahih')
    })
  })

  it('should allow refetch', async () => {
    const { result } = renderHook(() => useQuranOfTheDay())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const fetchCallCount = (global.fetch as jest.Mock).mock.calls.length

    // Trigger refetch
    await result.current.refetch()

    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(fetchCallCount)
  })
})

