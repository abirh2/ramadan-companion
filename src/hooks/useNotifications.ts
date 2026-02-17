'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type {
  NotificationPreferences,
  PrayerName,
  UseNotificationsResult,
} from '@/types/notification.types'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  subscribeToPush,
  unsubscribeFromPush,
  getStoredFCMToken,
  storeFCMToken,
  clearStoredFCMToken,
} from '@/lib/notifications'
import { Capacitor } from '@capacitor/core'

/**
 * Hook for managing prayer time notification preferences and permissions
 * 
 * Features:
 * - Check browser support and permission status
 * - Request notification permission (requires authentication)
 * - Subscribe/unsubscribe to Web Push API
 * - Load/save preferences (dual-storage: localStorage + profile)
 * - Toggle individual prayer notifications
 * - Enable/disable all notifications
 * 
 * Note: Web Push API requires authentication. Users must be logged in to receive notifications.
 */
export function useNotifications(): UseNotificationsResult {
  const { profile } = useAuth()
  const [state, setState] = useState<{
    isSupported: boolean
    permission: NotificationPermission | null
    preferences: NotificationPreferences
    loading: boolean
    error: string | null
  }>({
    isSupported: false,
    permission: null,
    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
    loading: true,
    error: null,
  })

  const isFetchingRef = useRef(false)

  // Load preferences on mount and when profile changes
  const loadPreferences = useCallback(() => {
    if (isFetchingRef.current) return

    isFetchingRef.current = true

    try {
      const isSupported = isNotificationSupported()
      const permission = getNotificationPermission()
      const preferences = getNotificationPreferences(profile)

      setState({
        isSupported,
        permission,
        preferences,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('[useNotifications] Failed to load preferences:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load preferences',
      }))
    } finally {
      isFetchingRef.current = false
    }
  }, [profile])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const granted = await requestNotificationPermission()

      if (granted) {
        const subscription = await subscribeToPush()

        if (subscription) {
          try {
            const body =
              'fcmToken' in subscription
                ? { fcmToken: subscription.fcmToken }
                : subscription

            if ('fcmToken' in subscription) {
              storeFCMToken(subscription.fcmToken)
            }

            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            })
          } catch (error) {
            console.error('[useNotifications] Failed to save subscription:', error)
          }
        }

        const newPreferences: NotificationPreferences = {
          enabled: true,
          prayers: {
            Fajr: true,
            Dhuhr: true,
            Asr: true,
            Maghrib: true,
            Isha: true,
          },
        }

        await saveNotificationPreferences(newPreferences, profile)

        setState((prev) => ({
          ...prev,
          permission: 'granted',
          preferences: newPreferences,
          loading: false,
        }))

        return true
      } else {
        setState((prev) => ({
          ...prev,
          permission: getNotificationPermission(),
          loading: false,
        }))

        return false
      }
    } catch (error) {
      console.error('[useNotifications] Permission request failed:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Permission request failed',
      }))
      return false
    }
  }, [profile])

  // Toggle individual prayer notification
  const togglePrayer = useCallback(
    async (prayer: PrayerName): Promise<void> => {
      try {
        const newPreferences: NotificationPreferences = {
          ...state.preferences,
          prayers: {
            ...state.preferences.prayers,
            [prayer]: !state.preferences.prayers[prayer],
          },
        }

        await saveNotificationPreferences(newPreferences, profile)

        setState((prev) => ({
          ...prev,
          preferences: newPreferences,
        }))
      } catch (error) {
        console.error(`[useNotifications] Failed to toggle ${prayer}:`, error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : `Failed to toggle ${prayer}`,
        }))
      }
    },
    [state.preferences, profile]
  )

  // Enable all notifications
  const enableAll = useCallback(async (): Promise<void> => {
    try {
      const newPreferences: NotificationPreferences = {
        enabled: true,
        prayers: {
          Fajr: true,
          Dhuhr: true,
          Asr: true,
          Maghrib: true,
          Isha: true,
        },
      }

      await saveNotificationPreferences(newPreferences, profile)

      setState((prev) => ({
        ...prev,
        preferences: newPreferences,
      }))
    } catch (error) {
      console.error('[useNotifications] Failed to enable all:', error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable all',
      }))
    }
  }, [profile])

  // Disable all notifications
  const disableAll = useCallback(async (): Promise<void> => {
    try {
      if (Capacitor.isNativePlatform()) {
        const fcmToken = getStoredFCMToken()
        if (fcmToken) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fcmToken }),
          })
          clearStoredFCMToken()
        }
        await unsubscribeFromPush()
      } else {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await subscription.unsubscribe()
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          })
        }
      }

      const newPreferences: NotificationPreferences = {
        ...state.preferences,
        enabled: false,
      }

      await saveNotificationPreferences(newPreferences, profile)

      setState((prev) => ({
        ...prev,
        preferences: newPreferences,
      }))
    } catch (error) {
      console.error('[useNotifications] Failed to disable all:', error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disable all',
      }))
    }
  }, [state.preferences, profile])

  // Refetch preferences
  const refetch = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    loadPreferences()
  }, [loadPreferences])

  return {
    isSupported: state.isSupported,
    permission: state.permission,
    preferences: state.preferences,
    loading: state.loading,
    error: state.error,
    requestPermission,
    togglePrayer,
    enableAll,
    disableAll,
    refetch,
  }
}

