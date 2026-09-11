'use client'

import type { CalendarDate } from '@/types/calendar.types'

interface DateDetailsProps {
  date: CalendarDate | null
}

export function DateDetails({ date }: DateDetailsProps) {
  if (!date) {
    return (
      <section aria-labelledby="date-details-title" className="rounded-grouped bg-surface-grouped px-4 py-5 sm:px-5">
        <h2 id="date-details-title" className="text-base font-semibold text-text-primary">Date details</h2>
        <p className="mt-2 type-body-secondary text-text-secondary">Select a date to see its Gregorian and Hijri details.</p>
      </section>
    )
  }

  // Format dates for display
  const formatGregorian = () => {
    return `${date.gregorian.weekday}, ${date.gregorian.monthName} ${date.gregorian.day}, ${date.gregorian.year}`
  }

  const formatHijri = () => {
    return `${date.hijri.weekday}, ${date.hijri.day} ${date.hijri.monthName} ${date.hijri.year}`
  }

  return (
    <section aria-labelledby="date-details-title" className="rounded-grouped bg-surface-grouped px-4 py-5 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="date-details-title" className="text-base font-semibold text-text-primary">Date details</h2>
        {date.isToday && <span className="text-xs font-semibold text-teal">Today</span>}
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <h3 className="type-caption font-semibold text-text-tertiary">Gregorian</h3>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {formatGregorian()}
          </p>
        </div>

        {/* Hijri Date */}
        <div>
          <h3 className="type-caption font-semibold text-text-tertiary">Hijri</h3>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {formatHijri()}
          </p>
          <p className="mt-1 font-arabic text-base text-text-secondary" lang="ar" dir="rtl">
            {date.hijri.monthNameAr}
          </p>
        </div>

        {/* Important dates */}
        {date.isImportant && date.importantDates && date.importantDates.length > 0 && (
          <div className="border-t border-border-subtle pt-4">
            <h3 className="type-caption font-semibold text-text-tertiary">Islamic events</h3>
            <div className="mt-2 space-y-3">
              {date.importantDates.map((importantDate) => (
                <div key={importantDate.id}>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {importantDate.name}
                      </p>
                      {importantDate.nameAr && (
                        <p className="font-arabic text-sm text-text-secondary" lang="ar" dir="rtl">
                          {importantDate.nameAr}
                        </p>
                      )}
                      <p className="mt-1 type-caption text-text-secondary">
                        {importantDate.description}
                      </p>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
