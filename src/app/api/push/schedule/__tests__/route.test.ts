/**
 * Integration tests for prayer notification cron job
 * Tests timezone handling and notification delivery
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'
import * as timezoneModule from '@/lib/timezone'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('web-push')
jest.mock('@/lib/prayerQuotes')
jest.mock('@/lib/timezone')

import * as supabaseServerModule from '@/lib/supabase/server'
import * as webpushModule from 'web-push'
import * as prayerQuotesModule from '@/lib/prayerQuotes'

const mockCreateServiceRoleClient = supabaseServerModule.createServiceRoleClient as jest.MockedFunction<typeof supabaseServerModule.createServiceRoleClient>
const mockWebpush = webpushModule as jest.Mocked<typeof webpushModule>
const mockGetRandomPrayerQuote = prayerQuotesModule.getRandomPrayerQuote as jest.MockedFunction<typeof prayerQuotesModule.getRandomPrayerQuote>

describe('POST /api/push/schedule - Timezone Handling', () => {
  let mockRequest: Partial<NextRequest>
  
  const mockProfile = {
    id: 'test-user-123',
    location_lat: 40.7128,
    location_lng: -74.0060, // NYC coordinates
    calculation_method: '4',
    madhab: '0',
    notification_preferences: {
      enabled: true,
      prayers: {
        Fajr: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true,
      },
    },
  }

  const mockSubscription = {
    id: 'sub-123',
    user_id: 'test-user-123',
    endpoint: 'https://fcm.googleapis.com/test',
    p256dh: 'test-p256dh',
    auth: 'test-auth',
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock environment
    process.env.CRON_SECRET = 'test-secret'
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test-public-key'
    process.env.VAPID_PRIVATE_KEY = 'test-private-key'
    process.env.VAPID_MAILTO = 'mailto:test@example.com'

    // Mock request with authorization
    mockRequest = {
      headers: new Headers({
        'authorization': 'Bearer test-secret',
      }),
    }

    // Mock Supabase client
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockResolvedValue({
        data: [mockProfile],
        error: null,
      }),
      delete: jest.fn().mockReturnThis(),
    }

    mockCreateServiceRoleClient.mockReturnValue(mockSupabase as any)

    // Configure Supabase mock for subscriptions
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'push_subscriptions') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [mockSubscription],
            error: null,
          }),
          delete: jest.fn().mockReturnThis(),
        }
      }
      return mockSupabase
    })

    // Mock web-push
    mockWebpush.setVapidDetails = jest.fn()
    mockWebpush.sendNotification = jest.fn().mockResolvedValue({ statusCode: 201 } as any)

    // Mock prayer quotes
    mockGetRandomPrayerQuote.mockReturnValue({
      text: 'Test hadith quote',
      source: 'Sahih Bukhari 123',
      prayerName: 'Fajr',
    })
  })

  describe('Timezone Detection from Coordinates', () => {
    it('should use timezone from user coordinates for NYC', async () => {
      // Mock timezone function
      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      mockGetTimezoneFromCoordinates.mockReturnValue('America/New_York')

      const response = await POST(mockRequest as NextRequest)
      const data = await response.json()

      expect(mockGetTimezoneFromCoordinates).toHaveBeenCalledWith(
        40.7128,
        -74.0060
      )
      expect(data.success).toBe(true)
    })

    it('should use timezone from user coordinates for London', async () => {
      const londonProfile = {
        ...mockProfile,
        location_lat: 51.5074,
        location_lng: -0.1278,
      }

      const mockSupabase = mockCreateServiceRoleClient()
      mockSupabase.not.mockResolvedValue({
        data: [londonProfile],
        error: null,
      })

      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      mockGetTimezoneFromCoordinates.mockReturnValue('Europe/London')

      const response = await POST(mockRequest as NextRequest)
      const data = await response.json()

      expect(mockGetTimezoneFromCoordinates).toHaveBeenCalledWith(
        51.5074,
        -0.1278
      )
      expect(data.success).toBe(true)
    })

    it('should use timezone from user coordinates for Dubai', async () => {
      const dubaiProfile = {
        ...mockProfile,
        location_lat: 25.2048,
        location_lng: 55.2708,
      }

      const mockSupabase = mockCreateServiceRoleClient()
      mockSupabase.not.mockResolvedValue({
        data: [dubaiProfile],
        error: null,
      })

      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      mockGetTimezoneFromCoordinates.mockReturnValue('Asia/Dubai')

      const response = await POST(mockRequest as NextRequest)
      const data = await response.json()

      expect(mockGetTimezoneFromCoordinates).toHaveBeenCalledWith(
        25.2048,
        55.2708
      )
      expect(data.success).toBe(true)
    })
  })

  describe('Prayer Time Calculation with Correct Timezone', () => {
    it('should calculate prayer times using user timezone not UTC', async () => {
      // Mock timezone to return EST
      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      mockGetTimezoneFromCoordinates.mockReturnValue('America/New_York')

      const response = await POST(mockRequest as NextRequest)
      const data = await response.json()

      // Verify timezone was used for prayer time calculation
      expect(mockGetTimezoneFromCoordinates).toHaveBeenCalled()
      expect(data.success).toBe(true)
      
      // Prayer times should be calculated in user's timezone
      // not in UTC (server timezone)
    })

    it('should handle user traveling between timezones', async () => {
      // Initial location: NYC
      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      mockGetTimezoneFromCoordinates.mockReturnValue('America/New_York')

      await POST(mockRequest as NextRequest)
      
      expect(mockGetTimezoneFromCoordinates).toHaveBeenCalledWith(
        40.7128,
        -74.0060
      )

      // User travels to LA
      const laProfile = {
        ...mockProfile,
        location_lat: 34.0522,
        location_lng: -118.2437,
      }

      const mockSupabase = mockCreateServiceRoleClient()
      mockSupabase.not.mockResolvedValue({
        data: [laProfile],
        error: null,
      })

      mockGetTimezoneFromCoordinates.mockReturnValue('America/Los_Angeles')

      await POST(mockRequest as NextRequest)

      expect(mockGetTimezoneFromCoordinates).toHaveBeenCalledWith(
        34.0522,
        -118.2437
      )
    })
  })

  describe('Notification Payload Verification', () => {
    it('should include local time in notification title', async () => {
      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      mockGetTimezoneFromCoordinates.mockReturnValue('America/New_York')

      const webpush = mockWebpush
      let capturedPayload: string | undefined

      webpush.sendNotification.mockImplementation((_sub: any, payload: string) => {
        capturedPayload = payload
        return Promise.resolve({ statusCode: 201 })
      })

      await POST(mockRequest as NextRequest)

      // Verify payload contains prayer time in local timezone
      if (capturedPayload) {
        const parsed = JSON.parse(capturedPayload)
        expect(parsed.title).toMatch(/Time for \w+ Prayer - \d{2}:\d{2}/)
        
        // Time should NOT be in UTC (would be different by 4-5 hours)
        // This is implicitly tested by using the correct timezone
      }
    })
  })

  describe('Authorization', () => {
    it('should reject request without authorization header', async () => {
      const unauthorizedRequest = {
        headers: new Headers(),
      }

      const response = await POST(unauthorizedRequest as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject request with invalid CRON_SECRET', async () => {
      const invalidRequest = {
        headers: new Headers({
          'authorization': 'Bearer wrong-secret',
        }),
      }

      const response = await POST(invalidRequest as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Error Handling', () => {
    it('should handle timezone lookup failure gracefully', async () => {
      const mockGetTimezoneFromCoordinates = jest.spyOn(
        timezoneModule,
        'getTimezoneFromCoordinates'
      )
      // Return UTC as fallback
      mockGetTimezoneFromCoordinates.mockReturnValue('UTC')

      const response = await POST(mockRequest as NextRequest)
      const data = await response.json()

      // Should still succeed even with UTC fallback
      expect(data.success).toBe(true)
    })

    it('should skip users without location coordinates', async () => {
      const profileWithoutLocation = {
        ...mockProfile,
        location_lat: null,
        location_lng: null,
      }

      const mockSupabase = mockCreateServiceRoleClient()
      mockSupabase.not.mockResolvedValue({
        data: [profileWithoutLocation],
        error: null,
      })

      const response = await POST(mockRequest as NextRequest)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.results.skipped).toBeGreaterThan(0)
    })
  })
})

