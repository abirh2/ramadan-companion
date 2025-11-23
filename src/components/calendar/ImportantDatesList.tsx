'use client'

import { Card } from '@/components/ui/card'
import type { ImportantDate, CalendarDate } from '@/types/calendar.types'
import { cn } from '@/lib/utils'

interface ImportantDatesListProps {
  dates: ImportantDate[]
  onDateClick?: (date: ImportantDate, calendarDate?: CalendarDate) => void
}

export function ImportantDatesList({ dates, onDateClick }: ImportantDatesListProps) {
  if (dates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          No important dates this month
        </p>
      </div>
    )
  }

  // Sort dates by day
  const sortedDates = [...dates].sort((a, b) => a.hijriDate.day - b.hijriDate.day)

  return (
    <div className="space-y-2">
      {sortedDates.map((date) => (
        <Card
          key={date.id}
          className={cn(
            'p-3 cursor-pointer transition-all hover:shadow-md',
            date.color
          )}
          onClick={() => onDateClick?.(date)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onDateClick?.(date)
            }
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              {date.icon}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight">
                {date.name}
              </h4>
              {date.nameAr && (
                <p className="text-xs text-muted-foreground mt-0.5 rtl">
                  {date.nameAr}
                </p>
              )}
              <p className="text-xs font-medium mt-1">
                {date.hijriDate.day}th day of the month
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {date.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  date.significance === 'high' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  date.significance === 'medium' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                  date.significance === 'low' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                )}>
                  {date.significance === 'high' && 'High'}
                  {date.significance === 'medium' && 'Medium'}
                  {date.significance === 'low' && 'Low'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

