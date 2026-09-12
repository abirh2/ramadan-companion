'use client'

import { useState } from 'react'
import { MessageSquare, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { submitFeedback, validateFeedbackContent } from '@/lib/feedback'
import { useAuth } from '@/hooks/useAuth'
import type { FeedbackType } from '@/types/feedback.types'

interface FeedbackButtonProps {
  pagePath: string
  presentation?: 'footer' | 'row'
}

export function FeedbackButton({ pagePath, presentation = 'footer' }: FeedbackButtonProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('problem')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate content
    const validation = validateFeedbackContent(content)
    if (!validation.valid) {
      setError(validation.error || 'Invalid feedback')
      return
    }

    setSubmitting(true)

    try {
      const result = await submitFeedback({
        page_path: pagePath,
        feedback_type: feedbackType,
        content,
        user_id: user?.id || null,
      })

      if (result.success) {
        setSuccess(true)
        setContent('')
        setFeedbackType('problem')
        // Auto-close after showing success message
        setTimeout(() => {
          setSuccess(false)
          setOpen(false)
        }, 2000)
      } else {
        setError(result.error || 'Failed to submit feedback')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setTimeout(() => {
        setContent('')
        setFeedbackType('problem')
        setError(null)
        setSuccess(false)
      }, 200)
    }
  }

  return (
    <>
      {presentation === 'footer' ? (
      <div className="mt-8 border-t border-border-subtle pt-6">
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="gap-2"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Feedback
          </Button>
        </div>
      </div>
      ) : (
        <button type="button" className="more-row group w-full text-left" onClick={() => setOpen(true)}>
          <MessageSquare className="size-5 shrink-0 text-text-secondary" strokeWidth={1.8} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="type-body block text-text-primary">Feedback</span>
            <span className="type-caption mt-0.5 block text-text-secondary">Report a problem or suggest an improvement</span>
          </span>
          <span className="type-caption text-text-secondary">Anonymous</span>
        </button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by reporting issues or suggesting new features.
              Your feedback is anonymous.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="space-y-4 py-8 text-center" role="status" aria-live="polite">
              <CheckCircle className="mx-auto size-9 text-success" aria-hidden="true" />
              <div>
                <p className="type-section-title mx-auto text-text-primary">Thank you</p>
                <p className="type-body-secondary mt-1 text-text-secondary">
                  Your feedback was submitted.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Feedback form">
              {/* Feedback Type Selection */}
              <div className="space-y-3">
                <span className="type-label text-text-primary">
                  What would you like to do?
                </span>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="problem" id="problem" />
                    <label
                      htmlFor="problem"
                      className="type-body-secondary cursor-pointer font-medium text-text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Report a problem
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="suggestion" id="suggestion" />
                    <label
                      htmlFor="suggestion"
                      className="type-body-secondary cursor-pointer font-medium text-text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Suggest an improvement
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Feedback Content */}
              <div className="space-y-2">
                <label htmlFor="feedback-content" className="type-label text-text-primary">
                  {feedbackType === 'problem'
                    ? 'Describe the problem'
                    : 'Describe your suggestion'}
                  <span className="sr-only">(required, minimum 10 characters)</span>
                </label>
                <textarea
                  id="feedback-content"
                  name="feedback-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    feedbackType === 'problem'
                      ? 'Describe what happened…'
                      : 'Describe your suggestion…'
                  }
                  className="type-body-secondary flex min-h-[120px] w-full resize-none rounded-control border border-border-strong bg-surface-primary px-3 py-3 text-text-primary placeholder:text-text-tertiary focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={submitting}
                  required
                  aria-required="true"
                  aria-invalid={error !== null}
                  aria-describedby={error ? 'feedback-help feedback-error' : 'feedback-help'}
                  minLength={10}
                />
                <p id="feedback-help" className="type-caption text-text-secondary">
                  Minimum 10 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-grouped border border-destructive/30 bg-destructive-muted p-3" role="alert" aria-live="polite">
                  <p id="feedback-error" className="type-body-secondary text-destructive">{error}</p>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="rounded-grouped bg-surface-grouped p-3">
                <p className="type-caption text-text-secondary">
                  Your feedback is anonymous and helps us improve the app. We do
                  not collect personal information.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  aria-label="Cancel and close feedback dialog"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting || content.trim().length < 10}
                  aria-label={submitting ? 'Submitting feedback...' : 'Submit feedback'}
                >
                  {submitting && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  Submit Feedback
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
