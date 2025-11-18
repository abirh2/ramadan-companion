// Notification utilities for prayer time reminders
// Handles permission requests, scheduling, storage, and browser API interactions

import type {
  NotificationPreferences,
  PrayerName,
  ScheduledNotification,
} from '@/types/notification.types'
import type { PrayerTime } from '@/types/ramadan.types'
import { getRandomPrayerQuote } from './prayerQuotes'

// LocalStorage keys
const STORAGE_KEYS = {
  PREFERENCES: 'notification_preferences',
  PERMISSION_REQUESTED: 'notification_permission_requested',
} as const

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
}

// Store for active notification timeouts
let scheduledNotifications: Map<PrayerName, ScheduledNotification> = new Map()

/**
 * Detect if device is iOS
 * @returns true if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua)
}

/**
 * Detect iOS browser type
 * @returns 'safari' | 'chrome' | 'firefox' | 'edge' | 'other' | 'not-ios'
 */
export function getIOSBrowser(): string {
  if (!isIOS()) return 'not-ios'
  
  const ua = navigator.userAgent
  if (/CriOS/.test(ua)) return 'chrome'
  if (/FxiOS/.test(ua)) return 'firefox'
  if (/EdgiOS/.test(ua)) return 'edge'
  if (/Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) return 'safari'
  
  return 'other'
}

/**
 * Check if notifications are supported by the browser
 * IMPORTANT: On iOS, only Safari supports Web Push notifications
 * iOS Chrome/Firefox/Edge use WebKit and do NOT support notifications
 * @returns true if notifications are supported
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check basic API support
  const hasAPI = 'Notification' in window && 'serviceWorker' in navigator
  
  // On iOS, only Safari supports notifications
  // All other iOS browsers (Chrome, Firefox, Edge) use WebKit without notification support
  if (isIOS()) {
    const browser = getIOSBrowser()
    return hasAPI && browser === 'safari'
  }
  
  return hasAPI
}

/**
 * Get current notification permission status
 * @returns NotificationPermission or null if not supported
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null
  return Notification.permission
}

/**
 * Request notification permission from the user
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported in this browser')
    return false
  }

  // Mark that we've requested permission
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEYS.PERMISSION_REQUESTED,
      new Date().toISOString()
    )
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('[Notifications] Permission result:', permission)
    return permission === 'granted'
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error)
    return false
  }
}

/**
 * Load notification preferences with fallback chain
 * Priority: Profile → localStorage → defaults
 * @param profile - User profile (optional)
 * @returns NotificationPreferences
 */
export function getNotificationPreferences(
  profile?: { notification_preferences?: NotificationPreferences } | null
): NotificationPreferences {
  // 1. Try profile first (authenticated users)
  if (profile?.notification_preferences) {
    return profile.notification_preferences
  }

  // 2. Try localStorage (guest users + fallback)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationPreferences
        return parsed
      }
    } catch (error) {
      console.error('[Notifications] Failed to load from localStorage:', error)
    }
  }

  // 3. Return defaults
  return DEFAULT_NOTIFICATION_PREFERENCES
}

/**
 * Save notification preferences to localStorage and optionally to profile
 * Follows dual-storage pattern
 * @param preferences - Preferences to save
 * @param profile - Optional profile for authenticated users
 */
export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
  profile?: { id: string } | null
): Promise<void> {
  // Always save to localStorage (works for guest + authenticated)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
    } catch (error) {
      console.error('[Notifications] Failed to save to localStorage:', error)
    }
  }

  // Also save to profile if authenticated
  if (profile?.id) {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        console.error('[Notifications] Failed to save to profile:', error)
      } else {
        console.log('[Notifications] Saved to profile')
      }
    } catch (error) {
      console.error('[Notifications] Error saving to profile:', error)
    }
  }
}

/**
 * Format time for notification display (12-hour format with AM/PM)
 * @param timeString - Time in HH:MM format
 * @returns Formatted time string
 */
