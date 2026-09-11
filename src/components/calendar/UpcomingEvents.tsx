import type { IslamicEventWithCountdown } from '@/hooks/useIslamicEvents'

interface UpcomingEventsProps {
  events: IslamicEventWithCountdown[]
  loading: boolean
  error: string | null
}

function formatEventDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCountdown(event: IslamicEventWithCountdown) {
  if (event.isActive) return event.durationDays > 1 ? `Day ${event.currentDay ?? 1}` : 'Today'
  if (event.daysUntil === 1) return 'Tomorrow'
  return `${event.daysUntil} days`
}

export function UpcomingEvents({ events, loading, error }: UpcomingEventsProps) {
  const importantEvents = events.filter((event) => !event.flags?.isWeeklyJumua).slice(0, 5)

  return (
    <section aria-labelledby="upcoming-events-title">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="upcoming-events-title" className="type-section-title text-text-primary">Upcoming</h2>
        <p className="type-caption text-text-tertiary">Important Islamic dates</p>
      </div>

      {loading ? (
        <div className="divide-y divide-border-subtle rounded-grouped bg-surface-grouped/70 px-4" role="status" aria-label="Loading upcoming events">
          {[0, 1, 2].map((item) => (
            <div key={item} className="grid grid-cols-[1fr_auto] gap-4 py-4">
              <div className="space-y-2"><div className="h-3 w-28 animate-pulse rounded bg-border-strong/45" /><div className="h-3 w-20 animate-pulse rounded bg-border-strong/30" /></div>
              <div className="h-3 w-14 animate-pulse rounded bg-border-strong/30" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-grouped bg-surface-grouped px-4 py-5" role="status">
          <p className="type-body-secondary font-medium text-text-primary">Upcoming dates are unavailable</p>
          <p className="mt-1 type-caption text-text-secondary">The calendar itself is still available.</p>
        </div>
      ) : importantEvents.length === 0 ? (
        <div className="rounded-grouped bg-surface-grouped px-4 py-5">
          <p className="type-body-secondary text-text-secondary">No upcoming events available.</p>
        </div>
      ) : (
        <ol className="divide-y divide-border-subtle border-y border-border-subtle">
          {importantEvents.map((event) => {
            const approaching = event.isActive || (event.daysUntil >= 0 && event.daysUntil <= 30)
            return (
              <li key={event.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)_auto]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {approaching && <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-label="Approaching soon" />}
                    <p className="truncate text-sm font-semibold text-text-primary">{event.name}</p>
                  </div>
                  <p className="mt-0.5 truncate font-arabic text-sm text-text-tertiary" lang="ar" dir="rtl">{event.arabicName}</p>
                </div>
                <p className="col-start-1 row-start-2 mt-0.5 type-caption text-text-tertiary sm:col-start-2 sm:row-start-1 sm:mt-0 sm:text-text-secondary">{formatEventDate(event.startDate)}</p>
                <div className="text-right">
                  <p className={approaching ? 'text-sm font-semibold tabular-nums text-gold' : 'text-sm font-medium tabular-nums text-text-secondary'}>
                    {formatCountdown(event)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
