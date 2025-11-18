'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type {
  PrayerTrackingRecord,
  DailyPrayerCompletion,
  PrayerStatistics,
  TimeRange,
  PrayerName,
  UsePrayerTrackingResult,
} from '@/types/prayer-tracking.types'
import {
  getTodayDateString,
  getDateRangeForTimeRange,
  calculateStatistics,
  saveTodayToLocalStorage,
  getTodayFromLocalStorage,
  clearOldLocalStorageData,
  syncLocalStorageToDatabase,
  prayerToColumnName,
} from '@/lib/prayerTracking'

export function usePrayerTracking(): UsePrayerTrackingResult {
  const { user, profile } = useAuth()
  const [state, setState] = useState<{
    todayCompletion: DailyPrayerCompletion | null
    statistics: PrayerStatistics | null
    timeRange: TimeRange
    loading: boolean
    error: string | null
  }>({
    todayCompletion: null,
    statistics: null,
    timeRange: '30days',
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)
  const hasSyncedRef = useRef(false)
  const lastCheckDateRef = useRef<string>(getTodayDateString())
  const timeRangeRef = useRef<TimeRange>('30days')

  // Fetch data (today + historical for authenticated users)
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      if (!user) {
        // Guest user - use localStorage only
        const todayCompletion = getTodayFromLocalStorage()
        if (mountedRef.current) {
          setState({
            todayCompletion,
            statistics: null,
            timeRange: timeRangeRef.current,
            loading: false,
            error: null,
          })
        }
      } else {
        // Authenticated user - use database
        const supabase = createClient()
        const today = getTodayDateString()
        const { startDate, endDate } = getDateRangeForTimeRange(timeRangeRef.current)

        // Fetch records in date range
        const { data: records, error } = await supabase
          .from('prayer_tracking')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (error) {
          throw new Error(error.message)
        }

        // Find or create today's record
        const todayRecord = records?.find((r) => r.date === today)
        let todayCompletion: DailyPrayerCompletion

        if (todayRecord) {
          todayCompletion = {
            date: todayRecord.date,
            fajr_completed: todayRecord.fajr_completed,
            dhuhr_completed: todayRecord.dhuhr_completed,
            asr_completed: todayRecord.asr_completed,
            maghrib_completed: todayRecord.maghrib_completed,
            isha_completed: todayRecord.isha_completed,
            totalCompleted:
              (todayRecord.fajr_completed ? 1 : 0) +
              (todayRecord.dhuhr_completed ? 1 : 0) +
              (todayRecord.asr_completed ? 1 : 0) +
              (todayRecord.maghrib_completed ? 1 : 0) +
              (todayRecord.isha_completed ? 1 : 0),
            completionRate: 0,
          }
          todayCompletion.completionRate = (todayCompletion.totalCompleted / 5) * 100
        } else {
          todayCompletion = {
            date: today,
            fajr_completed: false,
            dhuhr_completed: false,
            asr_completed: false,
            maghrib_completed: false,
            isha_completed: false,
            totalCompleted: 0,
            completionRate: 0,
          }
        }

        // Calculate statistics
        const statistics = calculateStatistics(
          (records as PrayerTrackingRecord[]) || [],
          timeRangeRef.current,
          profile?.created_at || null
        )

        if (mountedRef.current) {
          setState({
            todayCompletion,
            statistics,
            timeRange: timeRangeRef.current,
            loading: false,
            error: null,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching prayer tracking:', error)
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch prayer tracking',
        }))
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [user, profile])

  // Sync localStorage to database on sign-in
  useEffect(() => {
    if (user && !hasSyncedRef.current) {
      hasSyncedRef.current = true
      syncLocalStorageToDatabase(user.id).then(() => {
        // After sync, fetch fresh data from database
        fetchData()
      })
    }
  }, [user, fetchData])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    clearOldLocalStorageData() // Cleanup old localStorage data
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  // Check for midnight crossing and refetch
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const today = getTodayDateString()
      if (lastCheckDateRef.current !== today) {
        lastCheckDateRef.current = today
        clearOldLocalStorageData()
        hasSyncedRef.current = false // Reset sync flag for new day
        fetchData()
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkMidnight)
  }, [fetchData])

  // Toggle prayer completion
  const togglePrayer = useCallback(
    async (prayer: PrayerName) => {
      if (!state.todayCompletion) return

      const columnName = prayerToColumnName(prayer) as keyof DailyPrayerCompletion
      const newValue = !state.todayCompletion[columnName]
      const today = getTodayDateString()

      // Optimistic update
      const updatedCompletion: DailyPrayerCompletion = {
        ...state.todayCompletion,
        [columnName]: newValue,
      }

      // Recalculate total
      updatedCompletion.totalCompleted =
        (updatedCompletion.fajr_completed ? 1 : 0) +
        (updatedCompletion.dhuhr_completed ? 1 : 0) +
        (updatedCompletion.asr_completed ? 1 : 0) +
        (updatedCompletion.maghrib_completed ? 1 : 0) +
        (updatedCompletion.isha_completed ? 1 : 0)
      updatedCompletion.completionRate = (updatedCompletion.totalCompleted / 5) * 100

      setState((prev) => ({
        ...prev,
        todayCompletion: updatedCompletion,
      }))

      try {
        if (!user) {
          // Guest user - save to localStorage
          saveTodayToLocalStorage(updatedCompletion)
        } else {
          // Authenticated user - save to database
          const supabase = createClient()

          // Check if record exists
          const { data: existing } = await supabase
            .from('prayer_tracking')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

          const record = {
            user_id: user.id,
            date: today,
            fajr_completed: updatedCompletion.fajr_completed,
            dhuhr_completed: updatedCompletion.dhuhr_completed,
            asr_completed: updatedCompletion.asr_completed,
            maghrib_completed: updatedCompletion.maghrib_completed,
            isha_completed: updatedCompletion.isha_completed,
          }

          if (existing) {
            // Update existing record
            const { error } = await supabase
              .from('prayer_tracking')
              .update(record)
              .eq('id', existing.id)

            if (error) throw error
          } else {
            // Insert new record
            const { error } = await supabase.from('prayer_tracking').insert(record)

            if (error) throw error
          }

          // Refetch to update statistics
          await fetchData()
        }
      } catch (error) {
        console.error('Error toggling prayer:', error)
        // Revert optimistic update on error
        setState((prev) => ({
          ...prev,
          todayCompletion: state.todayCompletion,
          error: error instanceof Error ? error.message : 'Failed to update prayer',
        }))
      }
    },
    [state.todayCompletion, user, fetchData]
  )

  // Change time range
  const setTimeRange = useCallback(
    (range: TimeRange) => {
      timeRangeRef.current = range
      setState((prev) => ({
        ...prev,
        timeRange: range,
        loading: true,
      }))
      // Trigger refetch with new time range
      isFetchingRef.current = false
      fetchData()
    },
    [fetchData]
  )

  // Refetch function
  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    await fetchData()
  }, [fetchData])

  return {
    ...state,
    accountCreatedAt: profile?.created_at || null,
    togglePrayer,
    setTimeRange,
    refetch,
  }
}

