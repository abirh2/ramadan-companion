/**
 * Feedback submission utilities
 * Handles anonymous and authenticated user feedback
 */

import { supabase } from './supabaseClient'
import type { FeedbackSubmission, FeedbackSubmissionResult } from '@/types/feedback.types'

/**
 * Submit user feedback (problem or suggestion)
 * Works for both anonymous and authenticated users
 */
export async function submitFeedback(
  submission: FeedbackSubmission
): Promise<FeedbackSubmissionResult> {
  try {
    // Get user agent if available
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : null

    // Prepare feedback data
    const feedbackData = {
      page_path: submission.page_path,
      feedback_type: submission.feedback_type,
      content: submission.content.trim(),
      user_id: submission.user_id || null,
      user_agent: submission.user_agent || userAgent,
      metadata: submission.metadata || null,
    }

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)

    if (error) {
      console.error('Feedback submission error:', error)
      return {
        success: false,
        error: 'Failed to submit feedback. Please try again.',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (err) {
    console.error('Unexpected error submitting feedback:', err)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Validate feedback content
 */
export function validateFeedbackContent(content: string): {
  valid: boolean
  error?: string
} {
  const trimmed = content.trim()

  if (!trimmed) {
    return {
      valid: false,
      error: 'Please enter your feedback',
    }
  }

  if (trimmed.length < 10) {
    return {
      valid: false,
      error: 'Feedback must be at least 10 characters',
    }
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      error: 'Feedback must be less than 5000 characters',
    }
  }

  return { valid: true }
}

