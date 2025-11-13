import { NextRequest, NextResponse } from 'next/server'
import type { OverpassResponse } from '@/types/places.types'
import { buildOverpassQuery, parseMosqueData, sortMosquesByDistance } from '@/lib/places'

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '4828' // Default: 3 miles = 4828 meters

    // Validate required parameters
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required parameters: latitude, longitude' },
        { status: 400 }
      )
    }

    // Validate latitude and longitude ranges
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const radiusMeters = parseFloat(radius)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180' },
        { status: 400 }
      )
    }

    if (isNaN(radiusMeters) || radiusMeters <= 0 || radiusMeters > 50000) {
      return NextResponse.json(
        { error: 'Invalid radius. Must be between 0 and 50000 meters' },
        { status: 400 }
      )
    }

    // Build Overpass query
    const query = buildOverpassQuery(lat, lng, radiusMeters)

    // Fetch from Overpass API with retry logic for timeouts
    let response: Response | null = null
    let lastError: Error | null = null
    const maxRetries = 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(OVERPASS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
          next: { revalidate: 3600 }, // Cache for 1 hour
          signal: AbortSignal.timeout(15000), // 15 second timeout
        })

        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          break
        }

        // Server error (5xx) - retry if we have attempts left
        if (attempt < maxRetries) {
          console.warn(`Overpass API attempt ${attempt + 1} failed with status ${response.status}, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))) // Exponential backoff
          continue
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        // If timeout or network error, retry if we have attempts left
        if (attempt < maxRetries) {
          console.warn(`Overpass API attempt ${attempt + 1} failed:`, lastError.message, '- retrying...')
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
      }
    }

    // Check if we got a response
    if (!response) {
      throw new Error(lastError?.message || 'Failed to fetch from Overpass API after multiple attempts')
    }

    if (!response.ok) {
      if (response.status === 504 || response.status === 503) {
        throw new Error('Overpass API is temporarily overloaded. Please try again in a moment or reduce your search radius.')
      }
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()

    // Parse and process mosque data
    const mosques = data.elements.map((element) => parseMosqueData(element, lat, lng))

    // Sort by distance
    const sortedMosques = sortMosquesByDistance(mosques)

    return NextResponse.json({
      mosques: sortedMosques,
      count: sortedMosques.length,
      searchLocation: { lat, lng },
      radiusMeters,
    })
  } catch (error) {
    console.error('Error in /api/mosques:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch mosques',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

