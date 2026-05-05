/**
 * Islamic calendar event definitions.
 *
 * Events are defined by their fixed Hijri date (month + day).
 * The Gregorian equivalent must be computed each year since the Hijri
 * calendar is purely lunar and shifts ~11 days earlier each Gregorian year.
 *
 * Jumu'ah is the exception — it is computed from the Gregorian calendar
 * (next Friday) rather than a Hijri date.
 */

export interface IslamicEventDefinition {
  /** Unique identifier used as a stable React key. */
  id: string
  /** Display name. */
  name: string
  /** Arabic name for display. */
  arabicName: string
  /** Short description shown on the card. */
  description: string
  /** Hijri month (1 = Muharram … 12 = Dhul Hijjah). Null for Gregorian events. */
  hijriMonth: number | null
  /** Hijri day within the month. Null for Gregorian events. */
  hijriDay: number | null
  /** Duration in days (1 = single day event). */
  durationDays: number
  /** Icon name from Lucide — component resolved in EventCard. */
  icon: string
  /** Special flags for runtime logic. */
  flags?: {
    /** Show countdown only during Ramadan (Laylat al-Qadr). */
    onlyDuringRamadan?: boolean
    /** Compute from next Friday instead of Hijri date. */
    isWeeklyJumua?: boolean
    /** Ramadan-specific: show iftar/suhoor timer when active instead of countdown. */
    isRamadan?: boolean
  }
}

export const ISLAMIC_EVENTS: IslamicEventDefinition[] = [
  {
    id: 'ramadan',
    name: 'Ramadan',
    arabicName: 'رمضان',
    description: 'The blessed month of fasting, prayer, and reflection',
    hijriMonth: 9,
    hijriDay: 1,
    durationDays: 30,
    icon: 'Moon',
    flags: { isRamadan: true },
  },
  {
    id: 'laylat-al-qadr',
    name: "Laylat al-Qadr",
    arabicName: 'لَيْلَةُ الْقَدْرِ',
    description: "The Night of Power — better than a thousand months",
    hijriMonth: 9,
    hijriDay: 27,
    durationDays: 1,
    icon: 'Star',
    flags: { onlyDuringRamadan: true },
  },
  {
    id: 'eid-al-fitr',
    name: 'Eid al-Fitr',
    arabicName: 'عِيدُ الْفِطْر',
    description: 'Festival of Breaking the Fast — celebrating the end of Ramadan',
    hijriMonth: 10,
    hijriDay: 1,
    durationDays: 3,
    icon: 'Gift',
  },
  {
    id: 'dhul-hijjah-first-10',
    name: 'First 10 Days of Dhul Hijjah',
    arabicName: 'أَوَّلُ عَشْرِ ذِي الْحِجَّة',
    description: 'The best days of the year — days of increased worship and dhikr',
    hijriMonth: 12,
    hijriDay: 1,
    durationDays: 10,
    icon: 'Calendar',
  },
  {
    id: 'eid-al-adha',
    name: 'Eid al-Adha',
    arabicName: 'عِيدُ الْأَضْحَى',
    description: 'Festival of Sacrifice — commemorating Ibrahim\'s devotion',
    hijriMonth: 12,
    hijriDay: 10,
    durationDays: 4,
    icon: 'Gift',
  },
  {
    id: 'islamic-new-year',
    name: 'Islamic New Year',
    arabicName: 'رَأْسُ السَّنَةِ الْهِجْرِيَّة',
    description: 'First day of Muharram — beginning of the new Hijri year',
    hijriMonth: 1,
    hijriDay: 1,
    durationDays: 1,
    icon: 'Sparkles',
  },
  {
    id: 'shaban-15',
    name: "15th of Sha'ban",
    arabicName: 'لَيْلَةُ النِّصْفِ مِنْ شَعْبَان',
    description: 'Night of forgiveness and blessings in the middle of Sha\'ban',
    hijriMonth: 8,
    hijriDay: 15,
    durationDays: 1,
    icon: 'Star',
  },
  {
    id: 'jummah',
    name: "Next Jumu'ah",
    arabicName: 'الْجُمُعَة',
    description: 'The weekly Friday prayer — the best day of the week',
    hijriMonth: null,
    hijriDay: null,
    durationDays: 1,
    icon: 'Users',
    flags: { isWeeklyJumua: true },
  },
]

/**
 * Determine the next Hijri year in which the given event month/day
 * falls on or after today's Hijri date.
 *
 * @param currentHijriMonth   Today's Hijri month (1–12)
 * @param currentHijriDay     Today's Hijri day (1–30)
 * @param eventMonth          Target event's Hijri month
 * @param eventDay            Target event's first Hijri day
 * @param currentHijriYear    Today's Hijri year
 */
export function getNextEventHijriYear(
  currentHijriMonth: number,
  currentHijriDay: number,
  eventMonth: number,
  eventDay: number,
  currentHijriYear: number
): number {
  if (
    eventMonth > currentHijriMonth ||
    (eventMonth === currentHijriMonth && eventDay >= currentHijriDay)
  ) {
    return currentHijriYear
  }
  return currentHijriYear + 1
}

/**
 * Calculate the Gregorian date of the next Jumu'ah (Friday).
 * Returns midnight UTC of the next Friday.
 */
export function getNextJumua(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday … 5 = Friday … 6 = Saturday
  // (5 - dayOfWeek + 7) % 7 yields 0 on Friday (today), 1 on Thursday, 6 on Saturday.
  // When the result is 0 today IS Friday, so we show today's Jumu'ah.
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7
  const friday = new Date(now)
  friday.setDate(friday.getDate() + daysUntilFriday)
  friday.setHours(0, 0, 0, 0)
  return friday
}
