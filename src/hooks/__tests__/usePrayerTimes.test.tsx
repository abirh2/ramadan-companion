import { renderHook, waitFor } from '@testing-library/react'
import { usePrayerTimes } from '../usePrayerTimes'
import * as locationUtils from '@/lib/location'
import * as prayerTimesUtils from '@/lib/prayerTimes'

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
  }),
}))

jest.mock('@/lib/location')
jest.mock('@/lib/prayerTimes')

// Mock fetch
global.fetch = jest.fn()

describe('usePrayerTimes', () => {
  const mockPrayerTimesResponse = {
    code: 200,
    status: 'OK',
    data: {
      timings: {
        Fajr: '05:00',
        Sunrise: '06:30',
        Dhuhr: '12:00',
        Asr: '15:00',
        Maghrib: '18:00',
        Isha: '19:30',
      },
      date: {
        readable: '12 Nov 2024',
        timestamp: '1731412800',
        gregorian: {
          date: '12-11-2024',
          day: '12',
          month: { number: 11, en: 'November' },
          year: '2024',
        },
        hijri: {
          date: '10-05-1446',
          day: '10',
          month: { number: 5, en: 'Jumādá al-ūlá', ar: 'جُمادى الأولى' },
          year: '1446',
        },
      },
      meta: {
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        method: {
          id: 4,
          name: 'Umm Al-Qura University, Makkah',
        },
        school: 'STANDARD',
      },
    },
  }

  const mockQiblaResponse = {
    code: 200,
    status: 'OK',
    data: {
      direction: 58.48,
      latitude: 40.7128,
      longitude: -74.006,
      compassDirection: 'NE',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/prayertimes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPrayerTimesResponse),
        })
      }
      if (url.includes('/api/qibla')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQiblaResponse),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    // Mock location utilities
    ;(locationUtils.getUserLocation as jest.Mock).mockReturnValue({
      lat: 40.7128,
      lng: -74.006,
      city: 'New York, USA',
      type: 'detected',
    })
    ;(locationUtils.requestGeolocation as jest.Mock).mockResolvedValue(null)
    ;(locationUtils.saveLocationToStorage as jest.Mock).mockResolvedValue(undefined)

    // Mock prayer times calculation utilities
    ;(prayerTimesUtils.calculatePrayerTimesLocal as jest.Mock).mockReturnValue({
      Fajr: '05:15',
      Sunrise: '06:45',
      Dhuhr: '12:15',
      Asr: '15:15',
      Maghrib: '18:15',
      Isha: '19:45',
    })
    ;(prayerTimesUtils.validatePrayerTimes as jest.Mock).mockReturnValue(true)
  })

  it('should fetch and return prayer times data', async () => {
    const { result } = renderHook(() => usePrayerTimes())

    // Initially loading
    expect(result.current.loading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Check prayer times
    expect(result.current.prayerTimes).toEqual(mockPrayerTimesResponse.data.timings)
    expect(result.current.qiblaDirection).toEqual(mockQiblaResponse.data)
    expect(result.current.location).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('should calculate next prayer correctly', async () => {
    const { result } = renderHook(() => usePrayerTimes())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.nextPrayer).toBeDefined()
    expect(result.current.nextPrayer?.name).toBeTruthy()
    expect(result.current.nextPrayer?.time).toBeTruthy()
    expect(result.current.nextPrayer?.countdown).toBeTruthy()
  })

  it('should handle API errors gracefully with fallback', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 500,
      })
    })

    const { result } = renderHook(() => usePrayerTimes())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // With fallback, API errors result in local calculation
    expect(result.current.prayerTimes).toBeDefined()
    expect(result.current.calculationSource).toBe('local')
    expect(result.current.error).toBeNull()
  })

  it('should use default location when no location is available', async () => {
    ;(locationUtils.getUserLocation as jest.Mock).mockReturnValue(null)
    ;(locationUtils.requestGeolocation as jest.Mock).mockResolvedValue(null)

    const { result } = renderHook(() => usePrayerTimes())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.location).toEqual(locationUtils.MECCA_COORDS)
  })

  it('should update calculation method', async () => {
    const { result } = renderHook(() => usePrayerTimes())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialMethod = result.current.calculationMethod

    // Update calculation method
    await result.current.updateCalculationMethod('2')

    await waitFor(() => {
      expect(result.current.calculationMethod).toBe('2')
    })

    expect(result.current.calculationMethod).not.toBe(initialMethod)
  })

  // Fallback mechanism tests
  describe('Fallback to local calculation', () => {
    it('should indicate API source when API succeeds', async () => {
      const { result } = renderHook(() => usePrayerTimes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.calculationSource).toBe('api')
      expect(result.current.prayerTimes).toEqual(mockPrayerTimesResponse.data.timings)
    })

    it('should fall back to local calculation when API fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/prayertimes')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          })
        }
        if (url.includes('/api/qibla')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQiblaResponse),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const { result } = renderHook(() => usePrayerTimes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have prayer times from local calculation
      expect(result.current.prayerTimes).toBeDefined()
      expect(result.current.prayerTimes?.Fajr).toBe('05:15')
      expect(result.current.calculationSource).toBe('local')
      expect(result.current.error).toBeNull()

      // Verify local calculation was called
      expect(prayerTimesUtils.calculatePrayerTimesLocal).toHaveBeenCalled()
      expect(prayerTimesUtils.validatePrayerTimes).toHaveBeenCalled()
    })

    it('should fall back to local calculation when API network fails', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/prayertimes')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/api/qibla')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockQiblaResponse),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const { result } = renderHook(() => usePrayerTimes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have prayer times from local calculation
      expect(result.current.prayerTimes).toBeDefined()
      expect(result.current.calculationSource).toBe('local')
      expect(result.current.error).toBeNull()
    })

    it('should handle error when both API and local calculation fail', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.reject(new Error('Network error'))
      })
      ;(prayerTimesUtils.calculatePrayerTimesLocal as jest.Mock).mockImplementation(() => {
        throw new Error('Local calculation failed')
      })

      const { result } = renderHook(() => usePrayerTimes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.prayerTimes).toBeNull()
      expect(result.current.calculationSource).toBeNull()
    })

    it('should continue with prayer times if Qibla API fails independently', async () => {
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/prayertimes')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockPrayerTimesResponse),
          })
        }
        if (url.includes('/api/qibla')) {
          return Promise.reject(new Error('Qibla API failed'))
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      const { result } = renderHook(() => usePrayerTimes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Prayer times should still be available
      expect(result.current.prayerTimes).toEqual(mockPrayerTimesResponse.data.timings)
      expect(result.current.calculationSource).toBe('api')
      expect(result.current.error).toBeNull()

      // Qibla should be null but not cause error
      expect(result.current.qiblaDirection).toBeNull()
    })

    it('should reject invalid local calculations', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.reject(new Error('API failed'))
      })
      ;(prayerTimesUtils.validatePrayerTimes as jest.Mock).mockReturnValue(false)

      const { result } = renderHook(() => usePrayerTimes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.prayerTimes).toBeNull()
    })
  })
})

