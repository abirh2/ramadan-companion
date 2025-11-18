// Prayer Time Notification Types

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface PrayerNotificationPreferences {
  Fajr: boolean
  Dhuhr: boolean
  Asr: boolean
  Maghrib: boolean
  Isha: boolean
}

export interface NotificationPreferences {
  enabled: boolean
  prayers: PrayerNotificationPreferences
}

export interface PrayerQuote {
  id: string
  text: string
  source: string
  prayer?: PrayerName // Specific prayer this quote relates to
}

// Web Push API Subscription Types
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushSubscriptionDB {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  created_at: string
  updated_at: string
}

export interface ScheduledNotification {
  prayerName: PrayerName
  scheduledTime: Date
  timeoutId?: NodeJS.Timeout
}

export interface UseNotificationsResult {
  isSupported: boolean
  permission: NotificationPermission | null
  preferences: NotificationPreferences
  loading: boolean
  error: string | null
  requestPermission: () => Promise<boolean>
  togglePrayer: (prayer: PrayerName) => Promise<void>
  enableAll: () => Promise<void>
  disableAll: () => Promise<void>
  refetch: () => Promise<void>
}

