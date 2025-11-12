import { NextRequest, NextResponse } from 'next/server'

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1'

// Helper function to convert bearing to compass direction
function bearingToDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')

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

    // Fetch from AlAdhan Qibla API with caching
    const response = await fetch(
      `${ALADHAN_BASE_URL}/qibla/${latitude}/${longitude}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours (Qibla direction doesn't change)
      }
    )

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.status}`)
    }

    const data = await response.json()

    // Add compass direction string to the response
    if (data.data && typeof data.data.direction === 'number') {
      return NextResponse.json({
        ...data,
        data: {
          ...data.data,
          compassDirection: bearingToDirection(data.data.direction),
        },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/qibla:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Qibla direction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

