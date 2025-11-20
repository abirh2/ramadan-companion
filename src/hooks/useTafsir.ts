/**
 * useTafsir Hook
 * 
 * Manages tafsir (commentary) fetching for Quran ayahs.
 * Handles tafsir list, content fetching, and tafsir selection state.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  TafsirResource,
  TafsirContent,
  QuranComTafsirListResponse,
  QuranComTafsirContentResponse,
} from '@/types/quran.types'
import { DEFAULT_TAFSIR_ID } from '@/types/quran.types'

const TAFSIR_STORAGE_KEY = 'selectedTafsirId'

/**
 * Get selected tafsir ID from sessionStorage
 */
function getStoredTafsirId(): number {
  if (typeof window === 'undefined') return DEFAULT_TAFSIR_ID
  
  try {
    const stored = sessionStorage.getItem(TAFSIR_STORAGE_KEY)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Error reading tafsir preference from sessionStorage:', error)
  }
  
  return DEFAULT_TAFSIR_ID
}

/**
 * Save selected tafsir ID to sessionStorage
 */
function setStoredTafsirId(tafsirId: number): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(TAFSIR_STORAGE_KEY, tafsirId.toString())
  } catch (error) {
    console.error('Error saving tafsir preference to sessionStorage:', error)
  }
}

export interface UseTafsirResult {
  // Tafsir list
  tafsirs: TafsirResource[]
  tafsirLoading: boolean
  tafsirError: string | null
  
  // Selected tafsir and content
  selectedTafsirId: number
  setSelectedTafsirId: (id: number) => void
  tafsirContent: TafsirContent | null
  contentLoading: boolean
  contentError: string | null
  
  // Actions
  fetchTafsirContent: (surah: number, ayah: number) => Promise<void>
  clearContent: () => void
  syncFromStorage: () => void
}

export function useTafsir(): UseTafsirResult {
  // Tafsir list state
  const [tafsirs, setTafsirs] = useState<TafsirResource[]>([])
  const [tafsirLoading, setTafsirLoading] = useState(true)
  const [tafsirError, setTafsirError] = useState<string | null>(null)

  // Selected tafsir and content state
  // Initialize with default to avoid hydration mismatch
  const [selectedTafsirId, setSelectedTafsirIdState] = useState<number>(DEFAULT_TAFSIR_ID)
  const [tafsirContent, setTafsirContent] = useState<TafsirContent | null>(null)
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  // Load stored tafsir ID from sessionStorage after mount (client-side only)
  useEffect(() => {
    const storedId = getStoredTafsirId()
    if (storedId !== DEFAULT_TAFSIR_ID) {
      setSelectedTafsirIdState(storedId)
    }
  }, [])

  // Wrapper to update both state and sessionStorage
  const setSelectedTafsirId = useCallback((id: number) => {
    setSelectedTafsirIdState(id)
    setStoredTafsirId(id)
  }, [])

  // Fetch tafsir list on mount
  useEffect(() => {
    const fetchTafsirList = async () => {
      setTafsirLoading(true)
      setTafsirError(null)

      try {
        const response = await fetch('/api/quran/tafsirs')

        if (!response.ok) {
          throw new Error(`Failed to fetch tafsir list: ${response.status}`)
        }

        const data: QuranComTafsirListResponse = await response.json()
        setTafsirs(data.tafsirs)
      } catch (err) {
        console.error('Error fetching tafsir list:', err)
        setTafsirError(err instanceof Error ? err.message : 'Failed to fetch tafsir list')
      } finally {
        setTafsirLoading(false)
      }
    }

    fetchTafsirList()
  }, [])

  // Fetch tafsir content for specific ayah
  const fetchTafsirContent = useCallback(
    async (surah: number, ayah: number) => {
      setContentLoading(true)
      setContentError(null)

      try {
        const response = await fetch(
          `/api/quran/tafsirs/${selectedTafsirId}/${surah}/${ayah}`
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Tafsir not available for this ayah')
          }
          throw new Error(`Failed to fetch tafsir: ${response.status}`)
        }

        const data: QuranComTafsirContentResponse = await response.json()
        setTafsirContent(data.tafsir)
      } catch (err) {
        console.error('Error fetching tafsir content:', err)
        setContentError(err instanceof Error ? err.message : 'Failed to fetch tafsir')
        setTafsirContent(null)
      } finally {
        setContentLoading(false)
      }
    },
    [selectedTafsirId]
  )

  // Clear content (when dialog closes)
  const clearContent = useCallback(() => {
    setTafsirContent(null)
    setContentError(null)
  }, [])

  // Sync selected tafsir from sessionStorage
  // Called when dialog opens to ensure latest selection is used
  const syncFromStorage = useCallback(() => {
    const storedId = getStoredTafsirId()
    if (storedId !== selectedTafsirId) {
      setSelectedTafsirIdState(storedId)
    }
  }, [selectedTafsirId])

  return {
    tafsirs,
    tafsirLoading,
    tafsirError,
    selectedTafsirId,
    setSelectedTafsirId,
    tafsirContent,
    contentLoading,
    contentError,
    fetchTafsirContent,
    clearContent,
    syncFromStorage,
  }
}

