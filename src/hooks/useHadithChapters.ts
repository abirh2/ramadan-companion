'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { HadithChapter, HadithBook } from '@/types/hadith.types'

interface UseHadithChaptersParams {
  bookSlug: string
}

interface UseHadithChaptersResult {
  chapters: HadithChapter[]
  book: HadithBook | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredChapters: HadithChapter[]
}

/**
 * Hook to fetch chapters for a specific hadith book
 * Includes search/filter functionality
 * 
 * @param bookSlug - The slug of the book (e.g., 'sahih-bukhari')
 * @returns {UseHadithChaptersResult} Chapters list with search and loading/error states
 */
export function useHadithChapters({ bookSlug }: UseHadithChaptersParams): UseHadithChaptersResult {
  const [chapters, setChapters] = useState<HadithChapter[]>([])
  const [book, setBook] = useState<HadithBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchChapters = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/hadith/chapters?bookSlug=${bookSlug}`)

      if (!response.ok) {
        throw new Error('Failed to fetch chapters')
      }

      const data = await response.json()

      if (mountedRef.current) {
        setChapters(data.chapters || [])
        setBook(data.book || null)
        setLoading(false)
      }
    } catch (err) {
      console.error('Error fetching hadith chapters:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load chapters')
        setLoading(false)
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [bookSlug])

  const refetch = useCallback(async () => {
    await fetchChapters()
  }, [fetchChapters])

  // Filter chapters based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters

    const query = searchQuery.toLowerCase()
    return chapters.filter(
      (chapter) =>
        chapter.chapterEnglish.toLowerCase().includes(query) ||
        chapter.chapterArabic.includes(query) ||
        chapter.chapterNumber.toString().includes(query)
    )
  }, [chapters, searchQuery])

  useEffect(() => {
    mountedRef.current = true
    fetchChapters()

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchChapters])

  return {
    chapters,
    book,
    loading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    filteredChapters,
  }
}

