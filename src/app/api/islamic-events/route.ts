/**
 * GET /api/islamic-events
 *
 * Returns upcoming Islamic events with their Gregorian dates, computed from
 * the current Hijri date using the AlAdhan API for date conversion.
 *
 * Response is cached for 6 hours since Hijri dates only change once per day
 * and event dates shift slowly (11 days/year).
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, PUBLIC_LIMIT } from '@/lib/rateLimit'
import {
  ISLAMIC_EVENTS,
  getNextEventHijriYear,
  getNextJumua,
} from '@/lib/islamicEvents'

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1'

export interface IslamicEventDate {
  id: string
  name: string
  arabicName: string
  description: string
  icon: string
  /** ISO date string (YYYY-MM-DD) of the first day of the event. */
  startDate: string
  /** ISO date string of the last day of the event. */
  endDate: string
  durationDays: number
  flags?: {
    onlyDuringRamadan?: boolean
    isWeeklyJumua?: boolean
    isRamadan?: boolean
  }
}

export interface IslamicEventsResponse {
  events: IslamicEventDate[]
  currentHijri: {
    day: number
    month: number
    year: number
    monthName: string
  }
  isRamadan: boolean
  ramadanStart: string | null
  ramadanEnd: string | null
}

/**
 * Convert a Hijri date to Gregorian ISO string using AlAdhan.
 * Returns null if the conversion fails.
 */
async function hijriToGregorian(
  day: number,
  month: number,
  year: number
): Promise<string | null> {
  try {
    const url = `${ALADHAN_BASE_URL}/hToG/${day}-${month}-${year}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    const g = data?.data?.gregorian
    if (!g) return null
    const y = g.year
    const m = String(g.month.number).padStart(2, '0')
    const d = String(parseInt(g.day, 10)).padStart(2, '0')
    return `${y}-${m}-${d}`
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_LIMIT)
  if (limited) return limited

  try {
    // ── 1. Fetch today's Hijri date ───────────────────────────────────────
    const today = new Date()
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`

    const hijriRes = await fetch(`${ALADHAN_BASE_URL}/gToH/${dateStr}`, {
      next: { revalidate: 3600 },
    })

    if (!hijriRes.ok) {
      throw new Error('Failed to fetch current Hijri date')
    }

    const hijriData = await hijriRes.json()
    const currentHijriDay = parseInt(hijriData.data.hijri.day, 10)
    const currentHijriMonth = parseInt(hijriData.data.hijri.month.number, 10)
    const currentHijriYear = parseInt(hijriData.data.hijri.year, 10)
    const currentHijriMonthName = hijriData.data.hijri.month.en as string

    // ── 2. Convert upcoming event Hijri dates to Gregorian in parallel ────
    const todayMs = today.setHours(0, 0, 0, 0)

    const conversions = ISLAMIC_EVENTS
      .filter((ev) => !ev.flags?.isWeeklyJumua) // Jumu'ah is Gregorian — no conversion needed
      .map(async (ev) => {
        if (!ev.hijriMonth || !ev.hijriDay) return null

        // Skip Laylat al-Qadr outside Ramadan (will be filtered below)
        const hijriYear = getNextEventHijriYear(
          currentHijriMonth,
          currentHijriDay,
          ev.hijriMonth,
          ev.hijriDay,
          currentHijriYear
        )

        const startIso = await hijriToGregorian(ev.hijriDay, ev.hijriMonth, hijriYear)
        if (!startIso) return null

        return { ev, startIso, hijriYear }
      })

    const results = await Promise.all(conversions)

    // ── 3. Determine Ramadan window ───────────────────────────────────────
    const ramadanResult = results.find((r) => r?.ev.id === 'ramadan')
    const ramadanStartIso = ramadanResult?.startIso ?? null

    let ramadanEndIso: string | null = null
    let isRamadan = false

    if (ramadanStartIso) {
      const ramadanStart = new Date(ramadanStartIso + 'T00:00:00')
      // Eid al-Fitr is 1 Shawwal; Ramadan ends the day before. Estimate as start + 29 days.
      const ramadanEndDate = new Date(ramadanStart)
      ramadanEndDate.setDate(ramadanEndDate.getDate() + 29)
      ramadanEndIso = ramadanEndDate.toISOString().split('T')[0]

      const ramadanStartMs = ramadanStart.getTime()
      const ramadanEndMs = ramadanEndDate.getTime()
      isRamadan = todayMs >= ramadanStartMs && todayMs <= ramadanEndMs
    }

    // ── 4. Build Jumu'ah entry ────────────────────────────────────────────
    const jumua = ISLAMIC_EVENTS.find((ev) => ev.flags?.isWeeklyJumua)!
    const nextFriday = getNextJumua()
    const nextFridayIso = nextFriday.toISOString().split('T')[0]

    // ── 5. Assemble events, filtering past ones ───────────────────────────
    const events: IslamicEventDate[] = []

    for (const result of results) {
      if (!result) continue
      const { ev, startIso } = result

      // Skip Laylat al-Qadr if we are not in Ramadan
      if (ev.flags?.onlyDuringRamadan && !isRamadan) continue

      const startMs = new Date(startIso + 'T00:00:00').getTime()
      const endDate = new Date(startIso + 'T00:00:00')
      endDate.setDate(endDate.getDate() + ev.durationDays - 1)
      const endIso = endDate.toISOString().split('T')[0]

      // Only include events that haven't fully ended yet
      if (endDate.getTime() < todayMs) continue

      events.push({
        id: ev.id,
        name: ev.name,
        arabicName: ev.arabicName,
        description: ev.description,
        icon: ev.icon,
        startDate: startIso,
        endDate: endIso,
        durationDays: ev.durationDays,
        flags: ev.flags,
      })
    }

    // Add Jumu'ah
    events.push({
      id: jumua.id,
      name: jumua.name,
      arabicName: jumua.arabicName,
      description: jumua.description,
      icon: jumua.icon,
      startDate: nextFridayIso,
      endDate: nextFridayIso,
      durationDays: 1,
      flags: jumua.flags,
    })

    // Sort by startDate ascending (soonest first)
    events.sort((a, b) => a.startDate.localeCompare(b.startDate))

    const response: IslamicEventsResponse = {
      events,
      currentHijri: {
        day: currentHijriDay,
        month: currentHijriMonth,
        year: currentHijriYear,
        monthName: currentHijriMonthName,
      },
      isRamadan,
      ramadanStart: ramadanStartIso,
      ramadanEnd: ramadanEndIso,
    }

    return NextResponse.json(response, {
      headers: {
        // Cache at the CDN/browser level for 6 hours
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('[islamic-events] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Islamic events' },
      { status: 500 }
    )
  }
}
