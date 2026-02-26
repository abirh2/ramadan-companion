/**
 * Widget Bridge — writes data to shared native storage so home screen widgets
 * can read it without requiring the app to be open.
 *
 * On iOS  → Uses a custom WidgetBridgePlugin (WidgetBridgePlugin.swift) that
 *           writes directly to UserDefaults(suiteName: "group.com.deencompanion.app").
 *           @capacitor/preferences is NOT used for this purpose: its "group" config
 *           option only changes the key prefix within UserDefaults.standard, which is
 *           sandboxed per process and cannot be read by widget extensions.
 *
 * On Android → @capacitor/preferences writes to SharedPreferences "CapacitorStorage"
 *              which the widget BroadcastReceivers read directly.
 *
 * All write functions are no-ops when running in a browser (Capacitor not present).
 */

import { Capacitor, registerPlugin } from '@capacitor/core'

// --------------------------------------------------------------------------
// Native plugin interface (iOS: WidgetBridgePlugin.swift)
// --------------------------------------------------------------------------

interface WidgetBridgeNativePlugin {
  setValues(options: { data: Record<string, string> }): Promise<void>
  getValue(options: { key: string }): Promise<{ value: string | null }>
}

const WidgetBridgeNative = registerPlugin<WidgetBridgeNativePlugin>('WidgetBridge')

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
 * On iOS: uses WidgetBridgePlugin to write a batch of key-value pairs directly
 * to the App Group UserDefaults container that the widget extension can read.
 *
 * On Android: falls back to @capacitor/preferences which writes to the
 * SharedPreferences file read by widget BroadcastReceivers.
 */
async function setAll(pairs: Record<string, string>): Promise<void> {
  if (Capacitor.getPlatform() === 'ios') {
    await WidgetBridgeNative.setValues({ data: pairs })
  } else {
    const { Preferences } = await import('@capacitor/preferences')
    await Promise.all(
      Object.entries(pairs).map(([key, value]) => Preferences.set({ key, value }))
    )
  }
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
    let rawValue: string | null = null

    if (Capacitor.getPlatform() === 'ios') {
      const result = await WidgetBridgeNative.getValue({ key: 'widget_zikr_count' })
      rawValue = result.value
    } else {
      const { Preferences } = await import('@capacitor/preferences')
      const result = await Preferences.get({ key: 'widget_zikr_count' })
      rawValue = result.value
    }

    if (rawValue === null) return null
    const parsed = parseInt(rawValue, 10)
    return isNaN(parsed) ? null : parsed
  } catch (err) {
    console.warn('[widgetBridge] readWidgetZikrCount failed:', err)
    return null
  }
}
