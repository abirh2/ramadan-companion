'use client'

/**
 * useIslamicEvents
 *
 * Fetches upcoming Islamic calendar events from /api/islamic-events and
 * computes live countdowns that update every minute.
 *
 * Returns events sorted by start date (soonest first), with each event
 * enriched with:
 *  - daysUntil: days until the event starts (0 = today/ongoing)
 *  - isActive: true when today falls within the event's date range
 *  - currentDay: for multi-day events, which day within the range (1-based)
 */

import { useEffect, useState, useCallback } from 'react'
import type { IslamicEventDate, IslamicEventsResponse } from '@/app/api/islamic-events/route'

export interface IslamicEventWithCountdown extends IslamicEventDate {
  /** Days until event starts. 0 means today is the start or event is active. */
  daysUntil: number
  /** True when today falls within the event window (start <= today <= end). */
  isActive: boolean
  /** For multi-day events, which day of the event today is (1-based). Null if not active. */
  currentDay: number | null
}

interface IslamicEventsState {
  events: IslamicEventWithCountdown[]
  currentHijri: IslamicEventsResponse['currentHijri'] | null
  isRamadan: boolean
  ramadanStart: string | null
  ramadanEnd: string | null
  loading: boolean
  error: string | null
}

/** Compute countdowns from raw event dates relative to today. */
function enrichEvents(events: IslamicEventDate[]): IslamicEventWithCountdown[] {
  const todayStr = new Date().toISOString().split('T')[0]

  return events.map((ev) => {
    const startMs = new Date(ev.startDate + 'T00:00:00').getTime()
    const endMs = new Date(ev.endDate + 'T00:00:00').getTime()
    const todayMs = new Date(todayStr + 'T00:00:00').getTime()

    const isActive = todayMs >= startMs && todayMs <= endMs
    const daysUntil = isActive
      ? 0
      : Math.ceil((startMs - todayMs) / (1000 * 60 * 60 * 24))

    const currentDay = isActive
      ? Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1
      : null

    return { ...ev, daysUntil, isActive, currentDay }
  })
}

export function useIslamicEvents() {
  const [state, setState] = useState<IslamicEventsState>({
    events: [],
    currentHijri: null,
    isRamadan: false,
    ramadanStart: null,
    ramadanEnd: null,
    loading: true,
    error: null,
  })

  // Keep raw events for re-enrichment when the clock ticks over midnight
  const [rawEvents, setRawEvents] = useState<IslamicEventDate[]>([])

  const fetchEvents = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const res = await fetch('/api/islamic-events')
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data: IslamicEventsResponse = await res.json()
      setRawEvents(data.events)

      setState({
        events: enrichEvents(data.events),
        currentHijri: data.currentHijri,
        isRamadan: data.isRamadan,
        ramadanStart: data.ramadanStart,
        ramadanEnd: data.ramadanEnd,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('[useIslamicEvents] Fetch error:', err)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load events',
      }))
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Refresh countdowns at the top of each minute so daysUntil stays current
  useEffect(() => {
    if (rawEvents.length === 0) return

    const msUntilNextMinute = 60_000 - (Date.now() % 60_000)
    let intervalId: ReturnType<typeof setInterval>

    const startInterval = () => {
      setState((prev) => ({
        ...prev,
        events: enrichEvents(rawEvents),
      }))
      intervalId = setInterval(() => {
        setState((prev) => ({
          ...prev,
          events: enrichEvents(rawEvents),
        }))
      }, 60_000)
    }

    const timeoutId = setTimeout(startInterval, msUntilNextMinute)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [rawEvents])

  return {
    ...state,
    refetch: fetchEvents,
  }
}
