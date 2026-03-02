/**
 * Widget Bridge -- writes data to shared native storage so home screen widgets
 * can read it without requiring the app to be open.
 *
 * On iOS  -> @capacitor/preferences writes to UserDefaults.standard with a
 *           "group.com.deencompanion.app." key prefix (the configured group).
 *           AppDelegate observes these writes and mirrors the values to the
 *           real App Group UserDefaults suite (group.com.deencompanion.app)
 *           which the widget extension reads via SharedDefaults.
 *
 * On Android -> @capacitor/preferences writes to SharedPreferences file
 *              "CapacitorStorage" which the widget BroadcastReceivers read directly.
 *
 * All write functions are no-ops when running in a browser (Capacitor not present).
 */

import { Capacitor } from '@capacitor/core'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface PrayerWidgetData {
  /** e.g. "Fajr", "Dhuhr" */
  name: string
  /** Human-readable time in 12hr format, e.g. "5:30 AM" */
  time: string
  /** ISO date string of when the next prayer occurs (widget computes countdown) */
  targetTime: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface AllPrayersWidgetData {
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  /** 24hr times (HH:MM) for widget self-computation of next prayer */
  fajr24: string
  dhuhr24: string
  asr24: string
  maghrib24: string
  isha24: string
  /** Name of the next upcoming prayer, used for highlighting */
  nextPrayer: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface VerseWidgetData {
  /** Arabic text (RTL) */
  arabic: string
  /** English translation */
  translation: string
  /** Attribution line, e.g. "Surah Al-Fatiha 1:1" */
  source: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface HadithWidgetData {
  /** Arabic text (RTL) */
  arabic: string
  /** English translation */
  translation: string
  /** Attribution line, e.g. "Sahih Muslim 123" */
  source: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface ZikrWidgetData {
  /** Arabic text of current phrase */
  arabic: string
  /** Transliteration, e.g. "SubhanAllah" */
  transliteration: string
  /** Current counter value */
  count: number
  /** Target count (0 = no target / free count) */
  target: number
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface HijriWidgetData {
  /** Day of the Hijri month, e.g. "14" */
  day: string
  /** Hijri month name, e.g. "Ramadan" */
  monthName: string
  /** Hijri year, e.g. "1447" */
  year: string
  /** Gregorian date for context, e.g. "Feb 26" */
  gregorianDate: string
  /** Day of the week, e.g. "Friday" */
  weekday: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface CharityWidgetData {
  /** Formatted monthly total, e.g. "$45.00" */
  monthly: string
  /** Formatted yearly total, e.g. "$540.00" */
  yearly: string
  /** Currency symbol, e.g. "$" */
  currency: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface QiblaWidgetData {
  /** Bearing in degrees, e.g. "58.5" */
  direction: string
  /** Cardinal direction, e.g. "NE" */
  compass: string
  /** User's city name, e.g. "New York" */
  city: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface MosqueWidgetData {
  /** Name of the nearest mosque */
  name: string
  /** Formatted distance, e.g. "0.8 mi" */
  distance: string
  /** Address string */
  address: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface WidgetConfigData {
  /** Latitude, e.g. "40.7128" */
  lat: string
  /** Longitude, e.g. "-74.0060" */
  lng: string
  /** AlAdhan calculation method ID, e.g. "4" */
  calculationMethod: string
  /** AlAdhan madhab ID: "0" = Standard, "1" = Hanafi */
  madhab: string
  /** IANA timezone string, e.g. "America/New_York" */
  timezone: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface PrayerDaySchedule {
  fajr: string    // HH:MM 24hr
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface PrayerScheduleData {
  /** Map of ISO date string (YYYY-MM-DD) to prayer times for that day */
  schedule: Record<string, PrayerDaySchedule>
  /** ISO timestamp of last update */
  updatedAt: string
}

// --------------------------------------------------------------------------
// Internal helpers
// --------------------------------------------------------------------------

function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

async function set(key: string, value: string): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key, value })
}

async function setAll(pairs: Record<string, string>): Promise<void> {
  await Promise.all(Object.entries(pairs).map(([key, value]) => set(key, value)))
}

/** Convert "HH:MM" (24hr) to "H:MM AM/PM" (12hr) */
export function to12Hour(time24: string): string {
  const parts = time24.split(':')
  const h = parseInt(parts[0], 10)
  const m = parts[1]?.padStart(2, '0') ?? '00'
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m} ${period}`
}

const WIDGET_ARABIC_MAX = 300
const WIDGET_TRANSLATION_MAX = 250

function truncateForWidget(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - 1).trimEnd() + '\u2026'
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Write next-prayer widget data. Called once per prayer transition (not every second).
 * The widget generates its own countdown timeline entries from targetTime.
 */
export async function updatePrayerWidget(data: PrayerWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    // Compute a static countdown string for Android backward compatibility
    const diff = new Date(data.targetTime).getTime() - Date.now()
    let countdown = '---'
    if (diff > 0) {
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      countdown = h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    await setAll({
      widget_prayer_name: data.name,
      widget_prayer_time: data.time,
      widget_prayer_target_time: data.targetTime,
      widget_prayer_countdown: countdown,
      widget_prayer_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updatePrayerWidget failed:', err)
  }
}

/**
 * Write all five daily prayer times for the All Prayers widget.
 * Times should already be in 12hr format.
 */
export async function updateAllPrayersWidget(data: AllPrayersWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_all_prayers_fajr: data.fajr,
      widget_all_prayers_dhuhr: data.dhuhr,
      widget_all_prayers_asr: data.asr,
      widget_all_prayers_maghrib: data.maghrib,
      widget_all_prayers_isha: data.isha,
      widget_all_prayers_fajr_24: data.fajr24,
      widget_all_prayers_dhuhr_24: data.dhuhr24,
      widget_all_prayers_asr_24: data.asr24,
      widget_all_prayers_maghrib_24: data.maghrib24,
      widget_all_prayers_isha_24: data.isha24,
      widget_all_prayers_next: data.nextPrayer,
      widget_all_prayers_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateAllPrayersWidget failed:', err)
  }
}

/**
 * Write Quran verse widget data (quran only). Content is truncated to fit widgets.
 */
export async function updateVerseWidget(data: VerseWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_verse_type: 'quran',
      widget_verse_arabic: truncateForWidget(data.arabic, WIDGET_ARABIC_MAX),
      widget_verse_translation: truncateForWidget(data.translation, WIDGET_TRANSLATION_MAX),
      widget_verse_source: data.source,
      widget_verse_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateVerseWidget failed:', err)
  }
}

/**
 * Write Hadith widget data to dedicated hadith keys (separate from verse).
 */
export async function updateHadithWidget(data: HadithWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_hadith_arabic: truncateForWidget(data.arabic, WIDGET_ARABIC_MAX),
      widget_hadith_translation: truncateForWidget(data.translation, WIDGET_TRANSLATION_MAX),
      widget_hadith_source: data.source,
      widget_hadith_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateHadithWidget failed:', err)
  }
}

/**
 * Write zikr counter widget data.
 */
export async function updateZikrWidget(data: ZikrWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_zikr_arabic: data.arabic,
      widget_zikr_transliteration: data.transliteration,
      widget_zikr_count: String(data.count),
      widget_zikr_target: String(data.target),
      widget_zikr_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateZikrWidget failed:', err)
  }
}

/**
 * Read the zikr count stored by an iOS 17+ in-widget increment.
 */
export async function readWidgetZikrCount(): Promise<number | null> {
  if (!isNative()) return null
  try {
    const { Preferences } = await import('@capacitor/preferences')
    const result = await Preferences.get({ key: 'widget_zikr_count' })
    if (result.value === null) return null
    const parsed = parseInt(result.value, 10)
    return isNaN(parsed) ? null : parsed
  } catch (err) {
    console.warn('[widgetBridge] readWidgetZikrCount failed:', err)
    return null
  }
}

/**
 * Write Hijri (Islamic) date widget data.
 */
export async function updateHijriWidget(data: HijriWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_hijri_day: data.day,
      widget_hijri_month_name: data.monthName,
      widget_hijri_year: data.year,
      widget_hijri_gregorian_date: data.gregorianDate,
      widget_hijri_weekday: data.weekday,
      widget_hijri_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateHijriWidget failed:', err)
  }
}

/**
 * Write charity/donation tracker widget data.
 */
export async function updateCharityWidget(data: CharityWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_charity_monthly: data.monthly,
      widget_charity_yearly: data.yearly,
      widget_charity_currency: data.currency,
      widget_charity_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateCharityWidget failed:', err)
  }
}

/**
 * Write Qibla direction widget data.
 */
export async function updateQiblaWidget(data: QiblaWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_qibla_direction: data.direction,
      widget_qibla_compass: data.compass,
      widget_qibla_city: data.city,
      widget_qibla_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateQiblaWidget failed:', err)
  }
}

/**
 * Write nearest mosque widget data.
 */
export async function updateMosqueWidget(data: MosqueWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_mosque_name: data.name,
      widget_mosque_distance: data.distance,
      widget_mosque_address: data.address,
      widget_mosque_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateMosqueWidget failed:', err)
  }
}

/**
 * Write location + method config so widget extensions can self-compute prayer times.
 * This is the primary data source for Strategy B (embedded algorithm).
 */
export async function updateWidgetConfig(data: WidgetConfigData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_config_lat: data.lat,
      widget_config_lng: data.lng,
      widget_config_method: data.calculationMethod,
      widget_config_madhab: data.madhab,
      widget_config_timezone: data.timezone,
      widget_config_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateWidgetConfig failed:', err)
  }
}

/**
 * Write a 14-day prayer time schedule as a JSON blob.
 * Used as Strategy A fallback when the embedded algorithm has no config data.
 */
export async function updatePrayerSchedule(data: PrayerScheduleData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_prayer_schedule: JSON.stringify(data.schedule),
      widget_prayer_schedule_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updatePrayerSchedule failed:', err)
  }
}
