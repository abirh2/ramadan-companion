import type { MosqueData, OverpassElement, DistanceUnit, HalalFoodData, GeoapifyFeature } from '@/types/places.types'
import type { Profile } from '@/types/auth.types'
import { createClient } from '@/lib/supabase/client'

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * 0.621371
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters * 0.000621371
}

/**
 * Convert miles to meters
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.34
}

/**
 * Format distance with appropriate unit
 * @param distanceKm - distance in kilometers
 * @param unit - preferred distance unit
 * @returns formatted string like "1.2 mi" or "2.0 km"
 */
export function formatDistance(distanceKm: number, unit: DistanceUnit = 'mi'): string {
  if (unit === 'mi') {
    const miles = kmToMiles(distanceKm)
    return `${miles.toFixed(1)} mi`
  } else {
    return `${distanceKm.toFixed(1)} km`
  }
}

/**
 * Build Overpass API query for mosques
 * @param lat - latitude
 * @param lng - longitude
 * @param radiusMeters - search radius in meters
 * @returns Overpass QL query string
 */
export function buildOverpassQuery(lat: number, lng: number, radiusMeters: number): string {
  return `[out:json];node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});out;`
}

/**
 * Generate fallback name for mosque when name is missing
 * Uses address components to create descriptive name
 */
export function generateFallbackName(tags: OverpassElement['tags']): string {
  if (!tags) return 'Unnamed Mosque'
  
  const street = tags['addr:street']
  const houseNumber = tags['addr:housenumber']
  const city = tags['addr:city']
  
  if (street) {
    if (houseNumber) {
      return `Mosque near ${houseNumber} ${street}`
    }
    return `Mosque near ${street}`
  }
  
  if (city) {
    return `Mosque in ${city}`
  }
  
  return 'Unnamed Mosque'
}

/**
 * Parse Overpass API element into MosqueData
 * @param element - raw Overpass element
 * @param userLat - user's latitude for distance calculation
 * @param userLng - user's longitude for distance calculation
 */
export function parseMosqueData(
  element: OverpassElement,
  userLat: number,
  userLng: number
): MosqueData {
  const tags = element.tags || {}
  const name = tags.name || generateFallbackName(tags)
  const distanceKm = calculateDistance(userLat, userLng, element.lat, element.lon)
  
  return {
    id: element.id,
    name,
    lat: element.lat,
    lng: element.lon,
    distanceKm,
    address: {
      street: tags['addr:street']
        ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim()
        : undefined,
      city: tags['addr:city'],
      state: tags['addr:state'],
      postcode: tags['addr:postcode'],
      country: tags['addr:country'],
    },
    tags: {
      phone: tags.phone,
      website: tags.website,
      opening_hours: tags.opening_hours,
      wheelchair: tags.wheelchair,
      denomination: tags.denomination,
    },
  }
}

/**
 * Sort mosques by distance (ascending)
 */
export function sortMosquesByDistance(mosques: MosqueData[]): MosqueData[] {
  return [...mosques].sort((a, b) => a.distanceKm - b.distanceKm)
}

/**
 * Get user's preferred distance unit from localStorage or profile
 */
export function getDistanceUnit(profile?: Profile | null): DistanceUnit {
  // Priority 1: Profile (if authenticated)
  if (profile?.distance_unit) {
    return profile.distance_unit as DistanceUnit
  }
  
  // Priority 2: localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('distance_unit')
    if (stored === 'mi' || stored === 'km') {
      return stored
    }
  }
  
  // Default: miles (for US users)
  return 'mi'
}

/**
 * Save user's preferred distance unit to localStorage and profile
 */
export async function saveDistanceUnit(unit: DistanceUnit): Promise<void> {
  // Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('distance_unit', unit)
    } catch (error) {
      console.error('Error saving distance unit to localStorage:', error)
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
          distance_unit: unit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
      
      if (error) {
        console.error('Error saving distance unit to profile:', error)
      }
    }
  } catch (error) {
    console.error('Error updating profile with distance unit:', error)
  }
}

// Geoapify API Functions for Halal Food Finder

/**
 * Build Geoapify API URL for halal food search
 * @param lat - latitude
 * @param lng - longitude
 * @param radiusMeters - search radius in meters
 * @param searchType - type of search: 'strict', 'category', or 'cuisine'
 * @param apiKey - Geoapify API key
 * @returns Geoapify API URL
 */
