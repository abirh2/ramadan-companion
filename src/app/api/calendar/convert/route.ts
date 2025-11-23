import { NextRequest, NextResponse } from 'next/server'

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1'

/**
 * GET /api/calendar/convert
 * 
 * Bidirectional date conversion between Gregorian and Hijri calendars
 * 
 * Query Parameters:
 * - date (required): Date in DD-MM-YYYY format
 * - direction (optional): 'gToH' (Gregorian to Hijri, default) or 'hToG' (Hijri to Gregorian)
 * 
 * Returns: Converted date with full metadata for both calendars
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const direction = searchParams.get('direction') || 'gToH'

    // Validate required parameters
    if (!date) {
      return NextResponse.json(
        { error: 'Missing required parameter: date (format: DD-MM-YYYY)' },
        { status: 400 }
      )
    }

    // Validate direction
    if (direction !== 'gToH' && direction !== 'hToG') {
      return NextResponse.json(
        { error: 'Invalid direction. Must be "gToH" or "hToG"' },
        { status: 400 }
      )
    }

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected DD-MM-YYYY' },
        { status: 400 }
      )
    }

    // Parse and validate date components
    const [day, month, year] = date.split('-').map(Number)
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1) {
      return NextResponse.json(
        { error: 'Invalid date values' },
        { status: 400 }
      )
    }

    // Fetch from AlAdhan API
    const apiUrl = `${ALADHAN_BASE_URL}/${direction}/${date}`
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Validate response structure
    if (!data.data) {
      throw new Error('Invalid response structure from AlAdhan API')
    }

    // Transform data to simplified structure
    const converted = {
      gregorian: {
        day: parseInt(data.data.gregorian.day, 10),
        month: parseInt(data.data.gregorian.month.number, 10),
        year: parseInt(data.data.gregorian.year, 10),
        monthName: data.data.gregorian.month.en,
        weekday: data.data.gregorian.weekday.en,
        date: data.data.gregorian.date, // DD-MM-YYYY format
      },
      hijri: {
        day: parseInt(data.data.hijri.day, 10),
        month: parseInt(data.data.hijri.month.number, 10),
        year: parseInt(data.data.hijri.year, 10),
        monthName: data.data.hijri.month.en,
        monthNameAr: data.data.hijri.month.ar,
        weekday: data.data.hijri.weekday.en,
        weekdayAr: data.data.hijri.weekday.ar,
        date: data.data.hijri.date, // DD-MM-YYYY format
      },
    }

    return NextResponse.json({
      code: 200,
      status: 'OK',
      data: converted,
      meta: {
        inputDate: date,
        direction: direction,
      },
    })
  } catch (error) {
    console.error('Error in /api/calendar/convert:', error)
    return NextResponse.json(
      { error: 'Failed to convert date' },
      { status: 500 }
    )
  }
}

