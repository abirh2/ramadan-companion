'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Loader2, MapPin } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { CALCULATION_METHODS } from '@/types/ramadan.types'

export function NextPrayerCard() {
  const { nextPrayer, prayerTimes, location, calculationMethod, loading, error } = usePrayerTimes()

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
  const cardAriaLabel = `Next prayer: ${nextPrayer?.name}${nextPrayer?.isTomorrow ? ' tomorrow' : ''} in ${nextPrayer?.countdown}. Scheduled for ${nextPrayer?.time ? formatTime(nextPrayer.time) : ''}. Click to view all prayer times.`

  // Prayer names for the grid
  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

  return (
    <Link href="/times" className="block" aria-label={cardAriaLabel}>
      <Card className="rounded-3xl shadow-sm cursor-pointer transition-shadow hover:shadow-md" role="article">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Next Prayer
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
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight" aria-live="polite" aria-atomic="true">
              {nextPrayer?.name}{nextPrayer?.isTomorrow ? ' (tomorrow)' : ''} in {nextPrayer?.countdown}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate()} • {nextPrayer?.time ? formatTime(nextPrayer.time) : ''} • {methodName}
            </p>
          </div>

          {/* Mini prayer times grid */}
          {prayerTimes && (
            <div className="grid grid-cols-5 gap-2 pt-2">
              {prayerNames.map((name) => {
                const isNext = nextPrayer?.name === name && !nextPrayer?.isTomorrow
                const time = prayerTimes[name]
                
                return (
                  <div
                    key={name}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                      isNext
                        ? 'bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isNext ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {name}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isNext ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {time.split(':').slice(0, 2).join(':')}
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

