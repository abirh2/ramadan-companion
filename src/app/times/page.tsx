'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Clock, Sunrise, Loader2, Calendar } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { usePrayerTracking } from '@/hooks/usePrayerTracking'
import { useAuth } from '@/hooks/useAuth'
import { QiblaCompass } from '@/components/prayer-times/QiblaCompass'
import { PrayerCheckbox, PrayerCompletionSummary } from '@/components/prayer-times/PrayerCheckboxes'
import { PrayerStatistics } from '@/components/prayer-times/PrayerStatistics'
import { DateSelectorModal } from '@/components/prayer-times/DateSelectorModal'
import { CompactPreferencesCard } from '@/components/prayer-times/CompactPreferencesCard'
import { PreferencesDetailModal } from '@/components/prayer-times/PreferencesDetailModal'
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

  // Modal states
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [prefsModalOpen, setPrefsModalOpen] = useState(false)

  // Hijri date state
  const [hijriDate, setHijriDate] = useState<string>('')

  // Fetch Hijri date
  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const response = await fetch('/api/hijri')
        if (response.ok) {
          const data = await response.json()
          const hijri = data.currentHijri
          // Format: "24 Rajab 1447"
          setHijriDate(`${hijri.day} ${hijri.monthName} ${hijri.year}`)
        }
      } catch (error) {
        console.error('Error fetching Hijri date:', error)
      }
    }

    fetchHijriDate()
  }, [])

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

  // Format Gregorian date
  const gregorianDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  // Calculate Imsak time (10 minutes before Fajr)
  const getImsakTime = (fajrTime: string): string => {
    const [hours, minutes] = fajrTime.split(':').map(Number)
    const fajrDate = new Date()
    fajrDate.setHours(hours, minutes, 0, 0)
    fajrDate.setMinutes(fajrDate.getMinutes() - 10)
    return `${String(fajrDate.getHours()).padStart(2, '0')}:${String(fajrDate.getMinutes()).padStart(2, '0')}`
  }

  // Check if a prayer is happening NOW (at prayer time and up to 15 minutes after)
  const isPrayerNow = (prayerTime: string): boolean => {
    const now = new Date()
    const [hours, minutes] = prayerTime.split(':').map(Number)
    const prayerDate = new Date(now)
    prayerDate.setHours(hours, minutes, 0, 0)
    
    const timeDiff = now.getTime() - prayerDate.getTime()
    // Prayer is NOW if current time is at or after prayer time, but within 15 minutes
    return timeDiff >= 0 && timeDiff <= 15 * 60 * 1000
  }

  // Get the next upcoming prayer (for "UP NEXT" indicator)
  const getUpNextPrayer = (): string | null => {
    if (!prayerTimes) return null
    
    const now = new Date()
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    
    for (const prayer of prayers) {
      const [hours, minutes] = prayerTimes[prayer as keyof typeof prayerTimes].split(':').map(Number)
      const prayerDate = new Date(now)
      prayerDate.setHours(hours, minutes, 0, 0)
      
      // If prayer time hasn't arrived yet, it's up next
      if (prayerDate.getTime() > now.getTime()) {
        return prayer
      }
    }
    
    // If all prayers have passed, next is tomorrow's Fajr
    return 'Fajr'
  }

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
              {/* Next Prayer Hero Card */}
              <Card className="rounded-3xl shadow-md border-accent/30" role="article">
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

              {/* Date Header with Calendar Button */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{gregorianDate}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {hijriDate && (
                      <span className="text-muted-foreground font-medium text-sm">{hijriDate}</span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setDateModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Other Dates</span>
                </Button>
              </div>

              {/* Prayer Schedule */}
              <section className="space-y-3" role="article">
                {prayerSchedule.map((prayer) => {
                  const timeUntil = prayer.isPrayer ? getTimeUntil(prayer.time) : null
                  const isNow = prayer.isPrayer && isPrayerNow(prayer.time)
                  const upNextPrayer = getUpNextPrayer()
                  const isUpNext = prayer.name === upNextPrayer && !isNow
                  const isPrayerCompleted =
                    todayCompletion && prayer.isPrayer
                      ? todayCompletion[
                          `${prayer.name.toLowerCase()}_completed` as keyof typeof todayCompletion
                        ]
                      : false

                  // Special styling for prayer happening NOW (dark green)
                  if (isNow && prayer.isPrayer) {
                    return (
                      <div
                        key={prayer.name}
                        className="relative flex items-center justify-between p-4 bg-green-900 dark:bg-green-950 rounded-[24px] shadow-md overflow-hidden"
                      >
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-green-400/20 blur-3xl rounded-full" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                          {todayCompletion && (
                            <button
                              onClick={() => togglePrayer(prayer.name as PrayerName)}
                              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                                isPrayerCompleted
                                  ? 'bg-green-500 text-white border-none'
                                  : 'border-2 border-white/20 text-white/40 hover:border-white/40'
                              }`}
                            >
                              {isPrayerCompleted && <Check className="h-6 w-6" />}
                            </button>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white">{prayer.name}</p>
                              <span className="px-1.5 py-0.5 rounded bg-green-500 text-[9px] text-white font-black uppercase tracking-widest">
                                Now
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-white/70">
                                {formatTime(prayer.time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Special styling for UP NEXT prayer (light blue)
                  if (isUpNext && prayer.isPrayer) {
                    return (
                      <div
                        key={prayer.name}
                        className="relative flex items-center justify-between p-4 bg-primary/10 border-2 border-primary/30 rounded-[24px] shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          {todayCompletion && (
                            <button
                              onClick={() => togglePrayer(prayer.name as PrayerName)}
                              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                                isPrayerCompleted
                                  ? 'bg-green-500 text-white border-none'
                                  : 'border-2 border-muted text-muted-foreground hover:border-primary'
                              }`}
                            >
                              {isPrayerCompleted && <Check className="h-6 w-6" />}
                            </button>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">{prayer.name}</p>
                              <span className="px-1.5 py-0.5 rounded bg-primary/20 text-[9px] text-primary font-black uppercase tracking-widest">
                                Up Next
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(prayer.time)}
                              </span>
                              {prayer.name === 'Fajr' && prayerTimes && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                    Imsak {formatTime(getImsakTime(prayerTimes.Fajr))}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {timeUntil && (
                            <span className="text-[10px] text-primary uppercase font-bold tracking-tight">
                              {timeUntil}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Sunrise (non-prayer)
                  if (prayer.name === 'Sunrise') {
                    return (
                      <div
                        key={prayer.name}
                        className="flex items-center justify-between px-6 py-2 opacity-60"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <Sunrise className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">{prayer.name}</p>
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">
                          {formatTime(prayer.time)}
                        </p>
                      </div>
                    )
                  }

                  // Regular prayer cards
                  return (
                    <div
                      key={prayer.name}
                      className="group flex items-center justify-between p-4 bg-card border border-border rounded-[24px] shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {todayCompletion && (
                          <button
                            onClick={() => togglePrayer(prayer.name as PrayerName)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                              isPrayerCompleted
                                ? 'bg-green-500 text-white border-none'
                                : 'border-2 border-muted text-muted-foreground hover:border-primary'
                            }`}
                          >
                            {isPrayerCompleted && <Check className="h-6 w-6" />}
                          </button>
                        )}
                        <div>
                          <p className="font-bold text-foreground">{prayer.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(prayer.time)}
                            </span>
                            {prayer.name === 'Fajr' && prayerTimes && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                  Imsak {formatTime(getImsakTime(prayerTimes.Fajr))}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {timeUntil && (
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                            {timeUntil}
                          </span>
                        )}
                        {!timeUntil && prayer.isPrayer && (
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                            Passed
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </section>

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

              {/* Compact Preferences Card */}
              <section aria-labelledby="preferences-title">
                <h2 id="preferences-title" className="sr-only">Prayer Preferences</h2>
                <CompactPreferencesCard
                  calculationMethod={calculationMethod}
                  madhab={madhab}
                  location={location}
                  onEditClick={() => setPrefsModalOpen(true)}
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

