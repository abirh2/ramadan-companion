package com.deencompanion.app.widgets

import android.content.Context

/**
 * Reads widget data from the SharedPreferences file written by the
 * Capacitor Preferences plugin. The file name "CapacitorStorage" is
 * hard-coded by the plugin when no group override is configured.
 */
object WidgetPrefs {
    private const val PREFS_FILE = "CapacitorStorage"

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)

    // --- Prayer ---
    fun prayerName(context: Context): String =
        prefs(context).getString("widget_prayer_name", "") ?: ""

    fun prayerTime(context: Context): String =
        prefs(context).getString("widget_prayer_time", "") ?: ""

    fun prayerCountdown(context: Context): String =
        prefs(context).getString("widget_prayer_countdown", "") ?: ""

    // --- Verse ---
    fun verseType(context: Context): String =
        prefs(context).getString("widget_verse_type", "quran") ?: "quran"

    fun verseArabic(context: Context): String =
        prefs(context).getString("widget_verse_arabic", "") ?: ""

    fun verseTranslation(context: Context): String =
        prefs(context).getString("widget_verse_translation", "") ?: ""

    fun verseSource(context: Context): String =
        prefs(context).getString("widget_verse_source", "") ?: ""

    // --- Zikr ---
    fun zikrArabic(context: Context): String =
        prefs(context).getString("widget_zikr_arabic", "سُبْحَانَ ٱللَّٰهِ") ?: "سُبْحَانَ ٱللَّٰهِ"

    fun zikrTransliteration(context: Context): String =
        prefs(context).getString("widget_zikr_transliteration", "SubhanAllah") ?: "SubhanAllah"

    fun zikrCount(context: Context): Int =
        (prefs(context).getString("widget_zikr_count", "0") ?: "0").toIntOrNull() ?: 0

    fun zikrTarget(context: Context): Int =
        (prefs(context).getString("widget_zikr_target", "33") ?: "33").toIntOrNull() ?: 33

    /** Write incremented zikr count back (used by ZikrIncrementReceiver) */
    fun setZikrCount(context: Context, count: Int) {
        prefs(context).edit().putString("widget_zikr_count", count.toString()).apply()
    }
}
