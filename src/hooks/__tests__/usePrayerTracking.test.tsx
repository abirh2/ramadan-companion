import { renderHook, act, waitFor } from '@testing-library/react'
import { usePrayerTracking } from '../usePrayerTracking'
import { useAuth } from '../useAuth'
import * as prayerTrackingLib from '@/lib/prayerTracking'

// Mock dependencies
jest.mock('../useAuth')
jest.mock('@/lib/supabase/client')
jest.mock('@/lib/prayerTracking')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('usePrayerTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock: Record<string, string> = {}
    global.localStorage = {
      getItem: jest.fn((key: string) => localStorageMock[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        localStorageMock[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete localStorageMock[key]
      }),
      clear: jest.fn(() => {
        Object.keys(localStorageMock).forEach((key) => delete localStorageMock[key])
      }),
      key: jest.fn(),
      length: 0,
    }
  })

  describe('Guest User (Not Authenticated)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        profile: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        refreshProfile: jest.fn(),
      })

      // Mock getTodayFromLocalStorage to return empty completion
      jest.spyOn(prayerTrackingLib, 'getTodayFromLocalStorage').mockReturnValue({
        date: '2024-01-15',
        fajr_completed: false,
        dhuhr_completed: false,
        asr_completed: false,
        maghrib_completed: false,
        isha_completed: false,
        totalCompleted: 0,
        completionRate: 0,
      })

      // Mock other utility functions
      jest.spyOn(prayerTrackingLib, 'saveTodayToLocalStorage').mockImplementation()
      jest.spyOn(prayerTrackingLib, 'clearOldLocalStorageData').mockImplementation()
      jest.spyOn(prayerTrackingLib, 'getTodayDateString').mockReturnValue('2024-01-15')
    })

    it('should load today completion from localStorage for guest user', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.todayCompletion).not.toBeNull()
      expect(result.current.todayCompletion?.date).toBe('2024-01-15')
      expect(result.current.statistics).toBeNull() // No statistics for guest users
      expect(prayerTrackingLib.getTodayFromLocalStorage).toHaveBeenCalled()
    })

    it('should toggle prayer completion for guest user', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Toggle Fajr prayer
      await act(async () => {
        await result.current.togglePrayer('Fajr')
      })

      expect(prayerTrackingLib.saveTodayToLocalStorage).toHaveBeenCalled()
    })

    it('should clean up old localStorage data on mount', async () => {
      renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(prayerTrackingLib.clearOldLocalStorageData).toHaveBeenCalled()
      })
    })
  })

  describe('Authenticated User', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
    }

    const mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                order: jest.fn(() =>
                  Promise.resolve({
                    data: [],
                    error: null,
                  })
                ),
              })),
            })),
          })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    }

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { access_token: 'mock-token' } as any,
        profile: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        refreshProfile: jest.fn(),
      })

      // Mock Supabase client
      const { createClient } = require('@/lib/supabase/client')
      createClient.mockReturnValue(mockSupabase)

      // Mock utility functions
      jest.spyOn(prayerTrackingLib, 'getTodayDateString').mockReturnValue('2024-01-15')
      jest.spyOn(prayerTrackingLib, 'getDateRangeForTimeRange').mockReturnValue({
        startDate: '2024-01-01',
        endDate: '2024-01-15',
      })
      jest.spyOn(prayerTrackingLib, 'calculateStatistics').mockReturnValue({
        totalDays: 15,
        totalPrayers: 75,
        completedPrayers: 60,
        overallCompletionRate: 80,
        byPrayer: {
          Fajr: { completed: 12, total: 15, rate: 80 },
          Dhuhr: { completed: 12, total: 15, rate: 80 },
          Asr: { completed: 12, total: 15, rate: 80 },
          Maghrib: { completed: 12, total: 15, rate: 80 },
          Isha: { completed: 12, total: 15, rate: 80 },
        },
        dailyCompletions: [],
      })
      jest.spyOn(prayerTrackingLib, 'syncLocalStorageToDatabase').mockResolvedValue()
      jest.spyOn(prayerTrackingLib, 'clearOldLocalStorageData').mockImplementation()
    })

    it('should fetch data from database for authenticated user', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('prayer_tracking')
      expect(result.current.statistics).not.toBeNull()
    })

    it('should sync localStorage to database on sign-in', async () => {
      renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(prayerTrackingLib.syncLocalStorageToDatabase).toHaveBeenCalledWith(mockUser.id)
      })
    })

    it('should toggle prayer and update database', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock select to return no existing record
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: null,
              })
            ),
          })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      }))
      mockSupabase.from = mockFrom as any

      await act(async () => {
        await result.current.togglePrayer('Fajr')
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('prayer_tracking')
    })

    it('should change time range and refetch data', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.timeRange).toBe('30days')

      await act(async () => {
        result.current.setTimeRange('7days')
      })

      await waitFor(() => {
        expect(result.current.timeRange).toBe('7days')
      })
    })

    it('should handle errors gracefully', async () => {
      // Mock Supabase to return an error
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                order: jest.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: 'Database error' },
                  })
                ),
              })),
            })),
          })),
        })),
      }))
      mockSupabase.from = mockFrom as any

      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Time Range Functionality', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        profile: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        refreshProfile: jest.fn(),
      })

      jest.spyOn(prayerTrackingLib, 'getTodayFromLocalStorage').mockReturnValue({
        date: '2024-01-15',
        fajr_completed: false,
        dhuhr_completed: false,
        asr_completed: false,
        maghrib_completed: false,
        isha_completed: false,
        totalCompleted: 0,
        completionRate: 0,
      })
      jest.spyOn(prayerTrackingLib, 'clearOldLocalStorageData').mockImplementation()
      jest.spyOn(prayerTrackingLib, 'getTodayDateString').mockReturnValue('2024-01-15')
    })

    it('should have default time range of 30 days', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.timeRange).toBe('30days')
    })

    it('should allow changing time range', async () => {
      const { result } = renderHook(() => usePrayerTracking())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const timeRanges: Array<'7days' | '30days' | '90days' | 'all'> = [
        '7days',
        '90days',
        'all',
        '30days',
      ]

      for (const range of timeRanges) {
        await act(async () => {
          result.current.setTimeRange(range)
        })

        await waitFor(() => {
          expect(result.current.timeRange).toBe(range)
        })
      }
    })
  })
})

