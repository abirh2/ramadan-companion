/**
 * Feedback filters component for admin dashboard
 * Allows filtering by status, priority, category, and page
 */

'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { FeedbackFilters as Filters } from '@/types/feedback.types'
import { X, Filter } from 'lucide-react'

interface FeedbackFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  pageOptions: string[]
}

/**
 * Filter controls for feedback table
 * Shows active filter count and provides clear button
 */
export function FeedbackFilters({
  filters,
  onFiltersChange,
  pageOptions,
}: FeedbackFiltersProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  // Count active filters (excluding 'all' selections)
  const activeFilterCount = Object.entries(filters).filter(
    ([, value]) => value && value !== 'all' && value !== ''
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Status filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Priority
          </label>
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Category
          </label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature-request">Feature Request</SelectItem>
              <SelectItem value="ui-ux">UI/UX</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Page
          </label>
          <Select
            value={filters.page_path || 'all'}
            onValueChange={(value) => handleFilterChange('page_path', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All pages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pages</SelectItem>
              {pageOptions.map((page) => (
                <SelectItem key={page} value={page}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search filter */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Search content
        </label>
        <Input
          placeholder="Search feedback content..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="h-9"
        />
      </div>
    </div>
  )
}

