package com.deencompanion.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.deencompanion.app.MainActivity
import com.deencompanion.app.R

/**
 * Prayer Times home screen widget.
 * Reads next prayer name, time, and countdown from SharedPreferences
 * (written by the Capacitor Preferences plugin in the web app).
 * Tapping the widget opens the app to the /times page.
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
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val name = WidgetPrefs.prayerName(context).ifEmpty { "—" }
            val time = WidgetPrefs.prayerTime(context).ifEmpty { "Open app" }
            val countdown = WidgetPrefs.prayerCountdown(context).ifEmpty { "—" }

            val views = RemoteViews(context.packageName, R.layout.widget_prayer)
            views.setTextViewText(R.id.widget_prayer_name, name)
            views.setTextViewText(R.id.widget_prayer_time, time)
            views.setTextViewText(R.id.widget_prayer_countdown, countdown)

            // Tap → open app (MainActivity handles deep links)
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
