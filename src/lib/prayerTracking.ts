// Prayer Tracking Utility Functions

import type {
  PrayerTrackingRecord,
  DailyPrayerCompletion,
  PrayerStatistics,
  TimeRange,
  PrayerName,
} from '@/types/prayer-tracking.types'

const STORAGE_PREFIX = 'prayer_tracking_'

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get date range for a given time range filter
 */
export function getDateRangeForTimeRange(
  range: TimeRange,
  accountCreatedAt?: string | null
): { startDate: string; endDate: string } {
  const endDate = getTodayDateString()
  const today = new Date()
  let startDate: Date

  switch (range) {
    case '7days':
      startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 6) // Last 7 days including today
      break
    case '30days':
      startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 29) // Last 30 days including today
      break
    case '90days':
      startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 89) // Last 90 days including today
      break
    case 'all':
      // For "all time", start from account creation or 2 years ago if not provided
      if (accountCreatedAt) {
        startDate = new Date(accountCreatedAt)
      } else {
        startDate = new Date(today)
        startDate.setFullYear(startDate.getFullYear() - 2)
      }
      break
  }

  const year = startDate.getFullYear()
  const month = String(startDate.getMonth() + 1).padStart(2, '0')
  const day = String(startDate.getDate()).padStart(2, '0')
  const startDateString = `${year}-${month}-${day}`

  return { startDate: startDateString, endDate }
}

/**
 * Calculate statistics from prayer tracking records
 */
export function calculateStatistics(
  records: PrayerTrackingRecord[],
  timeRange: TimeRange,
  accountCreatedAt?: string | null
): PrayerStatistics {
  const { startDate } = getDateRangeForTimeRange(timeRange, accountCreatedAt)
  const endDate = getTodayDateString()

  // Filter records by date range
  const filteredRecords = records.filter((record) => {
    return record.date >= startDate && record.date <= endDate
  })

  // Calculate total days in range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  // Initialize counters
  let totalCompleted = 0
  const prayerCounts = {
    Fajr: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
  }

  // Convert records to daily completions
  const dailyCompletions: DailyPrayerCompletion[] = []

  // Create map of existing records
  const recordMap = new Map<string, PrayerTrackingRecord>()
  filteredRecords.forEach((record) => {
    recordMap.set(record.date, record)
  })

  // Generate daily completions for all days in range
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateString = date.toISOString().split('T')[0]

    const record = recordMap.get(dateString)
    const completion: DailyPrayerCompletion = {
      date: dateString,
      fajr_completed: record?.fajr_completed ?? false,
      dhuhr_completed: record?.dhuhr_completed ?? false,
      asr_completed: record?.asr_completed ?? false,
      maghrib_completed: record?.maghrib_completed ?? false,
      isha_completed: record?.isha_completed ?? false,
      totalCompleted: 0,
      completionRate: 0,
    }

    // Calculate total completed for this day
    let dayCompleted = 0
    if (completion.fajr_completed) dayCompleted++
    if (completion.dhuhr_completed) dayCompleted++
    if (completion.asr_completed) dayCompleted++
    if (completion.maghrib_completed) dayCompleted++
    if (completion.isha_completed) dayCompleted++

    completion.totalCompleted = dayCompleted
    completion.completionRate = (dayCompleted / 5) * 100

    dailyCompletions.push(completion)

    // Update totals
    totalCompleted += dayCompleted
    if (completion.fajr_completed) prayerCounts.Fajr++
    if (completion.dhuhr_completed) prayerCounts.Dhuhr++
    if (completion.asr_completed) prayerCounts.Asr++
    if (completion.maghrib_completed) prayerCounts.Maghrib++
    if (completion.isha_completed) prayerCounts.Isha++
  }

  const totalPrayers = totalDays * 5
  const overallCompletionRate = totalPrayers > 0 ? (totalCompleted / totalPrayers) * 100 : 0

  return {
    totalDays,
    totalPrayers,
    completedPrayers: totalCompleted,
    overallCompletionRate,
    byPrayer: {
      Fajr: {
        completed: prayerCounts.Fajr,
        total: totalDays,
        rate: totalDays > 0 ? (prayerCounts.Fajr / totalDays) * 100 : 0,
      },
      Dhuhr: {
        completed: prayerCounts.Dhuhr,
        total: totalDays,
        rate: totalDays > 0 ? (prayerCounts.Dhuhr / totalDays) * 100 : 0,
      },
      Asr: {
        completed: prayerCounts.Asr,
        total: totalDays,
        rate: totalDays > 0 ? (prayerCounts.Asr / totalDays) * 100 : 0,
      },
      Maghrib: {
        completed: prayerCounts.Maghrib,
        total: totalDays,
        rate: totalDays > 0 ? (prayerCounts.Maghrib / totalDays) * 100 : 0,
      },
      Isha: {
        completed: prayerCounts.Isha,
        total: totalDays,
        rate: totalDays > 0 ? (prayerCounts.Isha / totalDays) * 100 : 0,
      },
    },
    dailyCompletions,
  }
}

