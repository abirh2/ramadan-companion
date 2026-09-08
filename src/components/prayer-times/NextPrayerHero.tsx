'use client'

import { Clock3, MapPin } from 'lucide-react'

interface NextPrayerHeroProps {
  nextPrayer: { name: string; countdown: string; time: string; isTomorrow: boolean } | null
  location: { city: string } | null
  loading: boolean
  error: string | null
  formatTime: (t: string) => string
  formatCountdown: (c: string) => string
}

/**
 * NextPrayerHero — the next-prayer summary rendered as a `surface-feature`
 * (dark teal) block at the top of the Prayer Times screen.
 *
 * It reuses the Home `NextPrayerCard` feature-surface visual vocabulary
 * (eyebrow, large heading, `type-feature-number` countdown, scheduled time,
 * de-emphasized location) but omits the decorative `home-prayer-pattern`
 * illustration (R1.7).
 *
 * Rendering:
 * - Eyebrow "Next prayer" in `type-nav text-surface-feature-muted`.
 * - Prayer name as a large heading; a "tomorrow" indicator is appended when
 *   `nextPrayer.isTomorrow` (R1.8).
 * - Countdown in the `type-feature-number` band (>= the name font and <= 2x the
 *   name font — it must not be scaled larger), with `aria-live="polite"` /
 *   `aria-atomic="true"` so screen readers announce updates (R1.6).
 * - Scheduled time in `type-section-title tabular-nums`, formatted "at 4:36 PM"
 *   (R1.3).
 * - Location de-emphasized in `type-caption text-surface-feature-muted` with a
 *   `MapPin`, truncated and smaller than both the name and the countdown (R1.4).
 * - When `!nextPrayer` or `error`, an "unavailable" placeholder replaces the
 *   name/countdown/time inside the same `surface-feature` block (R1.9).
 * - While `loading`, a skeleton variant renders inside `surface-feature` with an
 *   `sr-only` status message (R15.1).
 *
 * Styling is token-only so light and dark modes both re-theme (R9).
 */
export function NextPrayerHero({
  nextPrayer,
  location,
  loading,
  error,
  formatTime,
  formatCountdown,
}: NextPrayerHeroProps) {
  if (loading) {
    return (
      <section
        className="surface-feature overflow-hidden p-5 sm:p-6"
        aria-labelledby="next-prayer-hero-heading"
        aria-busy="true"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="next-prayer-hero-heading" className="type-nav text-surface-feature-muted">
            Next prayer
          </h2>
          <Clock3 className="size-5 text-surface-feature-muted" aria-hidden="true" />
        </div>
        <div className="mt-8 space-y-3" role="status">
          <div className="h-10 w-32 animate-pulse rounded-control bg-white/10" />
          <div className="h-6 w-52 animate-pulse rounded-control bg-white/10" />
          <span className="sr-only">Loading today&apos;s prayer times</span>
        </div>
      </section>
    )
  }

  if (error || !nextPrayer) {
    return (
      <section
        className="surface-feature p-5 sm:p-6"
        aria-labelledby="next-prayer-hero-heading"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="type-nav text-surface-feature-muted">Next prayer</p>
          <Clock3 className="size-5 text-surface-feature-muted" aria-hidden="true" />
        </div>
        <h2
          id="next-prayer-hero-heading"
          className="type-section-title mt-6 text-surface-feature-foreground"
        >
          Prayer times unavailable
        </h2>
        <p className="type-body-secondary mt-2 max-w-[34ch] text-surface-feature-muted">
          We couldn&apos;t determine the next prayer. Check your location and calculation settings
          below.
        </p>
      </section>
    )
  }

  const compactCountdown = formatCountdown(nextPrayer.countdown)
  const nextLabel = `${nextPrayer.name}${nextPrayer.isTomorrow ? ' tomorrow' : ''}`

  return (
    <section
      className="surface-feature relative overflow-hidden p-5 sm:p-6"
      aria-labelledby="next-prayer-hero-heading"
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="type-nav text-surface-feature-muted">Next prayer</p>
          <h2
            id="next-prayer-hero-heading"
            className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.025em] text-surface-feature-foreground"
          >
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

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p
            className="type-feature-number text-surface-feature-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {compactCountdown}
          </p>
          <p className="type-caption mt-1 text-surface-feature-muted">until prayer</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="type-section-title tabular-nums text-surface-feature-foreground">
            at {formatTime(nextPrayer.time)}
          </p>
          <p className="type-caption mt-1 text-surface-feature-muted">scheduled time</p>
        </div>
      </div>
    </section>
  )
}
