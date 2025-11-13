import { NextRequest, NextResponse } from 'next/server'
import type { 
  AlQuranCloudMultiResponse, 
  DailyQuranResponse,
  QuranTranslationId 
} from '@/types/quran.types'

const ALQURAN_CLOUD_BASE_URL = 'https://api.alquran.cloud/v1'
const ARABIC_EDITION = 'quran-uthmani'
const DEFAULT_TRANSLATION: QuranTranslationId = 'en.asad'
const TOTAL_AYAHS = 6236

/**
 * Weighted Ayah Ranges
 * Higher weight = higher probability of selection
 * Prioritizes impactful, memorable, and frequently recited ayahs
 */
const WEIGHTED_RANGES = [
  // Last Juz (30th) - Most memorized, frequent recitation (high weight)
  { start: 5672, end: 6236, weight: 20 }, // Juz 30: An-Naba to An-Nas
  
  // Early Medinan Surahs - Practical guidance (medium-high weight)
  { start: 1, end: 141, weight: 15 }, // Al-Fatihah, Al-Baqarah (first 141 ayahs)
  
  // Short impactful surahs (high weight)
  { start: 6111, end: 6236, weight: 18 }, // Last 4 surahs (Al-Ikhlas, Al-Falaq, An-Nas, etc.)
  
  // Surah Yaseen - "Heart of Quran" (high weight)
  { start: 4152, end: 4234, weight: 16 },
  
  // Surah Al-Kahf - Friday recitation (medium-high weight)
  { start: 2927, end: 3011, weight: 14 },
  
  // Surah Ar-Rahman - Beautiful recitation (medium weight)
  { start: 5104, end: 5181, weight: 12 },
  
  // Middle sections - Regular rotation (medium weight)
  { start: 142, end: 2926, weight: 8 },
  { start: 3012, end: 4151, weight: 8 },
  { start: 4235, end: 5103, weight: 8 },
  { start: 5182, end: 5671, weight: 8 },
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
 * Calculate the daily ayah number using weighted random selection
 * Same ayah globally for all users on the same day (deterministic seed)
 */
function getDailyAyahNumber(): number {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  
  // Create a numeric seed from the date
  const seed = year * 10000 + month * 100 + day
  
  // Calculate total weight
  let totalWeight = 0
  const weightedRanges = WEIGHTED_RANGES.map(range => {
    const rangeSize = range.end - range.start + 1
    const rangeWeight = rangeSize * range.weight
    totalWeight += rangeWeight
    return { ...range, rangeWeight }
  })
  
  // Generate seeded random value
  const randomValue = seededRandom(seed) * totalWeight
  
  // Select range based on weighted probability
  let cumulativeWeight = 0
  let selectedRange = weightedRanges[0]
  
  for (const range of weightedRanges) {
    cumulativeWeight += range.rangeWeight
    if (randomValue <= cumulativeWeight) {
      selectedRange = range
      break
    }
  }
  
  // Select random ayah within chosen range (using secondary seed)
  const rangeSize = selectedRange.end - selectedRange.start + 1
  const secondarySeed = seed * 7919 // Prime multiplier for variation
  const ayahIndex = Math.floor(seededRandom(secondarySeed) * rangeSize)
  const ayahNumber = selectedRange.start + ayahIndex
  
  return ayahNumber
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const translation = (searchParams.get('translation') || DEFAULT_TRANSLATION) as QuranTranslationId

    // Calculate today's ayah
    const ayahNumber = getDailyAyahNumber()

    // Fetch both Arabic and translation in a single API call
    // Format: /v1/ayah/{number}/editions/{edition1},{edition2}
    const editions = `${ARABIC_EDITION},${translation}`
    const apiUrl = `${ALQURAN_CLOUD_BASE_URL}/ayah/${ayahNumber}/editions/${editions}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours (same ayah all day)
    })

    if (!response.ok) {
      throw new Error(`AlQuran Cloud API error: ${response.status}`)
    }

    const data: AlQuranCloudMultiResponse = await response.json()

    // Validate response
    if (!data.data || data.data.length !== 2) {
      throw new Error('Invalid response from AlQuran Cloud API')
    }

    // First element is Arabic, second is translation
    const [arabic, translationAyah] = data.data

    // Format response
    const formattedResponse: DailyQuranResponse = {
      arabic,
      translation: translationAyah,
      surah: arabic.surah,
      ayahNumber: arabic.number,
      numberInSurah: arabic.numberInSurah,
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error in /api/quran:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Quran ayah',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

