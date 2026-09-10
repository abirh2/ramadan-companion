package com.deencompanion.app.widgets

import android.content.Context
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Reads widget data from the SharedPreferences file written by the
 * Capacitor Preferences plugin. The file name "CapacitorStorage" is
 * hard-coded by the plugin when no group override is configured.
 */
object WidgetPrefs {
    private const val PREFS_FILE = "CapacitorStorage"

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)

    // --- Verse (Quran only) ---
    fun verseArabic(context: Context): String =
        prefs(context).getString("widget_verse_arabic", "") ?: ""

    fun verseTranslation(context: Context): String =
        prefs(context).getString("widget_verse_translation", "") ?: ""

    fun verseSource(context: Context): String =
        prefs(context).getString("widget_verse_source", "") ?: ""

    // --- Hadith (separate from verse) ---
    fun hadithArabic(context: Context): String =
        prefs(context).getString("widget_hadith_arabic", "") ?: ""

    fun hadithTranslation(context: Context): String =
        prefs(context).getString("widget_hadith_translation", "") ?: ""

    fun hadithSource(context: Context): String =
        prefs(context).getString("widget_hadith_source", "") ?: ""

    // --- Zikr ---
    fun zikrArabic(context: Context): String =
        prefs(context).getString("widget_zikr_arabic", "\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0671\u0644\u0644\u0651\u064E\u0670\u0647\u0650") ?: "\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0671\u0644\u0644\u0651\u064E\u0670\u0647\u0650"

    fun zikrTransliteration(context: Context): String =
        prefs(context).getString("widget_zikr_transliteration", "SubhanAllah") ?: "SubhanAllah"

    fun zikrCount(context: Context): Int =
        (prefs(context).getString("widget_zikr_count", "0") ?: "0").toIntOrNull() ?: 0

    fun zikrTarget(context: Context): Int =
        (prefs(context).getString("widget_zikr_target", "33") ?: "33").toIntOrNull() ?: 33

    fun setZikrCount(context: Context, count: Int) {
        prefs(context).edit().putString("widget_zikr_count", count.toString()).apply()
    }

    // --- Hijri Date ---
    fun hijriDay(context: Context): String =
        prefs(context).getString("widget_hijri_day", "") ?: ""

    fun hijriMonthName(context: Context): String =
        prefs(context).getString("widget_hijri_month_name", "") ?: ""

    fun hijriYear(context: Context): String =
        prefs(context).getString("widget_hijri_year", "") ?: ""

    fun hijriGregorianDate(context: Context): String =
        prefs(context).getString("widget_hijri_gregorian_date", "") ?: ""

    fun hijriWeekday(context: Context): String =
        prefs(context).getString("widget_hijri_weekday", "") ?: ""

    // --- Qibla ---
    fun qiblaDirection(context: Context): String =
        prefs(context).getString("widget_qibla_direction", "") ?: ""

    fun qiblaCompass(context: Context): String =
        prefs(context).getString("widget_qibla_compass", "") ?: ""

    fun qiblaCity(context: Context): String =
        prefs(context).getString("widget_qibla_city", "") ?: ""

    // --- Mosque ---
    fun mosqueName(context: Context): String =
        prefs(context).getString("widget_mosque_name", "") ?: ""

    fun mosqueDistance(context: Context): String =
        prefs(context).getString("widget_mosque_distance", "") ?: ""

    fun mosqueAddress(context: Context): String =
        prefs(context).getString("widget_mosque_address", "") ?: ""

    data class CachedPrayer(
        val name: String,
        val displayTime: String,
        val timestamp: Long,
        val dayKey: String
    )

    data class PrayerSnapshot(
        val generatedAt: Long,
        val expiresAt: Long,
        val gregorianDate: String,
        val hijriDate: String,
        val prayers: List<CachedPrayer>
    ) {
        fun nextPrayer(now: Long): CachedPrayer? = prayers.firstOrNull { it.timestamp > now }
        fun prayersFor(dayKey: String): List<CachedPrayer> = prayers.filter { it.dayKey == dayKey }
        fun isStale(now: Long): Boolean = now >= expiresAt || nextPrayer(now) == null
    }

    /**
     * Reads the normalized, privacy-safe cache produced by the web prayer engine.
     * Native widgets intentionally never receive coordinates or calculation settings.
     */
    fun prayerSnapshot(context: Context): PrayerSnapshot? {
        val raw = prefs(context).getString("widget_prayer_snapshot_v1", null) ?: return null
        if (raw.length > 64 * 1024) return null

        return try {
            val json = JSONObject(raw)
            if (json.optInt("version") != 1) return null

            val generatedAt = parseIsoDate(json.optString("generatedAt")) ?: return null
            val expiresAt = parseIsoDate(json.optString("expiresAt")) ?: return null
            if (expiresAt <= generatedAt) return null

            val allowedNames = setOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")
            val prayerArray = json.optJSONArray("prayers") ?: return null
            if (prayerArray.length() > 70) return null

            val prayers = buildList {
                for (index in 0 until prayerArray.length()) {
                    val item = prayerArray.optJSONObject(index) ?: continue
                    val name = item.optString("name")
                    val displayTime = item.optString("time").take(16)
                    val timestamp = parseIsoDate(item.optString("timestamp")) ?: continue
                    val dayKey = item.optString("dayKey")
                    if (name in allowedNames && displayTime.isNotBlank() && dayKey.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) {
                        add(CachedPrayer(name, displayTime, timestamp, dayKey))
                    }
                }
            }.sortedBy { it.timestamp }

            if (prayers.isEmpty()) return null
            PrayerSnapshot(
                generatedAt = generatedAt,
                expiresAt = expiresAt,
                gregorianDate = json.optString("gregorianDate").take(80),
                hijriDate = json.optString("hijriDate").take(80),
                prayers = prayers
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun parseIsoDate(value: String): Long? {
        val formats = arrayOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm:ssX"
        )
        for (pattern in formats) {
            val formatter = SimpleDateFormat(pattern, Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
                isLenient = false
            }
            val parsed: Date = try { formatter.parse(value) } catch (_: Exception) { null } ?: continue
            return parsed.time
        }
        return null
    }
}
