import { NextRequest, NextResponse } from 'next/server'

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const method = searchParams.get('method') || '4' // Default: Umm al-Qura
    const school = searchParams.get('school') || '0' // Default: Standard (Shafi/Maliki/Hanbali)
    const date = searchParams.get('date') // Optional: DD-MM-YYYY format
    const timezone = searchParams.get('timezone') || 'UTC'

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

    // Format date as DD-MM-YYYY for AlAdhan API
    let dateString: string
    if (date) {
      dateString = date
    } else {
      const today = new Date()
      const day = String(today.getDate()).padStart(2, '0')
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const year = today.getFullYear()
      dateString = `${day}-${month}-${year}`
    }

    // Construct API URL
    const apiUrl = new URL(`${ALADHAN_BASE_URL}/timings/${dateString}`)
    apiUrl.searchParams.append('latitude', latitude)
    apiUrl.searchParams.append('longitude', longitude)
    apiUrl.searchParams.append('method', method)
    apiUrl.searchParams.append('school', school)
    apiUrl.searchParams.append('timezonestring', timezone)

    // Fetch from AlAdhan API with caching
    const response = await fetch(apiUrl.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/prayertimes:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch prayer times',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

