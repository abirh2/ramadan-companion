import { render, screen } from '@testing-library/react'
import { NotificationEntry } from '../NotificationEntry'
import { useAuth } from '@/hooks/useAuth'
import { Capacitor } from '@capacitor/core'

// Mock the auth hook so we can drive logged-in / logged-out states.
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Capacitor so we can control the native-platform branch.
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
  },
}))
const mockIsNativePlatform = Capacitor.isNativePlatform as jest.MockedFunction<
  typeof Capacitor.isNativePlatform
>

// Mock the real NotificationSettings so we assert delegation, not its internals.
jest.mock('../NotificationSettings', () => ({
  NotificationSettings: () => (
    <div data-testid="notification-settings">Notification Settings</div>
  ),
}))

const makeAuth = (user: unknown): ReturnType<typeof useAuth> =>
  ({
    user,
    session: null,
    profile: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
    signInWithApple: jest.fn(),
    signOut: jest.fn(),
    refreshProfile: jest.fn(),
  }) as unknown as ReturnType<typeof useAuth>

describe('NotificationEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsNativePlatform.mockReturnValue(false)
  })

  describe('logged out (web)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(makeAuth(null))
    })

    it('renders a single compact sign-in row conveying the requirement in text (R5.2, R5.3)', () => {
      render(<NotificationEntry />)

      // The compact NotificationSettings must not be rendered.
      expect(
        screen.queryByTestId('notification-settings')
      ).not.toBeInTheDocument()

      // The requirement is communicated by visible text, not color alone.
      expect(screen.getByText('Prayer Notifications')).toBeInTheDocument()
      expect(screen.getByText('Sign in to enable')).toBeInTheDocument()
    })

    it('activation starts the existing sign-in flow via a link to /profile (R5.2)', () => {
      render(<NotificationEntry />)

      const link = screen.getByRole('link', { name: /sign in to enable/i })
      expect(link).toHaveAttribute('href', '/profile')
    })

    it('renders exactly one row (a single link) for the logged-out state', () => {
      render(<NotificationEntry />)

      expect(screen.getAllByRole('link')).toHaveLength(1)
    })
  })

  describe('logged in (web)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(makeAuth({ id: 'user-1' }))
    })

    it('renders NotificationSettings and no sign-in row (R5.4)', () => {
      render(<NotificationEntry />)

      expect(screen.getByTestId('notification-settings')).toBeInTheDocument()
      expect(screen.queryByText('Sign in to enable')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('native platform', () => {
    it('renders NotificationSettings even when logged out (native has no sign-in requirement) (R5.5)', () => {
      mockUseAuth.mockReturnValue(makeAuth(null))
      mockIsNativePlatform.mockReturnValue(true)

      render(<NotificationEntry />)

      expect(screen.getByTestId('notification-settings')).toBeInTheDocument()
      expect(screen.queryByText('Sign in to enable')).not.toBeInTheDocument()
    })
  })
})