function formatTimeForNotification(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Show a browser notification with prayer details
 * @param prayerName - Name of the prayer
 * @param prayerTime - Time of the prayer
 */
async function showNotification(
  prayerName: PrayerName,
  prayerTime: string
): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported')
    return
  }

  if (Notification.permission !== 'granted') {
    console.warn('[Notifications] Permission not granted')
    return
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get random prayer quote
    const quote = getRandomPrayerQuote(prayerName)

    // Format time for display
    const formattedTime = formatTimeForNotification(prayerTime)

    // Show notification
    await registration.showNotification(
      `Time for ${prayerName} Prayer - ${formattedTime}`,
      {
        body: `${quote.text} - ${quote.source}`,
        icon: '/icon-192.png',
        badge: '/icon-192-maskable.png',
        tag: `prayer-${prayerName.toLowerCase()}`,
        requireInteraction: false,
        silent: false,
        data: {
          prayerName,
          url: '/times',
        },
      }
    )

    console.log(`[Notifications] Shown for ${prayerName}`)
  } catch (error) {
    console.error(`[Notifications] Failed to show for ${prayerName}:`, error)
  }
}

/**
 * Schedule a notification for a specific prayer time
 * @param prayerName - Name of the prayer
 * @param prayerTime - Time of the prayer (HH:MM format)
 * @returns ScheduledNotification or null if not scheduled
 */
function scheduleSingleNotification(
  prayerName: PrayerName,
  prayerTime: string
): ScheduledNotification | null {
  const now = new Date()
  
  // Parse prayer time
  const [hours, minutes] = prayerTime.split(':').map(Number)
  const prayerDate = new Date(now)
  prayerDate.setHours(hours, minutes, 0, 0)

  // Calculate time until prayer
  const timeUntil = prayerDate.getTime() - now.getTime()

  // Only schedule if prayer is in the future
  if (timeUntil <= 0) {
    console.log(`[Notifications] ${prayerName} already passed, skipping`)
    return null
  }

  // Clear existing timeout for this prayer if any
  const existing = scheduledNotifications.get(prayerName)
  if (existing?.timeoutId) {
    clearTimeout(existing.timeoutId)
  }

  // Schedule notification
  const timeoutId = setTimeout(() => {
    showNotification(prayerName, prayerTime)
    // Remove from scheduled map after showing
    scheduledNotifications.delete(prayerName)
  }, timeUntil)

  const scheduled: ScheduledNotification = {
    prayerName,
    scheduledTime: prayerDate,
    timeoutId,
  }

  scheduledNotifications.set(prayerName, scheduled)

  console.log(
    `[Notifications] Scheduled ${prayerName} for ${prayerDate.toLocaleTimeString()} (in ${Math.round(timeUntil / 1000 / 60)} minutes)`
  )

  return scheduled
}

/**
 * Schedule notifications for all enabled prayers
 * @param prayerTimes - Today's prayer times
 * @param preferences - Notification preferences
 */
export function scheduleNotifications(
  prayerTimes: PrayerTime,
  preferences: NotificationPreferences
): void {
  // Check if notifications are enabled
  if (!preferences.enabled) {
    console.log('[Notifications] Disabled, not scheduling')
    return
  }

  // Check permission
  if (getNotificationPermission() !== 'granted') {
    console.warn('[Notifications] Permission not granted, cannot schedule')
    return
  }

  // Cancel existing notifications first
  cancelNotifications()

  console.log('[Notifications] Scheduling prayers:', preferences.prayers)

  // Schedule each enabled prayer
  const prayerNames: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
  
  prayerNames.forEach((prayerName) => {
    if (preferences.prayers[prayerName]) {
      const prayerTime = prayerTimes[prayerName]
      if (prayerTime) {
        scheduleSingleNotification(prayerName, prayerTime)
      }
    }
  })
}

/**
 * Cancel all scheduled notifications
 */
export function cancelNotifications(): void {
  console.log('[Notifications] Cancelling all scheduled notifications')
  
  scheduledNotifications.forEach((notification) => {
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId)
    }
  })
  
  scheduledNotifications.clear()
}

/**
 * Get all currently scheduled notifications
 * @returns Array of scheduled notifications
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  return Array.from(scheduledNotifications.values())
}

/**
 * Check if user has previously been asked for notification permission
 * @returns true if permission was requested before
 */
export function hasAskedForPermission(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.PERMISSION_REQUESTED) !== null
}

