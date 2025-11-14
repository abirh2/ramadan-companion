/**
 * useQuranBookmarks Hook
 * 
 * Manages user's reading positions (bookmarks) in the Quran.
 * Implements dual-storage pattern:
 * - Authenticated users: Synced to Supabase
 * - Guest users: Stored in localStorage
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getBookmarks,
  getBookmarkForSurah,
  saveBookmark as saveBookmarkUtil,
  deleteBookmark as deleteBookmarkUtil,
  clearAllBookmarks as clearAllBookmarksUtil,
} from '@/lib/bookmarks'
import type { BookmarkData } from '@/types/quran.types'

export interface UseQuranBookmarksResult {
  bookmarks: BookmarkData[]
  loading: boolean
  error: string | null
  getBookmark: (surahNumber: number) => BookmarkData | undefined
  saveBookmark: (surahNumber: number, ayahNumber: number) => Promise<boolean>
  deleteBookmark: (surahNumber: number) => Promise<boolean>
  clearAll: () => Promise<boolean>
  refetch: () => Promise<void>
}

export function useQuranBookmarks(): UseQuranBookmarksResult {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bookmarks on mount and when user changes
  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getBookmarks(user?.id)
      setBookmarks(data)
    } catch (err) {
      console.error('Error fetching bookmarks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  // Get bookmark for specific surah
  const getBookmark = useCallback(
    (surahNumber: number): BookmarkData | undefined => {
      return bookmarks.find((b) => b.surah_number === surahNumber)
    },
    [bookmarks]
  )

  // Save or update bookmark
  const saveBookmarkFn = useCallback(
    async (surahNumber: number, ayahNumber: number): Promise<boolean> => {
      setError(null)
      
      try {
        const result = await saveBookmarkUtil(surahNumber, ayahNumber, user?.id)
        
        if (result.success && result.data) {
          // Optimistically update local state
          setBookmarks((prev) => {
            const existingIndex = prev.findIndex((b) => b.surah_number === surahNumber)
            if (existingIndex >= 0) {
              // Update existing
              const updated = [...prev]
              updated[existingIndex] = result.data!
              return updated
            } else {
              // Add new
              return [result.data!, ...prev]
            }
          })
          return true
        } else {
          setError(result.error || 'Failed to save bookmark')
          return false
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save bookmark'
        console.error('Error in saveBookmark:', err)
        setError(errorMessage)
        return false
      }
    },
    [user?.id]
  )

  // Delete bookmark
  const deleteBookmarkFn = useCallback(
    async (surahNumber: number): Promise<boolean> => {
      setError(null)
      
      try {
        const result = await deleteBookmarkUtil(surahNumber, user?.id)
        
        if (result.success) {
          // Optimistically update local state
          setBookmarks((prev) => prev.filter((b) => b.surah_number !== surahNumber))
          return true
        } else {
          setError(result.error || 'Failed to delete bookmark')
          return false
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete bookmark'
        console.error('Error in deleteBookmark:', err)
        setError(errorMessage)
        return false
      }
    },
    [user?.id]
  )

  // Clear all bookmarks
  const clearAll = useCallback(async (): Promise<boolean> => {
    setError(null)
    
    try {
      const result = await clearAllBookmarksUtil(user?.id)
      
      if (result.success) {
        setBookmarks([])
        return true
      } else {
        setError(result.error || 'Failed to clear bookmarks')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear bookmarks'
      console.error('Error in clearAll:', err)
      setError(errorMessage)
      return false
    }
  }, [user?.id])

  return {
    bookmarks,
    loading,
    error,
    getBookmark,
    saveBookmark: saveBookmarkFn,
    deleteBookmark: deleteBookmarkFn,
    clearAll,
    refetch: fetchBookmarks,
  }
}

