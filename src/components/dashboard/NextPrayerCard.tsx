'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Loader2, MapPin } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { CALCULATION_METHODS } from '@/types/ramadan.types'
import type { PrayerTime } from '@/types/ramadan.types'

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
const NOW_WINDOW_MS = 45 * 60 * 1000
const NEXT_PRAYER_BUFFER_MS = 15 * 60 * 1000

function getCurrentPrayer(
  prayerTimes: PrayerTime,
  nextPrayerName: string | undefined,
  isNextTomorrow: boolean | undefined
): { name: string; time: string } | null {
  const now = new Date()
  const currentMs = now.getTime()

  const schedule = PRAYER_ORDER.map((name) => {
    const [h, m] = prayerTimes[name].split(':').map(Number)
    const d = new Date(now)
    d.setHours(h, m, 0, 0)
    return { name, time: d, timeString: prayerTimes[name] }
  })

  // Find the most recent prayer that has passed
  let current: (typeof schedule)[number] | null = null
  let nextPrayerTime: Date | null = null

  for (let i = schedule.length - 1; i >= 0; i--) {
    if (schedule[i].time.getTime() <= currentMs) {
      current = schedule[i]
      nextPrayerTime = i < schedule.length - 1 ? schedule[i + 1].time : null
      break
    }
  }

  if (!current) return null

  const elapsed = currentMs - current.time.getTime()
  if (elapsed > NOW_WINDOW_MS) return null

  // End "Now" window early if next prayer is within buffer
  if (nextPrayerTime) {
    const untilNext = nextPrayerTime.getTime() - currentMs
    if (untilNext <= NEXT_PRAYER_BUFFER_MS) return null
  }

  return { name: current.name, time: current.timeString }
}

export function NextPrayerCard() {
  const { nextPrayer, prayerTimes, location, calculationMethod, loading, error } = usePrayerTimes()

  const currentPrayer = useMemo(() => {
    if (!prayerTimes || !nextPrayer) return null
    return getCurrentPrayer(prayerTimes, nextPrayer.name, nextPrayer.isTomorrow)
  }, [prayerTimes, nextPrayer])

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Format today's date
  const formatDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get method name
  const methodName = CALCULATION_METHODS.find((m) => m.id === calculationMethod)?.name || 'Umm al-Qura'

  // Loading state
  if (loading) {
    return (
      <Link href="/times" className="block" aria-label="Loading next prayer time">
        <Card className="rounded-3xl shadow-sm transition-shadow hover:shadow-md" role="article" aria-busy="true">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Next Prayer
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 py-6">
            <div className="flex items-center justify-center" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Loading prayer times...</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Error state
  if (error) {
    return (
      <Link href="/times" className="block" aria-label="Unable to load prayer times. Tap to view settings.">
        <Card className="rounded-3xl shadow-sm transition-shadow hover:shadow-md" role="article" aria-live="polite">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Next Prayer
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold text-muted-foreground">Unable to load</p>
            <p className="text-xs text-muted-foreground">Tap to view settings</p>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Success state
  const cardAriaLabel = currentPrayer
    ? `Now: ${currentPrayer.name}. Next prayer: ${nextPrayer?.name} in ${nextPrayer?.countdown}. Click to view all prayer times.`
    : `Next prayer: ${nextPrayer?.name}${nextPrayer?.isTomorrow ? ' tomorrow' : ''} in ${nextPrayer?.countdown}. Scheduled for ${nextPrayer?.time ? formatTime(nextPrayer.time) : ''}. Click to view all prayer times.`

  // Prayer names for the grid (includes Sunrise as a non-prayer informational entry)
  const gridEntries = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

  return (
    <Link href="/times" className="block" aria-label={cardAriaLabel}>
      <Card className="rounded-3xl shadow-sm cursor-pointer transition-shadow hover:shadow-md" role="article">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Prayer Times
              </CardTitle>
            </div>
            {location && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[100px]">{location.city}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPrayer ? (
            <div className="space-y-2">
              <div className="space-y-0.5">
                <p className="text-3xl font-bold tracking-tight" aria-live="polite" aria-atomic="true">
                  Now: {currentPrayer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Started at {formatTime(currentPrayer.time)} • {methodName}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {nextPrayer?.name}{nextPrayer?.isTomorrow ? ' (tomorrow)' : ''} in {nextPrayer?.countdown}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight" aria-live="polite" aria-atomic="true">
                {nextPrayer?.name}{nextPrayer?.isTomorrow ? ' (tomorrow)' : ''} in {nextPrayer?.countdown}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate()} • {nextPrayer?.time ? formatTime(nextPrayer.time) : ''} • {methodName}
              </p>
            </div>
          )}

          {/* Mini prayer times grid */}
          {prayerTimes && (
            <div className="grid grid-cols-6 gap-1.5 pt-2">
              {gridEntries.map((name) => {
                const isSunrise = name === 'Sunrise'
                const isCurrent = !isSunrise && currentPrayer?.name === name
                const isNext = !isSunrise && !isCurrent && nextPrayer?.name === name && !nextPrayer?.isTomorrow
                const time = formatTime(prayerTimes[name])
                
                return (
                  <div
                    key={name}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                      isCurrent
                        ? 'bg-green-100 dark:bg-green-900/40 ring-1 ring-green-500/30'
                        : isNext
                        ? 'bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20'
                        : isSunrise
                        ? 'bg-muted/30'
                        : 'bg-muted/50'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isCurrent ? 'text-green-700 dark:text-green-400' : isNext ? 'text-primary' : isSunrise ? 'text-muted-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {isCurrent ? 'Now' : isSunrise ? 'Rise' : name}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? 'text-green-700 dark:text-green-300' : isNext ? 'text-primary' : isSunrise ? 'text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

