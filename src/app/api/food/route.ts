import { NextRequest, NextResponse } from 'next/server'
import type { GeoapifyResponse, HalalFoodData } from '@/types/places.types'
import {
  buildGeoapifyUrl,
  parseGeoapifyFeature,
  mergeFoodResults,
  sortFoodByDistance,
} from '@/lib/places'

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY

/**
 * Calculate appropriate timeout based on search radius
 * Larger radius = more results = longer timeout needed
 */
function calculateTimeout(radiusMeters: number): number {
  // Base timeout: 15 seconds
  // Add 5 seconds for every 5000 meters (3.1 miles)
  const baseTimeout = 15000
  const additionalTimeout = Math.floor(radiusMeters / 5000) * 5000
  const maxTimeout = 45000 // Cap at 45 seconds
  
  return Math.min(baseTimeout + additionalTimeout, maxTimeout)
}

/**
 * Fetch from Geoapify API with retry logic
 * @param url - API URL to fetch
 * @param maxRetries - Maximum number of retry attempts
 * @param timeoutMs - Timeout in milliseconds (default: 20 seconds)
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = 2,
  timeoutMs: number = 20000
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
        signal: AbortSignal.timeout(timeoutMs),
      })

      // If successful or client error (4xx), don't retry
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }

      // Server error (5xx) - retry if we have attempts left
      if (attempt < maxRetries) {
        console.warn(
          `Geoapify API attempt ${attempt + 1} failed with status ${response.status}, retrying...`
        )
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1))) // Exponential backoff
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // If timeout or network error, retry if we have attempts left
      if (attempt < maxRetries) {
        console.warn(
          `Geoapify API attempt ${attempt + 1} failed:`,
          lastError.message,
          '- retrying...'
        )
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }
    }
  }

  throw lastError || new Error('Failed to fetch from Geoapify API after multiple attempts')
}

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: 'Geoapify API key not configured' },
        { status: 500 }
      )
    }

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

    // Calculate timeout based on search radius
    const timeout = calculateTimeout(radiusMeters)
    
    // Sequential search strategy: Only make additional calls if needed
    // This conserves API quota by avoiding unnecessary parallel requests
    const MIN_RESULTS = 5 // Minimum results before trying next strategy
    
    let allFoods: HalalFoodData[] = []
    let strategiesUsed = { strict: 0, category: 0, cuisine: 0 }
    
    // Strategy 1: Strict name search (most specific)
    try {
      const strictUrl = buildGeoapifyUrl(lat, lng, radiusMeters, 'strict', GEOAPIFY_API_KEY)
      const strictResponse = await fetchWithRetry(strictUrl, 2, timeout)
      
      if (strictResponse && strictResponse.ok) {
        const strictData: GeoapifyResponse = await strictResponse.json()
        const strictFoods = strictData.features.map((feature) =>
          parseGeoapifyFeature(feature, lat, lng)
        )
        allFoods = [...strictFoods]
        strategiesUsed.strict = strictFoods.length
      }
    } catch (err) {
      console.error('Strict search failed:', err)
    }
    
    // Strategy 2: Category search (only if we don't have enough results)
    if (allFoods.length < MIN_RESULTS) {
      try {
        const categoryUrl = buildGeoapifyUrl(lat, lng, radiusMeters, 'category', GEOAPIFY_API_KEY)
        const categoryResponse = await fetchWithRetry(categoryUrl, 2, timeout)
        
        if (categoryResponse && categoryResponse.ok) {
          const categoryData: GeoapifyResponse = await categoryResponse.json()
          const categoryFoods = categoryData.features.map((feature) =>
            parseGeoapifyFeature(feature, lat, lng)
          )
          allFoods = mergeFoodResults(allFoods, categoryFoods)
          strategiesUsed.category = categoryFoods.length
        }
      } catch (err) {
        console.error('Category search failed:', err)
      }
    }
    
    // Strategy 3: Cuisine search (only if we still don't have enough results)
    if (allFoods.length < MIN_RESULTS) {
      try {
        const cuisineUrl = buildGeoapifyUrl(lat, lng, radiusMeters, 'cuisine', GEOAPIFY_API_KEY)
        const cuisineResponse = await fetchWithRetry(cuisineUrl, 2, timeout)
        
        if (cuisineResponse && cuisineResponse.ok) {
          const cuisineData: GeoapifyResponse = await cuisineResponse.json()
          const cuisineFoods = cuisineData.features.map((feature) =>
            parseGeoapifyFeature(feature, lat, lng)
          )
          allFoods = mergeFoodResults(allFoods, cuisineFoods)
          strategiesUsed.cuisine = cuisineFoods.length
        }
      } catch (err) {
        console.error('Cuisine search failed:', err)
      }
    }
    
    // Check if we got any results at all
    if (allFoods.length === 0) {
      // Return empty results rather than error - allows user to try different location
      return NextResponse.json({
        foods: [],
        count: 0,
        searchLocation: { lat, lng },
        radiusMeters,
        searchStrategies: strategiesUsed,
        message: 'No halal food places found in this area. Try increasing the search radius or changing location.'
      })
    }

    // Sort by distance
    const sortedFoods = sortFoodByDistance(allFoods)

    return NextResponse.json({
      foods: sortedFoods,
      count: sortedFoods.length,
      searchLocation: { lat, lng },
      radiusMeters,
      searchStrategies: {
        ...strategiesUsed,
        merged: sortedFoods.length,
      },
    })
  } catch (error) {
    console.error('Error in /api/food:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch halal food places',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

