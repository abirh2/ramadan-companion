'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { RamadanCountdown, HijriApiResponse, PrayerTime } from '@/types/ramadan.types'

export function useRamadanCountdown(): RamadanCountdown {
  const { profile } = useAuth()
  const [state, setState] = useState<RamadanCountdown>({
    isRamadan: false,
    daysUntilRamadan: null,
    currentRamadanDay: null,
    nextEvent: null,
    timeUntilEvent: null,
    ramadanYear: 1446,
    ramadanStartDate: null,
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    async function fetchRamadanData() {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        console.log('Already fetching, skipping...')
        return
      }
      isFetchingRef.current = true
      
      // Clear any existing interval before fetching
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      try {
        // Get hijri_offset_days from localStorage (will support auth profile later)
        const offset = localStorage.getItem('hijri_offset_days') || '0'

        // Fetch Hijri calendar data
        const hijriResponse = await fetch(`/api/hijri?offset=${offset}`)
        if (!hijriResponse.ok) {
          throw new Error('Failed to fetch Hijri calendar')
        }

        const hijriData: HijriApiResponse = await hijriResponse.json()

        if (!mountedRef.current) {
          isFetchingRef.current = false
          return
        }

        // If not in Ramadan, show detailed countdown
        if (!hijriData.isRamadan && hijriData.ramadanStart) {
          // Store ramadanStart in a variable to avoid stale closures
          const ramadanStartTime = new Date(hijriData.ramadanStart).getTime()
          
          // Start a countdown timer that updates every second
          const updateCountdown = () => {
            if (!mountedRef.current) return
            
            const now = new Date()
            const diff = ramadanStartTime - now.getTime()
            
            if (diff <= 0) {
              // Ramadan has started - transition to during-Ramadan state with iftar/suhoor countdown
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              // Refetch to get during-Ramadan state (currentRamadanDay, prayer times for countdown)
              fetchRamadanData()
              return
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            
            const timeUntilEvent = `${days}d ${hours}h ${minutes}m ${seconds}s`
            
            setState({
              isRamadan: false,
              daysUntilRamadan: days,
              currentRamadanDay: null,
              nextEvent: null,
              timeUntilEvent,
              ramadanYear: hijriData.ramadanHijriYear || hijriData.currentHijri.year,
              ramadanStartDate: hijriData.ramadanStart,
              loading: false,
              error: null,
            })
          }
          
          // Initial update
          updateCountdown()
          
          // Update every second
          intervalRef.current = setInterval(updateCountdown, 1000)
        } else if (!hijriData.isRamadan) {
          // No ramadanStart date available, show error
          setState({
            isRamadan: false,
            daysUntilRamadan: null,
            currentRamadanDay: null,
            nextEvent: null,
            timeUntilEvent: null,
            ramadanYear: hijriData.currentHijri.year,
            ramadanStartDate: null,
            loading: false,
            error: 'Unable to determine Ramadan start date',
          })
        } else {
          // During Ramadan, fetch prayer times for iftar/suhoor countdowns
          await fetchPrayerTimesAndUpdate(hijriData)

          // Update every second during Ramadan
          intervalRef.current = setInterval(() => {
            updateCountdown(hijriData)
          }, 1000)
        }
      } catch (error) {
        console.error('Error fetching Ramadan data:', error)
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load Ramadan data',
          }))
        }
      } finally {
        if (mountedRef.current) {
          isFetchingRef.current = false
        }
      }
    }

    async function fetchPrayerTimesAndUpdate(hijriData: HijriApiResponse) {
      try {
        // Get location from profile or localStorage (default to Mecca)
        const lat = profile?.location_lat || localStorage.getItem('location_lat') || '21.4225'
        const lng = profile?.location_lng || localStorage.getItem('location_lng') || '39.8262'
        
        // Always use browser's timezone (auto-detected)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        const today = new Date()
        const timestamp = Math.floor(today.getTime() / 1000)

        // Fetch prayer times from AlAdhan API with browser timezone
        const prayerResponse = await fetch(
          `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4&timezonestring=${encodeURIComponent(timezone)}`
        )

        if (!prayerResponse.ok) {
          throw new Error('Failed to fetch prayer times')
        }

        const prayerData = await prayerResponse.json()
        const timings: PrayerTime = prayerData.data.timings

        if (!mountedRef.current) return

        // Store prayer times for countdown calculation
        localStorage.setItem('prayer_times_maghrib', timings.Maghrib)
        localStorage.setItem('prayer_times_fajr', timings.Fajr)

        updateCountdown(hijriData)
      } catch (error) {
        console.error('Error fetching prayer times:', error)
        // Fallback: just show Ramadan day without event countdown
        if (mountedRef.current) {
          setState({
            isRamadan: true,
            daysUntilRamadan: null,
            currentRamadanDay: hijriData.currentRamadanDay || null,
            nextEvent: null,
            timeUntilEvent: null,
            ramadanYear: hijriData.currentHijri.year,
            ramadanStartDate: hijriData.ramadanStart,
            loading: false,
            error: null,
          })
        }
      }
    }

    function updateCountdown(hijriData: HijriApiResponse) {
      const now = new Date()
      const maghribTime = localStorage.getItem('prayer_times_maghrib')
      const fajrTime = localStorage.getItem('prayer_times_fajr')

      if (!maghribTime || !fajrTime) {
        return
      }

      // Parse prayer times (format: "HH:MM")
      const [maghribHours, maghribMinutes] = maghribTime.split(':').map(Number)
      const [fajrHours, fajrMinutes] = fajrTime.split(':').map(Number)

      // Create Date objects for today's prayer times
      const maghrib = new Date(now)
      maghrib.setHours(maghribHours, maghribMinutes, 0, 0)

      const fajr = new Date(now)
      fajr.setHours(fajrHours, fajrMinutes, 0, 0)

      // Tomorrow's Fajr if today's Fajr has passed
      if (fajr < now) {
        fajr.setDate(fajr.getDate() + 1)
      }

      // Determine next event
      let nextEvent: 'iftar' | 'suhoor'
      let nextEventTime: Date

      if (now < maghrib) {
        // Next event is iftar (Maghrib)
        nextEvent = 'iftar'
        nextEventTime = maghrib
      } else {
        // Next event is suhoor end (Fajr)
        nextEvent = 'suhoor'
        nextEventTime = fajr
        // If after Maghrib, suhoor is tomorrow
        if (nextEventTime < now) {
          nextEventTime.setDate(nextEventTime.getDate() + 1)
        }
      }

      // Calculate time remaining
      const diff = nextEventTime.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const timeUntilEvent = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

      if (mountedRef.current) {
        setState({
          isRamadan: true,
          daysUntilRamadan: null,
          currentRamadanDay: hijriData.currentRamadanDay || null,
          nextEvent,
          timeUntilEvent,
          ramadanYear: hijriData.currentHijri.year,
          ramadanStartDate: hijriData.ramadanStart,
          loading: false,
          error: null,
        })
      }
    }

    fetchRamadanData()

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [profile]) // Re-fetch when profile changes (e.g., timezone update)

  return state
}
