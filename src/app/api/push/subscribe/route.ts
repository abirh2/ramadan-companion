import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, keys, fcmToken } = body

    const userAgent = request.headers.get('user-agent') || null

    // FCM token (native app)
    if (fcmToken && typeof fcmToken === 'string') {
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.id,
            fcm_token: fcmToken,
            endpoint: `fcm:${fcmToken}`,
            p256dh: 'fcm',
            auth: 'fcm',
            user_agent: userAgent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,endpoint' }
        )

      if (dbError) throw dbError
      return NextResponse.json({ success: true })
    }

    // Web Push subscription (PWA/browser)
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription format: provide endpoint+keys or fcmToken' },
        { status: 400 }
      )
    }

    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,endpoint' }
      )

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Push subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

