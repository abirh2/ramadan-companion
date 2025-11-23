'use client'

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CalendarView } from '@/types/calendar.types'
import { HIJRI_MONTHS, GREGORIAN_MONTHS } from '@/types/calendar.types'

interface CalendarControlsProps {
  view: CalendarView
  currentMonth: number
  currentYear: number
  onViewChange: (view: CalendarView) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export function CalendarControls({
  view,
  currentMonth,
  currentYear,
  onViewChange,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarControlsProps) {
  // Get current month name based on view
  const getMonthName = () => {
    if (view === 'gregorian') {
      const month = GREGORIAN_MONTHS.find((m) => m.number === currentMonth)
      return month ? month.name : ''
    } else {
      const month = HIJRI_MONTHS.find((m) => m.number === currentMonth)
      return month ? month.en : ''
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Month/Year Display & Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 min-w-[200px] justify-center">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">
            {getMonthName()} {currentYear}
          </h2>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="outline" onClick={onToday} className="ml-2">
          Today
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">View:</span>
        <div className="flex rounded-lg border border-border p-1">
          <Button
            variant={view === 'gregorian' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('gregorian')}
            className="rounded-md"
            aria-pressed={view === 'gregorian'}
          >
            Gregorian
          </Button>
          <Button
            variant={view === 'islamic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('islamic')}
            className="rounded-md"
            aria-pressed={view === 'islamic'}
          >
            Islamic
          </Button>
        </div>
      </div>
    </div>
  )
}

