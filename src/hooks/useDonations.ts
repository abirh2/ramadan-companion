import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDonations } from '@/lib/donations'
import { convertAmount, formatCurrency, getPreferredCurrency, getViewMode } from '@/lib/currency'
import type { Donation, DonationSummary, DonationFilters, DonationWithConversion, CurrencyViewMode } from '@/types/donation.types'
import type { CurrencyCode } from '@/types/currency.types'

interface UseDonationsResult {
  donations: Donation[]
  displayDonations: DonationWithConversion[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isEmpty: boolean
  summary: DonationSummary
  viewMode: CurrencyViewMode
  setViewMode: (mode: CurrencyViewMode) => void
  preferredCurrency: CurrencyCode
  setPreferredCurrency: (currency: CurrencyCode) => void
  converting: boolean
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

  const [viewMode, setViewModeState] = useState<CurrencyViewMode>('original')
  const [preferredCurrency, setPreferredCurrencyState] = useState<CurrencyCode>('USD')
  const [displayDonations, setDisplayDonations] = useState<DonationWithConversion[]>([])
  const [converting, setConverting] = useState(false)

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  // Initialize view mode and preferred currency from localStorage
  useEffect(() => {
    setViewModeState(getViewMode())
    setPreferredCurrencyState(getPreferredCurrency())
  }, [])

  // Wrapper for setViewMode to update state
  const setViewMode = useCallback((mode: CurrencyViewMode) => {
    setViewModeState(mode)
  }, [])

  // Wrapper for setPreferredCurrency to update state
  const setPreferredCurrency = useCallback((currency: CurrencyCode) => {
    setPreferredCurrencyState(currency)
  }, [])

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

  // Convert donations when view mode or preferred currency changes
  useEffect(() => {
    async function convertDonations() {
      if (viewMode === 'original') {
        // In original mode, no conversion needed
        setDisplayDonations(
          state.donations.map((donation) => ({
            ...donation,
            convertedAmount: donation.amount,
            convertedCurrency: donation.currency,
            conversionRate: 1,
          }))
        )
        return
      }

      // In converted mode, convert all donations to preferred currency
      setConverting(true)
      try {
        const converted = await Promise.all(
          state.donations.map(async (donation) => {
            try {
              const conversion = await convertAmount(
                donation.amount,
                donation.currency,
                preferredCurrency
              )
              return {
                ...donation,
                convertedAmount: conversion.convertedAmount,
                convertedCurrency: conversion.convertedCurrency,
                conversionRate: conversion.rate,
              }
            } catch (error) {
              console.error(`Error converting ${donation.currency} to ${preferredCurrency}:`, error)
              // Fallback to original amount if conversion fails
              return {
                ...donation,
                convertedAmount: donation.amount,
                convertedCurrency: donation.currency,
                conversionRate: 1,
              }
            }
          })
        )
        setDisplayDonations(converted)
      } catch (error) {
        console.error('Error converting donations:', error)
        // Fallback to original amounts
        setDisplayDonations(
          state.donations.map((donation) => ({
            ...donation,
            convertedAmount: donation.amount,
            convertedCurrency: donation.currency,
            conversionRate: 1,
          }))
        )
      } finally {
        setConverting(false)
      }
    }

    convertDonations()
  }, [state.donations, viewMode, preferredCurrency])

  // Calculate summary totals (using converted amounts in converted mode)
  const summary: DonationSummary = {
    ramadanTotal: 0,
    yearlyTotal: 0,
    allTimeTotal: 0,
    totalCount: displayDonations.length,
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

  displayDonations.forEach((donation) => {
    const amount = Number(donation.convertedAmount)
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
    displayDonations,
    loading: state.loading,
    error: state.error,
    refetch: fetchDonations,
    isEmpty: state.donations.length === 0 && !state.loading,
    summary,
    viewMode,
    setViewMode,
    preferredCurrency,
    setPreferredCurrency,
    converting,
  }
}

