// Notification utilities for prayer time reminders
// Handles permission requests, scheduling, storage, and browser API interactions
// Platform-aware: Web Push API for PWA/browser, Capacitor FCM for native apps

import type {
  NotificationPreferences,
  PrayerName,
  ScheduledNotification,
  PushSubscription,
} from '@/types/notification.types'
import { Capacitor } from '@capacitor/core'

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
 * Check if notifications are supported
 * - Native: Capacitor PushNotifications (FCM)
 * - Browser: Web Push API (iOS Safari only; other iOS browsers unsupported)
 * @returns true if notifications are supported
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false

  if (Capacitor.isNativePlatform()) {
    return true
  }

  const hasAPI = 'Notification' in window && 'serviceWorker' in navigator
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
  if (Capacitor.isNativePlatform()) {
    return 'default'
  }
  return Notification.permission
}

/**
 * Get native local notification permission (async)
 * Used for native app to check/sync permission state
 */
export async function getNativeNotificationPermission(): Promise<NotificationPermission> {
  if (!Capacitor.isNativePlatform()) return 'default'
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const { display } = await LocalNotifications.checkPermissions()
    if (display === 'granted') return 'granted'
    if (display === 'denied') return 'denied'
    return 'default'
  } catch {
    return 'default'
  }
}

/**
 * Request notification permission from the user
 * Platform-aware: Capacitor on native, Notification API on browser
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported')
    return false
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEYS.PERMISSION_REQUESTED,
      new Date().toISOString()
    )
  }

  try {
    if (Capacitor.isNativePlatform()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const { display } = await LocalNotifications.requestPermissions()
      return display === 'granted'
    }

    const permission = await Notification.requestPermission()
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

/** Result of native FCM subscription */
export interface FCMSubscription {
  fcmToken: string
}

/** Union type for push subscription (Web Push or FCM) */
export type PushSubscriptionResult = PushSubscription | FCMSubscription

/**
 * Subscribe to push notifications
 * - Native: Capacitor PushNotifications (FCM)
 * - Browser: Web Push API
 * @returns PushSubscription (browser) or FCMSubscription (native), or null if failed
 */
export async function subscribeToPush(): Promise<PushSubscriptionResult | null> {
  if (!isNotificationSupported()) return null

  try {
    if (Capacitor.isNativePlatform()) {
      return subscribeToPushNative()
    }
    return subscribeToPushBrowser()
  } catch (error) {
    console.error('[Notifications] Push subscription failed:', error)
    return null
  }
}

/** Native FCM subscription via Capacitor */
async function subscribeToPushNative(): Promise<FCMSubscription | null> {
  const { PushNotifications } = await import('@capacitor/push-notifications')

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return null

  await PushNotifications.register()

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      PushNotifications.removeAllListeners()
      resolve(null)
    }, 10000)

    PushNotifications.addListener(
      'registration',
      (token: { value: string }) => {
        clearTimeout(timeout)
        PushNotifications.removeAllListeners()
        resolve({ fcmToken: token.value })
      }
    )

    PushNotifications.addListener(
      'registrationError',
      (err: { error: string }) => {
        clearTimeout(timeout)
        PushNotifications.removeAllListeners()
        console.error('[Notifications] FCM registration error:', err.error)
        resolve(null)
      }
    )
  })
}

/** Browser Web Push subscription */
async function subscribeToPushBrowser(): Promise<PushSubscription | null> {
  if (Notification.permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) throw new Error('VAPID public key not configured')

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const keys = subscription.toJSON().keys
  if (!keys?.p256dh || !keys?.auth) throw new Error('Invalid subscription keys')

  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
  }
}

/**
 * Unsubscribe from push notifications
 * - Native: Removes listeners; backend deletion via fcmToken
 * - Browser: Unsubscribes from pushManager
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      await PushNotifications.removeAllListeners()
      return true
    }

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
 * Get stored FCM token for unsubscribe (native only)
 * Capacitor plugin does not expose token after registration; we store it when subscribing
 */
const FCM_TOKEN_STORAGE_KEY = 'notification_fcm_token'

export function getStoredFCMToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
}

export function storeFCMToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token)
  }
}

export function clearStoredFCMToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY)
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

