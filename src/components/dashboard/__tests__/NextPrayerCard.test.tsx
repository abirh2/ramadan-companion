import { render, screen } from '@testing-library/react'
import { NextPrayerCard } from '../NextPrayerCard'

// Mock usePrayerTimes hook
jest.mock('@/hooks/usePrayerTimes', () => ({
  usePrayerTimes: jest.fn(),
}))

import * as usePrayerTimesModule from '@/hooks/usePrayerTimes'
import type { UsePrayerTimesResult } from '@/types/ramadan.types'

const mockUsePrayerTimes = usePrayerTimesModule.usePrayerTimes as jest.MockedFunction<typeof usePrayerTimesModule.usePrayerTimes>

const createPrayerTimesResult = (
  overrides: Partial<UsePrayerTimesResult> = {}
): UsePrayerTimesResult => ({
  prayerTimes: null,
  nextPrayer: null,
  qiblaDirection: null,
  location: null,
  calculationMethod: '4',
  madhab: '0',
  calculationSource: null,
  loading: false,
  error: null,
  refetch: jest.fn(async () => {}),
  updateLocation: jest.fn(async () => {}),
  updateCalculationMethod: jest.fn(async () => {}),
  updateMadhab: jest.fn(async () => {}),
  ...overrides,
})

describe('NextPrayerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
      nextPrayer: null,
      location: null,
      calculationMethod: '4',
      loading: true,
      error: null,
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByText('Next prayer')).toBeInTheDocument()
    expect(screen.getByText(/Loading today's prayer times/i)).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
      nextPrayer: null,
      location: null,
      calculationMethod: '4',
      loading: false,
      error: 'Failed to load',
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/Prayer times need your attention/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /review prayer settings/i })).toHaveAttribute('href', '/times')
  })

  it('displays prayer time and countdown', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
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
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByRole('heading', { name: 'Asr' })).toBeInTheDocument()
    expect(screen.getByText('2h 15m')).toHaveClass('min-w-[7ch]', 'tabular-nums')
  })

  it('shows the next prayer as a semantic heading', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
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
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByRole('heading', { name: 'Dhuhr' })).toBeInTheDocument()
  })

  it('displays location when available', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
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
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/New York, USA/i)).toBeInTheDocument()
  })

  it('labels tomorrow prayers explicitly', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
      nextPrayer: {
        name: 'Fajr',
        time: '05:30',
        countdown: '5h 45m',
        timeUntil: 20700000,
        isTomorrow: true,
      },
      location: null,
      calculationMethod: '4',
      loading: false,
      error: null,
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByRole('heading', { name: /Fajr tomorrow/i })).toBeInTheDocument()
  })

  it('formats time in 12-hour format', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
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
    }))

    render(<NextPrayerCard />)
    
    expect(screen.getByText(/3:45 PM/i)).toBeInTheDocument()
  })

  it('renders clock icon', () => {
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult({
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
    }))

    const { container } = render(<NextPrayerCard />)
    
    // Lucide icons render as SVG elements
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
