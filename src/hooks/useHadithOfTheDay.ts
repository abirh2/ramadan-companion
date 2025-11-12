'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { DailyHadithResponse, HadithLanguageId } from '@/types/hadith.types'

const DEFAULT_LANGUAGE: HadithLanguageId = 'english'
const LANGUAGE_STORAGE_KEY = 'hadith_language'

interface UseHadithOfTheDayResult {
  hadithEnglish: string | null
  hadithUrdu: string | null
  hadithArabic: string | null
  narrator: string | null
  book: string | null
  bookSlug: string | null
  bookWriter: string | null
  chapter: string | null
  chapterArabic: string | null
  hadithNumber: string | null
  status: 'Sahih' | 'Hasan' | "Da'eef" | null
  selectedLanguage: HadithLanguageId
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  setLanguage: (language: HadithLanguageId) => Promise<void>
}

export function useHadithOfTheDay(): UseHadithOfTheDayResult {
  const { profile } = useAuth()
  const [state, setState] = useState<{
    hadithEnglish: string | null
    hadithUrdu: string | null
    hadithArabic: string | null
    narrator: string | null
    book: string | null
    bookSlug: string | null
    bookWriter: string | null
    chapter: string | null
    chapterArabic: string | null
    hadithNumber: string | null
    status: 'Sahih' | 'Hasan' | "Da'eef" | null
    selectedLanguage: HadithLanguageId
    loading: boolean
    error: string | null
  }>({
    hadithEnglish: null,
    hadithUrdu: null,
    hadithArabic: null,
    narrator: null,
    book: null,
    bookSlug: null,
    bookWriter: null,
    chapter: null,
    chapterArabic: null,
    hadithNumber: null,
    status: null,
    selectedLanguage: DEFAULT_LANGUAGE,
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  // Load language preference from profile or localStorage
  const getLanguagePreference = useCallback((): HadithLanguageId => {
    // Priority: Supabase profile → localStorage → default
    if (profile?.hadith_language) {
      return profile.hadith_language as HadithLanguageId
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored) {
        return stored as HadithLanguageId
      }
    }

    return DEFAULT_LANGUAGE
  }, [profile])

  // Fetch daily hadith from API
  const fetchDailyHadith = useCallback(async (language: HadithLanguageId) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/hadith?language=${language}`)

      if (!response.ok) {
        throw new Error('Failed to fetch daily hadith')
      }

      const data: DailyHadithResponse = await response.json()

      if (mountedRef.current) {
        setState({
          hadithEnglish: data.hadithEnglish,
          hadithUrdu: data.hadithUrdu,
          hadithArabic: data.hadithArabic,
          narrator: data.narrator,
          book: data.book,
          bookSlug: data.bookSlug,
          bookWriter: data.bookWriter,
          chapter: data.chapter,
          chapterArabic: data.chapterArabic,
          hadithNumber: data.hadithNumber,
          status: data.status,
          selectedLanguage: language,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Error fetching daily hadith:', error)
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load daily hadith',
        }))
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  // Update language preference
  const setLanguage = useCallback(
    async (language: HadithLanguageId) => {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
      }

      // Save to Supabase profile if authenticated (handled by caller component)
      // This hook focuses on fetching; the component will handle profile updates

      // Refetch with new language
      await fetchDailyHadith(language)
    },
    [fetchDailyHadith]
  )

  // Refetch current language
  const refetch = useCallback(async () => {
    await fetchDailyHadith(state.selectedLanguage)
  }, [fetchDailyHadith, state.selectedLanguage])

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true
    const language = getLanguagePreference()
    fetchDailyHadith(language)

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchDailyHadith, getLanguagePreference])

  return {
    hadithEnglish: state.hadithEnglish,
    hadithUrdu: state.hadithUrdu,
    hadithArabic: state.hadithArabic,
    narrator: state.narrator,
    book: state.book,
    bookSlug: state.bookSlug,
    bookWriter: state.bookWriter,
    chapter: state.chapter,
    chapterArabic: state.chapterArabic,
    hadithNumber: state.hadithNumber,
    status: state.status,
    selectedLanguage: state.selectedLanguage,
    loading: state.loading,
    error: state.error,
    refetch,
    setLanguage,
  }
}

