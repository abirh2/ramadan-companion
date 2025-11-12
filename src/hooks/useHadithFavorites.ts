'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  addHadithFavorite,
  removeHadithFavorite,
  checkIsHadithFavorited,
} from '@/lib/favorites'
import type { HadithFavoriteData } from '@/types/hadith.types'

interface UseHadithFavoritesResult {
  isFavorited: boolean
  isLoading: boolean
  toggleFavorite: () => Promise<void>
  requiresAuth: boolean
}

export function useHadithFavorites(
  hadithData: HadithFavoriteData | null
): UseHadithFavoritesResult {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)

  // Check if hadith is favorited on mount and when user/hadith changes
  useEffect(() => {
    mountedRef.current = true

    async function checkFavoriteStatus() {
      if (!user || !hadithData) {
        setIsFavorited(false)
        return
      }

      setIsLoading(true)
      const { isFavorited: favorited } = await checkIsHadithFavorited(
        user.id,
        hadithData.hadithNumber,
        hadithData.bookSlug
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
  }, [user, hadithData])

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!user || !hadithData) {
      // This should be handled by the component showing a login prompt
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        const { success } = await removeHadithFavorite(
          user.id,
          hadithData.hadithNumber,
          hadithData.bookSlug
        )
        if (success && mountedRef.current) {
          setIsFavorited(false)
        }
      } else {
        // Add to favorites
        const { success } = await addHadithFavorite(user.id, hadithData)
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
  }, [user, hadithData, isFavorited])

  return {
    isFavorited,
    isLoading,
    toggleFavorite,
    requiresAuth: !user,
  }
}

