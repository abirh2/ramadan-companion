import { NextRequest, NextResponse } from 'next/server'
import type { QuranComTafsirContentResponse } from '@/types/quran.types'

const QURAN_COM_API_BASE = 'https://api.quran.com/api/v4'

/**
 * GET /api/quran/tafsirs/[id]/[surah]/[ayah]
 * 
 * Fetches tafsir (commentary) for a specific ayah from Quran.com API
 * 
 * @param id - Tafsir resource ID (e.g., 169 for Ibn Kathir)
 * @param surah - Surah number (1-114)
 * @param ayah - Ayah number within surah
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; surah: string; ayah: string }> }
) {
  try {
    const resolvedParams = await params
    const { id, surah, ayah } = resolvedParams

    // Validate parameters
    const tafsirId = parseInt(id)
    const surahNum = parseInt(surah)
    const ayahNum = parseInt(ayah)

    if (isNaN(tafsirId) || isNaN(surahNum) || isNaN(ayahNum)) {
      return NextResponse.json(
        { error: 'Invalid parameters. All values must be numbers.' },
        { status: 400 }
      )
    }

    if (surahNum < 1 || surahNum > 114) {
      return NextResponse.json(
        { error: 'Invalid surah number. Must be between 1 and 114.' },
        { status: 400 }
      )
    }

    // Fetch tafsir from Quran.com API
    // Format: /tafsirs/{tafsir_id}/by_ayah/{surah}:{ayah}
    const apiUrl = `${QURAN_COM_API_BASE}/tafsirs/${tafsirId}/by_ayah/${surahNum}:${ayahNum}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 604800 }, // Cache for 7 days (static content)
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Tafsir not available for this ayah' },
          { status: 404 }
        )
      }
      if (response.status === 500) {
        return NextResponse.json(
          { error: 'Tafsir not available for this ayah' },
          { status: 404 } // Return 404 instead of 500 for unavailable content
        )
      }
      throw new Error(`Quran.com API error: ${response.status}`)
    }

    const data: QuranComTafsirContentResponse = await response.json()

    // Validate response
    if (!data.tafsir || !data.tafsir.text) {
      throw new Error('Invalid response from Quran.com API')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in /api/quran/tafsirs/[id]/[surah]/[ayah]:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch tafsir',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

