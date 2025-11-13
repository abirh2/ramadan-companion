/**
 * Feedback table component for admin dashboard
 * Displays feedback with inline editing capabilities
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, ChevronUp, Save, AlertCircle, MessageSquare } from 'lucide-react'
import type { Feedback, FeedbackUpdateData } from '@/types/feedback.types'
import { useAuth } from '@/hooks/useAuth'

interface FeedbackTableProps {
  feedback: Feedback[]
  onUpdate: (id: string, data: FeedbackUpdateData) => Promise<{ success: boolean; error?: string }>
}

/**
 * Table displaying feedback items with inline editing
 * Expandable rows show full content and admin notes
 */
export function FeedbackTable({ feedback, onUpdate }: FeedbackTableProps) {
  const { user } = useAuth()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const handleFieldUpdate = async (
    id: string,
    field: keyof FeedbackUpdateData,
    value: string | null
  ) => {
    setSavingIds((prev) => new Set(prev).add(id))

    const updateData: FeedbackUpdateData = {
      [field]: value,
    }

    // If marking as reviewed/resolved, set reviewed_at and reviewed_by
    if (field === 'status' && (value === 'reviewed' || value === 'resolved')) {
      updateData.reviewed_at = new Date().toISOString()
      updateData.reviewed_by = user?.id || null
    }

    const result = await onUpdate(id, updateData)

    setSavingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })

    if (!result.success) {
      alert(`Failed to update: ${result.error}`)
    }
  }

  const handleNotesSave = async (id: string) => {
    const notes = editingNotes[id]
    if (notes === undefined) return

    setSavingIds((prev) => new Set(prev).add(id))

    const result = await onUpdate(id, {
      admin_notes: notes.trim() || null,
    })

    setSavingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })

    if (result.success) {
      // Clear editing state
      setEditingNotes((prev) => {
        const newNotes = { ...prev }
        delete newNotes[id]
        return newNotes
      })
    } else {
      alert(`Failed to save notes: ${result.error}`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  if (feedback.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p>No feedback found matching your filters</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {feedback.map((item) => {
        const isExpanded = expandedIds.has(item.id)
        const isSaving = savingIds.has(item.id)
        const isEditingNotes = editingNotes[item.id] !== undefined

        return (
          <Card key={item.id} className="overflow-hidden">
            {/* Compact row */}
            <div className="flex items-center gap-3 p-4">
              {/* Expand toggle */}
              <button
                onClick={() => toggleExpanded(item.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Date */}
              <div className="w-28 shrink-0 text-xs text-muted-foreground">
                {formatDate(item.created_at)}
              </div>

              {/* Type badge */}
              <div className="shrink-0">
                {item.feedback_type === 'problem' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
                    <AlertCircle className="h-3 w-3" />
                    Problem
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    <MessageSquare className="h-3 w-3" />
                    Suggestion
                  </span>
                )}
              </div>

              {/* Page */}
              <div className="min-w-0 shrink-0 text-xs text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5">{item.page_path}</code>
              </div>

              {/* Content preview */}
              <div className="min-w-0 flex-1 truncate text-sm">
                {item.content}
              </div>

              {/* Status */}
              <div className="w-32 shrink-0">
                <Select
                  value={item.status}
                  onValueChange={(value) => handleFieldUpdate(item.id, 'status', value)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="w-28 shrink-0">
                <Select
                  value={item.priority}
                  onValueChange={(value) => handleFieldUpdate(item.id, 'priority', value)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="w-32 shrink-0">
                <Select
                  value={item.category || 'none'}
                  onValueChange={(value) =>
                    handleFieldUpdate(item.id, 'category', value === 'none' ? null : value)
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature-request">Feature</SelectItem>
                    <SelectItem value="ui-ux">UI/UX</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t bg-muted/30 p-4">
                <div className="space-y-4">
                  {/* Full content */}
                  <div>
                    <h4 className="mb-1 text-xs font-medium text-muted-foreground">
                      Full Content
                    </h4>
                    <p className="whitespace-pre-wrap text-sm">{item.content}</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-muted-foreground">User ID:</span>{' '}
                      <span className="font-mono text-xs">
                        {item.user_id ? item.user_id.slice(0, 8) + '...' : 'Anonymous'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">User Agent:</span>{' '}
                      <span className="text-xs">
                        {item.user_agent
                          ? item.user_agent.length > 50
                            ? item.user_agent.slice(0, 50) + '...'
                            : item.user_agent
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Admin notes */}
                  <div>
                    <h4 className="mb-1 text-xs font-medium text-muted-foreground">
                      Admin Notes
                    </h4>
                    <textarea
                      value={
                        isEditingNotes
                          ? editingNotes[item.id]
                          : item.admin_notes || ''
                      }
                      onChange={(e) =>
                        setEditingNotes((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Add internal notes about this feedback..."
                      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={isSaving}
                    />
                    {isEditingNotes && (
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleNotesSave(item.id)}
                          disabled={isSaving}
                        >
                          <Save className="mr-1 h-3 w-3" />
                          Save Notes
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNotes((prev) => {
                              const newNotes = { ...prev }
                              delete newNotes[item.id]
                              return newNotes
                            })
                          }}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Review metadata */}
                  {item.reviewed_at && (
                    <div className="text-xs text-muted-foreground">
                      Reviewed on {formatDate(item.reviewed_at)}
                      {item.reviewed_by && ` by ${item.reviewed_by.slice(0, 8)}...`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

