'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, Loader2, Clock } from 'lucide-react'
import type { PrayerTime, CalculationMethodId, MadhabId, LocationData } from '@/types/ramadan.types'

interface DateSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLocation: LocationData | null
  calculationMethod: CalculationMethodId
  madhab: MadhabId
}

interface DatePrayerTimes {
  date: string
  gregorianDate: string
  hijriDate: string
  times: PrayerTime | null
  loading: boolean
  error: string | null
}

export function DateSelectorModal({
  open,
  onOpenChange,
  currentLocation,
  calculationMethod,
  madhab,
}: DateSelectorModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateTimes, setDateTimes] = useState<DatePrayerTimes>({
    date: '',
    gregorianDate: '',
    hijriDate: '',
    times: null,
    loading: false,
    error: null,
  })

  // Fetch prayer times for selected date
  const fetchPrayerTimesForDate = async (date: Date) => {
    if (!currentLocation) {
      setDateTimes({
        date: date.toISOString().split('T')[0],
        gregorianDate: '',
        hijriDate: '',
        times: null,
        loading: false,
        error: 'Location not available',
      })
      return
    }

    setDateTimes((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const formattedDate = `${day}-${month}-${year}`

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const response = await fetch(
        `/api/prayertimes?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&method=${calculationMethod}&school=${madhab}&timezone=${encodeURIComponent(timezone)}&date=${formattedDate}`,
        { signal: AbortSignal.timeout(10000) }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch prayer times: ${response.status}`)
      }

      const data = await response.json()

      // Format dates
      const gregorianFormatted = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const hijriFormatted = data.data.date.hijri
        ? `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`
        : ''

      setDateTimes({
        date: date.toISOString().split('T')[0],
        gregorianDate: gregorianFormatted,
        hijriDate: hijriFormatted,
        times: data.data.timings,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching prayer times for date:', error)
      setDateTimes({
        date: date.toISOString().split('T')[0],
        gregorianDate: '',
        hijriDate: '',
        times: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prayer times',
      })
    }
  }

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      fetchPrayerTimesForDate(date)
    }
  }

  // Handle going back to today
  const handleToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setDateTimes({
      date: '',
      gregorianDate: '',
      hijriDate: '',
      times: null,
      loading: false,
      error: null,
    })
  }

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Prayer Times for Date
          </DialogTitle>
          <DialogDescription>
            Select a date to view prayer times for that day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-lg border"
              disabled={(date) => {
                // Disable dates more than 1 year in the future
                const oneYearFromNow = new Date()
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
                return date > oneYearFromNow
              }}
            />
          </div>

          {/* Date Information */}
          {dateTimes.gregorianDate && (
            <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">{dateTimes.gregorianDate}</p>
              {dateTimes.hijriDate && (
                <p className="text-xs text-muted-foreground">{dateTimes.hijriDate}</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {dateTimes.loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {dateTimes.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{dateTimes.error}</p>
            </div>
          )}

          {/* Prayer Times Display */}
          {dateTimes.times && !dateTimes.loading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Prayer Times</p>
              <div className="space-y-1 border rounded-lg overflow-hidden">
                {prayerNames.map((prayer) => (
                  <div
                    key={prayer}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{prayer}</span>
                      {prayer === 'Sunrise' && (
                        <span className="text-xs text-muted-foreground">(Not a prayer)</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {dateTimes.times && formatTime(dateTimes.times[prayer])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return to Today Button */}
          <Button onClick={handleToday} variant="outline" className="w-full">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Back to Today
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
