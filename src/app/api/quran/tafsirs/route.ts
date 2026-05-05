import { NextRequest, NextResponse } from 'next/server'
import type { QuranComTafsirListResponse } from '@/types/quran.types'
import { rateLimit, PUBLIC_LIMIT } from '@/lib/rateLimit'

const QURAN_COM_API_BASE = 'https://api.quran.com/api/v4'

/**
 * GET /api/quran/tafsirs
 * 
 * Fetches list of available tafsirs from Quran.com API
 * Returns all tafsirs grouped by language
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_LIMIT)
  if (limited) return limited

  try {
    const apiUrl = `${QURAN_COM_API_BASE}/resources/tafsirs`

    const response = await fetch(apiUrl, {
      next: { revalidate: 604800 }, // Cache for 7 days (tafsir list rarely changes)
    })

    if (!response.ok) {
      throw new Error(`Quran.com API error: ${response.status}`)
    }

    const data: QuranComTafsirListResponse = await response.json()

    // Validate response
    if (!data.tafsirs || !Array.isArray(data.tafsirs)) {
      throw new Error('Invalid response from Quran.com API')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/quran/tafsirs:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch tafsir list',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

