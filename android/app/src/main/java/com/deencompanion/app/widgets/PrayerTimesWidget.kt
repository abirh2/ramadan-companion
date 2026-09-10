package com.deencompanion.app.widgets

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.deencompanion.app.MainActivity
import com.deencompanion.app.R
import kotlin.math.ceil

/**
 * Glanceable next-prayer widget backed by the normalized app cache.
 * Refreshes happen at prayer boundaries; there is no second-by-second process.
 */
class PrayerTimesWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_PRAYER_BOUNDARY) {
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
        private const val ACTION_PRAYER_BOUNDARY = "com.deencompanion.lite.PRAYER_WIDGET_BOUNDARY"

        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val now = System.currentTimeMillis()
            val snapshot = WidgetPrefs.prayerSnapshot(context)
            val next = snapshot?.nextPrayer(now)
            val ready = snapshot != null && !snapshot.isStale(now) && next != null

            val views = RemoteViews(context.packageName, R.layout.widget_prayer)
            if (ready && next != null && snapshot != null) {
                views.setTextViewText(R.id.widget_prayer_eyebrow, "NEXT PRAYER")
                views.setTextViewText(R.id.widget_prayer_name, next.name)
                views.setTextViewText(R.id.widget_prayer_time, next.displayTime)
                views.setTextViewText(R.id.widget_prayer_countdown, formatRemaining(next.timestamp - now))
                views.setTextViewText(R.id.widget_prayer_date, listOf(snapshot.hijriDate, snapshot.gregorianDate).filter { it.isNotBlank() }.joinToString("  ·  "))
                scheduleBoundaryRefresh(context, widgetId, next.timestamp)
            } else {
                val stale = snapshot != null
                views.setTextViewText(R.id.widget_prayer_eyebrow, if (stale) "PRAYER TIMES" else "SETUP NEEDED")
                views.setTextViewText(R.id.widget_prayer_name, if (stale) "Refresh times" else "Set prayer times")
                views.setTextViewText(R.id.widget_prayer_time, "Open Deen Companion")
                views.setTextViewText(R.id.widget_prayer_countdown, if (stale) "Saved times are out of date" else "Choose a location in the app")
                views.setTextViewText(R.id.widget_prayer_date, "")
                cancelBoundaryRefresh(context, widgetId)
            }

            val tapIntent = Intent(Intent.ACTION_VIEW, Uri.parse("com.deencompanion.lite:///times"), context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                widgetId,
                tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_prayer_root, pendingIntent)
            appWidgetManager.updateAppWidget(widgetId, views)
        }

        private fun formatRemaining(milliseconds: Long): String {
            val minutes = ceil(milliseconds.coerceAtLeast(0) / 60_000.0).toInt()
            val hours = minutes / 60
            val remainder = minutes % 60
            return when {
                hours > 0 && remainder > 0 -> "in ${hours}h ${remainder}m"
                hours > 0 -> "in ${hours}h"
                else -> "in ${minutes.coerceAtLeast(1)}m"
            }
        }

        private fun scheduleBoundaryRefresh(context: Context, widgetId: Int, timestamp: Long) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timestamp + 1_000, boundaryIntent(context, widgetId))
        }

        private fun cancelBoundaryRefresh(context: Context, widgetId: Int) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.cancel(boundaryIntent(context, widgetId))
        }

        private fun boundaryIntent(context: Context, widgetId: Int): PendingIntent {
            val intent = Intent(context, PrayerTimesWidget::class.java).apply {
                action = ACTION_PRAYER_BOUNDARY
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
            }
            return PendingIntent.getBroadcast(
                context,
                widgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }
}
