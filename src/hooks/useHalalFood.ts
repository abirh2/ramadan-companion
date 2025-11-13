'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HalalFoodData, DistanceUnit } from '@/types/places.types'
import type { LocationData } from '@/types/ramadan.types'
import { getUserLocation } from '@/lib/location'
import { getDistanceUnit, milesToMeters } from '@/lib/places'
import { useAuth } from './useAuth'

interface UseHalalFoodResult {
  foods: HalalFoodData[]
  nearestFood: HalalFoodData | null
  loading: boolean
  error: string | null
  searchRadiusMiles: number
  distanceUnit: DistanceUnit
  location: LocationData | null
  searchFood: (lat: number, lng: number, radiusMiles: number) => Promise<void>
  updateRadius: (radiusMiles: number) => Promise<void>
  setCustomLocation: (location: LocationData) => void
  toggleDistanceUnit: (unit: DistanceUnit) => void
  refetch: () => Promise<void>
}

export function useHalalFood(): UseHalalFoodResult {
  const { profile } = useAuth()
  const [foods, setFoods] = useState<HalalFoodData[]>([])
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

  const searchFood = useCallback(async (lat: number, lng: number, radiusMiles: number) => {
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
        `/api/food?latitude=${lat}&longitude=${lng}&radius=${radiusMeters}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch halal food places: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setFoods(data.foods || [])
    } catch (err) {
      console.error('Error fetching halal food:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch halal food places')
      setFoods([])
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRadius = useCallback(
    async (radiusMiles: number) => {
      setSearchRadiusMiles(radiusMiles)
      if (location) {
        await searchFood(location.lat, location.lng, radiusMiles)
      }
    },
    [location, searchFood]
  )

  const setCustomLocation = useCallback(
    (newLocation: LocationData) => {
      setLocation(newLocation)
      searchFood(newLocation.lat, newLocation.lng, searchRadiusMiles)
    },
    [searchFood, searchRadiusMiles]
  )

  const toggleDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnit(unit)
    // Save preference will be handled in the component that calls this
  }, [])

  const refetch = useCallback(async () => {
    if (location) {
      await searchFood(location.lat, location.lng, searchRadiusMiles)
    }
  }, [location, searchRadiusMiles, searchFood])

  // Initial fetch on mount
  useEffect(() => {
    const initializeFood = async () => {
      // Get user's location from profile or localStorage
      const userLocation = getUserLocation(profile)

      if (userLocation) {
        setLocation(userLocation)
        await searchFood(userLocation.lat, userLocation.lng, searchRadiusMiles)
      } else {
        setLoading(false)
        setError('Location not set. Please enable location access or set your location manually.')
      }
    }

    initializeFood()
  }, [profile, searchRadiusMiles, searchFood])

  const nearestFood = foods.length > 0 ? foods[0] : null

  return {
    foods,
    nearestFood,
    loading,
    error,
    searchRadiusMiles,
    distanceUnit,
    location,
    searchFood,
    updateRadius,
    setCustomLocation,
    toggleDistanceUnit,
    refetch,
  }
}

