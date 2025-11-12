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
 * Calculate the daily ayah number using deterministic selection
 * Same ayah globally for all users on the same day
 */
function getDailyAyahNumber(): number {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  
  // Create a numeric representation of the date
  const dateNumber = year * 10000 + month * 100 + day
  
  // Deterministic selection: mod 6236 + 1 (ayah numbers are 1-indexed)
  const ayahNumber = (dateNumber % TOTAL_AYAHS) + 1
  
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

