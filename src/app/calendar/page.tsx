'use client'

import { useCalendar } from '@/hooks/useCalendar'
import { CalendarControls } from '@/components/calendar/CalendarControls'
import { GregorianCalendar } from '@/components/calendar/GregorianCalendar'
import { IslamicCalendar } from '@/components/calendar/IslamicCalendar'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'
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
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="h-6 w-6 text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Islamic Calendar</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          View and explore the Islamic (Hijri) calendar with important dates and events
        </p>
      </div>

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
            <div className="bg-card border rounded-lg p-4 sm:p-6">
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

