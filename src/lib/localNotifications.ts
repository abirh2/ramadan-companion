/**
 * Local notification scheduling for native apps (iOS/Android)
 * Schedules prayer time notifications for the next 7 days — no server/cron required.
 * Scheduling multiple days ahead ensures notifications fire even when the user
 * doesn't open the app for several days (the primary iOS reliability issue).
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

// Prayer base IDs (1–5). Final ID = (dayOffset + 1) * 10 + basePrayerId
// Day 0: Fajr=11 … Isha=15 | Day 1: Fajr=21 … | Day 6: Fajr=71 … Isha=75
const PRAYER_IDS: Record<PrayerName, number> = {
  Fajr: 1,
  Dhuhr: 2,
  Asr: 3,
  Maghrib: 4,
  Isha: 5,
}

const DAYS_AHEAD = 6 // Schedule today + next 6 days = 7 days total

function format12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Build a Date for a given "HH:MM" time string on a specific calendar date.
 */
function timeToDate(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date(baseDate)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Cancel ALL currently-pending prayer notifications.
 * Uses getPending() so it handles any ID scheme, including leftovers from
 * the old single-day scheme.
 */
export async function cancelPrayerNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const { notifications: pending } = await LocalNotifications.getPending()
    if (pending.length > 0) {
      await LocalNotifications.cancel({ notifications: pending })
    }
    console.log(`[LocalNotifications] Cancelled ${pending.length} notifications`)
  } catch (error) {
    console.error('[LocalNotifications] Failed to cancel:', error)
  }
}

/**
 * Schedule local prayer notifications for the next 7 days.
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

    // Cancel stale notifications before rescheduling
    await cancelPrayerNotifications()

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = Date.now()
    const prayerNames: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

    const notifications: Array<{
      id: number
      title: string
      body: string
      schedule: { at: Date; allowWhileIdle?: boolean }
      extra?: Record<string, string>
    }> = []

    for (let dayOffset = 0; dayOffset <= DAYS_AHEAD; dayOffset++) {
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + dayOffset)

      const prayerTimes = calculatePrayerTimesLocal(
        location.lat,
        location.lng,
        calculationMethod,
        madhab,
        timezone,
        targetDate
      )

      for (const prayerName of prayerNames) {
        const setting = preferences.prayers?.[prayerName]
        if (!setting || (typeof setting === 'object' ? !setting.enabled : !setting)) continue

        const minutesBefore = typeof setting === 'object' ? (setting.minutesBefore ?? 0) : 0
        const timeStr = prayerTimes[prayerName]
        const prayerDate = timeToDate(timeStr, targetDate)

        const scheduledDate = new Date(prayerDate.getTime() - minutesBefore * 60 * 1000)

        if (scheduledDate.getTime() <= now) continue

        const quote = getRandomPrayerQuote(prayerName)
        const displayTime = format12Hour(timeStr)
        const title = minutesBefore > 0
          ? `${prayerName} in ${minutesBefore} minutes — ${displayTime}`
          : `Time for ${prayerName} — ${displayTime}`
        const body = `${quote.text} — ${quote.source}`

        // Unique ID: (dayOffset + 1) * 10 + basePrayerId
        const id = (dayOffset + 1) * 10 + PRAYER_IDS[prayerName]

        notifications.push({
          id,
          title,
          body,
          schedule: { at: scheduledDate, allowWhileIdle: true },
          extra: { prayer: prayerName, url: '/times' },
        })
      }
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
      console.log(`[LocalNotifications] Scheduled ${notifications.length} notifications across ${DAYS_AHEAD + 1} days`)
    }
  } catch (error) {
    console.error('[LocalNotifications] Failed to schedule:', error)
  }
}

/**
 * Send a test notification immediately (fires 3 seconds from now).
 * Used for verifying notification permissions and delivery on device.
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    const permission = await LocalNotifications.requestPermissions()
    if (permission.display !== 'granted') {
      console.warn('[LocalNotifications] Permission not granted for test')
      return false
    }

    const testDate = new Date(Date.now() + 3000)
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 99,
          title: 'Deen Companion — Test Notification',
          body: 'Prayer notifications are working. You will receive reminders at each prayer time.',
          schedule: { at: testDate, allowWhileIdle: true },
          extra: { prayer: 'test', url: '/times' },
        },
      ],
    })
    console.log('[LocalNotifications] Test notification scheduled for', testDate.toLocaleTimeString())
    return true
  } catch (error) {
    console.error('[LocalNotifications] Test notification failed:', error)
    return false
  }
}

/**
 * Reschedule if notifications are enabled — call on app launch.
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
