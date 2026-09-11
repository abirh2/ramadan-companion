'use client'

import { DateDetails } from './DateDetails'
import { SchoolFilters } from './SchoolFilters'
import type { CalendarDate, SchoolFilter } from '@/types/calendar.types'

interface CalendarSidebarProps {
  selectedDate: CalendarDate | null
  schoolFilters: SchoolFilter
  onSchoolFiltersChange: (filters: SchoolFilter) => void
}

export function CalendarSidebar({
  selectedDate,
  schoolFilters,
  onSchoolFiltersChange,
}: CalendarSidebarProps) {
  return (
    <aside className="w-full space-y-4 lg:w-80" aria-label="Selected date and calendar options">
      <DateDetails date={selectedDate} />
      <details className="group rounded-grouped border border-border-subtle bg-surface-primary">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal [&::-webkit-details-marker]:hidden">
          Event filters
          <span className="text-xs font-medium text-text-tertiary group-open:hidden">Show</span>
          <span className="hidden text-xs font-medium text-text-tertiary group-open:inline">Hide</span>
        </summary>
        <div className="border-t border-border-subtle p-4">
            <SchoolFilters
              filters={schoolFilters}
              onFiltersChange={onSchoolFiltersChange}
            />
        </div>
      </details>
    </aside>
  )
}
