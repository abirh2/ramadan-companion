'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { HadithData, HadithBook, HadithChapter, HadithLanguageId, HadithBrowserResponse } from '@/types/hadith.types'

const DEFAULT_LANGUAGE: HadithLanguageId = 'english'
const LANGUAGE_STORAGE_KEY = 'hadith_language'

interface UseHadithsByChapterParams {
  bookSlug: string
  chapterNumber: string
}

interface UseHadithsByChapterResult {
  hadiths: HadithData[]
  book: HadithBook | null
  chapter: HadithChapter | null
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
  totalHadiths: number
  selectedLanguage: HadithLanguageId
  setLanguage: (language: HadithLanguageId) => Promise<void>
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

/**
 * Hook to fetch hadiths for a specific chapter with pagination
 * Includes language preference management
 * 
 * @param bookSlug - The slug of the book (e.g., 'sahih-bukhari')
 * @param chapterNumber - The chapter number
 * @returns {UseHadithsByChapterResult} Hadiths list with pagination and language management
 */
export function useHadithsByChapter({ 
  bookSlug, 
  chapterNumber 
}: UseHadithsByChapterParams): UseHadithsByChapterResult {
  const { profile } = useAuth()
  const [hadiths, setHadiths] = useState<HadithData[]>([])
  const [book, setBook] = useState<HadithBook | null>(null)
  const [chapter, setChapter] = useState<HadithChapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalHadiths, setTotalHadiths] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState<HadithLanguageId>(DEFAULT_LANGUAGE)
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
      if (stored && (stored === 'english' || stored === 'urdu')) {
        return stored as HadithLanguageId
      }
    }

    return DEFAULT_LANGUAGE
  }, [profile])

  // Fetch hadiths from API
  const fetchHadiths = useCallback(async (page: number, append: boolean = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(
        `/api/hadith/hadiths?bookSlug=${bookSlug}&chapterNumber=${chapterNumber}&page=${page}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch hadiths')
      }

      const data: HadithBrowserResponse = await response.json()

      if (mountedRef.current) {
        if (append) {
          setHadiths(prev => [...prev, ...data.hadiths])
        } else {
          setHadiths(data.hadiths)
          setBook(data.book)
          setChapter(data.chapter)
        }
        
        setHasMore(data.pagination.hasMore)
        setCurrentPage(data.pagination.currentPage)
        setTotalHadiths(data.pagination.total)
        setLoading(false)
        setLoadingMore(false)
      }
    } catch (err) {
      console.error('Error fetching hadiths:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load hadiths')
        setLoading(false)
        setLoadingMore(false)
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [bookSlug, chapterNumber])

  // Load more hadiths (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return
    
    const nextPage = currentPage + 1
    await fetchHadiths(nextPage, true)
  }, [hasMore, loadingMore, currentPage, fetchHadiths])

  // Update language preference
  const setLanguage = useCallback(async (language: HadithLanguageId) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    }

    // Update state immediately for responsive UI
    setSelectedLanguage(language)

    // Note: Profile update handled by parent component if needed
  }, [])

  // Refetch from beginning
  const refetch = useCallback(async () => {
    setCurrentPage(1)
    await fetchHadiths(1, false)
  }, [fetchHadiths])

  // Initial fetch on mount
  useEffect(() => {
    mountedRef.current = true
    const language = getLanguagePreference()
    setSelectedLanguage(language)
    fetchHadiths(1, false)

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchHadiths, getLanguagePreference])

  return {
    hadiths,
    book,
    chapter,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    totalHadiths,
    selectedLanguage,
    setLanguage,
    loadMore,
    refetch,
  }
}

