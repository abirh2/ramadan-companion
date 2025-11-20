'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { HadithBook } from '@/types/hadith.types'

interface UseHadithBrowserResult {
  books: HadithBook[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch all available hadith collections
 * 
 * @returns {UseHadithBrowserResult} Books list with loading/error states
 */
export function useHadithBrowser(): UseHadithBrowserResult {
  const [books, setBooks] = useState<HadithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchBooks = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hadith/books')

      if (!response.ok) {
        throw new Error('Failed to fetch hadith collections')
      }

      const data = await response.json()

      if (mountedRef.current) {
        setBooks(data.books || [])
        setLoading(false)
      }
    } catch (err) {
      console.error('Error fetching hadith books:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load hadith collections')
        setLoading(false)
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    mountedRef.current = true
    fetchBooks()

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchBooks])

  return {
    books,
    loading,
    error,
    refetch,
  }
}

