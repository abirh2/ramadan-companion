import { renderHook, waitFor } from '@testing-library/react'
import { useRamadanCountdown } from '../useRamadanCountdown'

// Mock fetch globally
global.fetch = jest.fn()

describe('useRamadanCountdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => '0')
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Countdown Timer Logic', () => {
    it('should display detailed countdown before Ramadan starts', async () => {
      // Set current time to December 1, 2024
      const mockCurrentDate = new Date('2024-12-01T12:00:00Z')
      jest.setSystemTime(mockCurrentDate)

      // Mock API response for before Ramadan
      const mockHijriResponse = {
        currentHijri: { day: 28, month: 5, year: 1446, monthName: 'Jumādá al-Ūlá' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 90,
        isRamadan: false,
        currentRamadanDay: undefined,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHijriResponse,
      })

      const { result } = renderHook(() => useRamadanCountdown())

      // Wait for initial data load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Verify initial state
      expect(result.current.isRamadan).toBe(false)
      expect(result.current.timeUntilEvent).toMatch(/^\d+d \d+h \d+m \d+s$/)
      expect(result.current.daysUntilRamadan).toBeGreaterThan(0)

      // Advance time by 1 second
      jest.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(result.current.timeUntilEvent).toMatch(/^\d+d \d+h \d+m \d+s$/)
      })
    })

    it('should format countdown with correct units (days, hours, minutes, seconds)', async () => {
      const mockCurrentDate = new Date('2025-02-28T23:59:00Z')
      jest.setSystemTime(mockCurrentDate)

      const mockHijriResponse = {
        currentHijri: { day: 28, month: 8, year: 1446, monthName: 'Sha'bān' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 1,
        isRamadan: false,
        currentRamadanDay: undefined,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHijriResponse,
      })

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should show "0d 0h 1m 0s" format
      expect(result.current.timeUntilEvent).toMatch(/\d+d \d+h \d+m \d+s/)
    })

    it('should update countdown every second', async () => {
      const mockCurrentDate = new Date('2025-02-28T23:59:50Z')
      jest.setSystemTime(mockCurrentDate)

      const mockHijriResponse = {
        currentHijri: { day: 28, month: 8, year: 1446, monthName: 'Sha'bān' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 1,
        isRamadan: false,
        currentRamadanDay: undefined,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHijriResponse,
      })

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const firstCountdown = result.current.timeUntilEvent

      // Advance time by 5 seconds
      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(result.current.timeUntilEvent).not.toBe(firstCountdown)
      })
    })

    it('should calculate days correctly for countdown', async () => {
      // 90 days before Ramadan
      const mockCurrentDate = new Date('2024-12-01T00:00:00Z')
      jest.setSystemTime(mockCurrentDate)

      const mockHijriResponse = {
        currentHijri: { day: 28, month: 5, year: 1446, monthName: 'Jumādá al-Ūlá' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 90,
        isRamadan: false,
        currentRamadanDay: undefined,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHijriResponse,
      })

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.daysUntilRamadan).toBe(90)
      expect(result.current.timeUntilEvent).toContain('90d')
    })

    it('should refetch data when countdown reaches zero', async () => {
      // 5 seconds before Ramadan
      const mockCurrentDate = new Date('2025-02-28T23:59:55Z')
      jest.setSystemTime(mockCurrentDate)

      const beforeRamadanResponse = {
        currentHijri: { day: 29, month: 8, year: 1446, monthName: 'Sha'bān' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 1,
        isRamadan: false,
        currentRamadanDay: undefined,
      }

      const duringRamadanResponse = {
        currentHijri: { day: 1, month: 9, year: 1446, monthName: 'Ramadan' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: null,
        isRamadan: true,
        currentRamadanDay: 1,
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => beforeRamadanResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => duringRamadanResponse,
        })

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.isRamadan).toBe(false)

      // Advance past Ramadan start time
      jest.advanceTimersByTime(10000)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('During Ramadan', () => {
    it('should show current Ramadan day', async () => {
      const mockCurrentDate = new Date('2025-03-10T12:00:00Z')
      jest.setSystemTime(mockCurrentDate)

      const mockHijriResponse = {
        currentHijri: { day: 10, month: 9, year: 1446, monthName: 'Ramadan' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: null,
        isRamadan: true,
        currentRamadanDay: 10,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHijriResponse,
      })

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.isRamadan).toBe(true)
      expect(result.current.currentRamadanDay).toBe(10)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should handle invalid API responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Cleanup', () => {
    it('should clear interval on unmount', async () => {
      const mockCurrentDate = new Date('2024-12-01T00:00:00Z')
      jest.setSystemTime(mockCurrentDate)

      const mockHijriResponse = {
        currentHijri: { day: 28, month: 5, year: 1446, monthName: 'Jumādá al-Ūlá' },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 90,
        isRamadan: false,
        currentRamadanDay: undefined,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHijriResponse,
      })

      const { result, unmount } = renderHook(() => useRamadanCountdown())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const timerCount = jest.getTimerCount()
      unmount()

      // After unmount, timers should be cleared
      expect(jest.getTimerCount()).toBeLessThan(timerCount)
    })
  })
})

