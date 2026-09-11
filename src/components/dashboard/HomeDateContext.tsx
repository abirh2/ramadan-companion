'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HIJRI_MONTHS } from '@/types/calendar.types'
import type { DateInfo, HijriDateInfo } from '@/types/calendar.types'

interface TodayData {
  gregorian: DateInfo
  hijri: HijriDateInfo
}

export function HomeDateContext() {
  const [todayData, setTodayData] = useState<TodayData | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchToday() {
      try {
        const today = new Date()
        const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`
        const response = await fetch(`/api/calendar/convert?date=${date}&direction=gToH`, {
          signal: controller.signal,
        })
        if (!response.ok) return
        const result = await response.json()
        setTodayData(result.data)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Unable to load Hijri date:', error)
        }
      }
    }

    fetchToday()
    return () => controller.abort()
  }, [])

  const today = new Date()
  const gregorian = todayData
    ? `${todayData.gregorian.weekday}, ${todayData.gregorian.monthName} ${todayData.gregorian.day}`
    : today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const year = todayData?.gregorian.year ?? today.getFullYear()
  const hijriMonthArabic = todayData
    ? HIJRI_MONTHS.find((month) => month.number === todayData.hijri.month)?.ar
    : null

  return (
    <header className="grid min-w-0 grid-cols-1 items-center px-1 min-[24rem]:grid-cols-[minmax(0,1fr)_auto]">
      <p className="type-caption text-text-secondary">{year}</p>
      <h1 className="type-section-title mt-0.5 text-text-primary min-[24rem]:col-span-2">
        {gregorian}
      </h1>
      <div className="mt-1.5 flex min-h-6 min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        {todayData ? (
          <>
            <p className="type-body-secondary text-text-secondary">
              {todayData.hijri.day} {todayData.hijri.monthName} {todayData.hijri.year}
            </p>
            {hijriMonthArabic && (
              <p className="text-base leading-none text-gold" lang="ar" dir="rtl">
                {hijriMonthArabic}
              </p>
            )}
          </>
        ) : (
          <span className="h-4 w-36 animate-pulse rounded-control-sm bg-surface-grouped" aria-label="Loading Hijri date" />
        )}
      </div>
      <Link
        href="/calendar"
        className="type-nav mt-1 inline-flex min-h-touch shrink-0 items-center gap-1 justify-self-start rounded-control px-2 text-teal hover:bg-teal-muted min-[24rem]:row-start-3 min-[24rem]:ml-2 min-[24rem]:mt-0 min-[24rem]:justify-self-auto"
        aria-label="Open Islamic calendar"
      >
        Calendar
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </header>
  )
}
