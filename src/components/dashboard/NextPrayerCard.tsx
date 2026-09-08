'use client'

import Link from 'next/link'
import { ArrowRight, Clock3, MapPin, Sunrise } from 'lucide-react'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

function formatTime(timeString: string, includePeriod = true) {
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')}${includePeriod ? ` ${period}` : ''}`
}

function formatCountdown(countdown: string) {
  const hours = countdown.match(/(\d+)h/)?.[1]
  const minutes = countdown.match(/(\d+)m/)?.[1]

  if (hours) return `${hours}h ${minutes ?? '0'}m`
  if (minutes) return `${minutes}m`
  return 'Less than a minute'
}

export function NextPrayerCard() {
  const { nextPrayer, prayerTimes, location, loading, error } = usePrayerTimes()

  if (loading) {
    return (
      <section className="surface-feature min-h-72 overflow-hidden p-6" aria-labelledby="next-prayer-heading" aria-busy="true">
        <div className="flex items-center justify-between gap-4">
          <h2 id="next-prayer-heading" className="type-nav text-surface-feature-muted">Next prayer</h2>
          <Clock3 className="size-5 text-surface-feature-muted" aria-hidden="true" />
        </div>
        <div className="mt-12 space-y-3" role="status">
          <div className="h-10 w-32 animate-pulse rounded-control bg-white/10" />
          <div className="h-6 w-52 animate-pulse rounded-control bg-white/10" />
          <span className="sr-only">Loading today&apos;s prayer times</span>
        </div>
      </section>
    )
  }

  if (error || !nextPrayer) {
    return (
      <section className="surface-feature min-h-72 p-6" aria-labelledby="next-prayer-heading" aria-live="polite">
        <Clock3 className="size-5 text-surface-feature-muted" aria-hidden="true" />
        <h2 id="next-prayer-heading" className="type-section-title mt-6 text-surface-feature-foreground">
          Prayer times need your attention
        </h2>
        <p className="type-body-secondary mt-2 max-w-[34ch] text-surface-feature-muted">
          Check your location and calculation settings to load today&apos;s schedule.
        </p>
        <Link
          href="/times"
          className="type-nav mt-6 inline-flex min-h-touch items-center gap-2 rounded-control bg-white/10 px-4 text-surface-feature-foreground hover:bg-white/15"
        >
          Review prayer settings
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    )
  }

  const compactCountdown = formatCountdown(nextPrayer.countdown)
  const nextLabel = `${nextPrayer.name}${nextPrayer.isTomorrow ? ' tomorrow' : ''}`

  return (
    <section
      className="surface-feature home-prayer-pattern relative min-h-72 overflow-hidden p-5 sm:p-6"
      aria-labelledby="next-prayer-heading"
    >
      <div className="relative z-10">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div>
            <p className="type-nav text-surface-feature-muted">Next prayer</p>
            <h2 id="next-prayer-heading" className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.025em] text-surface-feature-foreground">
              {nextLabel}
            </h2>
          </div>
          {location && (
            <div className="type-caption flex min-w-0 max-w-[42%] items-center gap-1.5 text-surface-feature-muted">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{location.city}</span>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="type-feature-number text-surface-feature-foreground" aria-live="polite" aria-atomic="true">
              {compactCountdown}
            </p>
            <p className="type-caption mt-1 text-surface-feature-muted">until prayer</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="type-section-title tabular-nums text-surface-feature-foreground">
              {formatTime(nextPrayer.time)}
            </p>
            <p className="type-caption mt-1 text-surface-feature-muted">scheduled time</p>
          </div>
        </div>

        {prayerTimes && (
          <div className="mt-7 border-t border-white/12 pt-5">
            <h3 className="sr-only">Today&apos;s prayer schedule</h3>
            <ol className="grid grid-cols-5 gap-1" aria-label="Today's five daily prayers">
            {PRAYER_ORDER.map((name) => {
              const isNext = nextPrayer.name === name && !nextPrayer.isTomorrow

              return (
                <li
                  key={name}
                  aria-current={isNext ? 'true' : undefined}
                  className={`relative min-w-0 rounded-control-sm px-0.5 py-2.5 text-center ${
                    isNext ? 'bg-white/12 outline outline-1 outline-white/35' : ''
                  }`}
                >
                  {isNext && (
                    <span className="absolute inset-x-0 -top-1 mx-auto h-0.5 w-5 rounded-round bg-gold" aria-hidden="true" />
                  )}
                  <span className={`block text-xs font-semibold leading-tight ${isNext ? 'text-surface-feature-foreground' : 'text-surface-feature-muted'}`}>
                    {name}
                  </span>
                  <span className="mt-1 block whitespace-nowrap text-[0.75rem] font-semibold leading-tight tabular-nums text-surface-feature-foreground sm:text-caption">
                    {formatTime(prayerTimes[name], false)}
                  </span>
                  {isNext && <span className="sr-only">Next prayer</span>}
                </li>
              )
            })}
            </ol>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          {prayerTimes ? (
            <p className="type-caption flex min-w-0 items-center gap-1.5 text-surface-feature-muted">
              <Sunrise className="size-4" aria-hidden="true" />
              Sunrise {formatTime(prayerTimes.Sunrise)}
            </p>
          ) : <span />}
          <Link
            href="/times"
            className="type-nav inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-control px-2 text-surface-feature-foreground underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
            aria-label="View full prayer times and settings"
          >
            View details
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
