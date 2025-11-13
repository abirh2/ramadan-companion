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
}

export function FeedbackButton({ pagePath }: FeedbackButtonProps) {
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
    } catch (err) {
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
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by reporting issues or suggesting new features.
              Your feedback is anonymous.
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 dark:text-green-400" />
              <div>
                <p className="text-lg font-semibold">Thank you!</p>
                <p className="text-sm text-muted-foreground">
                  Your feedback has been submitted successfully.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  What would you like to do?
                </label>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="problem" id="problem" />
                    <label
                      htmlFor="problem"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Report a Problem
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="suggestion" id="suggestion" />
                    <label
                      htmlFor="suggestion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Suggest an Improvement
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Feedback Content */}
              <div className="space-y-2">
                <label htmlFor="feedback-content" className="text-sm font-medium">
                  {feedbackType === 'problem'
                    ? 'Describe the problem'
                    : 'Describe your suggestion'}
                </label>
                <textarea
                  id="feedback-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    feedbackType === 'problem'
                      ? 'Please describe the issue you encountered...'
                      : 'Please describe your suggestion...'
                  }
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={submitting}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
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
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || content.trim().length < 10}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

