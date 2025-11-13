/**
 * Admin dashboard card
 * Shows admin-only quick stats and links to admin dashboard
 * Only visible to users with is_admin flag
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Loader2 } from 'lucide-react'
import { useAdmin } from '@/hooks/useAdmin'
import { useAnalytics } from '@/hooks/useAnalytics'

export function AdminCard() {
  const { isAdmin, loading: adminLoading } = useAdmin()
  const { feedbackMetrics, totalUsers, loading: analyticsLoading, refreshAll } = useAnalytics()

  useEffect(() => {
    if (isAdmin && !adminLoading) {
      refreshAll()
    }
  }, [isAdmin, adminLoading, refreshAll])

  // Don't render anything if not admin
  if (!isAdmin) {
    return null
  }

  const loading = analyticsLoading

  return (
    <Link href="/admin" className="block">
      <Card className="cursor-pointer rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-primary">
              Admin Dashboard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && (
            <>
              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Issues to Review</p>
                  <p className="text-xl font-semibold">
                    {feedbackMetrics?.unresolved || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                  <p className="text-xl font-semibold">
                    {totalUsers !== null ? totalUsers : '-'}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">Feedback Health</span>
                <span className="text-sm font-medium">
                  {feedbackMetrics
                    ? `${feedbackMetrics.reviewedPercentage}% reviewed`
                    : 'Loading...'}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

