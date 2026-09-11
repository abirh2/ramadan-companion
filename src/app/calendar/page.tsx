'use client'

import Link from 'next/link'
import { useCalendar } from '@/hooks/useCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { CalendarControls } from '@/components/calendar/CalendarControls'
import { GregorianCalendar } from '@/components/calendar/GregorianCalendar'
import { IslamicCalendar } from '@/components/calendar/IslamicCalendar'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { TodayHeader } from '@/components/calendar/TodayHeader'
import { UpcomingEvents } from '@/components/calendar/UpcomingEvents'
import { Loader2, ArrowLeft } from 'lucide-react'
import { FeedbackButton } from '@/components/FeedbackButton'

export default function CalendarPage() {
  const {
    view,
    currentMonth,
    currentYear,
    selectedDate,
    todayDate,
    calendarDates,
    schoolFilters,
    loading,
    error,
    setView,
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    selectDate,
    setSchoolFilters,
  } = useCalendar()
  const upcoming = useIslamicEvents()

  const firstDate = calendarDates[0]
  const lastDate = calendarDates.at(-1)
  const secondaryLabel = firstDate && lastDate
    ? view === 'gregorian'
      ? `${firstDate.hijri.day} ${firstDate.hijri.monthName} – ${lastDate.hijri.day} ${lastDate.hijri.monthName} ${lastDate.hijri.year}`
      : `${firstDate.gregorian.monthName} ${firstDate.gregorian.day} – ${lastDate.gregorian.monthName} ${lastDate.gregorian.day}, ${lastDate.gregorian.year}`
    : undefined

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
      <header>
        <Link 
          href="/more"
          className="type-nav inline-flex min-h-11 items-center gap-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:rounded-control-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          aria-label="Navigate back to More"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to More
        </Link>
        <h1 className="mt-2 type-page-title text-text-primary">Islamic Calendar</h1>
      </header>

      <div className="mt-8">
        <TodayHeader date={todayDate} error={error} />
      </div>

      <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-start">
        <section className="-mx-4 min-w-0 flex-1 border-y border-border-subtle bg-surface-primary sm:mx-0 sm:rounded-grouped sm:border sm:p-5" aria-label="Month calendar">
          <div className="px-3 pt-3 sm:p-0">
            <CalendarControls
              view={view}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onViewChange={setView}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onToday={goToToday}
              secondaryLabel={secondaryLabel}
            />
          </div>

          {loading && (
            <div className="flex h-96 items-center justify-center" role="status">
              <Loader2 className="size-7 animate-spin text-teal" aria-hidden="true" />
              <span className="sr-only">Loading calendar...</span>
            </div>
          )}

          {error && (
            <div
              className="flex h-96 items-center justify-center rounded-grouped bg-surface-grouped px-5 text-center"
              role="alert"
              aria-live="polite"
            >
              <div>
                <p className="text-base font-semibold text-text-primary">
                  Unable to load calendar
                </p>
                <p className="mt-1 type-caption text-text-secondary">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-5 sm:mt-5">
              {view === 'gregorian' ? (
                <GregorianCalendar dates={calendarDates} onDateSelect={selectDate} />
              ) : (
                <IslamicCalendar dates={calendarDates} onDateSelect={selectDate} />
              )}
            </div>
          )}
        </section>

        {!loading && !error && (
          <CalendarSidebar
            selectedDate={selectedDate}
            schoolFilters={schoolFilters}
            onSchoolFiltersChange={setSchoolFilters}
          />
        )}
      </div>

      <div className="mt-10">
        <UpcomingEvents events={upcoming.events} loading={upcoming.loading} error={upcoming.error} />
      </div>

      <FeedbackButton pagePath="/calendar" />
    </div>
  )
}
