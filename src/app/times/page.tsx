'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Loader2 } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { usePrayerTracking } from '@/hooks/usePrayerTracking'
import { useAuth } from '@/hooks/useAuth'
import { QiblaCompass } from '@/components/prayer-times/QiblaCompass'
import { PrayerStatistics } from '@/components/prayer-times/PrayerStatistics'
import { DateSelectorModal } from '@/components/prayer-times/DateSelectorModal'
import { PreferencesDetailModal } from '@/components/prayer-times/PreferencesDetailModal'
import { NextPrayerHero } from '@/components/prayer-times/NextPrayerHero'
import { PrayerSchedule } from '@/components/prayer-times/PrayerSchedule'
import { NotificationEntry } from '@/components/prayer-times/NotificationEntry'
import {
  PreferencesSection,
  deriveCalculationMethodLabel,
  deriveMadhabLabel,
  deriveLocationLabel,
} from '@/components/prayer-times/PreferencesSection'
import { buildPrayerRows, formatTime } from '@/components/prayer-times/prayerRowViewModel'
import { FeedbackButton } from '@/components/FeedbackButton'
import type { PrayerName } from '@/types/prayer-tracking.types'

// Compact countdown for the hero, e.g. "1h 20m" (mirrors the Home NextPrayerCard
// presentation). Presentation-only; introduces no new business logic.
function formatCountdown(countdown: string): string {
  const hours = countdown.match(/(\d+)h/)?.[1]
  const minutes = countdown.match(/(\d+)m/)?.[1]

  if (hours) return `${hours}h ${minutes ?? '0'}m`
  if (minutes) return `${minutes}m`
  return 'Less than a minute'
}

