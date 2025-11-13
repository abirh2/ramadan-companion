import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDonations } from '@/lib/donations'
import type { Donation, DonationSummary, DonationFilters } from '@/types/donation.types'

interface UseDonationsResult {
  donations: Donation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isEmpty: boolean
  summary: DonationSummary
}

export function useDonations(filters?: DonationFilters): UseDonationsResult {
  const { user } = useAuth()
  const [state, setState] = useState<{
    donations: Donation[]
    loading: boolean
    error: string | null
  }>({
    donations: [],
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchDonations = useCallback(async () => {
    if (!user || isFetchingRef.current) {
      setState({ donations: [], loading: false, error: null })
      return
    }

    isFetchingRef.current = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { donations, error } = await getDonations(user.id, filters)

      if (mountedRef.current) {
        if (error) {
          setState({
            donations: [],
            loading: false,
            error: error,
          })
        } else {
          setState({
            donations: donations || [],
            loading: false,
            error: null,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
      if (mountedRef.current) {
        setState({
          donations: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch donations',
        })
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [user, filters])

  // Calculate summary totals
  const summary: DonationSummary = {
    ramadanTotal: 0,
    yearlyTotal: 0,
    allTimeTotal: 0,
    totalCount: state.donations.length,
  }

  const currentYear = new Date().getFullYear()

  // Calculate Ramadan dates (approximate - we'll use Hijri API in the actual page)
  // For now, using rough estimate: Ramadan is in month 9 of Hijri calendar
  // This is a simplified calculation - the actual component will use precise dates
  // Ramadan 2024 was approximately March 10 - April 9, 2024
  // Ramadan 2025 will be approximately February 28 - March 29, 2025
  // For V1, we'll use a simple 30-day window approach
  const ramadanStart = new Date('2024-03-10') // Placeholder - will be dynamic
  const ramadanEnd = new Date('2024-04-09') // Placeholder - will be dynamic

  state.donations.forEach((donation) => {
    const amount = Number(donation.amount)
    const donationDate = new Date(donation.date)

    // All-time total
    summary.allTimeTotal += amount

    // Yearly total
    if (donationDate.getFullYear() === currentYear) {
      summary.yearlyTotal += amount
    }

    // Ramadan total (simplified - actual implementation will use Hijri calendar)
    if (donationDate >= ramadanStart && donationDate <= ramadanEnd) {
      summary.ramadanTotal += amount
    }
  })

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchDonations()

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchDonations])

  return {
    donations: state.donations,
    loading: state.loading,
    error: state.error,
    refetch: fetchDonations,
    isEmpty: state.donations.length === 0 && !state.loading,
    summary,
  }
}

