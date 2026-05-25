import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, PUBLIC_LIMIT } from '@/lib/rateLimit'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'RamadanCompanion/1.0 (https://github.com/ahossain/ramadan-companion)'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_LIMIT)
  if (limited) return limited

  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Missing or too short query parameter: q (min 2 characters)' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query.trim())}&format=json&limit=5`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    const results = data.map((result: { lat: string; lon: string; display_name: string }) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error in /api/geocode/search:', error)
    return NextResponse.json(
      { error: 'Failed to geocode', results: [] },
      { status: 500 }
    )
  }
}
