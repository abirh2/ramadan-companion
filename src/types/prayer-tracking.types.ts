// Prayer Tracking Types

export interface PrayerTrackingRecord {
  id: string
  user_id: string
  date: string // YYYY-MM-DD format
  fajr_completed: boolean
  dhuhr_completed: boolean
  asr_completed: boolean
  maghrib_completed: boolean
  isha_completed: boolean
  created_at: string
  updated_at: string
}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface DailyPrayerCompletion {
  date: string // YYYY-MM-DD
  fajr_completed: boolean
  dhuhr_completed: boolean
  asr_completed: boolean
  maghrib_completed: boolean
  isha_completed: boolean
  totalCompleted: number // 0-5
  completionRate: number // 0-100
}

export interface PrayerStatistics {
  totalDays: number
  totalPrayers: number // total possible prayers in period
  completedPrayers: number
  overallCompletionRate: number // 0-100
  byPrayer: {
    Fajr: { completed: number; total: number; rate: number }
    Dhuhr: { completed: number; total: number; rate: number }
    Asr: { completed: number; total: number; rate: number }
    Maghrib: { completed: number; total: number; rate: number }
    Isha: { completed: number; total: number; rate: number }
  }
  dailyCompletions: DailyPrayerCompletion[]
}

export type TimeRange = '7days' | '30days' | '90days' | 'all'

export interface UsePrayerTrackingResult {
  todayCompletion: DailyPrayerCompletion | null
  statistics: PrayerStatistics | null
  timeRange: TimeRange
  loading: boolean
  error: string | null
  accountCreatedAt: string | null // ISO date string for authenticated users
  togglePrayer: (prayer: PrayerName) => Promise<void>
  setTimeRange: (range: TimeRange) => void
  refetch: () => Promise<void>
}

