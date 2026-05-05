'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Star,
  Gift,
  Calendar,
  Users,
  Sparkles,
  Loader2,
  Music,
} from 'lucide-react'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { useRamadanCountdown } from '@/hooks/useRamadanCountdown'
import type { IslamicEventWithCountdown } from '@/hooks/useIslamicEvents'

// ── Icon resolver ──────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  Moon: <Moon className="h-4 w-4" aria-hidden="true" />,
  Star: <Star className="h-4 w-4" aria-hidden="true" />,
  Gift: <Gift className="h-4 w-4" aria-hidden="true" />,
  Calendar: <Calendar className="h-4 w-4" aria-hidden="true" />,
  Users: <Users className="h-4 w-4" aria-hidden="true" />,
  Sparkles: <Sparkles className="h-4 w-4" aria-hidden="true" />,
  Music: <Music className="h-4 w-4" aria-hidden="true" />,
}

function EventIcon({ name }: { name: string }) {
  return <>{ICON_MAP[name] ?? <Calendar className="h-4 w-4" aria-hidden="true" />}</>
}

// ── Format helpers ─────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function pluralDays(n: number): string {
  return n === 1 ? '1 day' : `${n} days`
}

// ── Daily motivational card ────────────────────────────────────────────────
// One rotating quote per day, sourced from prayerQuotes
const DAILY_REMINDERS = [
  {
    text: 'Whoever fears Allah, Allah will find a way out for him and provide for him from where he does not expect.',
    source: 'Quran 65:2-3',
  },
  {
    text: 'Verily, with hardship comes ease.',
    source: 'Quran 94:6',
  },
  {
    text: 'And He is with you wherever you are.',
    source: 'Quran 57:4',
  },
  {
    text: "The best of people are those most beneficial to others.",
    source: "Al-Mu\u2019jam al-Awsat 6026",
  },
  {
    text: 'Be in this world as if you are a stranger or a traveler.',
    source: 'Sahih Bukhari 6416',
  },
  {
    text: 'Allah does not burden a soul beyond that it can bear.',
    source: 'Quran 2:286',
  },
  {
    text: 'Indeed, Allah is with the patient.',
    source: 'Quran 2:153',
  },
]

function getDailyReminder() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86_400_000
  )
  return DAILY_REMINDERS[dayOfYear % DAILY_REMINDERS.length]
}

