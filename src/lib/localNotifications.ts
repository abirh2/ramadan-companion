/**
 * Local notification scheduling for native apps (iOS/Android)
 * Schedules prayer time notifications at exact times - no server/cron required
 */

import { Capacitor } from '@capacitor/core'
import { calculatePrayerTimesLocal } from '@/lib/prayerTimes'
import { getRandomPrayerQuote } from '@/lib/prayerQuotes'
import type {
  NotificationPreferences,
  PrayerName,
} from '@/types/notification.types'
import type { LocationData } from '@/types/ramadan.types'
import type { CalculationMethodId, MadhabId } from '@/types/ramadan.types'

const PRAYER_IDS: Record<PrayerName, number> = {
  Fajr: 1,
  Dhuhr: 2,
  Asr: 3,
  Maghrib: 4,
  Isha: 5,
}

function format12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Parse "HH:MM" to Date for today in local timezone
 */
function timeToDateToday(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Schedule local prayer notifications for today
 * Only runs on native platform.
 */
export async function schedulePrayerNotifications(
  preferences: NotificationPreferences,
  location: LocationData,
  calculationMethod: CalculationMethodId = '2',
  madhab: MadhabId = '0'
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    const permission = await LocalNotifications.requestPermissions()
    if (permission.display !== 'granted') {
      console.warn('[LocalNotifications] Permission not granted')
      return
    }

    await cancelPrayerNotifications()

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const today = new Date()
    const prayerTimes = calculatePrayerTimesLocal(
      location.lat,
      location.lng,
      calculationMethod,
      madhab,
      timezone,
      today
    )

    const notifications: Array<{
      id: number
      title: string
      body: string
      schedule: { at: Date; allowWhileIdle?: boolean }
      extra?: Record<string, string>
    }> = []

    const now = Date.now()
    const prayerNames: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

    for (const prayerName of prayerNames) {
      if (!preferences.prayers?.[prayerName]) continue

      const timeStr = prayerTimes[prayerName]
      const scheduledDate = timeToDateToday(timeStr)

      if (scheduledDate.getTime() <= now) continue

      const quote = getRandomPrayerQuote(prayerName)
      const title = `Time for ${prayerName} - ${format12Hour(timeStr)}`
      const body = `${quote.text} - ${quote.source}`

      notifications.push({
        id: PRAYER_IDS[prayerName],
        title,
        body,
        schedule: {
          at: scheduledDate,
          allowWhileIdle: true,
        },
        extra: { prayer: prayerName, url: '/times' },
      })
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({
        notifications: notifications.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: n.schedule,
          extra: n.extra,
        })),
      })
      console.log(`[LocalNotifications] Scheduled ${notifications.length} prayer notifications`)
    }
  } catch (error) {
    console.error('[LocalNotifications] Failed to schedule:', error)
  }
}

/**
 * Cancel all scheduled prayer notifications
 */
export async function cancelPrayerNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({
      notifications: Object.values(PRAYER_IDS).map((id) => ({ id })),
    })
    console.log('[LocalNotifications] Cancelled prayer notifications')
  } catch (error) {
    console.error('[LocalNotifications] Failed to cancel:', error)
  }
}

/**
 * Reschedule if notifications are enabled - call on app launch
 */
export async function rescheduleIfEnabled(
  preferences: NotificationPreferences,
  location: LocationData | null,
  calculationMethod: CalculationMethodId = '2',
  madhab: MadhabId = '0'
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  if (!preferences.enabled || !location) return

  await schedulePrayerNotifications(
    preferences,
    location,
    calculationMethod,
    madhab
  )
}
