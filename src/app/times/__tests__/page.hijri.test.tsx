import { render, screen } from '@testing-library/react'

// The page depends on the prayer-times / tracking / auth hooks. We mock them so
// the test can focus on the Hijri fetch + 5s-timeout fallback behavior in the
// page's fetchHijriDate effect (R2.3). The hooks are driven to a loaded,
// error-free state so the schedule (and its ScheduleHeader) renders.
jest.mock('@/hooks/usePrayerTimes', () => ({
  usePrayerTimes: jest.fn(),
}))
jest.mock('@/hooks/usePrayerTracking', () => ({
  usePrayerTracking: jest.fn(),
}))
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

import TimesPage from '@/app/times/page'
import * as usePrayerTimesModule from '@/hooks/usePrayerTimes'
import * as usePrayerTrackingModule from '@/hooks/usePrayerTracking'
import * as useAuthModule from '@/hooks/useAuth'
import type { UsePrayerTimesResult } from '@/types/ramadan.types'

const mockUsePrayerTimes = usePrayerTimesModule.usePrayerTimes as jest.MockedFunction<
  typeof usePrayerTimesModule.usePrayerTimes
>
const mockUsePrayerTracking = usePrayerTrackingModule.usePrayerTracking as jest.MockedFunction<
  typeof usePrayerTrackingModule.usePrayerTracking
>
const mockUseAuth = useAuthModule.useAuth as jest.MockedFunction<typeof useAuthModule.useAuth>

const createPrayerTimesResult = (
  overrides: Partial<UsePrayerTimesResult> = {}
): UsePrayerTimesResult => ({
  prayerTimes: null,
  nextPrayer: null,
  qiblaDirection: null,
  location: { city: 'London' } as UsePrayerTimesResult['location'],
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

const createTrackingResult = () =>
  ({
    todayCompletion: null,
    statistics: null,
    timeRange: '30days',
    loading: false,
    error: null,
    accountCreatedAt: null,
    togglePrayer: jest.fn(async () => {}),
    setTimeRange: jest.fn(),
    refetch: jest.fn(async () => {}),
  }) as unknown as ReturnType<typeof usePrayerTrackingModule.usePrayerTracking>

// The page derives the Gregorian date from `new Date()`; compute the same
// label here so the test asserts the actual rendered value.
const expectedGregorian = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
})

describe('TimesPage — Hijri timeout fallback (R2.3)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePrayerTimes.mockReturnValue(createPrayerTimesResult())
    mockUsePrayerTracking.mockReturnValue(createTrackingResult())
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuthModule.useAuth>)
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('shows the Hijri date when /api/hijri responds successfully within the timeout', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        currentHijri: { day: 24, monthName: 'Rajab', year: 1447 },
      }),
    }) as unknown as typeof fetch

    render(<TimesPage />)

    // The formatted Hijri date appears once the effect resolves.
    expect(await screen.findByText('24 Rajab 1447')).toBeInTheDocument()
    // Gregorian date remains visible alongside it.
    expect(screen.getByText(expectedGregorian)).toBeInTheDocument()
    // No unavailable indicator in the success case.
    expect(screen.queryByText('Hijri date unavailable')).not.toBeInTheDocument()
  })

  it('sets hijriUnavailable and keeps Gregorian visible when the fetch fails/times out', async () => {
    // A rejected fetch models both a network failure and the 5s AbortSignal
    // timeout (which surfaces as a rejected promise / TimeoutError).
    global.fetch = jest
      .fn()
      .mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError')) as unknown as typeof fetch

    render(<TimesPage />)

    // The fallback indicator appears once the effect's catch branch runs.
    expect(await screen.findByText('Hijri date unavailable')).toBeInTheDocument()
    // Gregorian date stays visible even though the Hijri lookup failed.
    expect(screen.getByText(expectedGregorian)).toBeInTheDocument()
    // No formatted Hijri date is shown in the failure case.
    expect(screen.queryByText(/\d+ \w+ \d{4}/)).not.toBeInTheDocument()
  })

  it('sets hijriUnavailable when /api/hijri responds with a non-ok status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch

    render(<TimesPage />)

    expect(await screen.findByText('Hijri date unavailable')).toBeInTheDocument()
    expect(screen.getByText(expectedGregorian)).toBeInTheDocument()
  })
})
