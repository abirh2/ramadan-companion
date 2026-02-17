import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, fcmToken } = body

    if (fcmToken && typeof fcmToken === 'string') {
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('fcm_token', fcmToken)

      if (dbError) throw dbError
      return NextResponse.json({ success: true })
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint or fcmToken required' },
        { status: 400 }
      )
    }

    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Push unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}

