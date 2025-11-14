/**
 * useQuranBrowserFavorites Hook
 * 
 * Hook for managing Quran favorites in the browser view where multiple ayahs are displayed.
 * Provides methods to check, add, and remove favorites for any ayah.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  addQuranFavorite,
  removeQuranFavorite,
  getFavorites,
} from '@/lib/favorites'
import type { QuranFavoriteData } from '@/types/quran.types'

interface UseQuranBrowserFavoritesResult {
  favoritedAyahs: Set<number>
  isLoading: boolean
  isFavorited: (ayahNumber: number) => boolean
  addFavorite: (data: QuranFavoriteData) => Promise<boolean>
  removeFavorite: (ayahNumber: number) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useQuranBrowserFavorites(): UseQuranBrowserFavoritesResult {
  const { user } = useAuth()
  const [favoritedAyahs, setFavoritedAyahs] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)

  // Fetch all favorited ayahs on mount and when user changes
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoritedAyahs(new Set())
      return
    }

    setIsLoading(true)

    try {
      const { favorites } = await getFavorites(user.id, 'quran')
      
      if (mountedRef.current) {
        // Extract ayah numbers from favorites
        const ayahNumbers = new Set(
          favorites.map((fav) => parseInt(fav.source_id))
        )
        setFavoritedAyahs(ayahNumbers)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [user])

  useEffect(() => {
    mountedRef.current = true
    fetchFavorites()

    return () => {
      mountedRef.current = false
    }
  }, [fetchFavorites])

  // Check if a specific ayah is favorited
  const isFavorited = useCallback(
    (ayahNumber: number): boolean => {
      return favoritedAyahs.has(ayahNumber)
    },
    [favoritedAyahs]
  )

  // Add ayah to favorites
  const addFavorite = useCallback(
    async (data: QuranFavoriteData): Promise<boolean> => {
      if (!user) {
        return false
      }

      try {
        const { success } = await addQuranFavorite(user.id, data)
        
        if (success && mountedRef.current) {
          // Optimistically update local state
          setFavoritedAyahs((prev) => new Set(prev).add(data.ayahNumber))
          return true
        }
        
        return false
      } catch (error) {
        console.error('Error adding favorite:', error)
        return false
      }
    },
    [user]
  )

  // Remove ayah from favorites
  const removeFavorite = useCallback(
    async (ayahNumber: number): Promise<boolean> => {
      if (!user) {
        return false
      }

      try {
        const { success } = await removeQuranFavorite(user.id, ayahNumber)
        
        if (success && mountedRef.current) {
          // Optimistically update local state
          setFavoritedAyahs((prev) => {
            const newSet = new Set(prev)
            newSet.delete(ayahNumber)
            return newSet
          })
          return true
        }
        
        return false
      } catch (error) {
        console.error('Error removing favorite:', error)
        return false
      }
    },
    [user]
  )

  return {
    favoritedAyahs,
    isLoading,
    isFavorited,
    addFavorite,
    removeFavorite,
    refetch: fetchFavorites,
  }
}