export function buildGeoapifyUrl(
  lat: number,
  lng: number,
  radiusMeters: number,
  searchType: 'strict' | 'category' | 'cuisine',
  apiKey: string
): string {
  const baseUrl = 'https://api.geoapify.com/v2/places'
  const filter = `circle:${lng},${lat},${radiusMeters}`
  const bias = `proximity:${lng},${lat}`
  
  // Dynamic limit based on radius to conserve API quota and prevent timeouts
  // Small radius (< 5km): 50 results
  // Medium radius (5-10km): 30 results  
  // Large radius (> 10km): 20 results
  let limit = 50
  if (radiusMeters > 10000) {
    limit = 20
  } else if (radiusMeters > 5000) {
    limit = 30
  }

  let categories = ''
  let name = ''

  switch (searchType) {
    case 'strict':
      // Search for places with "halal" in the name
      categories = 'catering.restaurant,catering.fast_food'
      name = 'halal'
      break
    case 'category':
      // Search for places explicitly categorized as halal
      categories = 'halal'
      break
    case 'cuisine':
      // Search for halal-likely cuisines
      categories = 'catering.restaurant.pakistani,catering.restaurant.turkish,catering.restaurant.lebanese,catering.restaurant.syrian,catering.restaurant.arab,catering.restaurant.kebab'
      break
  }

  const params = new URLSearchParams({
    categories,
    filter,
    bias,
    limit: limit.toString(),
    apiKey,
  })

  if (name) {
    params.set('name', name)
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate fallback name for food place when name is missing
 */
export function generateFallbackFoodName(feature: GeoapifyFeature): string {
  const props = feature.properties
  
  // Try to build name from cuisine
  const cuisine = props.catering?.cuisine || props.datasource?.raw?.cuisine
  if (cuisine) {
    return `${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} Restaurant`
  }
  
  // Try to build name from street
  if (props.street) {
    return `Restaurant on ${props.street}`
  }
  
  // Try to build name from neighborhood or city
  if (props.neighbourhood) {
    return `Restaurant in ${props.neighbourhood}`
  }
  
  if (props.city) {
    return `Restaurant in ${props.city}`
  }
  
  return 'Halal Restaurant'
}

/**
 * Parse Geoapify API feature into HalalFoodData
 * @param feature - Geoapify feature
 * @param userLat - user's latitude for distance calculation
 * @param userLng - user's longitude for distance calculation
 */
export function parseGeoapifyFeature(
  feature: GeoapifyFeature,
  userLat: number,
  userLng: number
): HalalFoodData {
  const props = feature.properties
  const name = props.name || props.address_line1 || generateFallbackFoodName(feature)
  
  // Calculate distance if not provided by API
  const distanceKm = props.distance
    ? props.distance / 1000 // Convert meters to kilometers
    : calculateDistance(userLat, userLng, props.lat, props.lon)
  
  // Extract address components
  const address = {
    street: props.street && props.housenumber
      ? `${props.housenumber} ${props.street}`
      : props.street,
    city: props.city,
    state: props.state,
    postcode: props.postcode,
    country: props.country,
    formatted: props.formatted,
  }
  
  // Extract cuisine
  const cuisine = props.catering?.cuisine || props.datasource?.raw?.cuisine
  
  // Extract diet information
  const diet = props.catering?.diet || (props.datasource?.raw?.['diet:halal'] 
    ? { halal: props.datasource.raw['diet:halal'] === 'yes' || props.datasource.raw['diet:halal'] === 'only' }
    : undefined)
  
  // Extract contact information
  const contact = props.contact || (props.datasource?.raw?.phone || props.datasource?.raw?.website
    ? {
        phone: props.datasource?.raw?.phone,
        website: props.datasource?.raw?.website,
      }
    : undefined)
  
  // Extract opening hours
  const openingHours = props.opening_hours || props.datasource?.raw?.opening_hours
  
  // Extract facilities
  const facilities = props.facilities || (
    props.datasource?.raw?.wheelchair || 
    props.datasource?.raw?.takeaway || 
    props.datasource?.raw?.delivery
      ? {
          wheelchair: props.datasource?.raw?.wheelchair === 'yes',
          takeaway: props.datasource?.raw?.takeaway === 'yes' || props.datasource?.raw?.takeaway === 'only',
          delivery: props.datasource?.raw?.delivery === 'yes',
        }
      : undefined
  )
  
  return {
    id: props.place_id,
    name,
    lat: props.lat,
    lng: props.lon,
    distanceKm,
    address,
    categories: props.categories || [],
    cuisine,
    diet,
    contact,
    openingHours,
    facilities,
  }
}

/**
 * Merge and deduplicate food results from multiple search strategies
 * @param results - array of HalalFoodData arrays from different searches
 * @returns deduplicated and merged array of HalalFoodData
 */
export function mergeFoodResults(...results: HalalFoodData[][]): HalalFoodData[] {
  const seen = new Set<string>()
  const merged: HalalFoodData[] = []
  
  // Flatten all results
  const allResults = results.flat()
  
  // Deduplicate by id (place_id)
  for (const food of allResults) {
    if (!seen.has(food.id)) {
      seen.add(food.id)
      merged.push(food)
    }
  }
  
  return merged
}

/**
 * Sort food places by distance (ascending)
 */
export function sortFoodByDistance(foods: HalalFoodData[]): HalalFoodData[] {
  return [...foods].sort((a, b) => a.distanceKm - b.distanceKm)
}

/**
 * Format OpenStreetMap opening hours into a more readable format
 * Handles OSM notation like "Mo-Su 12:00-23:00" or "11:00-2:00; Fr,Sa 11:00-03:00"
 */
export function formatOpeningHours(osmHours: string): string {
  if (!osmHours) return ''
  
  // Day abbreviation mapping
  const dayMap: Record<string, string> = {
    'Mo': 'Mon',
    'Tu': 'Tue',
    'We': 'Wed',
    'Th': 'Thu',
    'Fr': 'Fri',
    'Sa': 'Sat',
    'Su': 'Sun',
  }
  
  // Replace day abbreviations
  let formatted = osmHours
  Object.entries(dayMap).forEach(([osm, readable]) => {
    formatted = formatted.replace(new RegExp(osm, 'g'), readable)
  })
  
  // Replace semicolons with line breaks for better readability
  formatted = formatted.replace(/;\s*/g, '\n')
  
  // Add AM/PM indicators for times that look like they might be ambiguous
  // Times like "2:00" likely mean "02:00" (2 AM next day)
  formatted = formatted.replace(/\b(\d{1,2}):(\d{2})\b/g, (match, hours, minutes) => {
    const hour = parseInt(hours, 10)
    if (hour === 0) return `12:${minutes} AM`
    if (hour < 6) return `${hour}:${minutes} AM` // Early morning hours
    if (hour < 12) return `${hour}:${minutes} AM`
    if (hour === 12) return `12:${minutes} PM`
    if (hour > 12) return `${hour - 12}:${minutes} PM`
    return match
  })
  
  return formatted
}

