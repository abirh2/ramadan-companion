'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getFavorites, type FavoriteItem } from '@/lib/favorites'

interface UseFavoritesListResult {
  favorites: FavoriteItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isEmpty: boolean
}

export function useFavoritesList(itemType: 'quran' | 'hadith' = 'quran'): UseFavoritesListResult {
  const { user } = useAuth()
  const [state, setState] = useState<{
    favorites: FavoriteItem[]
    loading: boolean
    error: string | null
  }>({
    favorites: [],
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchFavorites = useCallback(async () => {
    if (!user || isFetchingRef.current) {
      setState({ favorites: [], loading: false, error: null })
      return
    }

    isFetchingRef.current = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { favorites, error } = await getFavorites(user.id, itemType)

      if (mountedRef.current) {
        if (error) {
          setState({
            favorites: [],
            loading: false,
            error: error,
          })
        } else {
          setState({
            favorites: favorites || [],
            loading: false,
            error: null,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      if (mountedRef.current) {
        setState({
          favorites: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch favorites',
        })
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [user, itemType])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchFavorites()

    return () => {
      mountedRef.current = false
      isFetchingRef.current = false
    }
  }, [fetchFavorites])

  return {
    favorites: state.favorites,
    loading: state.loading,
    error: state.error,
    refetch: fetchFavorites,
    isEmpty: state.favorites.length === 0 && !state.loading,
  }
}

