import { render, screen } from '@testing-library/react'
import { NextPrayerCard } from '../NextPrayerCard'

// Mock usePrayerTimes hook
jest.mock('@/hooks/usePrayerTimes', () => ({
  usePrayerTimes: jest.fn(),
}))

import * as usePrayerTimesModule from '@/hooks/usePrayerTimes'

const mockUsePrayerTimes = usePrayerTimesModule.usePrayerTimes as jest.MockedFunction<typeof usePrayerTimesModule.usePrayerTimes>

describe('NextPrayerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: null,
      location: null,
      calculationMethod: '4',
      loading: true,
      error: null,
    })

    render(<NextPrayerCard />)
    
    expect(screen.getByText('Next Prayer')).toBeInTheDocument()
    // Loader2 spinner should be present
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: null,
      location: null,
      calculationMethod: '4',
      loading: false,
      error: 'Failed to load',
    })

    render(<NextPrayerCard />)
    
    expect(screen.getByText('Next Prayer')).toBeInTheDocument()
    expect(screen.getByText(/Unable to load/i)).toBeInTheDocument()
  })

  it('displays prayer time and countdown', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: {
        name: 'Asr',
        time: '15:45',
        countdown: '2h 15m',
        timeUntil: 8100000,
      },
      location: {
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, USA',
        type: 'detected',
      },
      calculationMethod: '4',
      loading: false,
      error: null,
    })

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/Asr in 2h 15m/i)).toBeInTheDocument()
  })

  it('shows calculation method information', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: {
        name: 'Dhuhr',
        time: '12:00',
        countdown: '30m 15s',
        timeUntil: 1815000,
      },
      location: {
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, USA',
        type: 'detected',
      },
      calculationMethod: '4',
      loading: false,
      error: null,
    })

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/Umm al-Qura/i)).toBeInTheDocument()
  })

  it('displays location when available', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: {
        name: 'Maghrib',
        time: '18:00',
        countdown: '1h 30m',
        timeUntil: 5400000,
      },
      location: {
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, USA',
        type: 'detected',
      },
      calculationMethod: '4',
      loading: false,
      error: null,
    })

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/New York, USA/i)).toBeInTheDocument()
  })

  it('displays date', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: {
        name: 'Fajr',
        time: '05:30',
        countdown: '5h 45m',
        timeUntil: 20700000,
      },
      location: null,
      calculationMethod: '4',
      loading: false,
      error: null,
    })

    render(<NextPrayerCard />)
    
    // Check that date is displayed (format: "Nov 12" or similar)
    const dateRegex = /[A-Z][a-z]{2} \d{1,2}/
    expect(screen.getByText(dateRegex)).toBeInTheDocument()
  })

  it('formats time in 12-hour format', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: {
        name: 'Asr',
        time: '15:45',
        countdown: '2h 30m',
        timeUntil: 9000000,
      },
      location: null,
      calculationMethod: '4',
      loading: false,
      error: null,
    })

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/3:45 PM/i)).toBeInTheDocument()
  })

  it('renders clock icon', () => {
    mockUsePrayerTimes.mockReturnValue({
      nextPrayer: {
        name: 'Isha',
        time: '19:30',
        countdown: '45m',
        timeUntil: 2700000,
      },
      location: null,
      calculationMethod: '4',
      loading: false,
      error: null,
    })

    const { container } = render(<NextPrayerCard />)
    
    // Lucide icons render as SVG elements
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})

