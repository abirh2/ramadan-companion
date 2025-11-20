'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Moon, Loader2 } from 'lucide-react'
import { useRamadanCountdown } from '@/hooks/useRamadanCountdown'

export function RamadanCard() {
  const countdown = useRamadanCountdown()

  // Loading state
  if (countdown.loading) {
    return (
      <Card className="rounded-2xl shadow-md border-accent/30" role="article" aria-busy="true" aria-label="Loading Ramadan countdown">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-accent" aria-hidden="true" />
            <CardTitle className="text-base font-medium text-muted-foreground">
              Ramadan {countdown.ramadanYear}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 py-8">
          <div className="flex items-center justify-center" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Loading Ramadan countdown...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (countdown.error) {
    return (
      <Card className="rounded-2xl shadow-md border-accent/30" role="article" aria-live="polite" aria-label="Error loading Ramadan countdown">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-accent" aria-hidden="true" />
            <CardTitle className="text-base font-medium text-muted-foreground">
              Ramadan {countdown.ramadanYear}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold text-muted-foreground">Unable to load</p>
          <p className="text-sm text-muted-foreground">
            Check your connection and try refreshing
          </p>
        </CardContent>
      </Card>
    )
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Before Ramadan state
  if (!countdown.isRamadan && countdown.timeUntilEvent) {
    const cardAriaLabel = `Ramadan ${countdown.ramadanYear} countdown. Starts in ${countdown.timeUntilEvent}. Expected start date: ${formatDate(countdown.ramadanStartDate)}`
    
    return (
      <Card className="rounded-2xl shadow-md border-accent/30" role="article" aria-label={cardAriaLabel}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-accent" aria-hidden="true" />
            <CardTitle className="text-base font-medium text-muted-foreground">
              Ramadan {countdown.ramadanYear}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Starts in
            </p>
            <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums tracking-tight" aria-live="polite" aria-atomic="true">
              {countdown.timeUntilEvent}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Expected: {formatDate(countdown.ramadanStartDate)} • Adjust in Settings
          </p>
        </CardContent>
      </Card>
    )
  }

  // During Ramadan state
  if (countdown.isRamadan && countdown.currentRamadanDay) {
    const cardAriaLabel = countdown.nextEvent && countdown.timeUntilEvent
      ? `Ramadan ${countdown.ramadanYear}, Day ${countdown.currentRamadanDay}. ${countdown.timeUntilEvent} until ${countdown.nextEvent === 'iftar' ? 'Iftar at Maghrib' : 'Suhoor ends at Fajr'}`
      : `Ramadan Mubarak. Day ${countdown.currentRamadanDay} of 30`
    
    return (
      <Card className="rounded-2xl shadow-md border-accent/30" role="article" aria-label={cardAriaLabel}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-accent" aria-hidden="true" />
            <CardTitle className="text-base font-medium text-muted-foreground">
              Ramadan {countdown.ramadanYear} • Day {countdown.currentRamadanDay}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {countdown.nextEvent && countdown.timeUntilEvent ? (
            <>
              <p className="text-4xl font-bold text-foreground tabular-nums" aria-live="polite" aria-atomic="true">
                {countdown.timeUntilEvent}
              </p>
              <p className="text-sm text-muted-foreground">
                {countdown.nextEvent === 'iftar' 
                  ? 'Until Iftar (Maghrib)' 
                  : 'Until Suhoor ends (Fajr)'}
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold text-foreground">
                Ramadan Mubarak
              </p>
              <p className="text-sm text-muted-foreground">
                Day {countdown.currentRamadanDay} of 30
              </p>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  // Fallback
  return (
    <Card className="rounded-2xl shadow-md border-accent/30" role="article" aria-label={`Ramadan ${countdown.ramadanYear}. Preparing countdown data.`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle className="text-base font-medium text-muted-foreground">
            Ramadan {countdown.ramadanYear}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-4xl font-bold text-foreground">Ramadan</p>
        <p className="text-sm text-muted-foreground">
          Preparing countdown data...
        </p>
      </CardContent>
    </Card>
  )
}

