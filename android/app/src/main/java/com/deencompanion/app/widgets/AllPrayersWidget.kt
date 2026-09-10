package com.deencompanion.app.widgets

import android.app.AlarmManager
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
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/** Medium home-screen companion to PrayerTimesWidget, using the same app cache. */
class AllPrayersWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        ids.forEach { update(context, manager, it) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_BOUNDARY) {
            val widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
            if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                update(context, AppWidgetManager.getInstance(context), widgetId)
            }
        }
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        appWidgetIds.forEach { cancelBoundaryRefresh(context, it) }
        super.onDeleted(context, appWidgetIds)
    }

    companion object {
        private const val ACTION_BOUNDARY = "com.deencompanion.lite.ALL_PRAYERS_WIDGET_BOUNDARY"
        private val prayerNames = arrayOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")

        fun update(context: Context, manager: AppWidgetManager, widgetId: Int) {
            val now = System.currentTimeMillis()
            val snapshot = WidgetPrefs.prayerSnapshot(context)
            val next = snapshot?.nextPrayer(now)
            val usable = snapshot != null && !snapshot.isStale(now) && next != null

            val todayKey = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
                timeZone = TimeZone.getDefault()
            }.format(Date(now))

            val displayDayKey = if (usable && snapshot != null && next != null) {
                val todayPrayers = snapshot.prayersFor(todayKey)
                if (todayPrayers.size >= 5) todayKey else next.dayKey
            } else {
                null
            }

            val prayers = if (usable && snapshot != null && displayDayKey != null) {
                snapshot.prayersFor(displayDayKey).associateBy { it.name }
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
                    displayDayKey != null && displayDayKey != todayKey -> "TOMORROW"
                    else -> "DAILY PRAYERS"
                }
            )

            prayerNames.forEachIndexed { index, name ->
                views.setTextViewText(timeIds[index], prayers[name]?.displayTime ?: "—")
                val isNext = usable && name == next?.name && displayDayKey == next.dayKey
                views.setTextColor(nameIds[index], if (isNext) accent else secondary)
                views.setTextColor(timeIds[index], if (isNext) accent else primary)
            }

            if (usable && next != null) {
                scheduleBoundaryRefresh(context, widgetId, next.timestamp)
            } else {
                cancelBoundaryRefresh(context, widgetId)
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

        private fun scheduleBoundaryRefresh(context: Context, widgetId: Int, timestamp: Long) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                timestamp + 1_000,
                boundaryIntent(context, widgetId)
            )
        }

        private fun cancelBoundaryRefresh(context: Context, widgetId: Int) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.cancel(boundaryIntent(context, widgetId))
        }

        private fun boundaryIntent(context: Context, widgetId: Int): PendingIntent {
            val intent = Intent(context, AllPrayersWidget::class.java).apply {
                action = ACTION_BOUNDARY
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
            }
            return PendingIntent.getBroadcast(
                context,
                widgetId + 400,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }
}
