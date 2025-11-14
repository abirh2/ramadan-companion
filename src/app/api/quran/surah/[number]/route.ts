import { NextRequest, NextResponse } from 'next/server'
import { getSurahByNumber, isValidSurahNumber } from '@/lib/quranData'
import type { 
  AlQuranCloudSurahMultiResponse, 
  QuranTranslationId,
  FullSurahResponse,
  AyahPair,
  QuranSurah
} from '@/types/quran.types'

const ALQURAN_CLOUD_BASE_URL = 'https://api.alquran.cloud/v1'
const ARABIC_EDITION = 'quran-uthmani'
const TRANSLITERATION_EDITION = 'en.transliteration'
const DEFAULT_TRANSLATION: QuranTranslationId = 'en.asad'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const resolvedParams = await params
    const surahNumber = parseInt(resolvedParams.number)
    
    // Validate surah number
    if (isNaN(surahNumber) || !isValidSurahNumber(surahNumber)) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      )
    }
    
    // Get translation from query params
    const searchParams = request.nextUrl.searchParams
    const translation = (searchParams.get('translation') || DEFAULT_TRANSLATION) as QuranTranslationId
    
    // Fetch surah metadata from local data
    const surahMetadata = getSurahByNumber(surahNumber)
    if (!surahMetadata) {
      return NextResponse.json(
        { error: 'Surah not found' },
        { status: 404 }
      )
    }
    
    // Fetch full surah with three editions from AlQuran Cloud API
    // Format: /v1/surah/{number}/editions/{edition1},{edition2},{edition3}
    const editions = `${ARABIC_EDITION},${TRANSLITERATION_EDITION},${translation}`
    const apiUrl = `${ALQURAN_CLOUD_BASE_URL}/surah/${surahNumber}/editions/${editions}`
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 604800 }, // Cache for 7 days (7 * 24 * 60 * 60)
    })
    
    if (!response.ok) {
      throw new Error(`AlQuran Cloud API error: ${response.status}`)
    }
    
    const data: AlQuranCloudSurahMultiResponse = await response.json()
    
    // Validate response
    if (!data.data || data.data.length !== 3) {
      throw new Error('Invalid response from AlQuran Cloud API')
    }
    
    // AlQuran Cloud returns array of surah objects when using /surah endpoint with multiple editions
    // Each surah object contains an array of ayahs
    const arabicSurah = data.data[0]
    const transliterationSurah = data.data[1]
    const translationSurah = data.data[2]
    
    if (!arabicSurah.ayahs || !transliterationSurah.ayahs || !translationSurah.ayahs) {
      throw new Error('Missing ayahs in API response')
    }
    
    // Pair up Arabic, Transliteration, and Translation ayahs
    const ayahPairs: AyahPair[] = arabicSurah.ayahs.map((arabicAyah, index) => {
      const transliterationAyah = transliterationSurah.ayahs[index]
      const translationAyah = translationSurah.ayahs[index]
      
      return {
        numberInSurah: arabicAyah.numberInSurah,
        globalNumber: arabicAyah.number,
        arabic: arabicAyah,
        transliteration: transliterationAyah,
        translation: translationAyah,
      }
    })
    
    // Extract surah metadata from the API response
    const surah: QuranSurah = {
      number: arabicSurah.number,
      name: arabicSurah.name,
      englishName: arabicSurah.englishName,
      englishNameTranslation: arabicSurah.englishNameTranslation,
      numberOfAyahs: arabicSurah.numberOfAyahs,
      revelationType: arabicSurah.revelationType,
    }
    
    // Format response
    const formattedResponse: FullSurahResponse = {
      surah,
      ayahs: ayahPairs,
      translation,
    }
    
    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error in /api/quran/surah/[number]:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch surah',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

