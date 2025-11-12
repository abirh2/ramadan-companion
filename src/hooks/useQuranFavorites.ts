'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  addQuranFavorite,
  removeQuranFavorite,
  checkIsQuranFavorited,
} from '@/lib/favorites'
import type { QuranFavoriteData } from '@/types/quran.types'

interface UseQuranFavoritesResult {
  isFavorited: boolean
  isLoading: boolean
  toggleFavorite: () => Promise<void>
  requiresAuth: boolean
}

export function useQuranFavorites(
  ayahData: QuranFavoriteData | null
): UseQuranFavoritesResult {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)

  // Check if ayah is favorited on mount and when user/ayah changes
  useEffect(() => {
    mountedRef.current = true

    async function checkFavoriteStatus() {
      if (!user || !ayahData) {
        setIsFavorited(false)
        return
      }

      setIsLoading(true)
      const { isFavorited: favorited } = await checkIsQuranFavorited(
        user.id,
        ayahData.ayahNumber
      )

      if (mountedRef.current) {
        setIsFavorited(favorited)
        setIsLoading(false)
      }
    }

    checkFavoriteStatus()

    return () => {
      mountedRef.current = false
    }
  }, [user, ayahData])

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!user || !ayahData) {
      // This should be handled by the component showing a login prompt
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        const { success } = await removeQuranFavorite(user.id, ayahData.ayahNumber)
        if (success && mountedRef.current) {
          setIsFavorited(false)
        }
      } else {
        // Add to favorites
        const { success } = await addQuranFavorite(user.id, ayahData)
        if (success && mountedRef.current) {
          setIsFavorited(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [user, ayahData, isFavorited])

  return {
    isFavorited,
    isLoading,
    toggleFavorite,
    requiresAuth: !user,
  }
}

