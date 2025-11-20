import { renderHook, waitFor } from '@testing-library/react'
import { useHalalFood } from '../useHalalFood'
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

describe('useHalalFood', () => {
  const mockFoodResponse = {
    foods: [
      {
        id: 'food-1',
        name: 'Halal Paradise Restaurant',
        lat: 40.8784,
        lng: -73.8803,
        distanceKm: 0.4,
        cuisine: 'Middle Eastern',
        address: {
          street: '123 Main Street',
          city: 'Bronx',
          state: 'NY',
          country: 'United States',
        },
      },
      {
        id: 'food-2',
        name: 'Turkish Kebab House',
        lat: 40.8123,
        lng: -73.9544,
        distanceKm: 1.2,
        cuisine: 'Turkish',
        address: {
          street: '456 Broadway',
          city: 'New York',
          state: 'NY',
          country: 'United States',
        },
      },
    ],
  }

  const mockLocation = {
    lat: 40.7128,
    lng: -74.006,
    city: 'New York, USA',
    type: 'detected' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/food')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFoodResponse),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    // Mock location utilities
    ;(locationUtils.getUserLocation as jest.Mock).mockReturnValue(mockLocation)
    ;(locationUtils.saveLocationToStorage as jest.Mock).mockResolvedValue(undefined)
  })

  it('should initialize with location from getUserLocation', async () => {
    const { result } = renderHook(() => useHalalFood())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(locationUtils.getUserLocation).toHaveBeenCalled()
    expect(result.current.location).toEqual(mockLocation)
    expect(result.current.foods).toHaveLength(2)
    expect(result.current.nearestFood).toEqual(mockFoodResponse.foods[0])
  })

  it('should fetch halal food places with correct parameters', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/food?latitude=40.7128&longitude=-74.006')
    )
  })

  it('should persist location when setCustomLocation is called', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newLocation = {
      lat: 40.8784,
      lng: -73.8803,
      city: 'Bronx, NY',
      type: 'selected' as const,
    }

    await result.current.setCustomLocation(newLocation)

    await waitFor(() => {
      expect(result.current.location).toEqual(newLocation)
    })

    expect(locationUtils.saveLocationToStorage).toHaveBeenCalledWith(
      newLocation.lat,
      newLocation.lng,
      newLocation.city,
      newLocation.type
    )
  })

  it('should fetch halal food after setting custom location', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    ;(global.fetch as jest.Mock).mockClear()

    const newLocation = {
      lat: 40.8784,
      lng: -73.8803,
      city: 'Bronx, NY',
      type: 'selected' as const,
    }

    await result.current.setCustomLocation(newLocation)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/food?latitude=40.8784&longitude=-73.8803')
      )
    })
  })

  it('should persist detected location when using Locate button flow', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const detectedLocation = {
      lat: 40.8784,
      lng: -73.8803,
      city: 'Bronx, NY',
      type: 'detected' as const,
    }

    await result.current.setCustomLocation(detectedLocation)

    expect(locationUtils.saveLocationToStorage).toHaveBeenCalledWith(
      detectedLocation.lat,
      detectedLocation.lng,
      detectedLocation.city,
      'detected'
    )
  })

  it('should update radius and refetch food places', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    ;(global.fetch as jest.Mock).mockClear()

    await result.current.updateRadius(5)

    await waitFor(() => {
      expect(result.current.searchRadiusMiles).toBe(5)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('radius=8047') // 5 miles in meters (rounded)
      )
    })
  })

  it('should handle errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    )

    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toContain('Server error')
    expect(result.current.foods).toHaveLength(0)
  })

  it('should show error when location is not set', async () => {
    ;(locationUtils.getUserLocation as jest.Mock).mockReturnValue(null)

    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(
      'Location not set. Please enable location access or set your location manually.'
    )
    expect(result.current.foods).toHaveLength(0)
  })

  it('should refetch food places when refetch is called', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    ;(global.fetch as jest.Mock).mockClear()

    await result.current.refetch()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/food')
    )
  })

  it('should validate coordinates before fetching', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.searchFood(NaN, NaN, 3)

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid location coordinates')
    })
  })

  it('should validate radius before fetching', async () => {
    const { result } = renderHook(() => useHalalFood())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.searchFood(40.7128, -74.006, 0)

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid search radius')
    })
  })
})