// ── Generic event card ─────────────────────────────────────────────────────
function GenericEventCard({ event }: { event: IslamicEventWithCountdown }) {
  const isMultiDay = event.durationDays > 1
  const isPast = event.daysUntil < 0
  const isOngoing = event.isActive

  return (
    <Card
      className="rounded-3xl shadow-lg bg-primary text-primary-foreground border-0 relative overflow-hidden"
      role="article"
      aria-label={
        isOngoing
          ? `${event.name} — Day ${event.currentDay ?? 1} of ${event.durationDays}`
          : `${event.name} — in ${pluralDays(event.daysUntil)}`
      }
    >
      {/* Decorative background icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
        <div className="h-16 w-16 flex items-center justify-center">
          <EventIcon name={event.icon} />
        </div>
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <EventIcon name={event.icon} />
          <CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-80">
            {isOngoing && isMultiDay
              ? `${event.name} — Day ${event.currentDay} of ${event.durationDays}`
              : event.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10">
        {isOngoing ? (
          <>
            <p className="text-3xl font-bold">{event.arabicName}</p>
            <p className="text-sm opacity-70">{event.description}</p>
            {isMultiDay && (
              <p className="text-xs opacity-50">Ends {formatDate(event.endDate)}</p>
            )}
          </>
        ) : isPast ? (
          <>
            <p className="text-sm opacity-70">{event.description}</p>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1 opacity-70">Starts in</p>
              <p className="text-3xl font-bold tabular-nums">{pluralDays(event.daysUntil)}</p>
            </div>
            <p className="text-xs opacity-60">{formatDate(event.startDate)}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Ramadan card (wraps useRamadanCountdown for iftar/suhoor timer) ─────────
function RamadanEventCard() {
  const countdown = useRamadanCountdown()

  if (countdown.loading) {
    return (
      <Card className="rounded-3xl shadow-md border-accent/30" aria-busy="true">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-accent" aria-hidden="true" />
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Ramadan {countdown.ramadanYear}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Loading Ramadan countdown…</span>
        </CardContent>
      </Card>
    )
  }

  const bgClass = 'rounded-3xl shadow-lg bg-primary text-primary-foreground border-0 relative overflow-hidden'

  // Before Ramadan
  if (!countdown.isRamadan) {
    return (
      <Card className={bgClass} role="article">
        <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
          <Moon className="h-16 w-16" />
        </div>
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" aria-hidden="true" />
            <CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-80">
              Ramadan {countdown.ramadanYear}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 relative z-10">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1 opacity-70">Starts in</p>
            <p className="text-3xl font-bold tabular-nums" aria-live="polite">
              {countdown.timeUntilEvent ?? '—'}
            </p>
          </div>
          <p className="text-xs opacity-60">
            {countdown.ramadanStartDate
              ? `Expected: ${formatDate(countdown.ramadanStartDate)} · Adjust in Settings`
              : 'Adjust in Settings'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // During Ramadan
  return (
    <Card className={bgClass} role="article">
      <div className="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
        <Moon className="h-16 w-16" />
      </div>
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" aria-hidden="true" />
          <CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Ramadan {countdown.ramadanYear} · Day {countdown.currentRamadanDay}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        {countdown.nextEvent && countdown.timeUntilEvent ? (
          <>
            <p className="text-4xl font-bold tabular-nums" aria-live="polite">
              {countdown.timeUntilEvent}
            </p>
            <p className="text-sm opacity-70">
              {countdown.nextEvent === 'iftar'
                ? 'Until Iftar (Maghrib)'
                : 'Until Suhoor ends (Fajr)'}
            </p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold">Ramadan Mubarak</p>
            <p className="text-sm opacity-70">Day {countdown.currentRamadanDay} of 30</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Daily motivational card ────────────────────────────────────────────────
function DailyMotivationCard() {
  const reminder = getDailyReminder()
  return (
    <Card
      className="rounded-3xl shadow-md border-accent/30 relative overflow-hidden"
      role="article"
      aria-label="Daily reminder"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5" aria-hidden="true">
        <Star className="h-16 w-16" />
      </div>
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" aria-hidden="true" />
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Daily Reminder
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <p className="text-sm leading-relaxed font-medium text-foreground">
          &ldquo;{reminder.text}&rdquo;
        </p>
        <p className="text-xs text-muted-foreground">{reminder.source}</p>
      </CardContent>
    </Card>
  )
}

// ── Carousel ───────────────────────────────────────────────────────────────
export function IslamicEventsCarousel() {
  const { events, loading, error } = useIslamicEvents()
  const [activeIndex, setActiveIndex] = useState(0)

  // Build the slide list: Islamic events + daily motivation card at the end
  // The daily motivation card is always included
  const slides = [...events, { id: '__motivation__' }] as const

  const totalSlides = slides.length

  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pauseUntilRef = useRef(0)

  const AUTO_SCROLL_MS = 8_000
  const PAUSE_AFTER_INTERACTION_MS = 20_000

  const prev = useCallback(() => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS
    setActiveIndex((i) => (i - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const next = useCallback(() => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS
    setActiveIndex((i) => (i + 1) % totalSlides)
  }, [totalSlides])

  const goTo = useCallback((idx: number) => {
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS
    setActiveIndex(idx)
  }, [])

  useEffect(() => {
    if (totalSlides <= 1) return
    autoScrollRef.current = setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setActiveIndex((i) => (i + 1) % totalSlides)
    }, AUTO_SCROLL_MS)
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [totalSlides])

  // Keep activeIndex in bounds if events change
  const clampedIndex = Math.min(activeIndex, Math.max(0, totalSlides - 1))

  if (loading) {
    return (
      <Card className="rounded-3xl shadow-md border-accent/30" aria-busy="true">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-accent" aria-hidden="true" />
            <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Islamic Events
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Loading Islamic events…</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-3xl shadow-md border-accent/30" aria-live="polite">
        <CardContent className="py-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Unable to load events</p>
          <p className="text-xs text-muted-foreground">Check your connection and try refreshing</p>
        </CardContent>
      </Card>
    )
  }

  const currentSlide = slides[clampedIndex]
  const isMotivationSlide = 'id' in currentSlide && currentSlide.id === '__motivation__'
  const isRamadanSlide = !isMotivationSlide && (currentSlide as IslamicEventWithCountdown).flags?.isRamadan

  return (
    <div className="relative" role="region" aria-label="Islamic events carousel">
      {/* Active card */}
      <div className="mb-3">
        {isMotivationSlide ? (
          <DailyMotivationCard />
        ) : isRamadanSlide ? (
          <RamadanEventCard />
        ) : (
          <GenericEventCard event={currentSlide as IslamicEventWithCountdown} />
        )}
      </div>

      {/* Navigation row */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-between px-1">
          {/* Prev button */}
          <button
            onClick={prev}
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Previous event"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Event slides">
            {slides.map((s, i) => (
              <button
                key={'id' in s ? s.id : i}
                role="tab"
                aria-selected={i === clampedIndex}
                aria-label={
                  'id' in s && s.id === '__motivation__'
                    ? 'Daily reminder'
                    : `Slide ${i + 1}`
                }
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === clampedIndex
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70'
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Next event"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
