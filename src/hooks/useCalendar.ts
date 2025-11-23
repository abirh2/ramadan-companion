'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type {
  CalendarView,
  CalendarDate,
  SchoolFilter,
  UseCalendarResult,
  GregorianMonthApiResponse,
  HijriMonthApiResponse,
} from '@/types/calendar.types'
import {
  getImportantDatesForDay,
  isImportantDate,
  getDefaultSchoolFilter,
} from '@/lib/islamicDates'

/**
 * Custom hook for managing calendar state and data
 * 
 * Features:
 * - Toggle between Gregorian and Islamic calendar views
 * - Navigate months/years
 * - Select dates
 * - Filter important dates by school/madhab
 * - Persist preferences to localStorage + Supabase profile
 */
export function useCalendar(): UseCalendarResult {
  const { profile } = useAuth()

  // State
  const [view, setViewState] = useState<CalendarView>('gregorian')
  // Gregorian calendar state
  const [gregorianMonth, setGregorianMonth] = useState<number>(() => new Date().getMonth() + 1)
  const [gregorianYear, setGregorianYear] = useState<number>(() => new Date().getFullYear())
  // Hijri calendar state (initialized to null, will be set on first load)
  const [hijriMonth, setHijriMonth] = useState<number | null>(null)
  const [hijriYear, setHijriYear] = useState<number | null>(null)
  
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null)
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([])
  const [schoolFilters, setSchoolFiltersState] = useState<SchoolFilter>(getDefaultSchoolFilter())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Get current month/year based on view
  const currentMonth = view === 'gregorian' ? gregorianMonth : (hijriMonth || 1)
  const currentYear = view === 'gregorian' ? gregorianYear : (hijriYear || 1446)

  /**
   * Load preferences from localStorage and profile
   */
  useEffect(() => {
    // Load calendar view preference
    const savedView = localStorage.getItem('calendar_view') as CalendarView | null
    if (savedView && (savedView === 'gregorian' || savedView === 'islamic')) {
      setViewState(savedView)
    }

    // Load school filters
    const savedFilters = localStorage.getItem('calendar_school_filters')
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters) as SchoolFilter
        setSchoolFiltersState(filters)
      } catch (e) {
        console.error('Failed to parse school filters from localStorage:', e)
      }
    }
  }, [])

  /**
   * Fetch calendar data based on current view
   */
  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current date inside the function to avoid dependency issues
      const now = new Date()
      
      let apiUrl: string
      let response: Response

      if (view === 'gregorian') {
        // Fetch Gregorian month with Hijri conversions
        apiUrl = `/api/calendar/gregorian-month?month=${gregorianMonth}&year=${gregorianYear}`
        response = await fetch(apiUrl)
      } else {
        // For Islamic view, use stored Hijri month/year or fetch today's
        let targetHijriMonth = hijriMonth
        let targetHijriYear = hijriYear
        
        if (targetHijriMonth === null || targetHijriYear === null) {
          // First time loading Islamic view - get today's Hijri date
          const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
          const convertResponse = await fetch(`/api/calendar/convert?date=${todayStr}&direction=gToH`)
          
          if (!convertResponse.ok) {
            throw new Error('Failed to convert current date to Hijri')
          }
          
          const convertData = await convertResponse.json()
          targetHijriMonth = convertData.data.hijri.month
          targetHijriYear = convertData.data.hijri.year
          
          // Store in state for future navigation
          setHijriMonth(targetHijriMonth)
          setHijriYear(targetHijriYear)
        }

        apiUrl = `/api/calendar/hijri-month?month=${targetHijriMonth}&year=${targetHijriYear}`
        response = await fetch(apiUrl)
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar data: ${response.statusText}`)
      }

      const data: GregorianMonthApiResponse | HijriMonthApiResponse = await response.json()

      // Transform API data to CalendarDate format
      const dates: CalendarDate[] = data.data.map((dateData) => {
        const isToday = 
          dateData.gregorian.day === now.getDate() &&
          dateData.gregorian.month === now.getMonth() + 1 &&
          dateData.gregorian.year === now.getFullYear()

        const important = isImportantDate(
          dateData.hijri.day,
          dateData.hijri.month,
          schoolFilters
        )

        const importantDates = important
          ? getImportantDatesForDay(
              dateData.hijri.day,
              dateData.hijri.month,
              schoolFilters
            )
          : undefined

        return {
          gregorian: dateData.gregorian,
          hijri: dateData.hijri,
          isToday,
          isSelected: false,
          isImportant: important,
          importantDates,
        }
      })

      setCalendarDates(dates)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load calendar')
      setLoading(false)
    }
  }, [view, gregorianMonth, gregorianYear, hijriMonth, hijriYear, schoolFilters])

  /**
   * Fetch calendar data when dependencies change
   */
  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  /**
   * Set calendar view and save to localStorage
   */
  const setView = useCallback((newView: CalendarView) => {
    setViewState(newView)
    localStorage.setItem('calendar_view', newView)
    
    // TODO: Save to Supabase profile when authenticated
    // if (profile?.id) {
    //   updateProfilePreference('calendar_view', newView)
    // }
  }, [])

  /**
   * Navigate to next month
   */
  const goToNextMonth = useCallback(() => {
    if (view === 'gregorian') {
      if (gregorianMonth === 12) {
        setGregorianMonth(1)
        setGregorianYear(gregorianYear + 1)
      } else {
        setGregorianMonth(gregorianMonth + 1)
      }
    } else {
      // Islamic calendar
      const currentHijriMonth = hijriMonth || 1
      const currentHijriYear = hijriYear || 1446
      
      if (currentHijriMonth === 12) {
        setHijriMonth(1)
        setHijriYear(currentHijriYear + 1)
      } else {
        setHijriMonth(currentHijriMonth + 1)
      }
    }
  }, [view, gregorianMonth, gregorianYear, hijriMonth, hijriYear])

  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = useCallback(() => {
    if (view === 'gregorian') {
      if (gregorianMonth === 1) {
        setGregorianMonth(12)
        setGregorianYear(gregorianYear - 1)
      } else {
        setGregorianMonth(gregorianMonth - 1)
      }
    } else {
      // Islamic calendar
      const currentHijriMonth = hijriMonth || 1
      const currentHijriYear = hijriYear || 1446
      
      if (currentHijriMonth === 1) {
        setHijriMonth(12)
        setHijriYear(currentHijriYear - 1)
      } else {
        setHijriMonth(currentHijriMonth - 1)
      }
    }
  }, [view, gregorianMonth, gregorianYear, hijriMonth, hijriYear])

  /**
   * Navigate to today
   */
  const goToToday = useCallback(() => {
    const now = new Date()
    if (view === 'gregorian') {
      setGregorianMonth(now.getMonth() + 1)
      setGregorianYear(now.getFullYear())
    } else {
      // For Islamic view, we need to fetch today's Hijri date
      const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
      fetch(`/api/calendar/convert?date=${todayStr}&direction=gToH`)
        .then((res) => res.json())
        .then((data) => {
          setHijriMonth(data.data.hijri.month)
          setHijriYear(data.data.hijri.year)
        })
        .catch((err) => {
          console.error('Failed to get today\'s Hijri date:', err)
        })
    }
  }, [view])

  /**
   * Select a date
   */
  const selectDate = useCallback((date: CalendarDate) => {
    // Mark selected date
    const updatedDates = calendarDates.map((d) => ({
      ...d,
      isSelected:
        d.gregorian.day === date.gregorian.day &&
        d.gregorian.month === date.gregorian.month &&
        d.gregorian.year === date.gregorian.year,
    }))
    
    setCalendarDates(updatedDates)
    setSelectedDate(date)
  }, [calendarDates])

  /**
   * Set school filters and save to localStorage
   */
  const setSchoolFilters = useCallback((filters: SchoolFilter) => {
    setSchoolFiltersState(filters)
    localStorage.setItem('calendar_school_filters', JSON.stringify(filters))
    
    // TODO: Save to Supabase profile when authenticated
    // if (profile?.id) {
    //   updateProfilePreference('calendar_school_filters', filters)
    // }
  }, [])

  return {
    view,
    currentMonth,
    currentYear,
    selectedDate,
    calendarDates,
    schoolFilters,
    loading,
    error,
    setView,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    selectDate,
    setSchoolFilters,
  }
}

