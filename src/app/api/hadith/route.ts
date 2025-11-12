import { NextRequest, NextResponse } from 'next/server'
import type { HadithAPIResponse, DailyHadithResponse, HadithLanguageId } from '@/types/hadith.types'

const HADITH_API_BASE_URL = 'https://hadithapi.com/api'
// Temporary fallback - remove after .env.local is working
const HADITH_API_KEY = process.env.HADITH_API_KEY || '$2y$10$5v38H9m4hOEA84i8Zy16urBcqIZMqgmM66z4Fb6s2ZVI1Wd1AUa'

// Approximate hadith counts for the two sahih collections
const SAHIH_BUKHARI_COUNT = 7563
const SAHIH_MUSLIM_COUNT = 7563
const TOTAL_HADITHS = SAHIH_BUKHARI_COUNT + SAHIH_MUSLIM_COUNT

/**
 * Calculate the daily hadith selection using deterministic date-based algorithm
 * Same hadith globally for all users on the same day
 */
function getDailyHadithSelection(): { book: 'sahih-bukhari' | 'sahih-muslim'; hadithNumber: number } {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()

  // Create a numeric representation of the date
  const dateNumber = year * 10000 + month * 100 + day

  // Deterministic selection within total pool
  const globalIndex = dateNumber % TOTAL_HADITHS

  // Distribute between two collections
  if (globalIndex < SAHIH_BUKHARI_COUNT) {
    return {
      book: 'sahih-bukhari',
      hadithNumber: globalIndex + 1,
    }
  } else {
    return {
      book: 'sahih-muslim',
      hadithNumber: globalIndex - SAHIH_BUKHARI_COUNT + 1,
    }
  }
}

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

    const searchParams = request.nextUrl.searchParams
    const language = (searchParams.get('language') || 'english') as HadithLanguageId

    // Calculate today's hadith
    const { book, hadithNumber } = getDailyHadithSelection()

    // Fetch hadith from HadithAPI
    // Note: API requires hadithNumber parameter and book parameter
    const apiUrl = `${HADITH_API_BASE_URL}/hadiths/?apiKey=${HADITH_API_KEY}&hadithNumber=${hadithNumber}&book=${book}&paginate=1`

    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours (same hadith all day)
    })

    if (!response.ok) {
      throw new Error(`HadithAPI error: ${response.status}`)
    }

    const data = await response.json()

    // Validate response - API returns hadiths.data array, not single hadith
    if (data.status !== 200 || !data.hadiths || !data.hadiths.data || data.hadiths.data.length === 0) {
      throw new Error('Invalid response from HadithAPI')
    }

    // Extract first hadith from the array
    const hadith = data.hadiths.data[0]

    // Format response
    const formattedResponse: DailyHadithResponse = {
      hadithEnglish: hadith.hadithEnglish,
      hadithUrdu: hadith.hadithUrdu,
      hadithArabic: hadith.hadithArabic,
      narrator: hadith.englishNarrator,
      book: hadith.book.bookName,
      bookSlug: hadith.book.bookSlug,
      bookWriter: hadith.book.writerName,
      chapter: hadith.chapter.chapterEnglish,
      chapterArabic: hadith.chapter.chapterArabic,
      hadithNumber: hadith.hadithNumber,
      status: hadith.status,
      volume: hadith.volume,
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error in /api/hadith:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch hadith',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

