package com.deencompanion.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.deencompanion.app.MainActivity
import com.deencompanion.app.R
import java.util.Calendar

/**
 * All Prayers widget showing all five daily prayer times.
 * Self-computes which prayer is next to highlight it.
 */
class AllPrayersWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        private val PRAYER_NAMES = arrayOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")

        /**
         * Resolve today's prayer times using the three-tier strategy:
         * B → embedded algorithm, A → JSON schedule, Legacy → stored 24hr strings.
         */
        private fun resolveTodayTimes(context: Context): PrayerTimes? {
            val now = java.util.Date()

            // Strategy B
            if (WidgetPrefs.hasConfig(context)) {
                val calc = PrayerCalculator(
                    WidgetPrefs.configLat(context), WidgetPrefs.configLng(context),
                    WidgetPrefs.configMethod(context), WidgetPrefs.configMadhab(context)
                )
                calc.compute(now)?.let { return it }
            }

            // Strategy A
            val json = WidgetPrefs.prayerScheduleJSON(context)
            if (json.isNotEmpty()) {
                prayerTimesFromScheduleJSON(json, now)?.let { return it }
            }

            return null
        }

        private fun computeNextPrayerName(context: Context): String {
            val now = java.util.Date()
            resolveTodayTimes(context)?.let { times ->
                listOf("Fajr" to times.fajr, "Dhuhr" to times.dhuhr, "Asr" to times.asr,
                       "Maghrib" to times.maghrib, "Isha" to times.isha).forEach { (name, date) ->
                    if (date.after(now)) return name
                }
                return "Fajr"
            }

            // Legacy fallback
            val times24 = arrayOf(
                WidgetPrefs.allPrayersFajr24(context), WidgetPrefs.allPrayersDhuhr24(context),
                WidgetPrefs.allPrayersAsr24(context), WidgetPrefs.allPrayersMaghrib24(context),
                WidgetPrefs.allPrayersIsha24(context)
            )
            if (times24.any { it.isEmpty() }) return WidgetPrefs.allPrayersNext(context)
            val cal = Calendar.getInstance()
            val nowMin = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
            for (i in times24.indices) {
                val parts = times24[i].split(":").mapNotNull { it.toIntOrNull() }
                if (parts.size == 2 && parts[0] * 60 + parts[1] > nowMin) return PRAYER_NAMES[i]
            }
            return "Fajr"
        }

        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val nextName = computeNextPrayerName(context)

            val resolved = resolveTodayTimes(context)
            val calc = PrayerCalculator(0.0, 0.0, "4", "0")  // formatTime helper only

            val fajr = resolved?.let { calc.formatTime(it.fajr) }
                ?: WidgetPrefs.allPrayersFajr(context).ifEmpty { "---" }
            val dhuhr = resolved?.let { calc.formatTime(it.dhuhr) }
                ?: WidgetPrefs.allPrayersDhuhr(context).ifEmpty { "---" }
            val asr = resolved?.let { calc.formatTime(it.asr) }
                ?: WidgetPrefs.allPrayersAsr(context).ifEmpty { "---" }
            val maghrib = resolved?.let { calc.formatTime(it.maghrib) }
                ?: WidgetPrefs.allPrayersMaghrib(context).ifEmpty { "---" }
            val isha = resolved?.let { calc.formatTime(it.isha) }
                ?: WidgetPrefs.allPrayersIsha(context).ifEmpty { "---" }

            val views = RemoteViews(context.packageName, R.layout.widget_all_prayers)
            views.setTextViewText(R.id.widget_ap_fajr_time, fajr)
            views.setTextViewText(R.id.widget_ap_dhuhr_time, dhuhr)
            views.setTextViewText(R.id.widget_ap_asr_time, asr)
            views.setTextViewText(R.id.widget_ap_maghrib_time, maghrib)
            views.setTextViewText(R.id.widget_ap_isha_time, isha)

            // Highlight the next prayer column with accent color
            val accentColor = 0xFF10BA7A.toInt()
            val normalColor = 0xFF0F3D3E.toInt()
            val secondaryColor = 0xFF888888.toInt()

            val nameIds = intArrayOf(
                R.id.widget_ap_fajr_label, R.id.widget_ap_dhuhr_label,
                R.id.widget_ap_asr_label, R.id.widget_ap_maghrib_label,
                R.id.widget_ap_isha_label
            )
            val timeIds = intArrayOf(
                R.id.widget_ap_fajr_time, R.id.widget_ap_dhuhr_time,
                R.id.widget_ap_asr_time, R.id.widget_ap_maghrib_time,
                R.id.widget_ap_isha_time
            )

            for (i in PRAYER_NAMES.indices) {
                val isNext = PRAYER_NAMES[i] == nextName
                views.setTextColor(nameIds[i], if (isNext) accentColor else secondaryColor)
                views.setTextColor(timeIds[i], if (isNext) accentColor else normalColor)
            }

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/times")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 400, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_ap_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
