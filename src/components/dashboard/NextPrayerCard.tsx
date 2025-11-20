'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Loader2, MapPin } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { CALCULATION_METHODS } from '@/types/ramadan.types'

export function NextPrayerCard() {
  const { nextPrayer, location, calculationMethod, loading, error } = usePrayerTimes()

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
        <Card className="rounded-2xl shadow-sm transition-shadow hover:shadow-md" role="article" aria-busy="true">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
        <Card className="rounded-2xl shadow-sm transition-shadow hover:shadow-md" role="article" aria-live="polite">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
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

  return (
    <Link href="/times" className="block" aria-label={cardAriaLabel}>
      <Card className="rounded-2xl shadow-sm cursor-pointer transition-shadow hover:shadow-md" role="article">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Prayer
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold" aria-live="polite" aria-atomic="true">
            {nextPrayer?.name}{nextPrayer?.isTomorrow ? ' (tomorrow)' : ''} in {nextPrayer?.countdown}
          </p>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {formatDate()} • {nextPrayer?.time ? formatTime(nextPrayer.time) : ''} • {methodName}
            </p>
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate">{location.city}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