export default function TimesPage() {
  const { user } = useAuth()
  const {
    prayerTimes,
    nextPrayer,
    qiblaDirection,
    location,
    calculationMethod,
    madhab,
    loading,
    error,
    updateLocation,
    updateCalculationMethod,
    updateMadhab,
  } = usePrayerTimes()

  const {
    todayCompletion,
    statistics,
    timeRange,
    loading: trackingLoading,
    accountCreatedAt,
    togglePrayer,
    setTimeRange,
  } = usePrayerTracking()

  // Modal states
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [prefsModalOpen, setPrefsModalOpen] = useState(false)

  // Clock used to derive the schedule row states. It ticks every second so the
  // countdown/"up next"/"now" states stay fresh (well within the 60s minimum
  // refresh requirement). This mirrors the cadence of the countdown that the
  // usePrayerTimes hook already recomputes.
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Scroll to qibla section when navigating from the menu (#qibla hash)
  useEffect(() => {
    if (loading) return
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#qibla') return
    // Small delay lets the layout settle after data loads
    const timer = setTimeout(() => {
      document.getElementById('qibla')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => clearTimeout(timer)
  }, [loading])

  // Hijri date state
  const [hijriDate, setHijriDate] = useState<string>('')
  const [hijriUnavailable, setHijriUnavailable] = useState(false)

  // Fetch Hijri date with a 5-second timeout. On a successful response within
  // 5s we display the returned Hijri date; on any failure OR timeout (the
  // request aborts) we set hijriUnavailable so the Schedule_Header shows the
  // "unavailable" indicator while keeping the Gregorian date visible (R2.2, R2.3).
  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const response = await fetch('/api/hijri', { signal: AbortSignal.timeout(5000) })
        if (response.ok) {
          const data = await response.json()
          const hijri = data.currentHijri
          // Format: "24 Rajab 1447"
          setHijriDate(`${hijri.day} ${hijri.monthName} ${hijri.year}`)
        } else {
          setHijriUnavailable(true)
        }
      } catch (error) {
        // Covers network failures and the 5s timeout abort (TimeoutError).
        console.error('Error fetching Hijri date:', error)
        setHijriUnavailable(true)
      }
    }

    fetchHijriDate()
  }, [])

  // Format Gregorian date
  const gregorianDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  // Build the six-entry schedule rows from the pure module using the current clock.
  const rows = buildPrayerRows(prayerTimes, todayCompletion, now)

  // Normalize the hook's nextPrayer (whose isTomorrow is optional) into the
  // hero's prop shape without changing any values.
  const heroNextPrayer = nextPrayer
    ? {
        name: nextPrayer.name,
        countdown: nextPrayer.countdown,
        time: nextPrayer.time,
        isTomorrow: Boolean(nextPrayer.isTomorrow),
      }
    : null

  // Derive preference labels using the reused CALCULATION_METHODS/MADHABS logic.
  const calculationMethodLabel = deriveCalculationMethodLabel(calculationMethod)
  const madhabLabel = deriveMadhabLabel(madhab)
  const locationLabel = deriveLocationLabel(location)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex min-h-touch items-center gap-2 rounded-control text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Navigate back to homepage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      {loading ? (
        // Loading State — semantic tokens only, with an sr-only status message.
        <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
          <div className="space-y-3 text-center">
            <Loader2
              className="mx-auto h-12 w-12 animate-spin text-text-tertiary"
              aria-hidden="true"
            />
            <p className="type-body text-text-secondary" aria-hidden="true">
              Loading prayer times...
            </p>
            <span className="sr-only">Loading prayer times, please wait.</span>
          </div>
        </div>
      ) : error ? (
        // Error State — semantic tokens only; points users to the preferences below.
        <div className="flex items-center justify-center py-20" role="alert" aria-live="assertive">
          <div className="max-w-md space-y-3 text-center">
            <Clock className="mx-auto h-12 w-12 text-text-tertiary" aria-hidden="true" />
            <h2 className="type-section-title text-text-primary">Unable to Load Prayer Times</h2>
            <p className="type-body text-text-secondary">{error}</p>
            <p className="type-caption text-text-tertiary">
              Try adjusting your location settings in Preferences below.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <section className="space-y-6 lg:col-span-2" aria-label="Prayer times and statistics">
            {/* Next Prayer Hero */}
            <NextPrayerHero
              nextPrayer={heroNextPrayer}
              location={location}
              loading={loading}
              error={error}
              formatTime={formatTime}
              formatCountdown={formatCountdown}
            />

            {/* Prayer Schedule (with integrated ScheduleHeader) */}
            <PrayerSchedule
              header={{
                gregorianDate,
                hijriDate: hijriDate || null,
                hijriUnavailable,
                onOpenDatePicker: () => setDateModalOpen(true),
              }}
              rows={rows}
              showCompletion={Boolean(todayCompletion)}
              onToggle={(name: PrayerName) => togglePrayer(name)}
              formatTime={formatTime}
            />

            {/* Prayer Statistics */}
            <PrayerStatistics
              statistics={statistics}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              loading={trackingLoading}
              isAuthenticated={!!user}
              accountCreatedAt={accountCreatedAt}
            />
          </section>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6" aria-label="Settings and Qibla compass">
            {/* Preferences (with notifications entry) */}
            <section id="preferences" aria-labelledby="preferences-title" className="scroll-mt-6">
              <h2 id="preferences-title" className="sr-only">Prayer Preferences</h2>
              <PreferencesSection
                calculationMethodLabel={calculationMethodLabel}
                madhabLabel={madhabLabel}
                locationLabel={locationLabel}
                onEditCalculationMethod={() => setPrefsModalOpen(true)}
                onEditMadhab={() => setPrefsModalOpen(true)}
                onEditLocation={() => setPrefsModalOpen(true)}
                notifications={<NotificationEntry />}
              />
            </section>

            {/* Qibla Compass */}
            <section id="qibla" aria-label="Qibla compass" className="scroll-mt-6">
              <QiblaCompass
                qiblaDirection={qiblaDirection}
                locationLabel={locationLabel}
                loading={loading}
                error={!qiblaDirection && location ? 'Unable to determine direction' : error}
              />
            </section>
          </aside>
        </div>
      )}

      {/* Modals */}
      <DateSelectorModal
        open={dateModalOpen}
        onOpenChange={setDateModalOpen}
        currentLocation={location}
        calculationMethod={calculationMethod}
        madhab={madhab}
      />

      <PreferencesDetailModal
        open={prefsModalOpen}
        onOpenChange={setPrefsModalOpen}
        calculationMethod={calculationMethod}
        madhab={madhab}
        location={location}
        onCalculationMethodChange={updateCalculationMethod}
        onMadhabChange={updateMadhab}
        onLocationChange={updateLocation}
      />

      {/* Feedback Button */}
      <FeedbackButton pagePath="/times" />
    </div>
  )
}
