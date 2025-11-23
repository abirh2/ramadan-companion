'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImportantDatesList } from './ImportantDatesList'
import { DateDetails } from './DateDetails'
import { SchoolFilters } from './SchoolFilters'
import type { CalendarDate, ImportantDate, SchoolFilter } from '@/types/calendar.types'
import { getImportantDatesForMonth } from '@/lib/islamicDates'

interface CalendarSidebarProps {
  selectedDate: CalendarDate | null
  currentHijriMonth: number
  currentHijriYear: number
  schoolFilters: SchoolFilter
  onSchoolFiltersChange: (filters: SchoolFilter) => void
  onImportantDateClick?: (date: ImportantDate) => void
}

export function CalendarSidebar({
  selectedDate,
  currentHijriMonth,
  currentHijriYear,
  schoolFilters,
  onSchoolFiltersChange,
  onImportantDateClick,
}: CalendarSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('important')

  // Get important dates for current month
  const importantDates = getImportantDatesForMonth(
    currentHijriMonth,
    currentHijriYear,
    schoolFilters
  )

  return (
    <div className="w-full lg:w-80 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="important">Important Dates</TabsTrigger>
          <TabsTrigger value="details">Date Details</TabsTrigger>
        </TabsList>

        <TabsContent value="important" className="space-y-4">
          {/* School Filters */}
          <div className="p-4 border rounded-lg bg-card">
            <SchoolFilters
              filters={schoolFilters}
              onFiltersChange={onSchoolFiltersChange}
            />
          </div>

          {/* Important Dates List */}
          <div className="max-h-[600px] overflow-y-auto">
            <ImportantDatesList
              dates={importantDates}
              onDateClick={onImportantDateClick}
            />
          </div>
        </TabsContent>

        <TabsContent value="details">
          <DateDetails date={selectedDate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

