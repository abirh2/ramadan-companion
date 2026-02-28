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
 * Prayer Times home screen widget.
 * Self-computes the next prayer from stored 24hr prayer times so the widget
 * stays accurate even when the app is not open.
 */
class PrayerTimesWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {

        /**
         * Resolve the next prayer using three-tier strategy:
         * B: embedded PrayerCalculator (most accurate, works offline indefinitely)
         * A: stored 14-day JSON schedule
         * Legacy: single-day 24hr strings stored by app
         * Returns (name, display12hr, minutesUntil) or null if no data.
         */
        private fun resolveNextPrayer(context: Context): Triple<String, String, Int>? {
            val now = java.util.Date()

            // Strategy B: embedded algorithm
            if (WidgetPrefs.hasConfig(context)) {
                val calc = PrayerCalculator(
                    latitude = WidgetPrefs.configLat(context),
                    longitude = WidgetPrefs.configLng(context),
                    methodId = WidgetPrefs.configMethod(context),
                    madhabId = WidgetPrefs.configMadhab(context)
                )
                // Try today and tomorrow to handle wrapping past Isha
                for (dayOffset in 0..1) {
                    val cal = Calendar.getInstance()
                    cal.add(Calendar.DAY_OF_MONTH, dayOffset)
                    val times = calc.compute(cal.time) ?: continue
                    val pairs = listOf(
                        "Fajr" to times.fajr, "Dhuhr" to times.dhuhr, "Asr" to times.asr,
                        "Maghrib" to times.maghrib, "Isha" to times.isha
                    )
                    for ((name, date) in pairs) {
                        if (date.after(now)) {
                            val mins = ((date.time - now.time) / 60_000).toInt()
                            return Triple(name, calc.formatTime(date), mins)
                        }
                    }
                }
            }

            // Strategy A: 14-day schedule JSON
            val json = WidgetPrefs.prayerScheduleJSON(context)
            if (json.isNotEmpty()) {
                for (dayOffset in 0..1) {
                    val cal = Calendar.getInstance()
                    cal.add(Calendar.DAY_OF_MONTH, dayOffset)
                    val times = prayerTimesFromScheduleJSON(json, cal.time) ?: continue
                    val pairs = listOf(
                        "Fajr" to times.fajr, "Dhuhr" to times.dhuhr, "Asr" to times.asr,
                        "Maghrib" to times.maghrib, "Isha" to times.isha
                    )
                    val calc = PrayerCalculator(0.0, 0.0, "4", "0")  // for formatTime only
                    for ((name, date) in pairs) {
                        if (date.after(now)) {
                            val mins = ((date.time - now.time) / 60_000).toInt()
                            return Triple(name, calc.formatTime(date), mins)
                        }
                    }
                }
            }

            // Legacy fallback: stored 24hr strings
            val times24 = arrayOf(
                WidgetPrefs.allPrayersFajr24(context), WidgetPrefs.allPrayersDhuhr24(context),
                WidgetPrefs.allPrayersAsr24(context), WidgetPrefs.allPrayersMaghrib24(context),
                WidgetPrefs.allPrayersIsha24(context)
            )
            val times12 = arrayOf(
                WidgetPrefs.allPrayersFajr(context), WidgetPrefs.allPrayersDhuhr(context),
                WidgetPrefs.allPrayersAsr(context), WidgetPrefs.allPrayersMaghrib(context),
                WidgetPrefs.allPrayersIsha(context)
            )
            val names = arrayOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")
            if (times24.none { it.isEmpty() }) {
                val nowCal = Calendar.getInstance()
                val nowMin = nowCal.get(Calendar.HOUR_OF_DAY) * 60 + nowCal.get(Calendar.MINUTE)
                for (i in times24.indices) {
                    val parts = times24[i].split(":").mapNotNull { it.toIntOrNull() }
                    if (parts.size == 2) {
                        val pm = parts[0] * 60 + parts[1]
                        if (pm > nowMin) {
                            return Triple(names[i], times12[i].ifEmpty { times24[i] }, pm - nowMin)
                        }
                    }
                }
                val fp = times24[0].split(":").mapNotNull { it.toIntOrNull() }
                if (fp.size == 2) {
                    val mins = (24 * 60 - nowMin) + fp[0] * 60 + fp[1]
                    return Triple("Fajr", times12[0].ifEmpty { times24[0] }, mins)
                }
            }

            return null
        }

        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val next = resolveNextPrayer(context)

            val name: String
            val time: String
            val countdown: String

            if (next != null) {
                name = next.first
                time = next.second
                val h = next.third / 60
                val m = next.third % 60
                countdown = if (h > 0) "${h}h ${m}m" else "${m}m"
            } else {
                name = WidgetPrefs.prayerName(context).ifEmpty { "\u2014" }
                time = WidgetPrefs.prayerTime(context).ifEmpty { "Open app" }
                countdown = WidgetPrefs.prayerCountdown(context).ifEmpty { "\u2014" }
            }

            val views = RemoteViews(context.packageName, R.layout.widget_prayer)
            views.setTextViewText(R.id.widget_prayer_name, name)
            views.setTextViewText(R.id.widget_prayer_time, time)
            views.setTextViewText(R.id.widget_prayer_countdown, countdown)

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/times")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_prayer_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
