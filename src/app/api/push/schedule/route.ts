import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import webpush from 'web-push'
import * as admin from 'firebase-admin'
import { getRandomPrayerQuote } from '@/lib/prayerQuotes'
import { calculatePrayerTimesLocal } from '@/lib/prayerTimes'
import { getTimezoneFromCoordinates } from '@/lib/timezone'
import type { PrayerName } from '@/types/notification.types'

// Configure web-push (for PWA/browser subscriptions)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO || 'mailto:admin@deen-companion.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

// Initialize Firebase Admin SDK (for native FCM subscriptions)
if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  !admin.apps.length
) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })
}

/**
 * Parse prayer time string (HH:MM) to minutes since midnight
 * @param timeString - Time in 24-hour format (e.g., "05:30", "13:45")
 * @returns Minutes since midnight
 */
function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:14", "05:30")
 * @returns Time in 12-hour format (e.g., "2:14 PM", "5:30 AM")
 */
function format12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12 // Convert 0 to 12 for midnight
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Get current time in minutes since midnight for a specific timezone
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Minutes since midnight in the specified timezone
 */
function getCurrentTimeInTimezone(timezone: string): number {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
  return parseTimeToMinutes(timeString)
}

/**
 * Check if current time matches prayer time within a window
 * @param currentMinutes - Current time in minutes since midnight
 * @param prayerMinutes - Prayer time in minutes since midnight
 * @param windowMinutes - Window size in minutes (default: 2)
 * @returns True if within window
 */
// Helper function for time window validation (currently unused but kept for future use)
// function isWithinTimeWindow(
//   currentMinutes: number,
//   prayerMinutes: number,
//   windowMinutes: number = 2
// ): boolean {
//   return Math.abs(currentMinutes - prayerMinutes) <= windowMinutes
// }

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'development-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client to bypass RLS policies
    const supabase = createServiceRoleClient()

    // Get all users with notification preferences enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, location_lat, location_lng, calculation_method, madhab, notification_preferences')
      .not('notification_preferences', 'is', null)

    if (profilesError) throw profilesError

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    }

    for (const profile of profiles || []) {
      results.total++

      // Check if notifications enabled
      const prefs = profile.notification_preferences as any
      if (!prefs?.enabled) {
        results.skipped++
        continue
      }

      // Calculate today's prayer times
      if (!profile.location_lat || !profile.location_lng) {
        results.skipped++
        continue
      }

      // Get user's timezone from their coordinates
      const userTimezone = getTimezoneFromCoordinates(
        profile.location_lat,
        profile.location_lng
      )

      const prayerTimes = calculatePrayerTimesLocal(
        profile.location_lat,
        profile.location_lng,
        (profile.calculation_method || '2') as any, // Fallback to ISNA
        (profile.madhab || '0') as any,
        userTimezone, // User's actual timezone from coordinates
        new Date() // date - today
      )

      // Get user's subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', profile.id)

      if (!subscriptions || subscriptions.length === 0) {
        results.skipped++
        continue
      }

      // Get current time in user's timezone
      const currentMinutes = getCurrentTimeInTimezone(userTimezone)

      // Check notifications for each enabled prayer
      const prayerNames: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      
      for (const prayerName of prayerNames) {
        if (!prefs.prayers?.[prayerName]) continue

        const prayerTime = prayerTimes[prayerName]
        const prayerMinutes = parseTimeToMinutes(prayerTime)
        
        // Only send notification if current time is AT or AFTER prayer time (within 5-minute window)
        // Never send before prayer time - only send when prayer time has arrived or just passed
        // 5-minute window matches cron interval to guarantee zero missed notifications
        // Worst case: prayer at 5:30:01, last cron at 5:30, next cron at 5:35 (needs 5min window)
        if (currentMinutes < prayerMinutes || currentMinutes > prayerMinutes + 5) {
          continue // Too early or too late
        }

        const quote = getRandomPrayerQuote(prayerName)
        const title = `Time for ${prayerName} - ${format12Hour(prayerTime)}`
        const body = `${quote.text} - ${quote.source}`

        // Send to all user's subscriptions (Web Push for browser, FCM for native)
        for (const sub of subscriptions) {
          try {
            if (sub.fcm_token) {
              // Native app: send via Firebase Cloud Messaging
              if (!admin.apps.length) {
                results.failed++
                continue
              }
              await admin.messaging().send({
                token: sub.fcm_token,
                notification: { title, body },
                data: {
                  url: '/times',
                  prayer: prayerName,
                  prayerTime: prayerTime,
                },
                android: {
                  priority: 'high' as const,
                  notification: {
                    icon: 'ic_notification',
                    color: '#0f3d3e',
                    sound: 'default',
                  },
                },
                apns: {
                  payload: {
                    aps: {
                      sound: 'default',
                      badge: 1,
                      'content-available': 1,
                    },
                  },
                },
              })
            } else {
              // PWA/browser: send via Web Push API
              const payload = JSON.stringify({
                title,
                body,
                icon: '/icon-192.png',
                badge: '/icon-192-maskable.png',
                tag: `prayer-${prayerName.toLowerCase()}-${Date.now()}`,
                data: { url: '/times', prayer: prayerName },
              })
              await webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                  },
                },
                payload
              )
            }
            results.success++
          } catch (error: any) {
            // Handle subscription errors
            const isExpired =
              sub.fcm_token
                ? error.code === 'messaging/registration-token-not-registered' ||
                  error.code === 'messaging/invalid-registration-token'
                : error.statusCode === 410 || error.statusCode === 404
            if (isExpired) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id)
            }
            results.failed++
          }
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('[API] Schedule notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule notifications' },
      { status: 500 }
    )
  }
}

