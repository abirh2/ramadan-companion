/**
 * Admin Dashboard Page
 * Feedback management and system analytics for administrators
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedAdmin } from '@/components/admin/ProtectedAdmin'
import { FeedbackTable } from '@/components/admin/FeedbackTable'
import { FeedbackFilters } from '@/components/admin/FeedbackFilters'
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeedback } from '@/hooks/useFeedback'
import type { FeedbackFilters as Filters } from '@/types/feedback.types'
import { ArrowLeft, Shield } from 'lucide-react'

export default function AdminPage() {
  const [filters, setFilters] = useState<Filters>({})
  const { feedback, loading, error, fetchAllFeedback, updateFeedback } = useFeedback()

  // Extract unique page paths for filter options
  const pageOptions = Array.from(new Set(feedback.map((item) => item.page_path))).sort()

  // Fetch feedback on mount and when filters change
  useEffect(() => {
    fetchAllFeedback(filters)
  }, [filters, fetchAllFeedback])

  return (
    <ProtectedAdmin>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage feedback and monitor system health
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
          <Tabs defaultValue="feedback" className="space-y-6">
            <TabsList>
              <TabsTrigger value="feedback">Feedback Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Feedback Management Tab */}
            <TabsContent value="feedback" className="space-y-6">
              {/* Filters */}
              <FeedbackFilters
                filters={filters}
                onFiltersChange={setFilters}
                pageOptions={pageOptions}
              />

              {/* Feedback count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    'Loading feedback...'
                  ) : error ? (
                    <span className="text-destructive">Error: {error}</span>
                  ) : (
                    <>
                      Showing <span className="font-medium">{feedback.length}</span>{' '}
                      {feedback.length === 1 ? 'item' : 'items'}
                    </>
                  )}
                </p>
              </div>

              {/* Feedback Table */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="text-sm text-muted-foreground">Loading feedback...</p>
                  </div>
                </div>
              ) : (
                <FeedbackTable feedback={feedback} onUpdate={updateFeedback} />
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <AnalyticsPanel />
            </TabsContent>
        </Tabs>
      </div>
    </ProtectedAdmin>
  )
}

