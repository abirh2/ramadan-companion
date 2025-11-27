import type { ZikrPhrase, ZikrState, ZikrFeedbackPreferences } from '@/types/zikr.types'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/**
 * Standard zikr phrases with default targets
 */
export const STANDARD_PHRASES: ZikrPhrase[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    defaultTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    transliteration: 'Alhamdulillah',
    meaning: 'Praise be to Allah',
    defaultTarget: 33,
  },
  {
    id: 'allahu-akbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    defaultTarget: 34,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    transliteration: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    defaultTarget: 100,
  },
  {
    id: 'la-ilaha-illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    transliteration: 'La ilaha illallah',
    meaning: 'There is no god but Allah',
    defaultTarget: 100,
  },
]

/**
 * LocalStorage keys
 */
const STORAGE_KEYS = {
  ZIKR_STATE: 'zikr_state',
  FEEDBACK_PREFS: 'zikr_feedback_enabled',
} as const

/**
 * Get zikr phrase by ID
 */
export function getZikrPhraseById(phraseId: string): ZikrPhrase | undefined {
  return STANDARD_PHRASES.find((phrase) => phrase.id === phraseId)
}

/**
 * Get default zikr state
 */
export function getDefaultZikrState(): ZikrState {
  const defaultPhrase = STANDARD_PHRASES[0]
  return {
    phraseId: defaultPhrase.id,
    count: 0,
    target: defaultPhrase.defaultTarget,
    lastResetDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  }
}

/**
 * Load zikr state from localStorage
 */
export function loadZikrState(): ZikrState {
  if (typeof window === 'undefined') {
    return getDefaultZikrState()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ZIKR_STATE)
    if (!stored) {
      return getDefaultZikrState()
    }

    const parsed = JSON.parse(stored) as ZikrState
    
    // Validate parsed state
    if (!parsed.phraseId || typeof parsed.count !== 'number') {
      return getDefaultZikrState()
    }

    return parsed
  } catch (error) {
    console.error('Error loading zikr state:', error)
    return getDefaultZikrState()
  }
}

/**
 * Save zikr state to localStorage
 */
export function saveZikrState(state: ZikrState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEYS.ZIKR_STATE, JSON.stringify(state))
  } catch (error) {
    console.error('Error saving zikr state:', error)
  }
}

/**
 * Check if counter should reset based on Fajr time
 * 
 * The Islamic day begins at Fajr (dawn prayer).
 * If the current time is past today's Fajr AND the last reset was before today,
 * the counter should reset.
 * 
 * @param lastResetDate - ISO date string (YYYY-MM-DD) of last reset
 * @param fajrTime - Today's Fajr time as HH:MM string
 * @returns true if counter should reset
 */
export function shouldResetForFajr(lastResetDate: string, fajrTime: string | null): boolean {
  if (!fajrTime) {
    // If no Fajr time available, fall back to midnight reset
    const today = new Date().toISOString().split('T')[0]
    return lastResetDate < today
  }

  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    
    // If last reset was today or later, don't reset
    if (lastResetDate >= today) {
      return false
    }

    // Parse Fajr time (HH:MM format)
    const [fajrHour, fajrMinute] = fajrTime.split(':').map(Number)
    
    // Create Fajr datetime for today
    const todayFajr = new Date(now)
    todayFajr.setHours(fajrHour, fajrMinute, 0, 0)

    // If current time is past today's Fajr AND last reset was before today
    // then we've crossed into a new Islamic day
    return now >= todayFajr && lastResetDate < today
  } catch (error) {
    console.error('Error checking Fajr reset:', error)
    // Fall back to simple date comparison
    const today = new Date().toISOString().split('T')[0]
    return lastResetDate < today
  }
}

/**
 * Reset zikr counter with today's date
 */
export function resetZikrCounter(currentState: ZikrState): ZikrState {
  const today = new Date().toISOString().split('T')[0]
  return {
    ...currentState,
    count: 0,
    lastResetDate: today,
  }
}

/**
 * Load feedback preferences from localStorage
 */
export function loadFeedbackPreferences(): ZikrFeedbackPreferences {
  if (typeof window === 'undefined') {
    return { audioEnabled: true, hapticEnabled: true }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK_PREFS)
    if (!stored) {
      return { audioEnabled: true, hapticEnabled: true }
    }

    const parsed = JSON.parse(stored) as ZikrFeedbackPreferences
    return {
      audioEnabled: parsed.audioEnabled !== false,
      hapticEnabled: parsed.hapticEnabled !== false,
    }
  } catch (error) {
    console.error('Error loading feedback preferences:', error)
    return { audioEnabled: true, hapticEnabled: true }
  }
}

/**
 * Save feedback preferences to localStorage
 */
export function saveFeedbackPreferences(prefs: ZikrFeedbackPreferences): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK_PREFS, JSON.stringify(prefs))
  } catch (error) {
    console.error('Error saving feedback preferences:', error)
  }
}

/**
 * Play click sound using Web Audio API
 */
export function playClickSound(): void {
  if (typeof window === 'undefined' || !('AudioContext' in window)) {
    return
  }

  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800 // Hz
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)

    // Clean up
    setTimeout(() => {
      audioContext.close()
    }, 100)
  } catch (error) {
    // Silently fail - audio feedback is optional
    console.debug('Audio playback failed:', error)
  }
}

/**
 * Trigger haptic vibration
 */
/**
 * Trigger haptic vibration using platform-appropriate API
 * - Native apps: Uses Capacitor Haptics plugin for native Taptic Engine/vibration
 * - Browser/PWA: Uses navigator.vibrate API
 */
export async function triggerHapticFeedback(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native: Use Capacitor Haptics plugin for better tactile feedback
      await Haptics.impact({ style: ImpactStyle.Light })
    } else {
      // Browser: Use Web Vibration API
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10) // 10ms pulse
      }
    }
  } catch (error) {
    // Silently fail - haptic feedback is optional enhancement
    console.debug('Haptic feedback failed:', error)
  }
}

