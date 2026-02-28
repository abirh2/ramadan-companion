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

    // --- Prayer (single next prayer) ---
    fun prayerName(context: Context): String =
        prefs(context).getString("widget_prayer_name", "") ?: ""

    fun prayerTime(context: Context): String =
        prefs(context).getString("widget_prayer_time", "") ?: ""

    fun prayerCountdown(context: Context): String =
        prefs(context).getString("widget_prayer_countdown", "") ?: ""

    // --- All Prayers (12hr display) ---
    fun allPrayersFajr(context: Context): String =
        prefs(context).getString("widget_all_prayers_fajr", "") ?: ""

    fun allPrayersDhuhr(context: Context): String =
        prefs(context).getString("widget_all_prayers_dhuhr", "") ?: ""

    fun allPrayersAsr(context: Context): String =
        prefs(context).getString("widget_all_prayers_asr", "") ?: ""

    fun allPrayersMaghrib(context: Context): String =
        prefs(context).getString("widget_all_prayers_maghrib", "") ?: ""

    fun allPrayersIsha(context: Context): String =
        prefs(context).getString("widget_all_prayers_isha", "") ?: ""

    fun allPrayersNext(context: Context): String =
        prefs(context).getString("widget_all_prayers_next", "") ?: ""

    // --- All Prayers (24hr for self-computation) ---
    fun allPrayersFajr24(context: Context): String =
        prefs(context).getString("widget_all_prayers_fajr_24", "") ?: ""

    fun allPrayersDhuhr24(context: Context): String =
        prefs(context).getString("widget_all_prayers_dhuhr_24", "") ?: ""

    fun allPrayersAsr24(context: Context): String =
        prefs(context).getString("widget_all_prayers_asr_24", "") ?: ""

    fun allPrayersMaghrib24(context: Context): String =
        prefs(context).getString("widget_all_prayers_maghrib_24", "") ?: ""

    fun allPrayersIsha24(context: Context): String =
        prefs(context).getString("widget_all_prayers_isha_24", "") ?: ""

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

    // --- Charity ---
    fun charityMonthly(context: Context): String =
        prefs(context).getString("widget_charity_monthly", "") ?: ""

    fun charityYearly(context: Context): String =
        prefs(context).getString("widget_charity_yearly", "") ?: ""

    fun charityCurrency(context: Context): String =
        prefs(context).getString("widget_charity_currency", "$") ?: "$"

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

    // --- Widget Config (for embedded prayer time calculator – Strategy B) ---

    fun configLat(context: Context): Double =
        (prefs(context).getString("widget_config_lat", "") ?: "").toDoubleOrNull() ?: 0.0

    fun configLng(context: Context): Double =
        (prefs(context).getString("widget_config_lng", "") ?: "").toDoubleOrNull() ?: 0.0

    /** AlAdhan calculation method ID, e.g. "4" (Umm al-Qura) */
    fun configMethod(context: Context): String =
        prefs(context).getString("widget_config_method", "4") ?: "4"

    /** AlAdhan madhab ID: "0" = Standard, "1" = Hanafi */
    fun configMadhab(context: Context): String =
        prefs(context).getString("widget_config_madhab", "0") ?: "0"

    /** IANA timezone string, e.g. "America/New_York" */
    fun configTimezone(context: Context): String =
        prefs(context).getString("widget_config_timezone", java.util.TimeZone.getDefault().id) ?: java.util.TimeZone.getDefault().id

    fun hasConfig(context: Context): Boolean = configLat(context) != 0.0 && configLng(context) != 0.0

    // --- 14-Day Prayer Schedule (Strategy A fallback JSON blob) ---

    /** JSON-encoded map of "YYYY-MM-DD" → { fajr, dhuhr, asr, maghrib, isha } in HH:MM 24hr format. */
    fun prayerScheduleJSON(context: Context): String =
        prefs(context).getString("widget_prayer_schedule", "") ?: ""
}
