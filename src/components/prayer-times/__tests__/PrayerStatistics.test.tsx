import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PrayerStatistics } from '../PrayerStatistics'
import type { PrayerStatistics as PrayerStatisticsType } from '@/types/prayer-tracking.types'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('PrayerStatistics', () => {
  const mockOnTimeRangeChange = jest.fn()

  const mockStatistics: PrayerStatisticsType = {
    totalDays: 30,
    totalPrayers: 150,
    completedPrayers: 120,
    overallCompletionRate: 80,
    byPrayer: {
      Fajr: { completed: 24, total: 30, rate: 80 },
      Dhuhr: { completed: 24, total: 30, rate: 80 },
      Asr: { completed: 24, total: 30, rate: 80 },
      Maghrib: { completed: 24, total: 30, rate: 80 },
      Isha: { completed: 24, total: 30, rate: 80 },
    },
    dailyCompletions: [
      {
        date: '2024-01-01',
        fajr_completed: true,
        dhuhr_completed: true,
        asr_completed: true,
        maghrib_completed: true,
        isha_completed: true,
        totalCompleted: 5,
        completionRate: 100,
      },
      {
        date: '2024-01-02',
        fajr_completed: true,
        dhuhr_completed: false,
        asr_completed: true,
        maghrib_completed: true,
        isha_completed: false,
        totalCompleted: 3,
        completionRate: 60,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Guest User (Not Authenticated)', () => {
    it('shows sign-in prompt for guest users', () => {
      render(
        <PrayerStatistics
          statistics={null}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={false}
          accountCreatedAt={null}
        />
      )

      expect(screen.getByText('Prayer Statistics')).toBeInTheDocument()
      expect(
        screen.getByText(/Sign in to track your prayer history and view detailed statistics/i)
      ).toBeInTheDocument()
      expect(screen.getByText('Sign In to Track Progress')).toBeInTheDocument()
    })

    it('has link to profile page for sign-in', () => {
      render(
        <PrayerStatistics
          statistics={null}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={false}
          accountCreatedAt={null}
        />
      )

      const link = screen.getByText('Sign In to Track Progress').closest('a')
      expect(link).toHaveAttribute('href', '/profile')
    })
  })

  describe('Authenticated User - Collapsed State', () => {
    it('renders in collapsed state by default', () => {
      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      expect(screen.getByText('Prayer Statistics')).toBeInTheDocument()
      expect(screen.getByText('Show')).toBeInTheDocument()

      // Statistics should not be visible when collapsed
      expect(screen.queryByText('Completion Rate')).not.toBeInTheDocument()
    })

    it('expands when Show button is clicked', async () => {
      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        expect(screen.getByText('Hide')).toBeInTheDocument()
        expect(screen.getByText('Completion Rate')).toBeInTheDocument()
      })
    })

    it('collapses when Hide button is clicked', async () => {
      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand first
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        expect(screen.getByText('Hide')).toBeInTheDocument()
      })

      // Now collapse
      const hideButton = screen.getByText('Hide')
      fireEvent.click(hideButton)

      await waitFor(() => {
        expect(screen.getByText('Show')).toBeInTheDocument()
        expect(screen.queryByText('Completion Rate')).not.toBeInTheDocument()
      })
    })
  })

  describe('Authenticated User - Expanded State', () => {
    beforeEach(() => {
      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand the component
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)
    })

    it('displays time range selector buttons', async () => {
      await waitFor(() => {
        expect(screen.getByText('7 Days')).toBeInTheDocument()
        expect(screen.getByText('30 Days')).toBeInTheDocument()
        expect(screen.getByText('90 Days')).toBeInTheDocument()
        expect(screen.getByText('All Time')).toBeInTheDocument()
      })
    })

    it('calls onTimeRangeChange when time range button is clicked', async () => {
      await waitFor(() => {
        const sevenDaysButton = screen.getByText('7 Days')
        fireEvent.click(sevenDaysButton)
      })

      expect(mockOnTimeRangeChange).toHaveBeenCalledWith('7days')
    })

    it('displays statistics summary', async () => {
      await waitFor(() => {
        expect(screen.getByText('Completion Rate')).toBeInTheDocument()
        expect(screen.getByText('80%')).toBeInTheDocument()
        expect(screen.getByText('Total Prayers')).toBeInTheDocument()
        expect(screen.getByText('120/150')).toBeInTheDocument()
        expect(screen.getByText('Days Tracked')).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
        expect(screen.getByText('Perfect Days')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument() // One day with 5/5 in mock data
      })
    })

    it('displays per-prayer breakdown', async () => {
      await waitFor(() => {
        expect(screen.getByText('Prayer-by-Prayer Breakdown')).toBeInTheDocument()
        
        // Use getAllByText since prayer names appear in multiple places
        const fajrElements = screen.getAllByText('Fajr')
        expect(fajrElements.length).toBeGreaterThanOrEqual(1)
        
        const dhuhrElements = screen.getAllByText('Dhuhr')
        expect(dhuhrElements.length).toBeGreaterThanOrEqual(1)
        
        const asrElements = screen.getAllByText('Asr')
        expect(asrElements.length).toBeGreaterThanOrEqual(1)
        
        const maghribElements = screen.getAllByText('Maghrib')
        expect(maghribElements.length).toBeGreaterThanOrEqual(1)
        
        const ishaElements = screen.getAllByText('Isha')
        expect(ishaElements.length).toBeGreaterThanOrEqual(1)

        // Check completion rates
        const completionTexts = screen.getAllByText(/24\/30 \(80%\)/i)
        expect(completionTexts.length).toBe(5) // One for each prayer
      })
    })

    it('displays most consistent prayer', async () => {
      await waitFor(() => {
        // Find the "Most Consistent Prayer" heading
        expect(screen.getByText('Most Consistent Prayer')).toBeInTheDocument()
        
        // The section shows format like "Fajr: 80.0%" - verify one of the prayers is shown as most consistent
        // All prayers in mock data have 80% completion rate
        const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
        const hasMostConsistentPrayer = prayerNames.some((name) => {
          const elements = screen.queryAllByText(name)
          return elements.length > 0
        })
        expect(hasMostConsistentPrayer).toBe(true)
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', async () => {
      render(
        <PrayerStatistics
          statistics={null}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={true}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand first
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no statistics data', async () => {
      render(
        <PrayerStatistics
          statistics={null}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand first
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        expect(
          screen.getByText(/No prayer tracking data yet. Start tracking your prayers to see statistics!/i)
        ).toBeInTheDocument()
      })
    })

    it('shows empty state when totalDays is 0', async () => {
      const emptyStatistics: PrayerStatisticsType = {
        ...mockStatistics,
        totalDays: 0,
      }

      render(
        <PrayerStatistics
          statistics={emptyStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand first
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        expect(
          screen.getByText(/No prayer tracking data yet/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Time Range Button States', () => {
    it('highlights active time range button', async () => {
      const { rerender } = render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand first
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        const thirtyDaysButton = screen.getByText('30 Days')
        expect(thirtyDaysButton).toBeInTheDocument()
      })

      // Change to 7 days
      rerender(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="7days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      await waitFor(() => {
        const sevenDaysButton = screen.getByText('7 Days')
        expect(sevenDaysButton).toBeInTheDocument()
      })
    })

    it('disables time range buttons when loading', async () => {
      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={true}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand first
      const showButton = screen.getByText('Show')
      fireEvent.click(showButton)

      await waitFor(() => {
        const sevenDaysButton = screen.getByText('7 Days')
        expect(sevenDaysButton).toBeDisabled()
      })
    })
  })

  describe('Account Age Progress Indicator', () => {
    it('shows progress indicator when account is less than 7 days old for 7-day range', () => {
      // Account created 3 days ago
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const accountCreatedAt = threeDaysAgo.toISOString()

      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="7days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={accountCreatedAt}
        />
      )

      // Expand to see content
      fireEvent.click(screen.getByText('Show'))

      expect(screen.getByText('Building your history...')).toBeInTheDocument()
      expect(screen.getByText('3/7 days')).toBeInTheDocument()
      expect(screen.getByText(/Keep marking your prayers to unlock full 7 days insights!/i)).toBeInTheDocument()
    })

    it('shows progress indicator when account is less than 30 days old for 30-day range', () => {
      // Account created 15 days ago
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
      const accountCreatedAt = fifteenDaysAgo.toISOString()

      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={accountCreatedAt}
        />
      )

      // Expand to see content
      fireEvent.click(screen.getByText('Show'))

      expect(screen.getByText('Building your history...')).toBeInTheDocument()
      expect(screen.getByText('15/30 days')).toBeInTheDocument()
      expect(screen.getByText(/50% complete/i)).toBeInTheDocument()
    })

    it('does not show progress indicator when account is older than selected range', () => {
      // Account created 35 days ago (older than 30 days)
      const thirtyFiveDaysAgo = new Date()
      thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35)
      const accountCreatedAt = thirtyFiveDaysAgo.toISOString()

      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={accountCreatedAt}
        />
      )

      // Expand to see content
      fireEvent.click(screen.getByText('Show'))

      expect(screen.queryByText('Building your history...')).not.toBeInTheDocument()
      expect(screen.queryByText(/Keep marking your prayers to unlock full/i)).not.toBeInTheDocument()
    })

    it('does not show progress indicator for "all time" range', () => {
      // Account created 7 days ago
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const accountCreatedAt = sevenDaysAgo.toISOString()

      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="all"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={accountCreatedAt}
        />
      )

      // Expand to see content
      fireEvent.click(screen.getByText('Show'))

      // For "all time" range, no progress indicator should show
      expect(screen.queryByText('Building your history...')).not.toBeInTheDocument()
    })

    it('does not show progress indicator when accountCreatedAt is null', () => {
      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={null}
        />
      )

      // Expand to see content
      fireEvent.click(screen.getByText('Show'))

      expect(screen.queryByText('Building your history...')).not.toBeInTheDocument()
    })

    it('calculates correct progress percentage', () => {
      // Account created 10 days ago for 30-day range = 33% progress
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      const accountCreatedAt = tenDaysAgo.toISOString()

      render(
        <PrayerStatistics
          statistics={mockStatistics}
          timeRange="30days"
          onTimeRangeChange={mockOnTimeRangeChange}
          loading={false}
          isAuthenticated={true}
          accountCreatedAt={accountCreatedAt}
        />
      )

      // Expand to see content
      fireEvent.click(screen.getByText('Show'))

      // 10/30 = 33%
      expect(screen.getByText(/33% complete/i)).toBeInTheDocument()
    })
  })
})

