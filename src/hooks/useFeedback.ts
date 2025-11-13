/**
 * Feedback management hook for admin users
 * Provides functions to fetch, update, and analyze feedback submissions
 */

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Feedback,
  FeedbackUpdateData,
  FeedbackFilters,
  FeedbackStats,
} from '@/types/feedback.types'

export interface UseFeedbackResult {
  feedback: Feedback[]
  loading: boolean
  error: string | null
  fetchAllFeedback: (filters?: FeedbackFilters) => Promise<void>
  updateFeedback: (id: string, data: FeedbackUpdateData) => Promise<{ success: boolean; error?: string }>
  getFeedbackStats: () => Promise<FeedbackStats | null>
}

/**
 * Hook for admin feedback management
 * Only works for authenticated admin users (RLS enforced)
 * 
 * @example
 * const { feedback, loading, fetchAllFeedback, updateFeedback } = useFeedback()
 * 
 * // Fetch all feedback
 * await fetchAllFeedback()
 * 
 * // Fetch with filters
 * await fetchAllFeedback({ status: 'new', priority: 'high' })
 * 
 * // Update feedback
 * await updateFeedback(id, { status: 'reviewed', priority: 'medium' })
 */
export function useFeedback(): UseFeedbackResult {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  /**
   * Fetch all feedback with optional filters
   * Admin-only operation (RLS enforced)
   */
  const fetchAllFeedback = useCallback(
    async (filters?: FeedbackFilters) => {
      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })

        // Apply filters
        if (filters) {
          if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
          }
          if (filters.priority && filters.priority !== 'all') {
            query = query.eq('priority', filters.priority)
          }
          if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category)
          }
          if (filters.page_path) {
            query = query.eq('page_path', filters.page_path)
          }
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
        }

        let results = data || []

        // Client-side search filter (if provided)
        if (filters?.search && filters.search.trim()) {
          const searchLower = filters.search.toLowerCase()
          results = results.filter((item) =>
            item.content.toLowerCase().includes(searchLower)
          )
        }

        setFeedback(results)
      } catch (err) {
        console.error('Error fetching feedback:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch feedback')
        setFeedback([])
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  /**
   * Update feedback item
   * Admin-only operation (RLS enforced)
   */
  const updateFeedback = useCallback(
    async (id: string, data: FeedbackUpdateData): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error: updateError } = await supabase
          .from('feedback')
          .update(data)
          .eq('id', id)

        if (updateError) {
          throw updateError
        }

        // Update local state
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
        )

        return { success: true }
      } catch (err) {
        console.error('Error updating feedback:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update feedback',
        }
      }
    },
    [supabase]
  )

  /**
   * Get aggregated feedback statistics
   * Admin-only operation (RLS enforced)
   */
  const getFeedbackStats = useCallback(async (): Promise<FeedbackStats | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('*')

      if (fetchError) {
        throw fetchError
      }

      const feedbackData = (data || []) as Feedback[]

      // Aggregate statistics
      const stats: FeedbackStats = {
        total: feedbackData.length,
        by_status: { new: 0, reviewed: 0, resolved: 0 },
        by_priority: { low: 0, medium: 0, high: 0 },
        by_type: { problem: 0, suggestion: 0 },
        by_page: {},
        by_category: {},
      }

      feedbackData.forEach((item) => {
        // Count by status
        const status = item.status as keyof typeof stats.by_status
        stats.by_status[status] = (stats.by_status[status] || 0) + 1

        // Count by priority
        const priority = item.priority as keyof typeof stats.by_priority
        stats.by_priority[priority] = (stats.by_priority[priority] || 0) + 1

        // Count by type
        const type = item.feedback_type as keyof typeof stats.by_type
        stats.by_type[type] = (stats.by_type[type] || 0) + 1

        // Count by page
        stats.by_page[item.page_path] = (stats.by_page[item.page_path] || 0) + 1

        // Count by category (if set)
        if (item.category) {
          stats.by_category[item.category] = (stats.by_category[item.category] || 0) + 1
        }
      })

      return stats
    } catch (err) {
      console.error('Error getting feedback stats:', err)
      return null
    }
  }, [supabase])

  return {
    feedback,
    loading,
    error,
    fetchAllFeedback,
    updateFeedback,
    getFeedbackStats,
  }
}

