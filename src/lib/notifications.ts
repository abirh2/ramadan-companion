// Notification utilities for prayer time reminders
// Handles permission requests, scheduling, storage, and browser API interactions

import type {
  NotificationPreferences,
  PrayerName,
  ScheduledNotification,
  PushSubscription,
} from '@/types/notification.types'
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

// Note: Notification scheduling now handled by backend cron job + Web Push API
// No more client-side setTimeout scheduling

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

      //Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
          timezone: userTimezone,
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
 * Subscribe to push notifications using Web Push API
 * Returns subscription object or null if failed
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) return null
  if (Notification.permission !== 'granted') return null

  try {
    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Get VAPID public key from env
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      // Subscribe with VAPID key
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }

    // Convert to our format
    const keys = subscription.toJSON().keys
    if (!keys?.p256dh || !keys?.auth) {
      throw new Error('Invalid subscription keys')
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    }
  } catch (error) {
    console.error('[Notifications] Push subscription failed:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    return false
  } catch (error) {
    console.error('[Notifications] Unsubscribe failed:', error)
    return false
  }
}

/**
 * Helper to convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as BufferSource
}

/**
 * Cancel all scheduled notifications (legacy no-op)
 * Notifications are now handled by backend cron + Web Push API
 */
export function cancelNotifications(): void {
  console.log('[Notifications] No-op: notifications handled by backend')
  // No-op: Backend cron job now handles notification scheduling via Web Push API
}

/**
 * Check if user has previously been asked for notification permission
 * @returns true if permission was requested before
 */
export function hasAskedForPermission(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEYS.PERMISSION_REQUESTED) !== null
}

