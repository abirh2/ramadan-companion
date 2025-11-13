/**
 * Analytics hook for admin dashboard
 * Provides system metrics and user statistics
 */

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FeedbackMetrics {
  total: number
  unresolved: number
  reviewedPercentage: number
}

export interface UseAnalyticsResult {
  totalUsers: number | null
  feedbackMetrics: FeedbackMetrics | null
  loading: boolean
  error: string | null
  getTotalUsers: () => Promise<void>
  getFeedbackMetrics: () => Promise<void>
  refreshAll: () => Promise<void>
}

/**
 * Hook for admin analytics
 * Provides basic system metrics
 * 
 * @example
 * const { totalUsers, feedbackMetrics, loading, refreshAll } = useAnalytics()
 * 
 * useEffect(() => {
 *   refreshAll()
 * }, [])
 * 
 * @note Future expansion: Feature usage stats, engagement metrics, geographic data
 */
export function useAnalytics(): UseAnalyticsResult {
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [feedbackMetrics, setFeedbackMetrics] = useState<FeedbackMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  /**
   * Get total number of registered users
   * Counts all profiles in the database
   */
  const getTotalUsers = useCallback(async () => {
    try {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      setTotalUsers(count || 0)
    } catch (err) {
      console.error('Error fetching total users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user count')
      setTotalUsers(null)
    }
  }, [supabase])

  /**
   * Get feedback metrics
   * Total count, unresolved count, and review percentage
   */
  const getFeedbackMetrics = useCallback(async () => {
    try {
      // Get all feedback to calculate metrics
      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('status')

      if (fetchError) {
        throw fetchError
      }

      const feedbackData = data || []
      const total = feedbackData.length
      const unresolved = feedbackData.filter((item) => item.status === 'new').length
      const reviewed = feedbackData.filter(
        (item) => item.status === 'reviewed' || item.status === 'resolved'
      ).length
      const reviewedPercentage = total > 0 ? Math.round((reviewed / total) * 100) : 100

      setFeedbackMetrics({
        total,
        unresolved,
        reviewedPercentage,
      })
    } catch (err) {
      console.error('Error fetching feedback metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback metrics')
      setFeedbackMetrics(null)
    }
  }, [supabase])

  /**
   * Refresh all analytics data
   * Fetches user count and feedback metrics
   */
  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([getTotalUsers(), getFeedbackMetrics()])
    } catch (err) {
      console.error('Error refreshing analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [getTotalUsers, getFeedbackMetrics])

  return {
    totalUsers,
    feedbackMetrics,
    loading,
    error,
    getTotalUsers,
    getFeedbackMetrics,
    refreshAll,
  }
}

