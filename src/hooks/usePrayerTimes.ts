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

// Prayer names in order (excluding Sunrise for next prayer calculation)
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export function usePrayerTimes(): UsePrayerTimesResult {
  const { profile } = useAuth()
  const [state, setState] = useState<{
    prayerTimes: PrayerTime | null
    nextPrayer: NextPrayerInfo | null
    qiblaDirection: QiblaData | null
    location: LocationData | null
    calculationMethod: CalculationMethodId
    madhab: MadhabId
    loading: boolean
    error: string | null
  }>({
    prayerTimes: null,
    nextPrayer: null,
    qiblaDirection: null,
    location: null,
    calculationMethod: '4', // Default: Umm al-Qura
    madhab: '0', // Default: Standard (Shafi/Maliki/Hanbali)
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Calculate next prayer and countdown
  const calculateNextPrayer = useCallback((prayerTimes: PrayerTime): NextPrayerInfo | null => {
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
        }
      }
    }

    // If no prayer found today, next prayer is tomorrow's Fajr
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

      // Fetch prayer times
      const prayerTimesResponse = await fetch(
        `/api/prayertimes?latitude=${location.lat}&longitude=${location.lng}&method=${method}&school=${madhab}&timezone=${encodeURIComponent(timezone)}`
      )

      if (!prayerTimesResponse.ok) {
        throw new Error('Failed to fetch prayer times')
      }

      const prayerTimesData: PrayerTimesApiResponse = await prayerTimesResponse.json()

      // Fetch Qibla direction
      const qiblaResponse = await fetch(
        `/api/qibla?latitude=${location.lat}&longitude=${location.lng}`
      )

      if (!qiblaResponse.ok) {
        throw new Error('Failed to fetch Qibla direction')
      }

      const qiblaData: QiblaApiResponse = await qiblaResponse.json()

      if (!mountedRef.current) return

      // Calculate next prayer
      const nextPrayer = calculateNextPrayer(prayerTimesData.data.timings)

      setState({
        prayerTimes: prayerTimesData.data.timings,
        nextPrayer,
        qiblaDirection: qiblaData.data,
        location,
        calculationMethod: method,
        madhab,
        loading: false,
        error: null,
      })

      // Start countdown interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return
        const updatedNextPrayer = calculateNextPrayer(prayerTimesData.data.timings)
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
  }, [profile, calculateNextPrayer])

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

