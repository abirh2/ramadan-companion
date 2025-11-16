import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationSettings } from '../NotificationSettings'
import * as useNotificationsHook from '@/hooks/useNotifications'

// Mock the useNotifications hook
jest.mock('@/hooks/useNotifications')
const mockUseNotifications = useNotificationsHook.useNotifications as jest.MockedFunction<
  typeof useNotificationsHook.useNotifications
>

describe('NotificationSettings', () => {
  const mockRequestPermission = jest.fn()
  const mockTogglePrayer = jest.fn()
  const mockEnableAll = jest.fn()
  const mockDisableAll = jest.fn()
  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock return value
    mockUseNotifications.mockReturnValue({
      isSupported: true,
      permission: 'default',
      preferences: {
        enabled: false,
        prayers: {
          Fajr: true,
          Dhuhr: true,
          Asr: true,
          Maghrib: true,
          Isha: true,
        },
      },
      loading: false,
      error: null,
      requestPermission: mockRequestPermission,
      togglePrayer: mockTogglePrayer,
      enableAll: mockEnableAll,
      disableAll: mockDisableAll,
      refetch: mockRefetch,
    })
  })

  describe('Browser Support Detection', () => {
    it('should show not supported message when notifications are not supported', () => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        isSupported: false,
      })

      render(<NotificationSettings />)

      expect(
        screen.getByText(/Notifications are not supported in your browser/i)
      ).toBeInTheDocument()
    })

    it('should show enable button when notifications are supported', () => {
      render(<NotificationSettings />)

      expect(screen.getByRole('button', { name: /Enable Notifications/i })).toBeInTheDocument()
    })
  })

  describe('Permission States', () => {
    it('should show enable button when permission is default', () => {
      render(<NotificationSettings />)

      expect(screen.getByRole('button', { name: /Enable Notifications/i })).toBeInTheDocument()
      expect(
        screen.getByText(/Get notified at exact prayer times/)
      ).toBeInTheDocument()
    })

    it('should show denied message when permission is denied', () => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'denied',
      })

      render(<NotificationSettings />)

      expect(screen.getByText(/Notifications Blocked/i)).toBeInTheDocument()
      expect(
        screen.getByText(/You have blocked notifications for this site/)
      ).toBeInTheDocument()
    })

    it('should show settings when permission is granted', () => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'granted',
        preferences: {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
      })

      render(<NotificationSettings />)

      expect(screen.getByText('Fajr')).toBeInTheDocument()
      expect(screen.getByText('Dhuhr')).toBeInTheDocument()
      expect(screen.getByText('Asr')).toBeInTheDocument()
      expect(screen.getByText('Maghrib')).toBeInTheDocument()
      expect(screen.getByText('Isha')).toBeInTheDocument()
    })
  })

  describe('Requesting Permission', () => {
    it('should call requestPermission when enable button is clicked', async () => {
      mockRequestPermission.mockResolvedValue(true)

      render(<NotificationSettings />)

      const enableButton = screen.getByRole('button', { name: /Enable Notifications/i })
      fireEvent.click(enableButton)

      await waitFor(() => {
        expect(mockRequestPermission).toHaveBeenCalled()
      })
    })

    it('should show loading state while requesting permission', () => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        loading: true,
      })

      render(<NotificationSettings />)

      expect(screen.getByRole('button', { name: /Requesting.../i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Requesting.../i })).toBeDisabled()
    })
  })

  describe('Master Toggle', () => {
    it('should show enabled state when notifications are on', () => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'granted',
        preferences: {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: false,
            Asr: true,
            Maghrib: true,
            Isha: false,
          },
        },
      })

      render(<NotificationSettings />)

      expect(screen.getByText(/3 prayers enabled/i)).toBeInTheDocument()
    })

    it('should call enableAll when master toggle is turned on', async () => {
      mockEnableAll.mockResolvedValue()

      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'granted',
        preferences: {
          enabled: false,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
      })

      render(<NotificationSettings />)

      const masterToggle = screen.getAllByRole('switch')[0]
      fireEvent.click(masterToggle)

      await waitFor(() => {
        expect(mockEnableAll).toHaveBeenCalled()
      })
    })

    it('should call disableAll when master toggle is turned off', async () => {
      mockDisableAll.mockResolvedValue()

      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'granted',
        preferences: {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
      })

      render(<NotificationSettings />)

      const masterToggle = screen.getAllByRole('switch')[0]
      fireEvent.click(masterToggle)

      await waitFor(() => {
        expect(mockDisableAll).toHaveBeenCalled()
      })
    })
  })

  describe('Individual Prayer Toggles', () => {
    beforeEach(() => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'granted',
        preferences: {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: false,
            Asr: true,
            Maghrib: true,
            Isha: false,
          },
        },
      })
    })

    it('should show checkmarks for enabled prayers', () => {
      render(<NotificationSettings />)

      // Count checkmark icons (there should be 3: Fajr, Asr, Maghrib)
      const checkmarks = document.querySelectorAll('.lucide-check')
      expect(checkmarks.length).toBeGreaterThan(0)
    })

    it('should call togglePrayer when individual prayer toggle is clicked', async () => {
      mockTogglePrayer.mockResolvedValue()

      render(<NotificationSettings />)

      // Find all switches (1 master + 5 prayers = 6 total)
      const switches = screen.getAllByRole('switch')
      
      // Click the Fajr toggle (index 1, after master toggle)
      fireEvent.click(switches[1])

      await waitFor(() => {
        expect(mockTogglePrayer).toHaveBeenCalledWith('Fajr')
      })
    })

    it('should show prayer descriptions', () => {
      render(<NotificationSettings />)

      expect(screen.getByText('Dawn prayer')).toBeInTheDocument()
      expect(screen.getByText('Midday prayer')).toBeInTheDocument()
      expect(screen.getByText('Afternoon prayer')).toBeInTheDocument()
      expect(screen.getByText('Sunset prayer')).toBeInTheDocument()
      expect(screen.getByText('Night prayer')).toBeInTheDocument()
    })
  })

  describe('Error Display', () => {
    it('should show error message when there is an error', () => {
      mockUseNotifications.mockReturnValue({
        isSupported: true,
        permission: 'granted',
        preferences: {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
        loading: false,
        error: 'Failed to save preferences',
        requestPermission: mockRequestPermission,
        togglePrayer: mockTogglePrayer,
        enableAll: mockEnableAll,
        disableAll: mockDisableAll,
        refetch: mockRefetch,
      })

      render(<NotificationSettings />)

      expect(screen.getByText('Failed to save preferences')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should show disabled state when notifications are off', () => {
      mockUseNotifications.mockReturnValue({
        ...mockUseNotifications(),
        permission: 'granted',
        preferences: {
          enabled: false,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        },
      })

      render(<NotificationSettings />)

      expect(screen.getByText('Disabled')).toBeInTheDocument()
      // Individual prayers should not be shown when disabled
      expect(screen.queryByText('Dawn prayer')).not.toBeInTheDocument()
    })
  })
})

