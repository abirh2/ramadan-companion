/**
 * Widget Bridge — writes data to shared native storage so home screen widgets
 * can read it without requiring the app to be open.
 *
 * On iOS  → @capacitor/preferences maps to UserDefaults in the App Group
 *           "group.com.deencompanion.app" (requires the Preferences plugin group
 *           setting in capacitor.config.json and App Groups entitlement in Xcode).
 * On Android → @capacitor/preferences writes to SharedPreferences file
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
  /** Human-readable time, e.g. "5:30 AM" */
  time: string
  /** Countdown string, e.g. "2h 15m" */
  countdown: string
  /** ISO timestamp of last update */
  updatedAt: string
}

export interface VerseWidgetData {
  /** Source type — determines which deep-link the widget opens */
  type: 'quran' | 'hadith'
  /** Arabic text (RTL) */
  arabic: string
  /** English translation or hadith text */
  translation: string
  /** Attribution line, e.g. "Surah Al-Fatiha 1:1" or "Sahih Muslim 123" */
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

// --------------------------------------------------------------------------
// Internal helpers
// --------------------------------------------------------------------------

/** Returns true only inside a Capacitor native context */
function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Lazily import and call Preferences.set so the Preferences plugin is never
 * imported on the web (where it would log harmless but noisy warnings).
 */
async function set(key: string, value: string): Promise<void> {
  const { Preferences } = await import('@capacitor/preferences')
  await Preferences.set({ key, value })
}

async function setAll(pairs: Record<string, string>): Promise<void> {
  await Promise.all(Object.entries(pairs).map(([key, value]) => set(key, value)))
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Write prayer times widget data to native shared storage.
 * Called by usePrayerTimes after a successful fetch and on every countdown tick.
 */
export async function updatePrayerWidget(data: PrayerWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_prayer_name: data.name,
      widget_prayer_time: data.time,
      widget_prayer_countdown: data.countdown,
      widget_prayer_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updatePrayerWidget failed:', err)
  }
}

/**
 * Write Quran-verse or Hadith widget data to native shared storage.
 * Called by useQuranOfTheDay and useHadithOfTheDay after a successful fetch.
 * The `type` field tells the widget which deep-link to open on tap.
 */
export async function updateVerseWidget(data: VerseWidgetData): Promise<void> {
  if (!isNative()) return
  try {
    await setAll({
      widget_verse_type: data.type,
      widget_verse_arabic: data.arabic,
      widget_verse_translation: data.translation,
      widget_verse_source: data.source,
      widget_verse_update: data.updatedAt,
    })
  } catch (err) {
    console.warn('[widgetBridge] updateVerseWidget failed:', err)
  }
}

/**
 * Write zikr counter widget data to native shared storage.
 * Called by useZikr on every increment, reset, and phrase change.
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
 * Read the zikr count that was stored by an iOS 17+ in-widget increment.
 * Returns null if not on a native platform or if no widget data exists.
 *
 * Used by useZikr on app foreground to reconcile counts:
 * the app takes whichever count is higher to avoid losing taps made in the widget.
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
