import type { CalendarDate } from '@/types/calendar.types'

interface TodayHeaderProps {
  date: CalendarDate | null
  error?: string | null
}

export function TodayHeader({ date, error }: TodayHeaderProps) {
  const now = new Date()
  const gregorianDate = date
    ? `${date.gregorian.monthName} ${date.gregorian.day}, ${date.gregorian.year}`
    : now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <section className="grid gap-5 border-b border-border-subtle pb-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-10 sm:pb-8" aria-label="Today">
      <div>
        <h2 className="text-balance text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text-primary">
          {gregorianDate}
        </h2>
        <p className="mt-2 type-caption text-text-tertiary">Today · Gregorian</p>
      </div>

      <div className="sm:text-right">
        {date ? (
          <>
            <p className="text-lg font-semibold leading-snug text-teal dark:text-teal">
              {date.hijri.day} {date.hijri.monthName} {date.hijri.year}
            </p>
            <p
              className="mt-1 font-arabic text-xl leading-relaxed text-text-secondary"
              lang="ar"
              dir="rtl"
            >
              {date.hijri.monthNameAr}
            </p>
          </>
        ) : (
          <p className="type-body-secondary text-text-secondary" role="status">
            {error ? 'Today’s Hijri date is unavailable' : 'Loading today’s Hijri date…'}
          </p>
        )}
      </div>
    </section>
  )
}
