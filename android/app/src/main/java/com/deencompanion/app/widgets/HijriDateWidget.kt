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
 * Islamic (Hijri) Date widget. Shows the Hijri date with
 * Gregorian reference. Tapping opens the app to /calendar.
 */
class HijriDateWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val day = WidgetPrefs.hijriDay(context).ifEmpty { "--" }
            val monthName = WidgetPrefs.hijriMonthName(context).ifEmpty { "Open app" }
            val year = WidgetPrefs.hijriYear(context)
            val gregorianDate = WidgetPrefs.hijriGregorianDate(context)
            val weekday = WidgetPrefs.hijriWeekday(context)

            val views = RemoteViews(context.packageName, R.layout.widget_hijri)
            views.setTextViewText(R.id.widget_hijri_day, day)
            views.setTextViewText(R.id.widget_hijri_month, monthName)
            views.setTextViewText(R.id.widget_hijri_year, year)
            views.setTextViewText(R.id.widget_hijri_gregorian, gregorianDate)
            views.setTextViewText(R.id.widget_hijri_weekday, weekday)

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/calendar")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 500, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_hijri_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
