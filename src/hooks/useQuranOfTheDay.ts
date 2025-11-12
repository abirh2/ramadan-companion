'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { 
  DailyQuranResponse, 
  QuranAyah, 
  QuranSurah,
  QuranTranslationId 
} from '@/types/quran.types'

const DEFAULT_TRANSLATION: QuranTranslationId = 'en.asad'
const TRANSLATION_STORAGE_KEY = 'quran_translation'

interface UseQuranOfTheDayResult {
  arabic: QuranAyah | null
  translation: QuranAyah | null
  surah: QuranSurah | null
  ayahNumber: number | null
  numberInSurah: number | null
  selectedTranslation: QuranTranslationId
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setTranslation: (translation: QuranTranslationId) => Promise<void>
}

export function useQuranOfTheDay(): UseQuranOfTheDayResult {
  const { profile } = useAuth()
  const [state, setState] = useState<{
    arabic: QuranAyah | null
    translation: QuranAyah | null
    surah: QuranSurah | null
    ayahNumber: number | null
    numberInSurah: number | null
    selectedTranslation: QuranTranslationId
    loading: boolean
    error: string | null
  }>({
    arabic: null,
    translation: null,
    surah: null,
    ayahNumber: null,
    numberInSurah: null,
    selectedTranslation: DEFAULT_TRANSLATION,
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  // Load translation preference from profile or localStorage
  const getTranslationPreference = useCallback((): QuranTranslationId => {
    // Priority: Supabase profile → localStorage → default
    if (profile?.quran_translation) {
      return profile.quran_translation as QuranTranslationId
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TRANSLATION_STORAGE_KEY)
      if (stored) {
        return stored as QuranTranslationId
      }
    }
    
    return DEFAULT_TRANSLATION
  }, [profile])

  // Fetch daily ayah from API
  const fetchDailyAyah = useCallback(async (translation: QuranTranslationId) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/quran?translation=${translation}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily ayah')
      }

      const data: DailyQuranResponse = await response.json()

      if (mountedRef.current) {
        setState({
          arabic: data.arabic,
          translation: data.translation,
          surah: data.surah,
          ayahNumber: data.ayahNumber,
          numberInSurah: data.numberInSurah,
          selectedTranslation: translation,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Error fetching daily ayah:', error)
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load daily ayah',
        }))
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  // Update translation preference
  const setTranslation = useCallback(async (translation: QuranTranslationId) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(TRANSLATION_STORAGE_KEY, translation)
    }

    // Save to Supabase profile if authenticated (handled by caller component)
    // This hook focuses on fetching; the component will handle profile updates

    // Refetch with new translation
    await fetchDailyAyah(translation)
  }, [fetchDailyAyah])

  // Refetch current translation
  const refetch = useCallback(async () => {
    await fetchDailyAyah(state.selectedTranslation)
  }, [fetchDailyAyah, state.selectedTranslation])

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true
    const translation = getTranslationPreference()
    fetchDailyAyah(translation)

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchDailyAyah, getTranslationPreference])

  return {
    arabic: state.arabic,
    translation: state.translation,
    surah: state.surah,
    ayahNumber: state.ayahNumber,
    numberInSurah: state.numberInSurah,
    selectedTranslation: state.selectedTranslation,
    loading: state.loading,
    error: state.error,
    refetch,
    setTranslation,
  }
}

