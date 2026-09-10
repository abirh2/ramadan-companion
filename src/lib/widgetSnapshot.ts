export const PRAYER_WIDGET_SNAPSHOT_KEY = 'widget_prayer_snapshot_v1'

export type WidgetPrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface WidgetPrayerOccurrence {
  name: WidgetPrayerName
  time: string
  timestamp: string
  dayKey: string
}

export interface WidgetPrayerDay {
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface PrayerWidgetSnapshot {
  version: 1
  generatedAt: string
  expiresAt: string
  locationLabel: string
  timezone: string
  gregorianDate: string
  hijriDate: string
  prayers: WidgetPrayerOccurrence[]
  nextPrayer: WidgetPrayerOccurrence
  deepLink: '/times'
}

interface CreatePrayerWidgetSnapshotInput {
  generatedAt: string
  locationLabel: string
  timezone: string
  gregorianDate: string
  hijriDate: string
  prayers: WidgetPrayerOccurrence[]
}

const PRAYER_NAMES = new Set<WidgetPrayerName>([
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
])

const STALE_GRACE_MS = 6 * 60 * 60 * 1000

const PRAYER_FIELDS: Array<[WidgetPrayerName, keyof WidgetPrayerDay]> = [
  ['Fajr', 'fajr'],
  ['Dhuhr', 'dhuhr'],
  ['Asr', 'asr'],
  ['Maghrib', 'maghrib'],
  ['Isha', 'isha'],
]

function format12Hour(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

/** Local calendar day containing `iso`, matching createPrayerOccurrences timestamps. */
function startOfLocalDayMs(iso: string): number {
  const date = new Date(iso)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Converts the app-owned local schedule into absolute occurrences for native readers. */
export function createPrayerOccurrences(
  schedule: Record<string, WidgetPrayerDay>
): WidgetPrayerOccurrence[] {
  const occurrences: WidgetPrayerOccurrence[] = []

  for (const dateKey of Object.keys(schedule).sort()) {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
    if (!dateMatch) continue

    const [, yearText, monthText, dayText] = dateMatch
    const year = Number(yearText)
    const monthIndex = Number(monthText) - 1
    const day = Number(dayText)

    for (const [name, field] of PRAYER_FIELDS) {
      const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(schedule[dateKey][field])
      if (!timeMatch) continue

      const hours = Number(timeMatch[1])
      const minutes = Number(timeMatch[2])
      if (hours > 23 || minutes > 59) continue

      const timestamp = new Date(year, monthIndex, day, hours, minutes, 0, 0)
      if (
        timestamp.getFullYear() !== year ||
        timestamp.getMonth() !== monthIndex ||
        timestamp.getDate() !== day
      ) {
        continue
      }

      occurrences.push({
        name,
        time: format12Hour(hours, minutes),
        timestamp: timestamp.toISOString(),
        dayKey: dateKey,
      })
    }
  }

  return occurrences
}

/**
 * Produces the privacy-minimal, versioned contract consumed by native widgets.
 * Prayer calculation stays in the web app; native code only selects entries by
 * timestamp and schedules platform-appropriate refreshes.
 *
 * Includes the full current local day (past + future) so daily-schedule widgets
 * can render all five times, plus remaining future days for next-prayer timelines.
 */
export function createPrayerWidgetSnapshot(
  input: CreatePrayerWidgetSnapshotInput
): PrayerWidgetSnapshot | null {
  const generatedAtMs = Date.parse(input.generatedAt)
  if (!Number.isFinite(generatedAtMs)) return null

  const dayStartMs = startOfLocalDayMs(input.generatedAt)

  const prayers = input.prayers
    .filter((prayer) => {
      const timestamp = Date.parse(prayer.timestamp)
      return (
        PRAYER_NAMES.has(prayer.name) &&
        prayer.time.trim().length > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(prayer.dayKey) &&
        Number.isFinite(timestamp) &&
        timestamp >= dayStartMs
      )
    })
    .map((prayer) => ({ ...prayer, time: prayer.time.trim() }))
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))

  const nextPrayer = prayers.find((prayer) => Date.parse(prayer.timestamp) > generatedAtMs)
  const lastPrayer = prayers.at(-1)
  if (!nextPrayer || !lastPrayer) return null

  return {
    version: 1,
    generatedAt: new Date(generatedAtMs).toISOString(),
    expiresAt: new Date(Date.parse(lastPrayer.timestamp) + STALE_GRACE_MS).toISOString(),
    locationLabel: input.locationLabel.trim().slice(0, 80),
    timezone: input.timezone.trim(),
    gregorianDate: input.gregorianDate.trim(),
    hijriDate: input.hijriDate.trim(),
    prayers,
    nextPrayer,
    deepLink: '/times',
  }
}
