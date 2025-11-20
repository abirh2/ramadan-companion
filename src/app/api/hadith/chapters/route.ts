import { NextRequest, NextResponse } from 'next/server'
import type { HadithChaptersResponse } from '@/types/hadith.types'

const HADITH_API_BASE_URL = 'https://hadithapi.com/api'
const HADITH_API_KEY = process.env.HADITH_API_KEY

/**
 * GET /api/hadith/chapters?bookSlug=sahih-bukhari
 * 
 * Fetches all chapters for a specific hadith collection
 * Returns list of chapters with metadata (number, English/Arabic names)
 * 
 * @param bookSlug - The slug of the book (e.g., 'sahih-bukhari')
 * @returns {HadithChaptersResponse} List of chapters for the book
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!HADITH_API_KEY) {
      console.error('HADITH_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Hadith API is not configured' },
        { status: 500 }
      )
    }

    // Get bookSlug from query params
    const searchParams = request.nextUrl.searchParams
    const bookSlug = searchParams.get('bookSlug')

    if (!bookSlug) {
      return NextResponse.json(
        { error: 'bookSlug parameter is required' },
        { status: 400 }
      )
    }

    // Fetch chapters from HadithAPI
    const apiUrl = `${HADITH_API_BASE_URL}/${bookSlug}/chapters?apiKey=${HADITH_API_KEY}`
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours (chapters list is static)
    })

    if (!response.ok) {
      throw new Error(`HadithAPI responded with status ${response.status}`)
    }

    const data: HadithChaptersResponse = await response.json()

    // Validate response structure
    if (data.status !== 200 || !data.chapters) {
      throw new Error('Invalid response from HadithAPI')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/hadith/chapters:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch hadith chapters',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

