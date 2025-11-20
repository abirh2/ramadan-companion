import {
  getUserLocation,
  getStoredLocation,
  saveLocationToStorage,
  isValidCoordinates,
  MECCA_COORDS,
} from '../location'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('location utilities', () => {
  const mockLocalStorage: Record<string, string> = {}

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks()

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key]
        }),
        clear: jest.fn(() => {
          Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key])
        }),
      },
      writable: true,
    })

    // Clear mock localStorage
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key])
  })

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(40.7128, -74.006)).toBe(true)
      expect(isValidCoordinates(0, 0)).toBe(true)
      expect(isValidCoordinates(-90, -180)).toBe(true)
      expect(isValidCoordinates(90, 180)).toBe(true)
    })

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false)
      expect(isValidCoordinates(-91, 0)).toBe(false)
      expect(isValidCoordinates(0, 181)).toBe(false)
      expect(isValidCoordinates(0, -181)).toBe(false)
      expect(isValidCoordinates(NaN, 0)).toBe(false)
      expect(isValidCoordinates(0, NaN)).toBe(false)
    })
  })

  describe('getStoredLocation', () => {
    it('should return location from localStorage', () => {
      mockLocalStorage['location_lat'] = '40.7128'
      mockLocalStorage['location_lng'] = '-74.006'
      mockLocalStorage['location_city'] = 'New York, USA'
      mockLocalStorage['location_type'] = 'selected'

      const location = getStoredLocation()

      expect(location).toEqual({
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, USA',
        type: 'selected',
      })
    })

    it('should return null if no location is stored', () => {
      const location = getStoredLocation()
      expect(location).toBeNull()
    })

    it('should return null if only partial data is stored', () => {
      mockLocalStorage['location_lat'] = '40.7128'
      // Missing lng

      const location = getStoredLocation()
      expect(location).toBeNull()
    })

    it('should default to "selected" type if not stored', () => {
      mockLocalStorage['location_lat'] = '40.7128'
      mockLocalStorage['location_lng'] = '-74.006'

      const location = getStoredLocation()

      expect(location?.type).toBe('selected')
    })
  })

  describe('getUserLocation', () => {
    it('should prioritize profile location over localStorage', () => {
      const profile = {
        id: 'user-1',
        location_lat: 40.8784,
        location_lng: -73.8803,
        location_city: 'Bronx, NY',
        location_type: 'coords',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockLocalStorage['location_lat'] = '40.7128'
      mockLocalStorage['location_lng'] = '-74.006'
      mockLocalStorage['location_city'] = 'New York, USA'

      const location = getUserLocation(profile)

      expect(location).toEqual({
        lat: 40.8784,
        lng: -73.8803,
        city: 'Bronx, NY',
        type: 'detected',
      })
    })

    it('should fall back to localStorage if no profile', () => {
      mockLocalStorage['location_lat'] = '40.7128'
      mockLocalStorage['location_lng'] = '-74.006'
      mockLocalStorage['location_city'] = 'New York, USA'
      mockLocalStorage['location_type'] = 'selected'

      const location = getUserLocation(null)

      expect(location).toEqual({
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, USA',
        type: 'selected',
      })
    })

    it('should return null if no location is available', () => {
      const location = getUserLocation(null)
      expect(location).toBeNull()
    })

    it('should handle profile without location data', () => {
      const profile = {
        id: 'user-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockLocalStorage['location_lat'] = '40.7128'
      mockLocalStorage['location_lng'] = '-74.006'
      mockLocalStorage['location_city'] = 'New York, USA'

      const location = getUserLocation(profile)

      expect(location).toEqual({
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, USA',
        type: 'selected',
      })
    })
  })

  describe('saveLocationToStorage', () => {
    it('should save location to localStorage', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      await saveLocationToStorage(40.7128, -74.006, 'New York, USA', 'selected')

      expect(localStorage.setItem).toHaveBeenCalledWith('location_lat', '40.7128')
      expect(localStorage.setItem).toHaveBeenCalledWith('location_lng', '-74.006')
      expect(localStorage.setItem).toHaveBeenCalledWith('location_city', 'New York, USA')
      expect(localStorage.setItem).toHaveBeenCalledWith('location_type', 'selected')
    })

    it('should save to Supabase profile if user is authenticated', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: null })
      const mockEq = jest.fn().mockReturnValue({ data: null, error: null })
      mockUpdate.mockReturnValue({ eq: mockEq })

      const mockSupabase = {
        auth: {
          getUser: jest
            .fn()
            .mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        },
        from: jest.fn().mockReturnValue({
          update: mockUpdate,
        }),
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      await saveLocationToStorage(40.7128, -74.006, 'New York, USA', 'detected')

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          location_lat: 40.7128,
          location_lng: -74.006,
          location_city: 'New York, USA',
          location_type: 'coords',
        })
      )
      expect(mockEq).toHaveBeenCalledWith('id', 'user-1')
    })

    it('should handle Supabase errors gracefully', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })
      mockUpdate.mockReturnValue({ eq: mockEq })

      const mockSupabase = {
        auth: {
          getUser: jest
            .fn()
            .mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        },
        from: jest.fn().mockReturnValue({
          update: mockUpdate,
        }),
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      // Should not throw
      await expect(
        saveLocationToStorage(40.7128, -74.006, 'New York, USA', 'detected')
      ).resolves.not.toThrow()

      // But localStorage should still be updated
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should persist detected location type correctly', async () => {
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      await saveLocationToStorage(40.8784, -73.8803, 'Bronx, NY', 'detected')

      expect(localStorage.setItem).toHaveBeenCalledWith('location_type', 'detected')
    })
  })

  describe('MECCA_COORDS constant', () => {
    it('should have correct Mecca coordinates', () => {
      expect(MECCA_COORDS.lat).toBe(21.4225)
      expect(MECCA_COORDS.lng).toBe(39.8262)
      expect(MECCA_COORDS.city).toBe('Mecca, Saudi Arabia')
      expect(MECCA_COORDS.type).toBe('default')
    })
  })
})

