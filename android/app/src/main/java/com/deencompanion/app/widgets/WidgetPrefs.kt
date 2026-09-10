package com.deencompanion.app.widgets

import android.content.Context
import org.json.JSONArray
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
    private val deprecatedPrivateKeys = arrayOf(
        "widget_config_lat",
        "widget_config_lng",
        "widget_config_method",
        "widget_config_madhab",
        "widget_config_timezone",
        "widget_config_update",
        "widget_charity_monthly",
        "widget_charity_yearly",
        "widget_charity_currency",
        "widget_charity_update"
    )

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)

    @JvmStatic
    fun purgeDeprecatedPrivateData(context: Context) {
        val store = prefs(context)
        val presentKeys = deprecatedPrivateKeys.filter(store::contains)
        if (presentKeys.isEmpty()) return
        store.edit().apply {
            presentKeys.forEach { remove(it) }
        }.apply()
    }

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
        purgeDeprecatedPrivateData(context)
        val now = System.currentTimeMillis()
        val normalized = parseNormalizedSnapshot(
            prefs(context).getString("widget_prayer_snapshot_v1", null)
        )
        val legacyRevision = parseIsoDate(
            prefs(context).getString("widget_prayer_schedule_update", "") ?: ""
        )

        if (normalized != null && !normalized.isStale(now) &&
            (legacyRevision == null || normalized.generatedAt >= legacyRevision)) {
            return normalized
        }

        val migrated = legacyPrayerSnapshot(context, now, legacyRevision) ?: return normalized
        persistMigratedSnapshot(context, migrated)
        return migrated
    }

    private fun parseNormalizedSnapshot(raw: String?): PrayerSnapshot? {
        raw ?: return null
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

    /**
     * Converts the deployed web bundle's app-computed schedule into the v1
     * cache. This is data normalization only; native code never calculates
     * prayer times or stores the legacy coordinate/config keys.
     */
    private fun legacyPrayerSnapshot(
        context: Context,
        now: Long,
        legacyRevision: Long?
    ): PrayerSnapshot? {
        val store = prefs(context)
        val rawSchedule = store.getString("widget_prayer_schedule", null)
        val prayers = mutableListOf<CachedPrayer>()

        if (!rawSchedule.isNullOrBlank() && rawSchedule.length <= 64 * 1024) {
            try {
                val schedule = JSONObject(rawSchedule)
                if (schedule.length() <= 14) {
                    val parser = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US).apply {
                        timeZone = TimeZone.getDefault()
                        isLenient = false
                    }
                    val display = SimpleDateFormat("h:mm a", Locale.US).apply {
                        timeZone = TimeZone.getDefault()
                    }
                    val dayKeys = buildList {
                        val keys = schedule.keys()
                        while (keys.hasNext()) add(keys.next())
                    }.sorted()
                    val fields = arrayOf(
                        "Fajr" to "fajr",
                        "Dhuhr" to "dhuhr",
                        "Asr" to "asr",
                        "Maghrib" to "maghrib",
                        "Isha" to "isha"
                    )

                    for (dayKey in dayKeys) {
                        if (!dayKey.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) continue
                        val day = schedule.optJSONObject(dayKey) ?: continue
                        for ((name, field) in fields) {
                            val time = day.optString(field)
                            if (!time.matches(Regex("\\d{1,2}:\\d{2}"))) continue
                            val timestamp = try {
                                parser.parse("$dayKey $time")?.time
                            } catch (_: Exception) {
                                null
                            } ?: continue
                            if (timestamp > now) {
                                prayers.add(CachedPrayer(name, display.format(Date(timestamp)), timestamp, dayKey))
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                // Fall through to the single-next-prayer legacy cache.
            }
        }

        if (prayers.isEmpty()) {
            val name = store.getString("widget_prayer_name", "") ?: ""
            val displayTime = store.getString("widget_prayer_time", "") ?: ""
            val timestamp = parseIsoDate(store.getString("widget_prayer_target_time", "") ?: "")
            if (name in setOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha") &&
                displayTime.isNotBlank() && timestamp != null && timestamp > now) {
                val dayKey = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
                    timeZone = TimeZone.getDefault()
                }.format(Date(timestamp))
                prayers.add(CachedPrayer(name, displayTime.take(16), timestamp, dayKey))
            }
        }

        val sorted = prayers.sortedBy { it.timestamp }.take(70)
        if (sorted.isEmpty()) return null
        val gregorianDate = SimpleDateFormat("MMMM d, yyyy", Locale.US).apply {
            timeZone = TimeZone.getDefault()
        }.format(Date(now))
        return PrayerSnapshot(
            generatedAt = legacyRevision ?: now,
            expiresAt = sorted.last().timestamp + 6 * 60 * 60 * 1000,
            gregorianDate = gregorianDate,
            hijriDate = "",
            prayers = sorted
        )
    }

    private fun persistMigratedSnapshot(context: Context, snapshot: PrayerSnapshot) {
        val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
        val prayerArray = JSONArray()
        snapshot.prayers.forEach { prayer ->
            prayerArray.put(JSONObject().apply {
                put("name", prayer.name)
                put("time", prayer.displayTime)
                put("timestamp", formatter.format(Date(prayer.timestamp)))
                put("dayKey", prayer.dayKey)
            })
        }
        val next = snapshot.nextPrayer(System.currentTimeMillis()) ?: snapshot.prayers.first()
        val nextObject = JSONObject().apply {
            put("name", next.name)
            put("time", next.displayTime)
            put("timestamp", formatter.format(Date(next.timestamp)))
            put("dayKey", next.dayKey)
        }
        val json = JSONObject().apply {
            put("version", 1)
            put("generatedAt", formatter.format(Date(snapshot.generatedAt)))
            put("expiresAt", formatter.format(Date(snapshot.expiresAt)))
            put("locationLabel", (prefs(context).getString("widget_qibla_city", "") ?: "").take(80))
            put("timezone", TimeZone.getDefault().id)
            put("gregorianDate", snapshot.gregorianDate)
            put("hijriDate", snapshot.hijriDate)
            put("prayers", prayerArray)
            put("nextPrayer", nextObject)
            put("deepLink", "/times")
        }
        prefs(context).edit().putString("widget_prayer_snapshot_v1", json.toString()).apply()
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
