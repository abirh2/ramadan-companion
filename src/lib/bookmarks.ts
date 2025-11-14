/**
 * Quran Bookmarks Utilities
 * 
 * Functions for managing user's reading positions (bookmarks) in the Quran.
 * Handles CRUD operations for bookmarks with dual-storage pattern:
 * - Authenticated users: Saved to Supabase for cross-device sync
 * - Guest users: Saved to localStorage only
 */

import { supabase } from './supabaseClient'
import type { BookmarkData } from '@/types/quran.types'

const BOOKMARKS_STORAGE_KEY = 'ramadan-companion-quran-bookmarks'

/**
 * Get all bookmarks for the current user
 * Priority: Supabase (if authenticated) → localStorage
 */
export async function getBookmarks(userId?: string): Promise<BookmarkData[]> {
  // For authenticated users, try Supabase first
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('quran_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching bookmarks from Supabase:', error)
        // Fall through to localStorage
      } else if (data) {
        return data
      }
    } catch (err) {
      console.error('Supabase fetch error:', err)
      // Fall through to localStorage
    }
  }
  
  // For guest users or if Supabase fails, use localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error reading bookmarks from localStorage:', err)
    }
  }
  
  return []
}

/**
 * Get bookmark for a specific surah
 */
export async function getBookmarkForSurah(
  surahNumber: number,
  userId?: string
): Promise<BookmarkData | null> {
  const bookmarks = await getBookmarks(userId)
  return bookmarks.find((b) => b.surah_number === surahNumber) || null
}

/**
 * Save or update a bookmark
 * Saves to both Supabase (if authenticated) and localStorage
 */
export async function saveBookmark(
  surahNumber: number,
  ayahNumber: number,
  userId?: string
): Promise<{ success: boolean; data?: BookmarkData; error?: string }> {
  let supabaseData: BookmarkData | null = null
  
  // Save to Supabase only if user is authenticated
  if (userId) {
    try {
      console.log('Attempting to save bookmark to Supabase:', { userId, surahNumber, ayahNumber })
      
      // Upsert: Insert or update if exists (based on user_id + surah_number unique constraint)
      const { data, error } = await supabase
        .from('quran_bookmarks')
        .upsert(
          {
            user_id: userId,
            surah_number: surahNumber,
            ayah_number: ayahNumber,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,surah_number',
          }
        )
        .select()
        .single()
      
      if (error) {
        console.warn('Could not save bookmark to Supabase (will save to localStorage only):', error.message)
        // Don't return error - fall through to localStorage save
        // This allows guest users to still use bookmarks locally
      } else {
        supabaseData = data
        console.log('Bookmark saved to Supabase successfully')
      }
    } catch (err) {
      console.warn('Supabase bookmark save failed (will use localStorage):', err)
      // Don't return error - fall through to localStorage save
    }
  }
  
  // Also save to localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      const existingBookmarks = await getBookmarks(userId)
      const existingIndex = existingBookmarks.findIndex(
        (b) => b.surah_number === surahNumber
      )
      
      let updatedBookmarks: BookmarkData[]
      const localBookmark: BookmarkData = {
        id: supabaseData?.id || `local-${surahNumber}`,
        user_id: userId || 'guest',
        surah_number: surahNumber,
        ayah_number: ayahNumber,
        created_at: supabaseData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      if (existingIndex >= 0) {
        // Update existing
        updatedBookmarks = [...existingBookmarks]
        updatedBookmarks[existingIndex] = localBookmark
      } else {
        // Add new
        updatedBookmarks = [localBookmark, ...existingBookmarks]
      }
      
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks))
      
      return { success: true, data: localBookmark }
    } catch (err) {
      console.error('Error saving to localStorage:', err)
      // Still return success if Supabase save worked
      if (supabaseData) {
        return { success: true, data: supabaseData }
      }
      return { success: false, error: 'Failed to save bookmark' }
    }
  }
  
  // If we get here and have Supabase data, return success
  if (supabaseData) {
    return { success: true, data: supabaseData }
  }
  
  return { success: false, error: 'No storage available' }
}

/**
 * Delete a bookmark for a specific surah
 */
export async function deleteBookmark(
  surahNumber: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  // Delete from Supabase if authenticated
  if (userId) {
    try {
      const { error } = await supabase
        .from('quran_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('surah_number', surahNumber)
      
      if (error) {
        console.error('Error deleting bookmark from Supabase:', error)
        return { success: false, error: error.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Supabase delete error:', err)
      return { success: false, error: errorMessage }
    }
  }
  
  // Also delete from localStorage
  if (typeof window !== 'undefined') {
    try {
      const existingBookmarks = await getBookmarks(userId)
      const updatedBookmarks = existingBookmarks.filter(
        (b) => b.surah_number !== surahNumber
      )
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks))
    } catch (err) {
      console.error('Error deleting from localStorage:', err)
    }
  }
  
  return { success: true }
}

/**
 * Delete all bookmarks for the current user
 */
export async function clearAllBookmarks(
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  // Clear from Supabase if authenticated
  if (userId) {
    try {
      const { error } = await supabase
        .from('quran_bookmarks')
        .delete()
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error clearing bookmarks from Supabase:', error)
        return { success: false, error: error.message }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Supabase clear error:', err)
      return { success: false, error: errorMessage }
    }
  }
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(BOOKMARKS_STORAGE_KEY)
    } catch (err) {
      console.error('Error clearing localStorage:', err)
    }
  }
  
  return { success: true }
}

