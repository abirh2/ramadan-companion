/**
 * Feedback system types
 * Supports anonymous user feedback for problems and suggestions
 */

export type FeedbackType = 'problem' | 'suggestion'

export interface Feedback {
  id: string
  created_at: string
  page_path: string
  feedback_type: FeedbackType
  content: string
  user_id: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
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
  data?: Feedback
}

