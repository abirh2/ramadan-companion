import { renderHook, act, waitFor } from '@testing-library/react'
import { useNotifications } from '../useNotifications'
import * as notificationLib from '@/lib/notifications'
import * as authHook from '@/hooks/useAuth'

// Mock the auth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = authHook.useAuth as jest.MockedFunction<typeof authHook.useAuth>

// Mock notification library functions
jest.mock('@/lib/notifications')
const mockIsNotificationSupported = notificationLib.isNotificationSupported as jest.MockedFunction<typeof notificationLib.isNotificationSupported>
const mockGetNotificationPermission = notificationLib.getNotificationPermission as jest.MockedFunction<typeof notificationLib.getNotificationPermission>
const mockRequestNotificationPermission = notificationLib.requestNotificationPermission as jest.MockedFunction<typeof notificationLib.requestNotificationPermission>
const mockGetNotificationPreferences = notificationLib.getNotificationPreferences as jest.MockedFunction<typeof notificationLib.getNotificationPreferences>
const mockSaveNotificationPreferences = notificationLib.saveNotificationPreferences as jest.MockedFunction<typeof notificationLib.saveNotificationPreferences>

// Mock default preferences
const DEFAULT_PREFS = {
  enabled: false,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
}

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
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

    mockIsNotificationSupported.mockReturnValue(true)
    mockGetNotificationPermission.mockReturnValue('default')
    mockGetNotificationPreferences.mockReturnValue(DEFAULT_PREFS)
    mockSaveNotificationPreferences.mockResolvedValue()
  })

  describe('Browser Support', () => {
    it('should detect when notifications are supported', () => {
      mockIsNotificationSupported.mockReturnValue(true)

      const { result } = renderHook(() => useNotifications())

      expect(result.current.isSupported).toBe(true)
    })

    it('should detect when notifications are not supported', () => {
      mockIsNotificationSupported.mockReturnValue(false)

      const { result } = renderHook(() => useNotifications())

      expect(result.current.isSupported).toBe(false)
    })
  })

  describe('Permission Status', () => {
    it('should detect default permission status', () => {
      mockGetNotificationPermission.mockReturnValue('default')

      const { result } = renderHook(() => useNotifications())

      expect(result.current.permission).toBe('default')
    })

    it('should detect granted permission status', () => {
      mockGetNotificationPermission.mockReturnValue('granted')

      const { result } = renderHook(() => useNotifications())

      expect(result.current.permission).toBe('granted')
    })

    it('should detect denied permission status', () => {
      mockGetNotificationPermission.mockReturnValue('denied')

      const { result } = renderHook(() => useNotifications())

      expect(result.current.permission).toBe('denied')
    })
  })

  describe('Loading Preferences', () => {
    it('should load preferences for guest users from localStorage', () => {
      const { result } = renderHook(() => useNotifications())

      expect(mockGetNotificationPreferences).toHaveBeenCalledWith(null)
      expect(result.current.preferences).toEqual(DEFAULT_PREFS)
    })

    it('should load preferences for authenticated users from profile', () => {
      const mockProfile = {
        id: 'user-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        notification_preferences: {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: false,
            Asr: true,
            Maghrib: true,
            Isha: false,
          },
        },
      }

      mockUseAuth.mockReturnValue({
        user: { id: 'user-123' } as any,
        session: {} as any,
        profile: mockProfile as any,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        refreshProfile: jest.fn(),
      })

      mockGetNotificationPreferences.mockReturnValue(mockProfile.notification_preferences)

      const { result } = renderHook(() => useNotifications())

      expect(result.current.preferences).toEqual(mockProfile.notification_preferences)
    })
  })

  describe('Requesting Permission', () => {
    it('should request permission and enable all prayers on grant', async () => {
      mockRequestNotificationPermission.mockResolvedValue(true)

      const { result } = renderHook(() => useNotifications())

      let permissionGranted = false
      await act(async () => {
        permissionGranted = await result.current.requestPermission()
      })

      expect(permissionGranted).toBe(true)
      expect(mockSaveNotificationPreferences).toHaveBeenCalledWith(
        {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
        null
      )
    })

    it('should handle permission denial', async () => {
      mockRequestNotificationPermission.mockResolvedValue(false)

      const { result } = renderHook(() => useNotifications())

      let permissionGranted = true
      await act(async () => {
        permissionGranted = await result.current.requestPermission()
      })

      expect(permissionGranted).toBe(false)
      expect(mockSaveNotificationPreferences).not.toHaveBeenCalled()
    })
  })

  describe('Toggle Prayer', () => {
    it('should toggle individual prayer on', async () => {
      mockGetNotificationPreferences.mockReturnValue({
        enabled: true,
        prayers: {
          Fajr: false,
          Dhuhr: true,
          Asr: true,
          Maghrib: true,
          Isha: true,
        },
      })

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.togglePrayer('Fajr')
      })

      expect(mockSaveNotificationPreferences).toHaveBeenCalledWith(
        {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
        null
      )
    })

    it('should toggle individual prayer off', async () => {
      mockGetNotificationPreferences.mockReturnValue({
        enabled: true,
        prayers: {
          Fajr: true,
          Dhuhr: true,
          Asr: true,
          Maghrib: true,
          Isha: true,
        },
      })

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.togglePrayer('Dhuhr')
      })

      expect(mockSaveNotificationPreferences).toHaveBeenCalledWith(
        {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: false,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
        null
      )
    })
  })

  describe('Enable/Disable All', () => {
    it('should enable all prayers', async () => {
      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.enableAll()
      })

      expect(mockSaveNotificationPreferences).toHaveBeenCalledWith(
        {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
        null
      )
    })

    it('should disable all notifications', async () => {
      mockGetNotificationPreferences.mockReturnValue({
        enabled: true,
        prayers: {
          Fajr: true,
          Dhuhr: true,
          Asr: false,
          Maghrib: true,
          Isha: false,
        },
      })

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.disableAll()
      })

      expect(mockSaveNotificationPreferences).toHaveBeenCalledWith(
        {
          enabled: false,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: false,
            Maghrib: true,
            Isha: false,
          },
        },
        null
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      mockSaveNotificationPreferences.mockRejectedValue(new Error('Save failed'))

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.togglePrayer('Fajr')
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
    })
  })

  describe('Authenticated User Integration', () => {
    it('should save preferences to profile when authenticated', async () => {
      const mockProfile = {
        id: 'user-456',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockUseAuth.mockReturnValue({
        user: { id: 'user-456' } as any,
        session: {} as any,
        profile: mockProfile as any,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        refreshProfile: jest.fn(),
      })

      const { result } = renderHook(() => useNotifications())

      await act(async () => {
        await result.current.enableAll()
      })

      expect(mockSaveNotificationPreferences).toHaveBeenCalledWith(
        expect.any(Object),
        mockProfile
      )
    })
  })
})

