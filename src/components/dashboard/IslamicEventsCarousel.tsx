'use client'

import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { useRamadanCountdown } from '@/hooks/useRamadanCountdown'
import type { IslamicEventWithCountdown } from '@/hooks/useIslamicEvents'

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}

function prominenceFor(event: IslamicEventWithCountdown) {
  if (event.isActive) return 'active'
  if (event.flags?.isWeeklyJumua || event.daysUntil > 30) return 'compact'
  if (event.daysUntil < 7) return 'elevated'
  return 'moderate'
}

function EventContent({ event }: { event: IslamicEventWithCountdown }) {
  const prominence = prominenceFor(event)
  const isCompact = prominence === 'compact'

  return (
    <article
      className={`min-h-28 ${
        prominence === 'active'
          ? 'surface-feature p-5'
          : prominence === 'elevated'
            ? 'rounded-surface bg-gold-muted p-5 text-text-primary'
            : prominence === 'moderate'
              ? 'surface-grouped p-5'
              : 'rounded-grouped border border-border-subtle bg-surface-primary px-4 py-3.5'
      }`}
      aria-label={event.isActive ? `${event.name}, happening now` : `${event.name}, in ${event.daysUntil} days`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h3 className={`font-semibold tracking-[-0.01em] ${isCompact ? 'type-body' : 'text-lg leading-snug'}`}>
              {event.name}
            </h3>
            <span
              className={`${isCompact ? 'text-base' : 'text-lg'} ${prominence === 'active' ? 'text-surface-feature-muted' : 'text-gold'}`}
              lang="ar"
              dir="rtl"
            >
              {event.arabicName}
            </span>
          </div>
          {!isCompact && (
            <p className={`type-body-secondary mt-2 ${prominence === 'active' ? 'text-surface-feature-muted' : 'text-text-secondary'}`}>
              {event.description}
            </p>
          )}
          <p className={`type-caption mt-1.5 ${prominence === 'active' ? 'text-surface-feature-muted' : 'text-text-secondary'}`}>
            {event.isActive
              ? event.durationDays > 1
                ? `Day ${event.currentDay ?? 1} of ${event.durationDays}`
                : 'Today'
              : `${formatDate(event.startDate)} · ${event.daysUntil === 1 ? 'Tomorrow' : `In ${event.daysUntil} days`}`}
          </p>
        </div>
        <CalendarDays
          className={`size-5 shrink-0 ${prominence === 'active' ? 'text-surface-feature-muted' : 'text-text-tertiary'}`}
          aria-hidden="true"
        />
      </div>
    </article>
  )
}

function ActiveRamadanContent({ event }: { event: IslamicEventWithCountdown }) {
  const countdown = useRamadanCountdown()

  return (
    <article className="surface-feature p-5" aria-label={`${event.name}, active now`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-lg font-semibold">Ramadan</h3>
            <span className="text-lg text-surface-feature-muted" lang="ar" dir="rtl">{event.arabicName}</span>
          </div>
          <p className="type-caption mt-1 text-surface-feature-muted">
            Day {countdown.currentRamadanDay ?? event.currentDay ?? 1}
          </p>
        </div>
        {countdown.timeUntilEvent && (
          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums">{countdown.timeUntilEvent}</p>
            <p className="type-caption text-surface-feature-muted">
              until {countdown.nextEvent === 'iftar' ? 'iftar' : 'suhoor ends'}
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

export function IslamicEventsCarousel() {
  const { events, loading, error } = useIslamicEvents()
  const [activeIndex, setActiveIndex] = useState(0)

  if (loading) {
    return (
      <section aria-labelledby="events-heading" aria-busy="true">
        <h2 id="events-heading" className="type-section-title">Upcoming</h2>
        <div className="mt-3 h-20 animate-pulse rounded-grouped bg-surface-grouped" role="status">
          <span className="sr-only">Loading upcoming Islamic events</span>
        </div>
      </section>
    )
  }

  if (error || events.length === 0) {
    return (
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="type-section-title">Upcoming</h2>
        <p className="type-body-secondary mt-2 text-text-secondary">
          Event dates are unavailable right now. Your prayer schedule and daily reflection are still ready.
        </p>
      </section>
    )
  }

  const clampedIndex = Math.min(activeIndex, events.length - 1)
  const event = events[clampedIndex]
  const isActiveRamadan = Boolean(event.isActive && event.flags?.isRamadan)

  return (
    <section aria-labelledby="events-heading">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 id="events-heading" className="type-section-title">Upcoming</h2>
          <p className="type-caption mt-0.5 text-text-secondary">Islamic calendar</p>
        </div>
        {events.length > 1 && (
          <div className="flex items-center gap-1" aria-label="Browse upcoming events">
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index - 1 + events.length) % events.length)}
              className="inline-flex size-touch items-center justify-center rounded-control text-text-secondary hover:bg-surface-grouped hover:text-text-primary"
              aria-label="Previous event"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <span className="type-caption min-w-10 text-center text-text-secondary" aria-live="polite">
              {clampedIndex + 1} of {events.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index + 1) % events.length)}
              className="inline-flex size-touch items-center justify-center rounded-control text-text-secondary hover:bg-surface-grouped hover:text-text-primary"
              aria-label="Next event"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {isActiveRamadan ? <ActiveRamadanContent event={event} /> : <EventContent event={event} />}
    </section>
  )
}
