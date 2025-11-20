'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MosqueData, DistanceUnit } from '@/types/places.types'
import type { LocationData } from '@/types/ramadan.types'
import { getUserLocation, saveLocationToStorage } from '@/lib/location'
import { getDistanceUnit, milesToMeters } from '@/lib/places'
import { useAuth } from './useAuth'

interface UseMosquesResult {
  mosques: MosqueData[]
  nearestMosque: MosqueData | null
  loading: boolean
  error: string | null
  searchRadiusMiles: number
  distanceUnit: DistanceUnit
  location: LocationData | null
  searchMosques: (lat: number, lng: number, radiusMiles: number) => Promise<void>
  updateRadius: (radiusMiles: number) => Promise<void>
  setCustomLocation: (location: LocationData) => Promise<void>
  toggleDistanceUnit: (unit: DistanceUnit) => void
  refetch: () => Promise<void>
}

export function useMosques(): UseMosquesResult {
  const { profile } = useAuth()
  const [mosques, setMosques] = useState<MosqueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchRadiusMiles, setSearchRadiusMiles] = useState(3) // Default: 3 miles
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mi')
  const [location, setLocation] = useState<LocationData | null>(null)

  // Initialize distance unit from profile or localStorage
  useEffect(() => {
    const unit = getDistanceUnit(profile)
    setDistanceUnit(unit)
  }, [profile])

  const searchMosques = useCallback(async (lat: number, lng: number, radiusMiles: number) => {
    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      setError('Invalid location coordinates')
      setLoading(false)
      return
    }

    // Validate radius
    if (!radiusMiles || radiusMiles <= 0) {
      setError('Invalid search radius')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert miles to meters for API
      const radiusMeters = Math.round(milesToMeters(radiusMiles))

      const response = await fetch(
        `/api/mosques?latitude=${lat}&longitude=${lng}&radius=${radiusMeters}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch mosques: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMosques(data.mosques || [])
    } catch (err) {
      console.error('Error fetching mosques:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch mosques')
      setMosques([])
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRadius = useCallback(
    async (radiusMiles: number) => {
      setSearchRadiusMiles(radiusMiles)
      if (location) {
        await searchMosques(location.lat, location.lng, radiusMiles)
      }
    },
    [location, searchMosques]
  )

  const setCustomLocation = useCallback(
    async (newLocation: LocationData) => {
      setLocation(newLocation)
      await saveLocationToStorage(newLocation.lat, newLocation.lng, newLocation.city, newLocation.type)
      searchMosques(newLocation.lat, newLocation.lng, searchRadiusMiles)
    },
    [searchMosques, searchRadiusMiles]
  )

  const toggleDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnit(unit)
    // Save preference will be handled in the component that calls this
  }, [])

  const refetch = useCallback(async () => {
    if (location) {
      await searchMosques(location.lat, location.lng, searchRadiusMiles)
    }
  }, [location, searchRadiusMiles, searchMosques])

  // Initial fetch on mount
  useEffect(() => {
    const initializeMosques = async () => {
      // Get user's location from profile or localStorage
      const userLocation = getUserLocation(profile)

      if (userLocation) {
        setLocation(userLocation)
        await searchMosques(userLocation.lat, userLocation.lng, searchRadiusMiles)
      } else {
        setLoading(false)
        setError('Location not set. Please enable location access or set your location manually.')
      }
    }

    initializeMosques()
  }, [profile, searchRadiusMiles, searchMosques])

  const nearestMosque = mosques.length > 0 ? mosques[0] : null

  return {
    mosques,
    nearestMosque,
    loading,
    error,
    searchRadiusMiles,
    distanceUnit,
    location,
    searchMosques,
    updateRadius,
    setCustomLocation,
    toggleDistanceUnit,
    refetch,
  }
}

