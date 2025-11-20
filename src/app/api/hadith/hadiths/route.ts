import { NextRequest, NextResponse } from 'next/server'
import type { HadithBrowserResponse, HadithAPIListResponse } from '@/types/hadith.types'

const HADITH_API_BASE_URL = 'https://hadithapi.com/api'
const HADITH_API_KEY = process.env.HADITH_API_KEY

// Number of hadiths to fetch per request (since API returns 1 per page)
const HADITHS_PER_LOAD = 5

/**
 * GET /api/hadith/hadiths?bookSlug=sahih-bukhari&chapterNumber=1&page=1
 * 
 * Fetches hadiths for a specific chapter with pagination
 * HadithAPI parameters: page (page number) and paginate (items per page)
 * 
 * @param bookSlug - The slug of the book (e.g., 'sahih-bukhari')
 * @param chapterNumber - The chapter number
 * @param page - Page number (default: 1)
 * @returns {HadithBrowserResponse} List of hadiths with pagination info
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

    // Get parameters from query
    const searchParams = request.nextUrl.searchParams
    const bookSlug = searchParams.get('bookSlug')
    const chapterNumber = searchParams.get('chapterNumber')
    const page = parseInt(searchParams.get('page') || '1')

    if (!bookSlug || !chapterNumber) {
      return NextResponse.json(
        { error: 'bookSlug and chapterNumber parameters are required' },
        { status: 400 }
      )
    }

    // Fetch hadiths with correct pagination parameters
    // paginate = items per page, page = page number
    const apiUrl = `${HADITH_API_BASE_URL}/hadiths/?apiKey=${HADITH_API_KEY}&book=${bookSlug}&chapter=${chapterNumber}&page=${page}&paginate=${HADITHS_PER_LOAD}`
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    })

    if (!response.ok) {
      throw new Error(`HadithAPI responded with status ${response.status}`)
    }

    const data: HadithAPIListResponse = await response.json()

    // Validate response structure
    if (data.status !== 200 || !data.hadiths?.data) {
      throw new Error('Invalid response from HadithAPI')
    }

    const { hadiths: paginationInfo } = data
    const hadiths = paginationInfo.data

    // Extract book and chapter metadata from first hadith
    const firstHadith = hadiths[0]
    
    // Format response
    const apiResponse: HadithBrowserResponse = {
      hadiths,
      pagination: {
        currentPage: paginationInfo.current_page,
        lastPage: paginationInfo.last_page,
        perPage: paginationInfo.per_page,
        total: paginationInfo.total,
        from: paginationInfo.from,
        to: paginationInfo.to,
        hasMore: paginationInfo.current_page < paginationInfo.last_page,
      },
      book: firstHadith.book,
      chapter: firstHadith.chapter,
    }

    return NextResponse.json(apiResponse)
  } catch (error) {
    console.error('Error in /api/hadith/hadiths:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch hadiths',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

