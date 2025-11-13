import { useState, useEffect, useCallback, useRef } from 'react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import {
  loadZikrState,
  saveZikrState,
  shouldResetForFajr,
  resetZikrCounter,
  getZikrPhraseById,
  STANDARD_PHRASES,
  playClickSound,
  triggerHapticFeedback,
  loadFeedbackPreferences,
  saveFeedbackPreferences,
} from '@/lib/zikr'
import type { ZikrState, ZikrPhrase, ZikrFeedbackPreferences } from '@/types/zikr.types'

interface UseZikrResult {
  // State
  state: ZikrState
  currentPhrase: ZikrPhrase
  phrases: ZikrPhrase[]
  feedbackPrefs: ZikrFeedbackPreferences
  
  // Progress
  progress: number // 0-100 percentage
  isGoalReached: boolean
  hasTarget: boolean
  
  // Actions
  increment: () => void
  reset: () => void
  selectPhrase: (phraseId: string) => void
  setTarget: (target: number | null) => void
  toggleAudioFeedback: () => void
  toggleHapticFeedback: () => void
  
  // Status
  loading: boolean
}

export function useZikr(): UseZikrResult {
  const { prayerTimes } = usePrayerTimes()
  const [state, setState] = useState<ZikrState>(() => {
    const initialState = loadZikrState()
    // Check for Fajr reset on initial load
    const fajrTime = null // Will be checked after prayer times load
    if (fajrTime && shouldResetForFajr(initialState.lastResetDate, fajrTime)) {
      const resetState = resetZikrCounter(initialState)
      saveZikrState(resetState)
      return resetState
    }
    return initialState
  })
  const [feedbackPrefs, setFeedbackPrefs] = useState<ZikrFeedbackPreferences>(() => loadFeedbackPreferences())
  const [loading, setLoading] = useState(true)
  const hasCheckedResetRef = useRef(false)

  // Get current phrase details
  const currentPhrase = getZikrPhraseById(state.phraseId) || STANDARD_PHRASES[0]

  // Calculate progress
  const hasTarget = state.target !== null && state.target > 0
  const progress = hasTarget ? Math.min((state.count / state.target!) * 100, 100) : 0
  const isGoalReached = hasTarget && state.count >= state.target!

  // Check for Fajr reset when prayer times become available
  useEffect(() => {
    if (hasCheckedResetRef.current || !prayerTimes) {
      return
    }

    const fajrTime = prayerTimes.Fajr || null
    
    if (shouldResetForFajr(state.lastResetDate, fajrTime)) {
      setState((prevState) => {
        const resetState = resetZikrCounter(prevState)
        saveZikrState(resetState)
        return resetState
      })
    }

    hasCheckedResetRef.current = true
    setLoading(false)
  }, [prayerTimes, state.lastResetDate])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveZikrState(state)
    }
  }, [state, loading])

  // Increment counter
  const increment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      count: prev.count + 1,
    }))

    // Trigger feedback
    if (feedbackPrefs.audioEnabled) {
      playClickSound()
    }
    if (feedbackPrefs.hapticEnabled) {
      triggerHapticFeedback()
    }
  }, [feedbackPrefs])

  // Reset counter
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      count: 0,
    }))
  }, [])

  // Select a different phrase
  const selectPhrase = useCallback((phraseId: string) => {
    const phrase = getZikrPhraseById(phraseId)
    if (!phrase) {
      return
    }

    setState((prev) => ({
      ...prev,
      phraseId: phrase.id,
      count: 0, // Reset count when changing phrase
      target: phrase.defaultTarget,
    }))
  }, [])

  // Set target (null for free count mode)
  const setTarget = useCallback((target: number | null) => {
    setState((prev) => ({
      ...prev,
      target,
    }))
  }, [])

  // Toggle audio feedback
  const toggleAudioFeedback = useCallback(() => {
    setFeedbackPrefs((prev) => {
      const newPrefs = { ...prev, audioEnabled: !prev.audioEnabled }
      saveFeedbackPreferences(newPrefs)
      return newPrefs
    })
  }, [])

  // Toggle haptic feedback
  const toggleHapticFeedback = useCallback(() => {
    setFeedbackPrefs((prev) => {
      const newPrefs = { ...prev, hapticEnabled: !prev.hapticEnabled }
      saveFeedbackPreferences(newPrefs)
      return newPrefs
    })
  }, [])

  return {
    state,
    currentPhrase,
    phrases: STANDARD_PHRASES,
    feedbackPrefs,
    progress,
    isGoalReached,
    hasTarget,
    increment,
    reset,
    selectPhrase,
    setTarget,
    toggleAudioFeedback,
    toggleHapticFeedback,
    loading,
  }
}

