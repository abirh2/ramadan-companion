import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { rateLimit, AUTH_LIMIT } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, AUTH_LIMIT)
  if (limited) return limited

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceRoleClient()
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[API] Account delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Account delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
