/**
 * Zikr & Dua types for Tasbeeh Counter and Dua Library
 */

/**
 * A zikr phrase with its Arabic text, transliteration, and meaning
 */
export interface ZikrPhrase {
  id: string
  arabic: string
  transliteration: string
  meaning: string
  defaultTarget: number
}

/**
 * Current zikr counter state (stored in localStorage)
 */
export interface ZikrState {
  phraseId: string
  count: number
  target: number | null // null means no target (free count mode)
  lastResetDate: string // ISO date string for Fajr reset tracking
}

/**
 * A dua with Arabic text, transliteration, translation, and reference
 */
export interface Dua {
  id: string
  category: 'morning' | 'evening' | 'meals' | 'travel' | 'sleep' | 'home' | 'worship' | 'general'
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

/**
 * Feedback preferences for counter (audio/haptic)
 */
export interface ZikrFeedbackPreferences {
  audioEnabled: boolean
  hapticEnabled: boolean
}

