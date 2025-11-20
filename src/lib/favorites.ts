import { createClient } from '@/lib/supabase/client'
import type { QuranFavoriteData } from '@/types/quran.types'
import type { HadithFavoriteData } from '@/types/hadith.types'

export interface FavoriteItem {
  id: string
  user_id: string
  created_at: string
  item_type: 'quran' | 'hadith'
  source_id: string
  source_name: string
  title: string | null
  excerpt: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Add a Quran ayah to favorites
 */
export async function addQuranFavorite(
  userId: string,
  ayahData: QuranFavoriteData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      item_type: 'quran',
      source_id: ayahData.ayahNumber.toString(),
      source_name: 'AlQuran Cloud',
      title: `Surah ${ayahData.surahName} (${ayahData.surahNumber}:${ayahData.numberInSurah})`,
      excerpt: ayahData.translationText.substring(0, 200), // First 200 chars
      metadata: {
        ayahNumber: ayahData.ayahNumber,
        numberInSurah: ayahData.numberInSurah,
        surahNumber: ayahData.surahNumber,
        surahName: ayahData.surahName,
        arabicText: ayahData.arabicText,
        translationText: ayahData.translationText,
        translationId: ayahData.translationId,
      },
    })

    if (error) {
      console.error('Error adding favorite:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding favorite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add favorite',
    }
  }
}

/**
 * Remove a Quran ayah from favorites
 */
export async function removeQuranFavorite(
  userId: string,
  ayahNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', 'quran')
      .eq('source_id', ayahNumber.toString())

    if (error) {
      console.error('Error removing favorite:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing favorite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove favorite',
    }
  }
}

/**
 * Check if a Quran ayah is favorited
 */
export async function checkIsQuranFavorited(
  userId: string,
  ayahNumber: number
): Promise<{ isFavorited: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', 'quran')
      .eq('source_id', ayahNumber.toString())
      .maybeSingle()

    if (error) {
      console.error('Error checking favorite:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { isFavorited: false, error: error.message }
    }

    return { isFavorited: !!data }
  } catch (error) {
    console.error('Error checking favorite:', error)
    return {
      isFavorited: false,
      error: error instanceof Error ? error.message : 'Failed to check favorite',
    }
  }
}

/**
 * Get all favorites for a user
 */
export async function getFavorites(
  userId: string,
  itemType: 'quran' | 'hadith' = 'quran'
): Promise<{ favorites: FavoriteItem[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { favorites: [], error: error.message }
    }

    return { favorites: data || [] }
  } catch (error) {
    console.error('Error fetching favorites (catch):', error)
    return {
      favorites: [],
      error: error instanceof Error ? error.message : 'Failed to fetch favorites',
    }
  }
}

/**
 * Add a hadith to favorites
 */
export async function addHadithFavorite(
  userId: string,
  hadithData: HadithFavoriteData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      item_type: 'hadith',
      source_id: `${hadithData.bookSlug}:${hadithData.hadithNumber}`,
      source_name: 'HadithAPI',
      title: `${hadithData.book} ${hadithData.hadithNumber}`,
      excerpt: hadithData.hadithEnglish.substring(0, 200), // First 200 chars
      metadata: {
        hadithNumber: hadithData.hadithNumber,
        book: hadithData.book,
        bookSlug: hadithData.bookSlug,
        chapter: hadithData.chapter,
        status: hadithData.status,
        narrator: hadithData.narrator,
        hadithEnglish: hadithData.hadithEnglish,
        hadithUrdu: hadithData.hadithUrdu,
        hadithArabic: hadithData.hadithArabic,
      },
    })

    if (error) {
      console.error('Error adding hadith favorite:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding hadith favorite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add favorite',
    }
  }
}

/**
 * Remove a hadith from favorites
 */
export async function removeHadithFavorite(
  userId: string,
  hadithNumber: string,
  bookSlug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', 'hadith')
      .eq('source_id', `${bookSlug}:${hadithNumber}`)

    if (error) {
      console.error('Error removing hadith favorite:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing hadith favorite:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove favorite',
    }
  }
}

/**
 * Check if a hadith is favorited
 */
export async function checkIsHadithFavorited(
  userId: string,
  hadithNumber: string,
  bookSlug: string
): Promise<{ isFavorited: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_type', 'hadith')
      .eq('source_id', `${bookSlug}:${hadithNumber}`)
      .maybeSingle()

    if (error) {
      console.error('Error checking hadith favorite:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { isFavorited: false, error: error.message }
    }

    return { isFavorited: !!data }
  } catch (error) {
    console.error('Error checking hadith favorite:', error)
    return {
      isFavorited: false,
      error: error instanceof Error ? error.message : 'Failed to check favorite',
    }
  }
}

