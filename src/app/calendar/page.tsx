'use client'

import Link from 'next/link'
import { useCalendar } from '@/hooks/useCalendar'
import { CalendarControls } from '@/components/calendar/CalendarControls'
import { GregorianCalendar } from '@/components/calendar/GregorianCalendar'
import { IslamicCalendar } from '@/components/calendar/IslamicCalendar'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { Loader2, ArrowLeft } from 'lucide-react'
import { FeedbackButton } from '@/components/FeedbackButton'

export default function CalendarPage() {
  const {
    view,
    currentMonth,
    currentYear,
    selectedDate,
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

  // Get current Hijri month/year from calendar dates
  const currentHijriMonth = calendarDates.length > 0 ? calendarDates[0].hijri.month : 1
  const currentHijriYear = calendarDates.length > 0 ? calendarDates[0].hijri.year : 1446

  // Display the correct year based on view
  const displayYear = view === 'islamic' ? currentHijriYear : currentYear

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <header className="mb-8">
        <Link 
          href="/more"
          className="type-nav mb-3 inline-flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Navigate back to More"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to More
        </Link>
        <h1 className="type-page-title text-text-primary">Islamic Calendar</h1>
        <p className="type-body-secondary mt-2 text-text-secondary">
          View and explore the Islamic (Hijri) calendar with important dates and events
        </p>
      </header>

      {/* Calendar Controls */}
      <div className="mb-6">
        <CalendarControls
          view={view}
          currentMonth={currentMonth}
          currentYear={displayYear}
          onViewChange={setView}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center h-96" role="status">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Loading calendar...</span>
            </div>
          )}

          {error && (
            <div
              className="flex items-center justify-center h-96 text-center"
              role="alert"
              aria-live="polite"
            >
              <div>
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  Unable to load calendar
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="rounded-surface border border-border-subtle bg-surface-primary p-4 sm:p-6">
              {view === 'gregorian' ? (
                <GregorianCalendar dates={calendarDates} onDateSelect={selectDate} />
              ) : (
                <IslamicCalendar dates={calendarDates} onDateSelect={selectDate} />
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!loading && !error && (
          <CalendarSidebar
            selectedDate={selectedDate}
            currentHijriMonth={currentHijriMonth}
            currentHijriYear={currentHijriYear}
            schoolFilters={schoolFilters}
            onSchoolFiltersChange={setSchoolFilters}
          />
        )}
      </div>

      {/* Feedback Button */}
      <FeedbackButton pagePath="/calendar" />
    </div>
  )
}
