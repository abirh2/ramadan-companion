import { NextRequest, NextResponse } from 'next/server'
import type { HijriApiResponse } from '@/types/ramadan.types'

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Get current date
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const dateString = `${day}-${month}-${year}`

    // Fetch current Hijri date
    const hijriResponse = await fetch(
      `${ALADHAN_BASE_URL}/gToH/${dateString}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!hijriResponse.ok) {
      throw new Error('Failed to fetch Hijri date')
    }

    const hijriData = await hijriResponse.json()
    const currentHijri = {
      day: parseInt(hijriData.data.hijri.day, 10),
      month: parseInt(hijriData.data.hijri.month.number, 10),
      year: parseInt(hijriData.data.hijri.year, 10),
      monthName: hijriData.data.hijri.month.en,
    }

    // Apply offset if provided
    const adjustedHijri = { ...currentHijri }
    if (offset !== 0) {
      adjustedHijri.day += offset
      // Simple day adjustment (proper month rollover would be more complex)
      if (adjustedHijri.day < 1) {
        adjustedHijri.day = 29 + adjustedHijri.day
        adjustedHijri.month -= 1
      } else if (adjustedHijri.day > 30) {
        adjustedHijri.day = adjustedHijri.day - 30
        adjustedHijri.month += 1
      }
    }

    // Find the NEXT Ramadan (must be in the future)
    // Ramadan is Hijri month 9 - use hToGCalendar to convert Hijri to Gregorian
    const hijriYearsToCheck = [adjustedHijri.year, adjustedHijri.year + 1, adjustedHijri.year + 2]
    let ramadanStart = ''
    let ramadanEnd = ''
    let ramadanStartDate: Date | null = null
    let ramadanEndDate: Date | null = null
    let targetHijriYear = 0
    
    const todayTime = today.getTime()
    
    for (const hijriYear of hijriYearsToCheck) {
      // Fetch Ramadan (month 9) for this Hijri year
      const ramadanCalendarResponse = await fetch(
        `${ALADHAN_BASE_URL}/hToGCalendar/9/${hijriYear}`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      )

      if (!ramadanCalendarResponse.ok) {
        continue
      }

      const ramadanCalendar = await ramadanCalendarResponse.json()
      const ramadanData = ramadanCalendar.data
      
      if (!ramadanData || ramadanData.length === 0) {
        continue
      }
      
      const firstDay = ramadanData[0]?.gregorian
      const lastDay = ramadanData[ramadanData.length - 1]?.gregorian

      if (firstDay && lastDay) {
        const startDateStr = `${firstDay.year}-${String(firstDay.month.number).padStart(2, '0')}-${String(firstDay.day).padStart(2, '0')}`
        const endDateStr = `${lastDay.year}-${String(lastDay.month.number).padStart(2, '0')}-${String(lastDay.day).padStart(2, '0')}`
        const startDate = new Date(startDateStr)
        const endDate = new Date(endDateStr)
        
        // Check if this Ramadan is in the future OR currently happening
        if (endDate.getTime() >= todayTime) {
          ramadanStart = startDateStr
          ramadanEnd = endDateStr
          ramadanStartDate = startDate
          ramadanEndDate = endDate
          targetHijriYear = hijriYear
          break
        }
      }
    }
    
    if (!ramadanStartDate || !ramadanEndDate) {
      throw new Error('Could not determine next Ramadan dates')
    }

    // Calculate if we're in Ramadan and days until/current day
    const isRamadan = todayTime >= ramadanStartDate.getTime() && todayTime <= ramadanEndDate.getTime()
    
    let daysUntilRamadan: number | null = null
    let currentRamadanDay: number | undefined = undefined

    if (isRamadan) {
      // Calculate current day of Ramadan
      const daysSinceStart = Math.floor((todayTime - ramadanStartDate.getTime()) / (1000 * 60 * 60 * 24))
      currentRamadanDay = daysSinceStart + 1
    } else {
      // Calculate days until next Ramadan
      const diffTime = ramadanStartDate.getTime() - todayTime
      daysUntilRamadan = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const response: HijriApiResponse = {
      currentHijri: adjustedHijri,
      ramadanStart,
      ramadanEnd,
      daysUntilRamadan,
      isRamadan,
      currentRamadanDay,
      ramadanHijriYear: targetHijriYear, // The Hijri year of the next/current Ramadan
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in /api/hijri:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Hijri calendar data' },
      { status: 500 }
    )
  }
}

