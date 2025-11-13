/**
 * Feedback system types
 * Supports anonymous user feedback for problems and suggestions
 * Admin workflow includes status tracking, priority, and categorization
 */

export type FeedbackType = 'problem' | 'suggestion'

export type FeedbackStatus = 'new' | 'reviewed' | 'resolved'

export type FeedbackPriority = 'low' | 'medium' | 'high'

export type FeedbackCategory = 'bug' | 'feature-request' | 'ui-ux' | 'performance' | 'other'

export interface Feedback {
  id: string
  created_at: string
  page_path: string
  feedback_type: FeedbackType
  content: string
  user_id: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  // Admin workflow fields
  status: FeedbackStatus
  priority: FeedbackPriority
  category: FeedbackCategory | null
  admin_notes: string | null
  reviewed_at: string | null
  reviewed_by: string | null
}

export interface FeedbackSubmission {
  page_path: string
  feedback_type: FeedbackType
  content: string
  user_id?: string | null
  user_agent?: string | null
  metadata?: Record<string, unknown> | null
}

export interface FeedbackSubmissionResult {
  success: boolean
  error?: string
}

export interface FeedbackUpdateData {
  status?: FeedbackStatus
  priority?: FeedbackPriority
  category?: FeedbackCategory | null
  admin_notes?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
}

export interface FeedbackFilters {
  status?: FeedbackStatus | 'all'
  priority?: FeedbackPriority | 'all'
  category?: FeedbackCategory | 'all'
  page_path?: string
  search?: string
}

export interface FeedbackStats {
  total: number
  by_status: Record<FeedbackStatus, number>
  by_priority: Record<FeedbackPriority, number>
  by_type: Record<FeedbackType, number>
  by_page: Record<string, number>
  by_category: Record<string, number>
}

