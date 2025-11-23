'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CalendarDate } from '@/types/calendar.types'
import { Calendar as CalendarIcon } from 'lucide-react'

interface DateDetailsProps {
  date: CalendarDate | null
}

export function DateDetails({ date }: DateDetailsProps) {
  if (!date) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Date Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Select a date to view details
            </p>
          </div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Date Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gregorian Date */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1">
            Gregorian Calendar
          </h4>
          <p className="text-sm font-semibold">
            {formatGregorian()}
          </p>
        </div>

        {/* Hijri Date */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1">
            Islamic Calendar
          </h4>
          <p className="text-sm font-semibold">
            {formatHijri()}
          </p>
          <p className="text-xs text-muted-foreground mt-1 rtl">
            {date.hijri.monthNameAr}
          </p>
        </div>

        {/* Today indicator */}
        {date.isToday && (
          <div className="pt-2 border-t">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent text-accent-foreground">
              Today
            </span>
          </div>
        )}

        {/* Important dates */}
        {date.isImportant && date.importantDates && date.importantDates.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Significant Events
            </h4>
            <div className="space-y-2">
              {date.importantDates.map((importantDate) => (
                <div
                  key={importantDate.id}
                  className="p-2 rounded-lg border bg-card"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {importantDate.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {importantDate.name}
                      </p>
                      {importantDate.nameAr && (
                        <p className="text-xs text-muted-foreground rtl">
                          {importantDate.nameAr}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {importantDate.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

