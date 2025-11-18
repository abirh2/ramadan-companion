'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type {
  PrayerTime,
  NextPrayerInfo,
  QiblaData,
  LocationData,
  CalculationMethodId,
  MadhabId,
  PrayerTimesSource,
  UsePrayerTimesResult,
  PrayerTimesApiResponse,
  QiblaApiResponse,
} from '@/types/ramadan.types'
import {
  getUserLocation,
  requestGeolocation,
  saveLocationToStorage,
  MECCA_COORDS,
} from '@/lib/location'
import { calculatePrayerTimesLocal, validatePrayerTimes } from '@/lib/prayerTimes'

// Prayer names in order (excluding Sunrise for next prayer calculation)
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export function usePrayerTimes(): UsePrayerTimesResult {
  const { profile } = useAuth()
  const [state, setState] = useState<{
    prayerTimes: PrayerTime | null
    tomorrowPrayerTimes: PrayerTime | null
    nextPrayer: NextPrayerInfo | null
    qiblaDirection: QiblaData | null
    location: LocationData | null
    calculationMethod: CalculationMethodId
    madhab: MadhabId
    calculationSource: PrayerTimesSource
    loading: boolean
    error: string | null
  }>({
    prayerTimes: null,
    tomorrowPrayerTimes: null,
    nextPrayer: null,
    qiblaDirection: null,
    location: null,
    calculationMethod: '4', // Default: Umm al-Qura
    madhab: '0', // Default: Standard (Shafi/Maliki/Hanbali)
    calculationSource: null,
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  const lastDateRef = useRef<string>(new Date().toDateString())
  const lastPrayerNameRef = useRef<string | null>(null)

  // Calculate next prayer and countdown
  const calculateNextPrayer = useCallback((
    prayerTimes: PrayerTime, 
    tomorrowPrayerTimes: PrayerTime | null = null
  ): NextPrayerInfo | null => {
    const now = new Date()
    const currentTime = now.getTime()

    // Parse all prayer times
    const prayerSchedule = PRAYER_NAMES.map((name) => {
      const timeString = prayerTimes[name]
      const [hours, minutes] = timeString.split(':').map(Number)
      const prayerTime = new Date(now)
      prayerTime.setHours(hours, minutes, 0, 0)
      return { name, time: prayerTime, timeString }
    })

    // Find next prayer
    for (const prayer of prayerSchedule) {
      if (prayer.time.getTime() > currentTime) {
        const timeUntil = prayer.time.getTime() - currentTime
        const hours = Math.floor(timeUntil / (1000 * 60 * 60))
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000)

        let countdown: string
        if (hours > 0) {
          countdown = `${hours}h ${minutes}m ${seconds}s`
        } else if (minutes > 0) {
          countdown = `${minutes}m ${seconds}s`
        } else {
          countdown = `${seconds}s`
        }

        return {
          name: prayer.name,
          time: prayer.timeString,
          countdown,
          timeUntil,
          isTomorrow: false,
        }
      }
    }

    // If no prayer found today, next prayer is tomorrow's Fajr
    // Use tomorrow's actual times if available
    if (tomorrowPrayerTimes) {
      const [hours, minutes] = tomorrowPrayerTimes.Fajr.split(':').map(Number)
      const tomorrowFajr = new Date(now)
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
      tomorrowFajr.setHours(hours, minutes, 0, 0)
      
      const timeUntil = tomorrowFajr.getTime() - currentTime
      const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60))
      const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
      const secondsUntil = Math.floor((timeUntil % (1000 * 60)) / 1000)

      return {
        name: 'Fajr',
        time: tomorrowPrayerTimes.Fajr,
        countdown: `${hoursUntil}h ${minutesUntil}m ${secondsUntil}s`,
        timeUntil,
        isTomorrow: true,
      }
    }

    // Fallback: use today's Fajr + 24 hours if tomorrow's times not available
    const fajr = prayerSchedule[0]
    const tomorrowFajr = new Date(fajr.time)
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
    const timeUntil = tomorrowFajr.getTime() - currentTime
    const hours = Math.floor(timeUntil / (1000 * 60 * 60))
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000)

    return {
      name: 'Fajr',
      time: fajr.timeString,
      countdown: `${hours}h ${minutes}m ${seconds}s`,
      timeUntil,
      isTomorrow: true,
    }
  }, [])

  // Fetch tomorrow's prayer times
  const fetchTomorrowPrayerTimes = useCallback(async (
    location: LocationData,
    method: CalculationMethodId,
    madhab: MadhabId,
    timezone: string
  ): Promise<PrayerTime | null> => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Format date as DD-MM-YYYY for AlAdhan API
      const day = String(tomorrow.getDate()).padStart(2, '0')
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const year = tomorrow.getFullYear()
      const dateString = `${day}-${month}-${year}`

      // Try API first
      try {
        const response = await fetch(
          `/api/prayertimes?latitude=${location.lat}&longitude=${location.lng}&method=${method}&school=${madhab}&timezone=${encodeURIComponent(timezone)}&date=${dateString}`,
          { signal: AbortSignal.timeout(10000) }
        )

        if (response.ok) {
          const data: PrayerTimesApiResponse = await response.json()
          return data.data.timings
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (apiError) {
        // API failed - fall back to local calculation
        console.warn('AlAdhan API unavailable for tomorrow, using local calculation:', apiError)
        
        const localTimes = calculatePrayerTimesLocal(
          location.lat,
          location.lng,
          method,
          madhab,
          timezone,
          tomorrow
        )

        if (validatePrayerTimes(localTimes)) {
          return localTimes
        } else {
          throw new Error('Local calculation produced invalid times')
        }
      }
    } catch (error) {
      console.error('Failed to fetch tomorrow\'s prayer times:', error)
      return null
    }
  }, [])

  // Fetch prayer times and Qibla
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) {
      return
    }
    isFetchingRef.current = true

    try {
      // Get location with fallback chain
      let location = getUserLocation(profile)

      // If no location, try geolocation
      if (!location) {
        const geoLocation = await requestGeolocation()
        if (geoLocation) {
          location = geoLocation
          // Save to storage
          await saveLocationToStorage(
            geoLocation.lat,
            geoLocation.lng,
            geoLocation.city,
            'detected'
          )
        } else {
          // Fall back to Mecca
          location = MECCA_COORDS
        }
      }

      // Get calculation method from profile or localStorage
      let method: CalculationMethodId = '4'
      if (profile?.calculation_method) {
        method = profile.calculation_method as CalculationMethodId
      } else if (typeof window !== 'undefined') {
        const storedMethod = localStorage.getItem('calculation_method')
        if (storedMethod) {
          method = storedMethod as CalculationMethodId
        }
      }

      // Get madhab from profile or localStorage
      let madhab: MadhabId = '0'
      if (profile?.madhab) {
        madhab = (profile.madhab === 'hanafi' ? '1' : '0') as MadhabId
      } else if (typeof window !== 'undefined') {
        const storedMadhab = localStorage.getItem('madhab')
        if (storedMadhab) {
          madhab = storedMadhab as MadhabId
        }
      }

      // Get browser timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Try to fetch prayer times from API first
      let prayerTimes: PrayerTime | null = null
      let calculationSource: PrayerTimesSource = null

      try {
        const prayerTimesResponse = await fetch(
          `/api/prayertimes?latitude=${location.lat}&longitude=${location.lng}&method=${method}&school=${madhab}&timezone=${encodeURIComponent(timezone)}`,
          { signal: AbortSignal.timeout(10000) } // 10 second timeout
        )

        if (prayerTimesResponse.ok) {
          const prayerTimesData: PrayerTimesApiResponse = await prayerTimesResponse.json()
          prayerTimes = prayerTimesData.data.timings
          calculationSource = 'api'
        } else {
          throw new Error(`API returned ${prayerTimesResponse.status}`)
        }
      } catch (apiError) {
        // API failed - fall back to local calculation
        console.warn('AlAdhan API unavailable, falling back to local calculation:', apiError)
        
        try {
          prayerTimes = calculatePrayerTimesLocal(
            location.lat,
            location.lng,
            method,
            madhab,
            timezone
          )

          // Validate calculated times
          if (validatePrayerTimes(prayerTimes)) {
            calculationSource = 'local'
            console.info('Prayer times calculated locally using PrayTime library')
          } else {
            throw new Error('Local calculation produced invalid prayer times')
          }
        } catch (localError) {
          console.error('Local calculation also failed:', localError)
          throw new Error('Unable to calculate prayer times. Please check your connection.')
        }
      }

      // If we still don't have prayer times, bail out
      if (!prayerTimes || !calculationSource) {
        throw new Error('Failed to obtain prayer times from any source')
      }

      // Fetch Qibla direction (optional, can fail independently)
      let qiblaData: QiblaData | null = null
      try {
        const qiblaResponse = await fetch(
          `/api/qibla?latitude=${location.lat}&longitude=${location.lng}`,
          { signal: AbortSignal.timeout(10000) }
        )

        if (qiblaResponse.ok) {
          const qibla: QiblaApiResponse = await qiblaResponse.json()
          qiblaData = qibla.data
        }
      } catch (qiblaError) {
        console.warn('Failed to fetch Qibla direction:', qiblaError)
        // Continue without Qibla data
      }

      if (!mountedRef.current) return

      // Check if Isha has passed - if so, proactively fetch tomorrow's times
      const [ishaHours, ishaMinutes] = prayerTimes.Isha.split(':').map(Number)
      const ishaTime = new Date()
      ishaTime.setHours(ishaHours, ishaMinutes, 0, 0)
      const now = new Date()
      const ishaHasPassed = now.getTime() > ishaTime.getTime()

      let tomorrowTimes: PrayerTime | null = null
      if (ishaHasPassed) {
        tomorrowTimes = await fetchTomorrowPrayerTimes(location, method, madhab, timezone)
      }

      // Calculate next prayer with tomorrow's times if available
      const nextPrayer = calculateNextPrayer(prayerTimes, tomorrowTimes)
      
      // Initialize lastPrayerNameRef
      lastPrayerNameRef.current = nextPrayer?.name || null

      setState({
        prayerTimes,
        tomorrowPrayerTimes: tomorrowTimes,
        nextPrayer,
        qiblaDirection: qiblaData,
        location,
        calculationMethod: method,
        madhab,
        calculationSource,
        loading: false,
        error: null,
      })

      // Note: Notifications now handled by backend cron + Web Push API

      // Start countdown interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return
        
        // Check if day changed (crossed midnight) - refetch everything
        const currentDate = new Date().toDateString()
        if (lastDateRef.current !== currentDate) {
          lastDateRef.current = currentDate
          fetchData()
          return
        }
        
        const updatedNextPrayer = calculateNextPrayer(prayerTimes!, tomorrowTimes)
        
        // Track prayer changes (notifications now handled by backend)
        const currentPrayerName = updatedNextPrayer?.name || null
        lastPrayerNameRef.current = currentPrayerName
        
        setState((prev) => ({ ...prev, nextPrayer: updatedNextPrayer }))
      }, 1000)
    } catch (error) {
      console.error('Error fetching prayer times:', error)
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load prayer times',
        }))
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [profile, calculateNextPrayer, fetchTomorrowPrayerTimes])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Note: Notifications now handled by backend cron + Web Push API
    }
  }, [fetchData])

  // Refetch function
  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    await fetchData()
  }, [fetchData])

  // Update location function
  const updateLocation = useCallback(
    async (lat: number, lng: number, city: string, type: LocationData['type']) => {
      await saveLocationToStorage(lat, lng, city, type)
      setState((prev) => ({
        ...prev,
        location: { lat, lng, city, type },
      }))
      await refetch()
    },
    [refetch]
  )

  // Update calculation method function
  const updateCalculationMethod = useCallback(
    async (method: CalculationMethodId) => {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('calculation_method', method)
      }

      // Save to profile if authenticated
      if (profile) {
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            await supabase
              .from('profiles')
              .update({
                calculation_method: method,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)
          }
        } catch (error) {
          console.error('Error saving calculation method to profile:', error)
        }
      }

      setState((prev) => ({
        ...prev,
        calculationMethod: method,
      }))
      await refetch()
    },
    [profile, refetch]
  )

  // Update madhab function
  const updateMadhab = useCallback(
    async (madhab: MadhabId) => {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('madhab', madhab)
      }

      // Save to profile if authenticated
      if (profile) {
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // Convert MadhabId to madhab string for profile
            const madhabString = madhab === '1' ? 'hanafi' : 'standard'
            await supabase
              .from('profiles')
              .update({
                madhab: madhabString,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id)
          }
        } catch (error) {
          console.error('Error saving madhab to profile:', error)
        }
      }

      setState((prev) => ({
        ...prev,
        madhab,
      }))
      await refetch()
    },
    [profile, refetch]
  )

  return {
    ...state,
    refetch,
    updateLocation,
    updateCalculationMethod,
    updateMadhab,
  }
}

