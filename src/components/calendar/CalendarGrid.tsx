'use client'

import { cn } from '@/lib/utils'
import type { CalendarDate, CalendarView } from '@/types/calendar.types'

interface CalendarGridProps {
  dates: CalendarDate[]
  onDateSelect: (date: CalendarDate) => void
  view: CalendarView
}

const GREGORIAN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ISLAMIC_WEEKDAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function getAccessibleLabel(date: CalendarDate) {
  const states = [
    date.isToday ? 'Today' : null,
    date.isSelected ? 'Selected' : null,
    date.importantDates?.length
      ? `Event: ${date.importantDates.map((event) => event.name).join(', ')}`
      : null,
  ].filter(Boolean)

  return `${date.gregorian.weekday}, ${date.gregorian.monthName} ${date.gregorian.day}, ${date.gregorian.year}. Hijri: ${date.hijri.day} ${date.hijri.monthName} ${date.hijri.year}.${states.length ? ` ${states.join('. ')}.` : ''}`
}

export function CalendarGrid({ dates, onDateSelect, view }: CalendarGridProps) {
  if (dates.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="type-body-secondary text-text-secondary">No dates available</p>
      </div>
    )
  }

  const firstDate = new Date(
    dates[0].gregorian.year,
    dates[0].gregorian.month - 1,
    dates[0].gregorian.day
  )
  const startDay = view === 'islamic' ? (firstDate.getDay() + 1) % 7 : firstDate.getDay()
  const weekdays = view === 'islamic' ? ISLAMIC_WEEKDAYS : GREGORIAN_WEEKDAYS
  const paddedDates: (CalendarDate | null)[] = [...Array(startDay).fill(null), ...dates]

  return (
    <div className="w-full" data-calendar-view={view}>
      <div className="mb-1 grid grid-cols-7" aria-hidden="true">
        {weekdays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-text-tertiary">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-grouped bg-border-subtle">
        {paddedDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-16 bg-surface-primary sm:min-h-20" aria-hidden="true" />
          }

          const primaryDay = view === 'gregorian' ? date.gregorian.day : date.hijri.day
          const secondaryDate = view === 'gregorian'
            ? `${date.hijri.day} ${date.hijri.monthName.split(' ')[0]}`
            : `${date.gregorian.day} ${date.gregorian.monthName.slice(0, 3)}`

          return (
            <button
              key={view === 'gregorian' ? date.gregorian.date : date.hijri.date}
              type="button"
              onClick={() => onDateSelect(date)}
              className={cn(
                'group relative flex min-h-16 min-w-0 flex-col items-center justify-center bg-surface-primary px-0.5 py-2 text-center transition-colors sm:min-h-20 sm:px-1',
                'hover:z-10 hover:bg-surface-grouped focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal',
                date.isToday && !date.isSelected && 'bg-teal-muted/55',
                date.isSelected && 'z-10 bg-teal text-white dark:text-surface-feature-foreground'
              )}
              aria-label={getAccessibleLabel(date)}
              aria-pressed={date.isSelected}
            >
              {date.isToday && (
                <span className={cn('absolute inset-x-2 top-0 h-0.5 bg-teal', date.isSelected && 'bg-white/80')} aria-hidden="true" />
              )}
              <span
                className="text-base font-semibold leading-none tabular-nums sm:text-lg"
                data-calendar-primary="true"
              >
                {primaryDay}
              </span>
              <span className={cn(
                'mt-1 max-w-full truncate text-xs font-medium leading-tight text-text-tertiary',
                date.isSelected && 'text-white/75 dark:text-surface-feature-foreground/75'
              )}>
                {secondaryDate}
              </span>
              {date.isImportant && (
                <span className={cn(
                  'absolute bottom-1.5 size-1 rounded-full bg-gold sm:bottom-2',
                  date.isSelected && 'bg-white'
                )} aria-hidden="true" />
              )}
              <span className="sr-only">
                {date.isToday ? ' Today.' : ''}
                {date.isSelected ? ' Selected.' : ''}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-3 type-caption text-text-tertiary sm:px-0 sm:pb-0" aria-label="Calendar legend">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-3 bg-teal" aria-hidden="true" />Today</span>
        <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />Islamic event</span>
      </div>
    </div>
  )
}
