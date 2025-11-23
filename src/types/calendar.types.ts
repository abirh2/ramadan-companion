// Islamic Calendar Types

/**
 * Calendar view modes
 */
export type CalendarView = 'gregorian' | 'islamic'

/**
 * Date object from API responses
 */
export interface DateInfo {
  day: number
  month: number
  year: number
  monthName: string
  weekday: string
  date: string // DD-MM-YYYY format
}

/**
 * Hijri date with Arabic translations
 */
export interface HijriDateInfo extends DateInfo {
  monthNameAr: string
  weekdayAr: string
}

/**
 * Unified calendar date object with both Gregorian and Hijri info
 */
export interface CalendarDate {
  gregorian: DateInfo
  hijri: HijriDateInfo
  isToday: boolean
  isSelected: boolean
  isImportant: boolean
  importantDates?: ImportantDate[]
}

/**
 * Islamic branches for filtering
 */
export type IslamicBranch = 
  | 'sunni'
  | 'shia' 
  | 'ibadi'
  | 'all'

/**
 * Important Islamic date metadata
 */
export interface ImportantDate {
  id: string
  name: string
  nameAr?: string
  hijriDate: { day: number; month: number }
  significance: 'high' | 'medium' | 'low'
  branch: IslamicBranch[]
  controversial?: boolean // Optional dates some scholars reject (e.g., Mawlid)
  color: string
  icon: string
  description: string
}

/**
 * Branch filter state (simplified from school/madhab)
 */
export interface SchoolFilter {
  sunni: boolean
  shia: boolean
  ibadi: boolean
}

/**
 * API Response Types
 */

// Hijri month API response
export interface HijriMonthApiResponse {
  code: number
  status: string
  data: Array<{
    gregorian: DateInfo
    hijri: HijriDateInfo
  }>
  meta: {
    hijriMonth: number
    hijriYear: number
    daysInMonth: number
  }
}

// Gregorian month API response
export interface GregorianMonthApiResponse {
  code: number
  status: string
  data: Array<{
    gregorian: DateInfo
    hijri: HijriDateInfo
  }>
  meta: {
    gregorianMonth: number
    gregorianYear: number
    daysInMonth: number
  }
}

// Date conversion API response
export interface DateConversionApiResponse {
  code: number
  status: string
  data: {
    gregorian: DateInfo
    hijri: HijriDateInfo
  }
  meta: {
    inputDate: string
    direction: 'gToH' | 'hToG'
  }
}

/**
 * Hook return types
 */
export interface UseCalendarResult {
  // State
  view: CalendarView
  currentMonth: number
  currentYear: number
  selectedDate: CalendarDate | null
  calendarDates: CalendarDate[]
  schoolFilters: SchoolFilter
  loading: boolean
  error: string | null
  
  // Actions
  setView: (view: CalendarView) => void
  goToNextMonth: () => void
  goToPreviousMonth: () => void
  goToToday: () => void
  selectDate: (date: CalendarDate) => void
  setSchoolFilters: (filters: SchoolFilter) => void
}

/**
 * Hijri month names (1-12)
 */
export const HIJRI_MONTHS = [
  { number: 1, en: 'Muharram', ar: 'مُحَرَّم' },
  { number: 2, en: 'Safar', ar: 'صَفَر' },
  { number: 3, en: 'Rabi\' al-Awwal', ar: 'رَبِيع الْأَوَّل' },
  { number: 4, en: 'Rabi\' al-Thani', ar: 'رَبِيع الثَّانِي' },
  { number: 5, en: 'Jumada al-Ula', ar: 'جُمَادَىٰ الْأُولَىٰ' },
  { number: 6, en: 'Jumada al-Akhirah', ar: 'جُمَادَىٰ الْآخِرَة' },
  { number: 7, en: 'Rajab', ar: 'رَجَب' },
  { number: 8, en: 'Sha\'ban', ar: 'شَعْبَان' },
  { number: 9, en: 'Ramadan', ar: 'رَمَضَان' },
  { number: 10, en: 'Shawwal', ar: 'شَوَّال' },
  { number: 11, en: 'Dhu al-Qi\'dah', ar: 'ذُو الْقَعْدَة' },
  { number: 12, en: 'Dhu al-Hijjah', ar: 'ذُو الْحِجَّة' },
] as const

/**
 * Gregorian month names (1-12)
 */
export const GREGORIAN_MONTHS = [
  { number: 1, name: 'January' },
  { number: 2, name: 'February' },
  { number: 3, name: 'March' },
  { number: 4, name: 'April' },
  { number: 5, name: 'May' },
  { number: 6, name: 'June' },
  { number: 7, name: 'July' },
  { number: 8, name: 'August' },
  { number: 9, name: 'September' },
  { number: 10, name: 'October' },
  { number: 11, name: 'November' },
  { number: 12, name: 'December' },
] as const

