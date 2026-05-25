import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, PUBLIC_LIMIT } from '@/lib/rateLimit'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'RamadanCompanion/1.0 (https://github.com/ahossain/ramadan-companion)'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_LIMIT)
  if (limited) return limited

  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lng' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90' },
        { status: 400 }
      )
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${NOMINATIM_BASE}/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

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

    let displayName: string | null = null
    if (city && country) {
      displayName = `${city}, ${country}`
    } else if (city) {
      displayName = city
    } else if (country) {
      displayName = country
    } else {
      displayName = data.display_name || null
    }

    return NextResponse.json({ city: displayName })
  } catch (error) {
    console.error('Error in /api/geocode/reverse:', error)
    return NextResponse.json(
      { error: 'Failed to reverse geocode', city: null },
      { status: 500 }
    )
  }
}
