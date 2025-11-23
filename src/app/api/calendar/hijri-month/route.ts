import { NextRequest, NextResponse } from 'next/server'

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1'

/**
 * GET /api/calendar/hijri-month
 * 
 * Fetch full Hijri month with Gregorian date conversions
 * 
 * Query Parameters:
 * - month (required): Hijri month number (1-12)
 * - year (required): Hijri year (e.g., 1446)
 * 
 * Returns: Array of dates with both Hijri and Gregorian information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Validate required parameters
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: month, year' },
        { status: 400 }
      )
    }

    // Validate month range (1-12)
    const monthNum = parseInt(month, 10)
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      )
    }

    // Validate year
    const yearNum = parseInt(year, 10)
    if (isNaN(yearNum) || yearNum < 1) {
      return NextResponse.json(
        { error: 'Invalid year. Must be a positive integer' },
        { status: 400 }
      )
    }

    // Fetch from AlAdhan API
    const apiUrl = `${ALADHAN_BASE_URL}/hToGCalendar/${monthNum}/${yearNum}`
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`AlAdhan API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Validate response structure
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response structure from AlAdhan API')
    }

    // Transform data to simplified structure
    const dates = data.data.map((dayData: {
      hijri: {
        day: string
        month: { number: number; en: string; ar: string }
        year: string
        weekday: { en: string; ar: string }
        date: string
      }
      gregorian: {
        day: string
        month: { number: number; en: string }
        year: string
        weekday: { en: string }
        date: string
      }
    }) => ({
      hijri: {
        day: parseInt(dayData.hijri.day, 10),
        month: dayData.hijri.month.number,
        year: parseInt(dayData.hijri.year, 10),
        monthName: dayData.hijri.month.en,
        monthNameAr: dayData.hijri.month.ar,
        weekday: dayData.hijri.weekday.en,
        weekdayAr: dayData.hijri.weekday.ar,
        date: dayData.hijri.date, // DD-MM-YYYY format
      },
      gregorian: {
        day: parseInt(dayData.gregorian.day, 10),
        month: dayData.gregorian.month.number,
        year: parseInt(dayData.gregorian.year, 10),
        monthName: dayData.gregorian.month.en,
        weekday: dayData.gregorian.weekday.en,
        date: dayData.gregorian.date, // DD-MM-YYYY format
      },
    }))

    return NextResponse.json({
      code: 200,
      status: 'OK',
      data: dates,
      meta: {
        hijriMonth: monthNum,
        hijriYear: yearNum,
        daysInMonth: dates.length,
      },
    })
  } catch (error) {
    console.error('Error in /api/calendar/hijri-month:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Hijri calendar data' },
      { status: 500 }
    )
  }
}

