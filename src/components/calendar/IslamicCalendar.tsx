'use client'

import { cn } from '@/lib/utils'
import type { CalendarDate } from '@/types/calendar.types'

interface IslamicCalendarProps {
  dates: CalendarDate[]
  onDateSelect: (date: CalendarDate) => void
}

// Islamic week starts on Saturday
const WEEKDAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function IslamicCalendar({ dates, onDateSelect }: IslamicCalendarProps) {
  if (dates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No dates available</p>
      </div>
    )
  }

  // Get the weekday of the first Hijri date
  // We need to map the Gregorian weekday to Islamic week (Sat = 0)
  const firstDate = new Date(
    dates[0].gregorian.year,
    dates[0].gregorian.month - 1,
    dates[0].gregorian.day
  )
  const gregorianDay = firstDate.getDay() // 0 = Sunday
  // Convert to Islamic week: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const startDay = (gregorianDay + 1) % 7

  // Create array with empty cells for padding
  const paddedDates: (CalendarDate | null)[] = [
    ...Array(startDay).fill(null),
    ...dates,
  ]

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          return (
            <button
              key={`${date.hijri.date}`}
              onClick={() => onDateSelect(date)}
              className={cn(
                'aspect-square p-2 rounded-lg border transition-all',
                'hover:border-accent hover:bg-accent/10',
                'focus:outline-none focus:ring-2 focus:ring-accent',
                date.isToday && 'border-accent bg-accent/20 font-bold',
                date.isSelected && 'border-accent bg-accent text-accent-foreground',
                date.isImportant && !date.isSelected && 'border-orange-300 dark:border-orange-700'
              )}
              aria-label={`${date.hijri.weekday}, ${date.hijri.day} ${date.hijri.monthName} ${date.hijri.year}. Gregorian: ${date.gregorian.day} ${date.gregorian.monthName} ${date.gregorian.year}`}
              aria-pressed={date.isSelected}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {/* Hijri date */}
                <span className="text-lg font-semibold">
                  {date.hijri.day}
                </span>
                
                {/* Gregorian date (smaller) */}
                <span className="text-xs text-muted-foreground mt-1">
                  {date.gregorian.day} {date.gregorian.monthName.substring(0, 3)}
                </span>

                {/* Important date indicator */}
                {date.isImportant && date.importantDates && date.importantDates.length > 0 && (
                  <span className="text-xs mt-1" aria-hidden="true">
                    {date.importantDates[0].icon}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

