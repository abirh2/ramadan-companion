'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { HijriDateInfo, DateInfo } from '@/types/calendar.types'

export function CalendarCard() {
  const [todayData, setTodayData] = useState<{
    gregorian: DateInfo
    hijri: HijriDateInfo
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTodayDate() {
      try {
        const today = new Date()
        const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`
        
        const response = await fetch(`/api/calendar/convert?date=${dateStr}&direction=gToH`)
        if (!response.ok) {
          throw new Error('Failed to fetch date conversion')
        }

        const data = await response.json()
        setTodayData(data.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching today\'s date:', err)
        setError(err instanceof Error ? err.message : 'Failed to load date')
        setLoading(false)
      }
    }

    fetchTodayDate()
  }, [])

  // Format date for display
  const formatGregorianDate = (date: DateInfo) => {
    return `${date.weekday}, ${date.monthName} ${date.day}, ${date.year}`
  }

  const formatHijriDate = (date: HijriDateInfo) => {
    return `${date.day} ${date.monthName} ${date.year}`
  }

  // Loading state
  if (loading) {
    return (
      <Link href="/calendar" className="block" aria-label="Loading calendar data">
        <Card className="rounded-3xl shadow-sm transition-shadow hover:shadow-md" role="article" aria-busy="true">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Islamic Calendar
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 py-6">
            <div className="flex items-center justify-center" role="status">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Loading calendar...</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Error state
  if (error || !todayData) {
    return (
      <Link href="/calendar" className="block" aria-label="Unable to load calendar. Tap to view calendar.">
        <Card className="rounded-3xl shadow-sm transition-shadow hover:shadow-md" role="article" aria-live="polite">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Islamic Calendar
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold text-muted-foreground">Unable to load</p>
            <p className="text-xs text-muted-foreground">Tap to view calendar</p>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Success state
  const cardAriaLabel = `Today's date: ${formatGregorianDate(todayData.gregorian)} which corresponds to ${formatHijriDate(todayData.hijri)} in the Islamic calendar. Click to view full calendar.`

  return (
    <Link href="/calendar" className="block" aria-label={cardAriaLabel}>
      <Card className="rounded-3xl shadow-sm cursor-pointer transition-shadow hover:shadow-md" role="article">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Islamic Calendar
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {formatGregorianDate(todayData.gregorian)}
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatHijriDate(todayData.hijri)}
            </p>
          </div>
          <p className="text-base text-right font-serif text-muted-foreground" dir="rtl" lang="ar">
            {todayData.hijri.monthNameAr}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

