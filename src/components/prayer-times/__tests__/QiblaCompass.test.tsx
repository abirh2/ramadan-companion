import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QiblaCompass } from '../QiblaCompass'
import * as orientation from '@/lib/orientation'

// Mock orientation utilities
jest.mock('@/lib/orientation', () => ({
  isMobileDevice: jest.fn(),
  hasOrientationSupport: jest.fn(),
  needsOrientationPermission: jest.fn(),
  requestOrientationPermission: jest.fn(),
  startOrientationTracking: jest.fn(),
  isLowAccuracy: jest.fn(),
}))

describe('QiblaCompass', () => {
  const mockQiblaDirection = {
    direction: 58.48,
    latitude: 40.7128,
    longitude: -74.006,
    compassDirection: 'NE',
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    // Default: desktop (no mobile, no orientation)
    jest.mocked(orientation.isMobileDevice).mockReturnValue(false)
    jest.mocked(orientation.hasOrientationSupport).mockReturnValue(false)
    jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
    jest.mocked(orientation.isLowAccuracy).mockReturnValue(false)
  })

  it('renders loading state', () => {
    render(<QiblaCompass qiblaDirection={null} loading={true} error={null} />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(<QiblaCompass qiblaDirection={null} loading={false} error="Failed to load" />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument()
  })

  it('displays Qibla direction with bearing', () => {
    render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    expect(screen.getByText(/58\.5° NE/i)).toBeInTheDocument()
    expect(screen.getByText(/Direction to Mecca/i)).toBeInTheDocument()
  })

  it('renders compass SVG', () => {
    const { container } = render(
      <QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('displays cardinal directions in static mode', () => {
    // Desktop: no mobile, so always static mode
    jest.mocked(orientation.isMobileDevice).mockReturnValue(false)
    jest.mocked(orientation.hasOrientationSupport).mockReturnValue(false)

    render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText(/Direction to Mecca/i)).toBeInTheDocument()
  })

  it('handles null qiblaDirection gracefully', () => {
    render(<QiblaCompass qiblaDirection={null} loading={false} error={null} />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    expect(screen.getByText(/Unable to determine direction/i)).toBeInTheDocument()
  })

  describe('Dynamic Compass Features', () => {
    it('does not show dynamic button on desktop', () => {
      // Desktop: no mobile, no orientation
      jest.mocked(orientation.isMobileDevice).mockReturnValue(false)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(false)

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      expect(screen.queryByText(/Dynamic/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Static/i)).not.toBeInTheDocument()
    })

    it('shows dynamic button on mobile with orientation support', () => {
      // Mobile with orientation support
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      expect(screen.getByText(/Dynamic/i)).toBeInTheDocument()
    })

    it('enables dynamic mode on Android without permission prompt', async () => {
      const user = userEvent.setup()
      
      // Android: mobile + orientation + no permission needed
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
      
      const mockCleanup = jest.fn()
      jest.mocked(orientation.startOrientationTracking).mockReturnValue(mockCleanup)

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      await waitFor(() => {
        expect(orientation.startOrientationTracking).toHaveBeenCalled()
        expect(screen.getByText(/Tracking device orientation/i)).toBeInTheDocument()
      })
    })

    it('requests permission on iOS before enabling dynamic mode', async () => {
      const user = userEvent.setup()
      
      // iOS: mobile + orientation + permission needed
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(true)
      jest.mocked(orientation.requestOrientationPermission).mockResolvedValue('granted')
      
      const mockCleanup = jest.fn()
      jest.mocked(orientation.startOrientationTracking).mockReturnValue(mockCleanup)

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      await waitFor(() => {
        expect(orientation.requestOrientationPermission).toHaveBeenCalled()
        expect(orientation.startOrientationTracking).toHaveBeenCalled()
      })
    })

    it('handles permission denied on iOS', async () => {
      const user = userEvent.setup()
      
      // iOS with permission denied
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(true)
      jest.mocked(orientation.requestOrientationPermission).mockResolvedValue('denied')

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      await waitFor(() => {
        expect(orientation.requestOrientationPermission).toHaveBeenCalled()
        expect(orientation.startOrientationTracking).not.toHaveBeenCalled()
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument()
      })
    })

    it('shows low accuracy warning when accuracy is poor', async () => {
      const user = userEvent.setup()
      
      // Setup mobile device
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
      jest.mocked(orientation.isLowAccuracy).mockReturnValue(true)
      
      let headingCallback: any
      jest.mocked(orientation.startOrientationTracking).mockImplementation((callback) => {
        headingCallback = callback
        return jest.fn()
      })

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      // Simulate low accuracy heading update
      await waitFor(() => {
        expect(headingCallback).toBeDefined()
      })
      
      headingCallback({ alpha: 45, accuracy: 20, timestamp: Date.now() })

      await waitFor(() => {
        expect(screen.getByText(/Low compass accuracy/i)).toBeInTheDocument()
        expect(screen.getByText(/Calibrate by moving phone/i)).toBeInTheDocument()
      })
    })

    it('toggles back to static mode', async () => {
      const user = userEvent.setup()
      
      // Setup mobile device
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
      
      const mockCleanup = jest.fn()
      jest.mocked(orientation.startOrientationTracking).mockReturnValue(mockCleanup)

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      // Enable dynamic mode
      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      await waitFor(() => {
        expect(screen.getByText(/Static/i)).toBeInTheDocument()
      })

      // Toggle back to static
      const staticButton = screen.getByText(/Static/i)
      await user.click(staticButton)

      await waitFor(() => {
        expect(screen.getByText(/Dynamic/i)).toBeInTheDocument()
        expect(mockCleanup).toHaveBeenCalled()
      })
    })

    it('shows alignment indicator when pointing at Qibla', async () => {
      const user = userEvent.setup()
      
      // Setup mobile device
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
      
      let headingCallback: any
      jest.mocked(orientation.startOrientationTracking).mockImplementation((callback) => {
        headingCallback = callback
        return jest.fn()
      })

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      await waitFor(() => {
        expect(headingCallback).toBeDefined()
      })
      
      // Simulate device heading aligned with Qibla (within 5 degrees)
      headingCallback({ alpha: 58, accuracy: 5, timestamp: Date.now() })

      await waitFor(() => {
        expect(screen.getByText(/Aligned with Qibla/i)).toBeInTheDocument()
      })
    })

    it('shows Kaaba icon and updated instructions in dynamic mode', async () => {
      const user = userEvent.setup()
      
      // Setup mobile device
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
      
      jest.mocked(orientation.startOrientationTracking).mockReturnValue(jest.fn())

      render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

      // Static mode: shows cardinal directions and bearing
      expect(screen.getByText('N')).toBeInTheDocument()
      expect(screen.getByText(/58\.5° NE/i)).toBeInTheDocument()
      expect(screen.getByText(/Direction to Mecca/i)).toBeInTheDocument()
      expect(screen.queryByText('🕋')).not.toBeInTheDocument()

      const dynamicButton = screen.getByText(/Dynamic/i)
      await user.click(dynamicButton)

      await waitFor(() => {
        // Dynamic mode: shows Kaaba emoji instead of N/S/E/W
        expect(screen.getByText('🕋')).toBeInTheDocument()
        expect(screen.queryByText('N')).not.toBeInTheDocument()
        expect(screen.queryByText('E')).not.toBeInTheDocument()
        expect(screen.queryByText('S')).not.toBeInTheDocument()
        expect(screen.queryByText('W')).not.toBeInTheDocument()
        
        // Still shows bearing info in dynamic mode
        expect(screen.getByText(/58\.5° NE/i)).toBeInTheDocument()
        expect(screen.getByText(/Direction to Mecca/i)).toBeInTheDocument()
        
        // Shows hold phone flat reminder
        expect(screen.getByText(/Hold phone flat for best results/i)).toBeInTheDocument()
      })
    })
  })
})

