import { renderHook, waitFor } from '@testing-library/react'
import { usePrayerTimes } from '../usePrayerTimes'
import * as locationUtils from '@/lib/location'

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
  }),
}))

jest.mock('@/lib/location')

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

  it('should handle API errors gracefully', async () => {
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

    expect(result.current.error).toBeTruthy()
    expect(result.current.prayerTimes).toBeNull()
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
})

