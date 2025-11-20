'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Sunrise, Loader2 } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { usePrayerTracking } from '@/hooks/usePrayerTracking'
import { useAuth } from '@/hooks/useAuth'
import { QiblaCompass } from '@/components/prayer-times/QiblaCompass'
import { PrayerTimesSettings } from '@/components/prayer-times/PrayerTimesSettings'
import { PrayerCheckbox, PrayerCompletionSummary } from '@/components/prayer-times/PrayerCheckboxes'
import { PrayerStatistics } from '@/components/prayer-times/PrayerStatistics'
import { NotificationSettings } from '@/components/prayer-times/NotificationSettings'
import { FeedbackButton } from '@/components/FeedbackButton'
import type { PrayerName } from '@/types/prayer-tracking.types'

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

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Calculate time until prayer
  const getTimeUntil = (timeString: string): string | null => {
    const now = new Date()
    const [hours, minutes] = timeString.split(':').map(Number)
    const prayerTime = new Date(now)
    prayerTime.setHours(hours, minutes, 0, 0)

    if (prayerTime.getTime() < now.getTime()) {
      return null // Prayer has passed
    }

    const diff = prayerTime.getTime() - now.getTime()
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60))
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursUntil > 0) {
      return `in ${hoursUntil}h ${minutesUntil}m`
    } else if (minutesUntil > 0) {
      return `in ${minutesUntil}m`
    } else {
      return 'now'
    }
  }

  // Prayer schedule with icons
  const prayerSchedule = prayerTimes
    ? [
        { name: 'Fajr', time: prayerTimes.Fajr, isPrayer: true },
        { name: 'Sunrise', time: prayerTimes.Sunrise, isPrayer: false },
        { name: 'Dhuhr', time: prayerTimes.Dhuhr, isPrayer: true },
        { name: 'Asr', time: prayerTimes.Asr, isPrayer: true },
        { name: 'Maghrib', time: prayerTimes.Maghrib, isPrayer: true },
        { name: 'Isha', time: prayerTimes.Isha, isPrayer: true },
      ]
    : []

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
          aria-label="Navigate back to homepage"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Back to Home</span>
        </Link>
        <h1 className="text-3xl font-bold">Prayer Times</h1>
        <p className="text-muted-foreground mt-2">Track your daily prayers and find the Qibla direction</p>
      </div>

      {loading ? (
          // Loading State
          <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
            <div className="text-center space-y-3">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" aria-hidden="true" />
              <p className="text-muted-foreground">Loading prayer times...</p>
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="flex items-center justify-center py-20" role="alert" aria-live="assertive">
            <div className="text-center space-y-3 max-w-md">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Unable to Load Prayer Times</h2>
              <p className="text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your location settings below.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <section className="lg:col-span-2 space-y-6" aria-label="Prayer times and statistics">
              {/* Next Prayer Hero */}
              <Card className="rounded-2xl shadow-md border-accent/30" role="article">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" aria-hidden="true" />
                    <CardTitle className="text-base font-medium text-muted-foreground" id="next-prayer-title">
                      Next Prayer
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-4xl md:text-5xl font-bold text-foreground tabular-nums">
                      {nextPrayer?.countdown}
                    </p>
                    <p className="text-lg text-muted-foreground mt-2">
                      until {nextPrayer?.name}{nextPrayer?.isTomorrow ? ' (tomorrow)' : ''} at {nextPrayer?.time ? formatTime(nextPrayer.time) : ''}
                    </p>
                  </div>
                  {location && (
                    <p className="text-sm text-muted-foreground">
                      📍 {location.city}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Prayer Schedule */}
              <Card className="rounded-2xl shadow-sm" role="article">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-medium" id="prayer-schedule-title">Today&apos;s Prayer Times</CardTitle>
                    <PrayerCompletionSummary todayCompletion={todayCompletion} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prayerSchedule.map((prayer) => {
                      const timeUntil = prayer.isPrayer ? getTimeUntil(prayer.time) : null
                      const isNext = nextPrayer?.name === prayer.name
                      const isPrayerCompleted =
                        todayCompletion && prayer.isPrayer
                          ? todayCompletion[
                              `${prayer.name.toLowerCase()}_completed` as keyof typeof todayCompletion
                            ]
                          : false

                      return (
                        <div
                          key={prayer.name}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isNext ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {prayer.isPrayer && todayCompletion && (
                              <PrayerCheckbox
                                prayerName={prayer.name as PrayerName}
                                completed={isPrayerCompleted as boolean}
                                onToggle={togglePrayer}
                              />
                            )}
                            {prayer.name === 'Sunrise' ? (
                              <Sunrise className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Clock
                                className={`h-5 w-5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`}
                              />
                            )}
                            <div>
                              <p className={`font-medium ${isNext ? 'text-primary' : 'text-foreground'}`}>
                                {prayer.name}
                              </p>
                              {!prayer.isPrayer && (
                                <p className="text-xs text-muted-foreground">(Not a prayer time)</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${isNext ? 'text-primary' : 'text-foreground'}`}>
                              {formatTime(prayer.time)}
                            </p>
                            {timeUntil && (
                              <p className="text-xs text-muted-foreground">{timeUntil}</p>
                            )}
                            {!timeUntil && prayer.isPrayer && (
                              <p className="text-xs text-muted-foreground">Passed</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

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
            <aside className="space-y-6" aria-label="Qibla compass and settings">
              {/* Qibla Compass */}
              <section id="qibla" aria-labelledby="qibla-title">
                <h2 id="qibla-title" className="sr-only">Qibla Compass</h2>
                <QiblaCompass qiblaDirection={qiblaDirection} loading={false} error={null} />
              </section>

              {/* Settings */}
              <section aria-labelledby="settings-title">
                <h2 id="settings-title" className="sr-only">Prayer Settings</h2>
                <PrayerTimesSettings
                  calculationMethod={calculationMethod}
                  madhab={madhab}
                  location={location}
                  onCalculationMethodChange={updateCalculationMethod}
                  onMadhabChange={updateMadhab}
                  onLocationChange={updateLocation}
                />
              </section>

              {/* Notification Settings */}
              <section aria-labelledby="notification-settings-title">
                <h2 id="notification-settings-title" className="sr-only">Notification Settings</h2>
                <NotificationSettings />
              </section>
            </aside>
          </div>
        )}

      {/* Feedback Button */}
      <FeedbackButton pagePath="/times" />
    </div>
  )
}

