'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  secondaryLabel?: string
}

export function CalendarControls({
  view,
  currentMonth,
  currentYear,
  onViewChange,
  onPreviousMonth,
  onNextMonth,
  onToday,
  secondaryLabel,
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="inline-grid grid-cols-2 rounded-control bg-surface-grouped p-1" aria-label="Calendar system">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('gregorian')}
            className={view === 'gregorian' ? 'bg-surface-primary text-text-primary shadow-hairline' : 'text-text-secondary'}
            aria-pressed={view === 'gregorian'}
          >
            Gregorian
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('islamic')}
            className={view === 'islamic' ? 'bg-surface-primary text-text-primary shadow-hairline' : 'text-text-secondary'}
            aria-pressed={view === 'islamic'}
          >
            Islamic
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onToday} className="text-teal">
          Today
        </Button>
      </div>

      <div className="grid w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-0 text-center">
          <h2 className="truncate text-lg font-semibold tracking-[-0.015em] text-text-primary sm:text-xl">
            {getMonthName()} {currentYear}
          </h2>
          {secondaryLabel && <p className="mt-0.5 truncate type-caption text-text-tertiary">{secondaryLabel}</p>}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

      </div>
    </div>
  )
}
