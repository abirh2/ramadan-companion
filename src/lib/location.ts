import type { LocationData, GeocodingResult } from '@/types/ramadan.types'
import type { Profile } from '@/types/auth.types'
import { createClient } from '@/lib/supabase/client'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

// Default fallback location - Mecca, Saudi Arabia
export const MECCA_COORDS: LocationData = {
  lat: 21.4225,
  lng: 39.8262,
  city: 'Mecca, Saudi Arabia',
  type: 'default',
}

/**
 * Request geolocation using platform-appropriate API
 * - Native apps: Uses Capacitor Geolocation plugin with explicit permission flow
 * - Browser/PWA: Uses navigator.geolocation API
 */
export async function requestGeolocation(): Promise<LocationData | null> {
  if (Capacitor.isNativePlatform()) {
    return requestGeolocationNative()
  } else {
    return requestGeolocationBrowser()
  }
}

/**
 * Native geolocation using Capacitor plugin
 * Handles explicit permission request flow required by mobile platforms
 */
async function requestGeolocationNative(): Promise<LocationData | null> {
  try {
    // Check current permission status
    const permission = await Geolocation.checkPermissions()
    
    // Request permission if not already granted
    if (permission.location !== 'granted') {
      const requestResult = await Geolocation.requestPermissions()
      if (requestResult.location !== 'granted') {
        console.error('Geolocation permission denied')
        return null
      }
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      timeout: 10000,
      maximumAge: 300000, // Cache for 5 minutes
      enableHighAccuracy: true,
    })

    const lat = position.coords.latitude
    const lng = position.coords.longitude

    // Try to reverse geocode to get city name
    const city = await reverseGeocode(lat, lng)

    return {
      lat,
      lng,
      city: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      type: 'detected',
    }
  } catch (error) {
    console.error('Geolocation error:', error)
    return null
  }
}

/**
 * Browser geolocation using navigator.geolocation API
 * Used for PWA and web browser contexts
 */
async function requestGeolocationBrowser(): Promise<LocationData | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    console.error('Geolocation is not supported by this browser')
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Try to reverse geocode to get city name
        const city = await reverseGeocode(lat, lng)

        resolve({
          lat,
          lng,
          city: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          type: 'detected',
        })
      },
      (error) => {
        console.error('Geolocation error:', error.message)
        resolve(null)
      },
      {
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  })
}

// Reverse geocode: convert coordinates to city name using Nominatim API
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'RamadanCompanion/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract city name from address components
    const address = data.address
    const city =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.municipality ||
      address?.county ||
      address?.state ||
      null

    const country = address?.country || null

    if (city && country) {
      return `${city}, ${country}`
    } else if (city) {
      return city
    } else if (country) {
      return country
    }

    return data.display_name || null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Geocode city name to coordinates using Nominatim API
export async function geocodeCity(cityName: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=5`,
      {
        headers: {
          'User-Agent': 'RamadanCompanion/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    return data.map((result: any) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    }))
  } catch (error) {
    console.error('Geocoding error:', error)
    return []
  }
}

// Get stored location from localStorage
export function getStoredLocation(): LocationData | null {
  if (typeof window === 'undefined') return null

  try {
    const lat = localStorage.getItem('location_lat')
    const lng = localStorage.getItem('location_lng')
    const city = localStorage.getItem('location_city')
    const type = localStorage.getItem('location_type') as LocationData['type'] | null

    if (lat && lng) {
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        city: city || `${lat}, ${lng}`,
        type: type || 'selected',
      }
    }
  } catch (error) {
    console.error('Error reading location from localStorage:', error)
  }

  return null
}

// Get user location with fallback chain: profile → localStorage → null
export function getUserLocation(profile?: Profile | null): LocationData | null {
  // Priority 1: Profile (if authenticated and location is set)
  if (profile?.location_lat && profile?.location_lng) {
    return {
      lat: profile.location_lat,
      lng: profile.location_lng,
      city: profile.location_city || `${profile.location_lat.toFixed(4)}, ${profile.location_lng.toFixed(4)}`,
      type: profile.location_type === 'coords' ? 'detected' : 'selected',
    }
  }

  // Priority 2: localStorage
  const storedLocation = getStoredLocation()
  if (storedLocation) {
    return storedLocation
  }

  // No location found - caller should request geolocation or use default
  return null
}

// Save location to localStorage and optionally to Supabase profile
export async function saveLocationToStorage(
  lat: number,
  lng: number,
  city: string,
  type: LocationData['type'] = 'selected'
): Promise<void> {
  // Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('location_lat', lat.toString())
      localStorage.setItem('location_lng', lng.toString())
      localStorage.setItem('location_city', city)
      localStorage.setItem('location_type', type)
    } catch (error) {
      console.error('Error saving location to localStorage:', error)
    }
  }

  // Save to Supabase profile if authenticated
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          location_lat: lat,
          location_lng: lng,
          location_city: city,
          location_type: type === 'detected' ? 'coords' : 'coords',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving location to profile:', error)
      }
    }
  } catch (error) {
    console.error('Error updating profile with location:', error)
  }
}

// Validate coordinates
export function isValidCoordinates(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

