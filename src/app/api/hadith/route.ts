import { NextRequest, NextResponse } from 'next/server'
import type { HadithAPIResponse, DailyHadithResponse, HadithLanguageId } from '@/types/hadith.types'

const HADITH_API_BASE_URL = 'https://hadithapi.com/api'
// Temporary fallback - remove after .env.local is working
const HADITH_API_KEY = process.env.HADITH_API_KEY || '$2y$10$5v38H9m4hOEA84i8Zy16urBcqIZMqgmM66z4Fb6s2ZVI1Wd1AUa'

// Approximate hadith counts for the two sahih collections
const SAHIH_BUKHARI_COUNT = 7563
const SAHIH_MUSLIM_COUNT = 7563

/**
 * Weighted Hadith Ranges
 * Higher weight = higher probability of selection
 * Prioritizes most authentic and impactful hadiths
 */
const WEIGHTED_COLLECTIONS = [
  // Sahih Bukhari - Most authentic collection (higher weight)
  {
    book: 'sahih-bukhari' as const,
    ranges: [
      // Book of Faith - Fundamental beliefs (very high weight)
      { start: 1, end: 100, weight: 20 },
      
      // Book of Knowledge - Seeking knowledge (high weight)  
      { start: 101, end: 200, weight: 18 },
      
      // Book of Prayer - Daily worship (very high weight)
      { start: 350, end: 800, weight: 20 },
      
      // Book of Zakat - Charity (high weight)
      { start: 1400, end: 1550, weight: 16 },
      
      // Book of Fasting - Ramadan relevance (very high weight)
      { start: 1891, end: 2080, weight: 22 },
      
      // Book of Hajj - Pilgrimage (medium-high weight)
      { start: 1555, end: 1890, weight: 14 },
      
      // Book of Good Manners (Adab) - Character (high weight)
      { start: 5800, end: 6200, weight: 18 },
      
      // Book of Tawheed - Monotheism (very high weight)
      { start: 7300, end: 7563, weight: 20 },
      
      // Other sections (medium weight)
      { start: 201, end: 349, weight: 10 },
      { start: 801, end: 1399, weight: 10 },
      { start: 2081, end: 5799, weight: 8 },
      { start: 6201, end: 7299, weight: 10 },
    ],
  },
  
  // Sahih Muslim - Also highly authentic (slightly lower weight)
  {
    book: 'sahih-muslim' as const,
    ranges: [
      // Book of Faith (high weight)
      { start: 1, end: 400, weight: 18 },
      
      // Book of Prayer (very high weight)
      { start: 1000, end: 1500, weight: 19 },
      
      // Book of Fasting (very high weight)
      { start: 2500, end: 2800, weight: 21 },
      
      // Book of Zakat (high weight)
      { start: 2200, end: 2400, weight: 15 },
      
      // Book of Piety and Good Character (high weight)
      { start: 6500, end: 7000, weight: 17 },
      
      // Other sections (medium weight)
      { start: 401, end: 999, weight: 10 },
      { start: 1501, end: 2199, weight: 9 },
      { start: 2401, end: 2499, weight: 9 },
      { start: 2801, end: 6499, weight: 8 },
      { start: 7001, end: 7563, weight: 10 },
    ],
  },
]

/**
 * Seeded random number generator for deterministic randomness
 * Same seed (date) produces same random sequence globally
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Calculate the daily hadith selection using weighted random
 * Same hadith globally for all users on the same day (deterministic seed)
 */
function getDailyHadithSelection(): { book: 'sahih-bukhari' | 'sahih-muslim'; hadithNumber: number } {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()

  // Create a numeric seed from the date
  const seed = year * 10000 + month * 100 + day

  // Flatten all ranges with their weights
  const allRanges: Array<{
    book: 'sahih-bukhari' | 'sahih-muslim'
    start: number
    end: number
    weight: number
    rangeWeight: number
  }> = []

  let totalWeight = 0

  for (const collection of WEIGHTED_COLLECTIONS) {
    for (const range of collection.ranges) {
      const rangeSize = range.end - range.start + 1
      const rangeWeight = rangeSize * range.weight
      totalWeight += rangeWeight
      
      allRanges.push({
        book: collection.book,
        start: range.start,
        end: range.end,
        weight: range.weight,
        rangeWeight,
      })
    }
  }

  // Generate seeded random value
  const randomValue = seededRandom(seed) * totalWeight

  // Select range based on weighted probability
  let cumulativeWeight = 0
  let selectedRange = allRanges[0]

  for (const range of allRanges) {
    cumulativeWeight += range.rangeWeight
    if (randomValue <= cumulativeWeight) {
      selectedRange = range
      break
    }
  }

  // Select random hadith within chosen range (using secondary seed)
  const rangeSize = selectedRange.end - selectedRange.start + 1
  const secondarySeed = seed * 7919 // Prime multiplier for variation
  const hadithIndex = Math.floor(seededRandom(secondarySeed) * rangeSize)
  const hadithNumber = selectedRange.start + hadithIndex

  return {
    book: selectedRange.book,
    hadithNumber,
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

