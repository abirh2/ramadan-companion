/**
 * Widget Bridge -- writes data to shared native storage so home screen widgets
 * can read it without requiring the app to be open.
 *
 * On iOS  -> @capacitor/preferences writes to UserDefaults.standard with a
 *           key prefix (default "CapacitorStorage."). AppDelegate observes
 *           these writes and mirrors the values (stripping the prefix) into
 *           the App Group UserDefaults suite (group.com.deencompanion.app)
 *           which the widget extension reads via SharedDefaults.
 *
 * On Android -> @capacitor/preferences writes to SharedPreferences file
 *              "CapacitorStorage" which the widget BroadcastReceivers read directly.
 *
 * All write functions are no-ops when running in a browser (Capacitor not present).
 */

import { Capacitor } from '@capacitor/core'
import {
  PRAYER_WIDGET_SNAPSHOT_KEY,
  type PrayerWidgetSnapshot,
} from '@/lib/widgetSnapshot'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

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

// --------------------------------------------------------------------------
// Internal helpers
// --------------------------------------------------------------------------

function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

async function refreshAndroidPrayerWidgets(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    const { registerPlugin } = await import('@capacitor/core')
    const WidgetRefresh = registerPlugin<{ refresh: () => Promise<void> }>('WidgetRefresh')
    await WidgetRefresh.refresh()
  } catch (err) {
    console.warn('[widgetBridge] Android widget refresh failed:', err)
  }
}

async function set(key: string, value: string): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key, value })
}

async function setAll(pairs: Record<string, string>): Promise<void> {
  await Promise.all(Object.entries(pairs).map(([key, value]) => set(key, value)))
}

async function removeAll(keys: string[]): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences')
  await Promise.all(keys.map((key) => Preferences.remove({ key })))
}

const DEPRECATED_PRIVATE_WIDGET_KEYS = [
  'widget_config_lat',
  'widget_config_lng',
  'widget_config_method',
  'widget_config_madhab',
  'widget_config_timezone',
  'widget_config_update',
  'widget_charity_monthly',
  'widget_charity_yearly',
  'widget_charity_currency',
  'widget_charity_update',
]

export async function purgeDeprecatedPrivateWidgetData(): Promise<void> {
  if (!isNative()) return
  try {
    await removeAll(DEPRECATED_PRIVATE_WIDGET_KEYS)
  } catch (err) {
    console.warn('[widgetBridge] Private widget cache cleanup failed:', err)
  }
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
 * Write the versioned prayer cache used by both native widget implementations.
 * Precise coordinates and account data are intentionally excluded. Removing the
 * former config keys migrates existing Android installs away from native prayer
 * calculation; iOS also purges its mirrored App Group copy in AppDelegate.
 */
export async function updatePrayerWidgetSnapshot(
  snapshot: PrayerWidgetSnapshot
): Promise<void> {
  if (!isNative()) return
  try {
    await set(PRAYER_WIDGET_SNAPSHOT_KEY, JSON.stringify(snapshot))
    await removeAll(DEPRECATED_PRIVATE_WIDGET_KEYS)
    await refreshAndroidPrayerWidgets()
  } catch (err) {
    console.warn('[widgetBridge] updatePrayerWidgetSnapshot failed:', err)
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
