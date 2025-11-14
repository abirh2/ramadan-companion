/**
 * useFullSurah Hook
 * 
 * Fetches and manages a complete surah with Arabic text and translation.
 * Handles loading states, errors, and translation switching.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import type { FullSurahResponse, QuranTranslationId } from '@/types/quran.types'

const DEFAULT_TRANSLATION: QuranTranslationId = 'en.asad'

export interface UseFullSurahResult {
  surahData: FullSurahResponse | null
  loading: boolean
  error: string | null
  translation: QuranTranslationId
  setTranslation: (translation: QuranTranslationId) => void
  refetch: () => Promise<void>
}

export function useFullSurah(surahNumber: number): UseFullSurahResult {
  const { profile } = useAuth()
  const [surahData, setSurahData] = useState<FullSurahResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [translation, setTranslationState] = useState<QuranTranslationId>(DEFAULT_TRANSLATION)

  // Get translation preference (priority: profile → default)
  useEffect(() => {
    if (profile?.quran_translation) {
      setTranslationState(profile.quran_translation as QuranTranslationId)
    }
  }, [profile])

  // Fetch surah data
  const fetchSurah = useCallback(
    async (translationId: QuranTranslationId) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/quran/surah/${surahNumber}?translation=${translationId}`
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch surah: ${response.status}`)
        }

        const data: FullSurahResponse = await response.json()
        setSurahData(data)
      } catch (err) {
        console.error('Error fetching surah:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch surah')
      } finally {
        setLoading(false)
      }
    },
    [surahNumber]
  )

  // Fetch on mount and when surah number or translation changes
  useEffect(() => {
    fetchSurah(translation)
  }, [fetchSurah, translation])

  // Set translation and refetch
  const setTranslation = useCallback(
    (newTranslation: QuranTranslationId) => {
      setTranslationState(newTranslation)
    },
    []
  )

  return {
    surahData,
    loading,
    error,
    translation,
    setTranslation,
    refetch: () => fetchSurah(translation),
  }
}

