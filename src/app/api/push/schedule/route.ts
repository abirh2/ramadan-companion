import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import webpush from 'web-push'
import { getRandomPrayerQuote } from '@/lib/prayerQuotes'
import { calculatePrayerTimesLocal } from '@/lib/prayerTimes'
import type { PrayerName } from '@/types/notification.types'

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_MAILTO || 'mailto:admin@ramadan-companion.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

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

      const prayerTimes = calculatePrayerTimesLocal(
        profile.location_lat,
        profile.location_lng,
        (profile.calculation_method || '4') as any,
        (profile.madhab || '0') as any,
        undefined, // timezone - will use browser default
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

      // Schedule notifications for each enabled prayer
      const prayerNames: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      
      for (const prayerName of prayerNames) {
        if (!prefs.prayers?.[prayerName]) continue

        const prayerTime = prayerTimes[prayerName]
        const quote = getRandomPrayerQuote(prayerName)
        
        const payload = JSON.stringify({
          title: `Time for ${prayerName} Prayer`,
          body: `${quote.text} - ${quote.source}`,
          icon: '/icon-192.png',
          badge: '/icon-192-maskable.png',
          tag: `prayer-${prayerName.toLowerCase()}-${Date.now()}`,
          data: { url: '/times', prayer: prayerName },
        })

        // Send to all user's subscriptions
        for (const sub of subscriptions) {
          try {
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
            results.success++
          } catch (error: any) {
            // Handle subscription errors
            if (error.statusCode === 410 || error.statusCode === 404) {
              // Subscription expired - delete it
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

