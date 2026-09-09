import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QiblaCompass } from '../QiblaCompass'
import * as orientation from '@/lib/orientation'
import * as qiblaHaptics from '@/lib/qiblaHaptics'
import type { QiblaData } from '@/types/ramadan.types'

jest.mock('@/lib/orientation', () => ({
  isMobileDevice: jest.fn(),
  hasOrientationSupport: jest.fn(),
  needsOrientationPermission: jest.fn(),
  requestOrientationPermission: jest.fn(),
  startOrientationTracking: jest.fn(),
  isLowAccuracy: jest.fn(),
}))

jest.mock('@/lib/qiblaHaptics', () => ({
  triggerQiblaAlignmentHaptic: jest.fn(),
}))

describe('QiblaCompass', () => {
  const qiblaDirection = {
    direction: 58.48,
    latitude: 40.7128,
    longitude: -74.006,
    compassDirection: 'NE',
  } satisfies QiblaData & { compassDirection: string }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(orientation.isMobileDevice).mockReturnValue(false)
    jest.mocked(orientation.hasOrientationSupport).mockReturnValue(false)
    jest.mocked(orientation.needsOrientationPermission).mockReturnValue(false)
    jest.mocked(orientation.isLowAccuracy).mockReturnValue(false)
  })

  it('renders an immersive loading state', () => {
    render(<QiblaCompass qiblaDirection={null} loading error={null} />)

    expect(screen.getByRole('heading', { name: 'Qibla' })).toBeInTheDocument()
    expect(screen.getByText('Calculating direction…')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders a concise recoverable error state', () => {
    render(<QiblaCompass qiblaDirection={null} loading={false} error="Location access was denied" />)

    expect(screen.getByText('Direction unavailable')).toBeInTheDocument()
    expect(screen.getByText('Location access was denied')).toBeInTheDocument()
  })

  it('shows bearing, location, compass rose, and browser fallback', () => {
    render(
      <QiblaCompass
        qiblaDirection={qiblaDirection}
        locationLabel="Upper Darby, PA"
        loading={false}
        error={null}
      />
    )

    expect(screen.getByText(/58\.5°/)).toBeInTheDocument()
    expect(screen.getByText('NE')).toBeInTheDocument()
    expect(screen.getByText('Direction to Makkah')).toBeInTheDocument()
    expect(screen.getByText('Upper Darby, PA')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
    expect(screen.getByText(/Live compass isn’t available/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /live device compass/i })).not.toBeInTheDocument()
  })

  describe('live compass', () => {
    beforeEach(() => {
      jest.mocked(orientation.isMobileDevice).mockReturnValue(true)
      jest.mocked(orientation.hasOrientationSupport).mockReturnValue(true)
      jest.mocked(orientation.startOrientationTracking).mockReturnValue(jest.fn())
    })

    it('enables on Android without requesting orientation permission', async () => {
      const user = userEvent.setup()
      await user.click(
        render(<QiblaCompass qiblaDirection={qiblaDirection} />).getByRole('button', {
          name: /live device compass/i,
        })
      )

      await waitFor(() => expect(orientation.startOrientationTracking).toHaveBeenCalled())
      expect(orientation.requestOrientationPermission).not.toHaveBeenCalled()
      expect(screen.getByText(/Turn until the Qibla marker reaches the top/)).toBeInTheDocument()
    })

    it('requests permission on iOS before enabling', async () => {
      const user = userEvent.setup()
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(true)
      jest.mocked(orientation.requestOrientationPermission).mockResolvedValue('granted')

      render(<QiblaCompass qiblaDirection={qiblaDirection} />)
      await user.click(screen.getByRole('button', { name: /live device compass/i }))

      await waitFor(() => {
        expect(orientation.requestOrientationPermission).toHaveBeenCalledTimes(1)
        expect(orientation.startOrientationTracking).toHaveBeenCalledTimes(1)
      })
    })

    it('keeps the manual bearing visible when permission is denied', async () => {
      const user = userEvent.setup()
      jest.mocked(orientation.needsOrientationPermission).mockReturnValue(true)
      jest.mocked(orientation.requestOrientationPermission).mockResolvedValue('denied')

      render(<QiblaCompass qiblaDirection={qiblaDirection} />)
      await user.click(screen.getByRole('button', { name: /live device compass/i }))

      expect(await screen.findByText(/Motion access was denied/)).toBeInTheDocument()
      expect(screen.getByText(/58\.5°/)).toBeInTheDocument()
      expect(orientation.startOrientationTracking).not.toHaveBeenCalled()
    })

    it('shows calibration guidance when accuracy is low', async () => {
      const user = userEvent.setup()
      let headingCallback: ((heading: orientation.DeviceHeading) => void) | undefined
      jest.mocked(orientation.isLowAccuracy).mockReturnValue(true)
      jest.mocked(orientation.startOrientationTracking).mockImplementation((callback) => {
        headingCallback = callback
        return jest.fn()
      })

      render(<QiblaCompass qiblaDirection={qiblaDirection} />)
      await user.click(screen.getByRole('button', { name: /live device compass/i }))
      await waitFor(() => expect(headingCallback).toBeDefined())
      act(() => headingCallback?.({ alpha: 45, accuracy: 20, timestamp: Date.now() }))

      expect(await screen.findByText(/Compass accuracy is low \(20°\)/)).toBeInTheDocument()
      expect(screen.getByText(/figure-eight/)).toBeInTheDocument()
    })

    it('communicates alignment, haptics once, and keeps cardinal directions', async () => {
      const user = userEvent.setup()
      let headingCallback: ((heading: orientation.DeviceHeading) => void) | undefined
      jest.mocked(orientation.startOrientationTracking).mockImplementation((callback) => {
        headingCallback = callback
        return jest.fn()
      })

      render(<QiblaCompass qiblaDirection={qiblaDirection} />)
      await user.click(screen.getByRole('button', { name: /live device compass/i }))
      await waitFor(() => expect(headingCallback).toBeDefined())
      act(() => headingCallback?.({ alpha: 58, accuracy: 5, timestamp: Date.now() }))

      expect(await screen.findByText('Facing Qibla')).toBeInTheDocument()
      expect(qiblaHaptics.triggerQiblaAlignmentHaptic).toHaveBeenCalledTimes(1)
      expect(screen.getByText('N')).toBeInTheDocument()
      expect(screen.getByText('E')).toBeInTheDocument()

      act(() => headingCallback?.({ alpha: 90, accuracy: 5, timestamp: Date.now() }))
      act(() => headingCallback?.({ alpha: 59, accuracy: 5, timestamp: Date.now() }))
      expect(qiblaHaptics.triggerQiblaAlignmentHaptic).toHaveBeenCalledTimes(1)
    })

    it('re-arms alignment feedback only after moving clearly outside tolerance', async () => {
      const user = userEvent.setup()
      let headingCallback: ((heading: orientation.DeviceHeading) => void) | undefined
      const now = jest.spyOn(Date, 'now')
      jest.mocked(orientation.startOrientationTracking).mockImplementation((callback) => {
        headingCallback = callback
        return jest.fn()
      })

      now.mockReturnValue(10_000)
      render(<QiblaCompass qiblaDirection={qiblaDirection} />)
      await user.click(screen.getByRole('button', { name: /live device compass/i }))
      await waitFor(() => expect(headingCallback).toBeDefined())
      act(() => headingCallback?.({ alpha: 58, accuracy: 5, timestamp: 10_000 }))
      expect(qiblaHaptics.triggerQiblaAlignmentHaptic).toHaveBeenCalledTimes(1)

      now.mockReturnValue(13_000)
      act(() => headingCallback?.({ alpha: 64, accuracy: 5, timestamp: 13_000 }))
      act(() => headingCallback?.({ alpha: 59, accuracy: 5, timestamp: 13_010 }))
      expect(qiblaHaptics.triggerQiblaAlignmentHaptic).toHaveBeenCalledTimes(1)

      act(() => headingCallback?.({ alpha: 70, accuracy: 5, timestamp: 13_020 }))
      act(() => headingCallback?.({ alpha: 59, accuracy: 5, timestamp: 13_030 }))
      expect(qiblaHaptics.triggerQiblaAlignmentHaptic).toHaveBeenCalledTimes(2)

      now.mockRestore()
    })

    it('stops tracking when returning to the manual bearing', async () => {
      const user = userEvent.setup()
      const cleanup = jest.fn()
      jest.mocked(orientation.startOrientationTracking).mockReturnValue(cleanup)

      render(<QiblaCompass qiblaDirection={qiblaDirection} />)
      await user.click(screen.getByRole('button', { name: /live device compass/i }))
      await user.click(await screen.findByRole('button', { name: /manual Qibla bearing/i }))

      await waitFor(() => expect(cleanup).toHaveBeenCalled())
      expect(screen.getByRole('button', { name: /live device compass/i })).toBeInTheDocument()
    })
  })
})
