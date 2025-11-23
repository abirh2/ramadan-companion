import type { ImportantDate, SchoolFilter } from '@/types/calendar.types'

/**
 * Important Islamic Dates Database
 * 
 * Each date includes:
 * - Hijri date (month + day)
 * - Significance level (high/medium/low)
 * - Schools that observe it (all schools or specific ones)
 * - Visual styling (color, icon)
 * - Description
 */

export const IMPORTANT_ISLAMIC_DATES: ImportantDate[] = [
  // ========================================
  // MONTH 1: MUHARRAM
  // ========================================
  {
    id: 'islamic-new-year',
    name: 'Islamic New Year',
    nameAr: 'رأس السنة الهجرية',
    hijriDate: { day: 1, month: 1 },
    significance: 'medium',
    branch: ['all'],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: '🌙',
    description: 'The first day of the Islamic calendar year, commemorating the Hijrah (migration) of Prophet Muhammad ﷺ from Makkah to Madinah.',
  },
  {
    id: 'ashura',
    name: 'Day of Ashura',
    nameAr: 'يوم عاشوراء',
    hijriDate: { day: 10, month: 1 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    icon: '📿',
    description: 'A day of fasting for Sunnis, commemorating Prophet Musa (Moses) being saved from Pharaoh. For Shia, a day of mourning for Imam Husayn\'s martyrdom at Karbala.',
  },
  {
    id: 'arbaeen',
    name: 'Arbaeen',
    nameAr: 'الأربعين',
    hijriDate: { day: 20, month: 2 },
    significance: 'high',
    branch: ['shia'],
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
    icon: '🕯️',
    description: 'Marks 40 days after Ashura, commemorating the martyrdom of Imam Husayn. One of the largest pilgrimages in the world.',
  },

  // ========================================
  // MONTH 3: RABI AL-AWWAL
  // ========================================
  {
    id: 'mawlid-standard',
    name: 'Mawlid al-Nabi',
    nameAr: 'مولد النبي',
    hijriDate: { day: 12, month: 3 },
    significance: 'medium',
    branch: ['sunni', 'shia'],
    controversial: true,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: '🕌',
    description: 'Birth of Prophet Muhammad ﷺ. Celebrated by many Muslims, though some scholars consider it an innovation (bid\'ah). Salafi scholars typically do not observe it.',
  },

  // ========================================
  // MONTH 7: RAJAB
  // ========================================
  {
    id: 'isra-miraj',
    name: 'Laylat al-Isra wal-Mi\'raj',
    nameAr: 'ليلة الإسراء والمعراج',
    hijriDate: { day: 27, month: 7 },
    significance: 'medium',
    branch: ['all'],
    controversial: true,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: '⭐',
    description: 'The Night Journey and Ascension. Commemorates Prophet Muhammad\'s ﷺ miraculous journey from Makkah to Jerusalem and ascension to the heavens. Some scholars consider specific observances bid\'ah.',
  },

  // ========================================
  // MONTH 8: SHA'BAN
  // ========================================
  {
    id: 'laylat-al-baraa',
    name: 'Laylat al-Bara\'ah',
    nameAr: 'ليلة البراءة',
    hijriDate: { day: 15, month: 8 },
    significance: 'medium',
    branch: ['sunni'],
    controversial: true,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    icon: '🌟',
    description: 'The Night of Forgiveness, also called Shab-e-Barat. A night of worship and seeking forgiveness. Some scholars consider specific observances weak or without basis.',
  },

  // ========================================
  // MONTH 9: RAMADAN
  // ========================================
  {
    id: 'ramadan-begins',
    name: 'First Day of Ramadan',
    nameAr: 'أول رمضان',
    hijriDate: { day: 1, month: 9 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: '🌙',
    description: 'The beginning of the holy month of fasting. Muslims fast from dawn to sunset, engage in increased worship, and seek to purify their souls.',
  },
  {
    id: 'laylat-al-qadr',
    name: 'Laylat al-Qadr',
    nameAr: 'ليلة القدر',
    hijriDate: { day: 27, month: 9 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: '⭐',
    description: 'The Night of Power. Better than a thousand months. The Quran was first revealed on this night. Sought in the last 10 nights of Ramadan, especially odd nights.',
  },
  {
    id: 'last-10-nights-ramadan',
    name: 'Last 10 Nights of Ramadan',
    nameAr: 'العشر الأواخر من رمضان',
    hijriDate: { day: 21, month: 9 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    icon: '🌟',
    description: 'The most blessed nights of the year. Muslims engage in intensive worship, seeking Laylat al-Qadr. Many perform I\'tikaf (spiritual retreat) in the mosque.',
  },

  // ========================================
  // MONTH 10: SHAWWAL
  // ========================================
  {
    id: 'eid-al-fitr',
    name: 'Eid al-Fitr',
    nameAr: 'عيد الفطر',
    hijriDate: { day: 1, month: 10 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    icon: '🕌',
    description: 'The Festival of Breaking the Fast. Celebrated after completing Ramadan. Muslims perform Eid prayer, give charity (Zakat al-Fitr), and celebrate with family.',
  },
  {
    id: 'six-days-shawwal',
    name: 'Six Days of Shawwal',
    nameAr: 'ستة أيام من شوال',
    hijriDate: { day: 2, month: 10 },
    significance: 'medium',
    branch: ['all'],
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    icon: '📿',
    description: 'Voluntary fasting of six days in Shawwal. Fasting these days after Ramadan is equivalent to fasting the entire year.',
  },

  // ========================================
  // MONTH 11: DHU AL-QI'DAH
  // ========================================
  {
    id: 'dhul-qidah-sacred',
    name: 'Sacred Month',
    nameAr: 'الشهر الحرام',
    hijriDate: { day: 1, month: 11 },
    significance: 'low',
    branch: ['all'],
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    icon: '🕊️',
    description: 'One of the four sacred months in Islam where fighting is prohibited. A time for increased worship and reflection.',
  },

  // ========================================
  // MONTH 12: DHU AL-HIJJAH
  // ========================================
  {
    id: 'first-10-days-dhul-hijjah',
    name: 'First 10 Days of Dhu al-Hijjah',
    nameAr: 'عشر ذي الحجة',
    hijriDate: { day: 1, month: 12 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: '📿',
    description: 'The most blessed days of the year. Good deeds during these days are beloved to Allah. Many Muslims fast, especially on the Day of Arafah.',
  },
  {
    id: 'day-of-arafah',
    name: 'Day of Arafah',
    nameAr: 'يوم عرفة',
    hijriDate: { day: 9, month: 12 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: '⛰️',
    description: 'The most important day of Hajj. Pilgrims stand on the plain of Arafat. Fasting this day for non-pilgrims expiates sins of two years.',
  },
  {
    id: 'eid-al-adha',
    name: 'Eid al-Adha',
    nameAr: 'عيد الأضحى',
    hijriDate: { day: 10, month: 12 },
    significance: 'high',
    branch: ['all'],
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: '🕌',
    description: 'The Festival of Sacrifice. Commemorates Prophet Ibrahim\'s willingness to sacrifice his son. Muslims perform Eid prayer and may sacrifice an animal.',
  },
  {
    id: 'days-of-tashriq',
    name: 'Days of Tashriq',
    nameAr: 'أيام التشريق',
    hijriDate: { day: 11, month: 12 },
    significance: 'medium',
    branch: ['all'],
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    icon: '🕌',
    description: 'The three days following Eid al-Adha (11th, 12th, 13th). Days of eating, drinking, and remembering Allah. Pilgrims complete Hajj rituals.',
  },
  {
    id: 'eid-al-ghadir',
    name: 'Eid al-Ghadir',
    nameAr: 'عيد الغدير',
    hijriDate: { day: 18, month: 12 },
    significance: 'high',
    branch: ['shia'],
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: '🎊',
    description: 'Commemorates Prophet Muhammad\'s ﷺ declaration at Ghadir Khumm, where Shia Muslims believe he appointed Ali ibn Abi Talib as his successor. One of the most important Shia holidays.',
  },
]

/**
 * Get important dates for a specific Hijri month, filtered by school preferences
 */
export function getImportantDatesForMonth(
  hijriMonth: number,
  hijriYear: number,
  filters: SchoolFilter
): ImportantDate[] {
  return IMPORTANT_ISLAMIC_DATES.filter((date) => {
    // Filter by month
    if (date.hijriDate.month !== hijriMonth) {
      return false
    }

    // Filter by branch
    if (date.branch.includes('all')) {
      return true
    }

    // Check if any of the enabled branches match
    return date.branch.some((branch) => {
      const branchKey = branch as keyof SchoolFilter
      return filters[branchKey] === true
    })
  })
}

/**
 * Check if a specific Hijri date is important
 */
export function isImportantDate(
  hijriDay: number,
  hijriMonth: number,
  filters: SchoolFilter
): boolean {
  return IMPORTANT_ISLAMIC_DATES.some((date) => {
    if (date.hijriDate.day !== hijriDay || date.hijriDate.month !== hijriMonth) {
      return false
    }

    if (date.branch.includes('all')) {
      return true
    }

    return date.branch.some((branch) => {
      const branchKey = branch as keyof SchoolFilter
      return filters[branchKey] === true
    })
  })
}

/**
 * Get all important dates for a specific Hijri day
 */
export function getImportantDatesForDay(
  hijriDay: number,
  hijriMonth: number,
  filters: SchoolFilter
): ImportantDate[] {
  return IMPORTANT_ISLAMIC_DATES.filter((date) => {
    if (date.hijriDate.day !== hijriDay || date.hijriDate.month !== hijriMonth) {
      return false
    }

    if (date.branch.includes('all')) {
      return true
    }

    return date.branch.some((branch) => {
      const branchKey = branch as keyof SchoolFilter
      return filters[branchKey] === true
    })
  })
}

/**
 * Get icon emoji for a date type
 */
export function getDateIcon(dateId: string): string {
  const date = IMPORTANT_ISLAMIC_DATES.find((d) => d.id === dateId)
  return date?.icon || '📅'
}

/**
 * Get all unique months that have important dates
 */
export function getMonthsWithImportantDates(): number[] {
  const months = new Set(IMPORTANT_ISLAMIC_DATES.map((date) => date.hijriDate.month))
  return Array.from(months).sort((a, b) => a - b)
}

/**
 * Count important dates in a month based on filters
 */
export function countImportantDatesInMonth(
  hijriMonth: number,
  filters: SchoolFilter
): number {
  return getImportantDatesForMonth(hijriMonth, 0, filters).length // Year not needed for count
}

/**
 * Check if entire month is significant (e.g., Ramadan)
 */
export function isSignificantMonth(hijriMonth: number): boolean {
  // Month 9 (Ramadan) is significant
  return hijriMonth === 9
}

/**
 * Get default branch filter (Sunni enabled by default)
 */
export function getDefaultSchoolFilter(): SchoolFilter {
  return {
    sunni: true,
    shia: false,
    ibadi: false,
  }
}