/**
 * Save today's prayer completion to localStorage
 */
export function saveTodayToLocalStorage(completion: DailyPrayerCompletion): void {
  if (typeof window === 'undefined') return

  try {
    const key = `${STORAGE_PREFIX}${completion.date}`
    localStorage.setItem(key, JSON.stringify(completion))
  } catch (error) {
    console.error('Failed to save prayer tracking to localStorage:', error)
  }
}

/**
 * Get today's prayer completion from localStorage
 */
export function getTodayFromLocalStorage(): DailyPrayerCompletion | null {
  if (typeof window === 'undefined') return null

  try {
    const today = getTodayDateString()
    const key = `${STORAGE_PREFIX}${today}`
    const stored = localStorage.getItem(key)

    if (stored) {
      const completion = JSON.parse(stored) as DailyPrayerCompletion
      return completion
    }

    // Return default empty completion for today
    return {
      date: today,
      fajr_completed: false,
      dhuhr_completed: false,
      asr_completed: false,
      maghrib_completed: false,
      isha_completed: false,
      totalCompleted: 0,
      completionRate: 0,
    }
  } catch (error) {
    console.error('Failed to load prayer tracking from localStorage:', error)
    return null
  }
}

/**
 * Clear old localStorage data (cleanup)
 * Removes all prayer tracking data except today's
 */
export function clearOldLocalStorageData(): void {
  if (typeof window === 'undefined') return

  try {
    const today = getTodayDateString()
    const todayKey = `${STORAGE_PREFIX}${today}`
    const keysToRemove: string[] = []

    // Find all prayer tracking keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX) && key !== todayKey) {
        keysToRemove.push(key)
      }
    }

    // Remove old keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Failed to clear old prayer tracking data:', error)
  }
}

/**
 * Sync today's localStorage data to database for authenticated user
 */
export async function syncLocalStorageToDatabase(userId: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const todayCompletion = getTodayFromLocalStorage()
    if (!todayCompletion) return

    // Only sync if there's at least one completed prayer
    if (todayCompletion.totalCompleted === 0) return

    // Import Supabase client
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // Check if record exists for today
    const { data: existing } = await supabase
      .from('prayer_tracking')
      .select('id')
      .eq('user_id', userId)
      .eq('date', todayCompletion.date)
      .single()

    const record = {
      user_id: userId,
      date: todayCompletion.date,
      fajr_completed: todayCompletion.fajr_completed,
      dhuhr_completed: todayCompletion.dhuhr_completed,
      asr_completed: todayCompletion.asr_completed,
      maghrib_completed: todayCompletion.maghrib_completed,
      isha_completed: todayCompletion.isha_completed,
    }

    if (existing) {
      // Update existing record
      await supabase
        .from('prayer_tracking')
        .update(record)
        .eq('id', existing.id)
    } else {
      // Insert new record
      await supabase.from('prayer_tracking').insert(record)
    }

    console.log('Synced localStorage prayer tracking to database')
  } catch (error) {
    console.error('Failed to sync prayer tracking to database:', error)
  }
}

/**
 * Convert prayer name to database column name
 */
export function prayerToColumnName(prayer: PrayerName): string {
  return `${prayer.toLowerCase()}_completed`
}

/**
 * Get midnight time for today (for reset logic)
 */
export function getMidnightToday(): Date {
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)
  return midnight
}

/**
 * Check if we've crossed midnight since last check
 */
export function hasCrossedMidnight(lastCheckDate: string): boolean {
  const today = getTodayDateString()
  return lastCheckDate !== today
}

