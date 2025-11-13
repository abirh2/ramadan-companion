'use client'

import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, Sunrise, Loader2 } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { QiblaCompass } from '@/components/prayer-times/QiblaCompass'
import { PrayerTimesSettings } from '@/components/prayer-times/PrayerTimesSettings'

export default function TimesPage() {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Prayer Times</h1>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          // Loading State
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Loading prayer times...</p>
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3 max-w-md">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
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
            <div className="lg:col-span-2 space-y-6">
              {/* Next Prayer Hero */}
              <Card className="rounded-2xl shadow-md border-accent/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" />
                    <CardTitle className="text-base font-medium text-muted-foreground">
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
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Today's Prayer Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prayerSchedule.map((prayer) => {
                      const timeUntil = prayer.isPrayer ? getTimeUntil(prayer.time) : null
                      const isNext = nextPrayer?.name === prayer.name

                      return (
                        <div
                          key={prayer.name}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            isNext ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {prayer.name === 'Sunrise' ? (
                              <Sunrise className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Clock className={`h-5 w-5 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
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
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Qibla Compass */}
              <QiblaCompass qiblaDirection={qiblaDirection} loading={false} error={null} />

              {/* Settings */}
              <PrayerTimesSettings
                calculationMethod={calculationMethod}
                madhab={madhab}
                location={location}
                onCalculationMethodChange={updateCalculationMethod}
                onMadhabChange={updateMadhab}
                onLocationChange={updateLocation}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

