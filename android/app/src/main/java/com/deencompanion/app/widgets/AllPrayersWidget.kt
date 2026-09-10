package com.deencompanion.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import androidx.core.content.ContextCompat
import com.deencompanion.app.MainActivity
import com.deencompanion.app.R

/** Medium home-screen companion to PrayerTimesWidget, using the same app cache. */
class AllPrayersWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        ids.forEach { update(context, manager, it) }
    }

    companion object {
        private val prayerNames = arrayOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")

        fun update(context: Context, manager: AppWidgetManager, widgetId: Int) {
            val now = System.currentTimeMillis()
            val snapshot = WidgetPrefs.prayerSnapshot(context)
            val next = snapshot?.nextPrayer(now)
            val usable = snapshot != null && !snapshot.isStale(now) && next != null
            val prayers = if (usable && snapshot != null && next != null) {
                snapshot.prayersFor(next.dayKey).associateBy { it.name }
            } else {
                emptyMap()
            }

            val views = RemoteViews(context.packageName, R.layout.widget_all_prayers)
            val timeIds = intArrayOf(
                R.id.widget_ap_fajr_time,
                R.id.widget_ap_dhuhr_time,
                R.id.widget_ap_asr_time,
                R.id.widget_ap_maghrib_time,
                R.id.widget_ap_isha_time
            )
            val nameIds = intArrayOf(
                R.id.widget_ap_fajr_label,
                R.id.widget_ap_dhuhr_label,
                R.id.widget_ap_asr_label,
                R.id.widget_ap_maghrib_label,
                R.id.widget_ap_isha_label
            )
            val accent = ContextCompat.getColor(context, R.color.widget_accent)
            val primary = ContextCompat.getColor(context, R.color.widget_primary)
            val secondary = ContextCompat.getColor(context, R.color.widget_secondary)

            views.setTextViewText(
                R.id.widget_ap_header,
                when {
                    snapshot == null -> "SET UP PRAYER TIMES"
                    !usable -> "PRAYER TIMES NEED REFRESHING"
                    else -> "DAILY PRAYERS"
                }
            )

            prayerNames.forEachIndexed { index, name ->
                views.setTextViewText(timeIds[index], prayers[name]?.displayTime ?: "—")
                val isNext = usable && name == next?.name
                views.setTextColor(nameIds[index], if (isNext) accent else secondary)
                views.setTextColor(timeIds[index], if (isNext) accent else primary)
            }

            val tapIntent = Intent(Intent.ACTION_VIEW, Uri.parse("com.deencompanion.lite:///times"), context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            views.setOnClickPendingIntent(
                R.id.widget_ap_root,
                PendingIntent.getActivity(
                    context,
                    widgetId + 400,
                    tapIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
            )
            manager.updateAppWidget(widgetId, views)
        }
    }
}
