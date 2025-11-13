/**
 * Analytics panel for admin dashboard
 * Displays system metrics and feedback statistics
 */

'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useFeedback } from '@/hooks/useFeedback'
import { Users, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react'

/**
 * Analytics dashboard panel
 * Shows user counts and feedback metrics
 * 
 * @note Future expansion: Feature usage stats, engagement metrics, geographic data
 */
export function AnalyticsPanel() {
  const { totalUsers, feedbackMetrics, loading, refreshAll } = useAnalytics()

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers !== null ? totalUsers.toLocaleString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        {/* Total Feedback */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackMetrics ? feedbackMetrics.total.toLocaleString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        {/* Unresolved Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackMetrics ? feedbackMetrics.unresolved.toLocaleString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        {/* Review Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackMetrics ? `${feedbackMetrics.reviewedPercentage}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Response rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Future expansion note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics Expansion Planned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Future analytics features will include:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Feature usage statistics (prayer times views, donations, favorites)</li>
              <li>User engagement metrics (DAU, WAU, retention rates)</li>
              <li>Geographic distribution and trends</li>
              <li>API performance monitoring</li>
              <li>Feedback trends and sentiment analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

