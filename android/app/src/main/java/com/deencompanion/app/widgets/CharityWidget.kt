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
 * Charity Tracker widget showing monthly and yearly donation totals.
 * Tapping opens the app to /charity.
 */
class CharityWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val monthly = WidgetPrefs.charityMonthly(context).ifEmpty { "$0" }
            val yearly = WidgetPrefs.charityYearly(context).ifEmpty { "$0" }

            val views = RemoteViews(context.packageName, R.layout.widget_charity)
            views.setTextViewText(R.id.widget_charity_monthly, monthly)
            views.setTextViewText(R.id.widget_charity_yearly, yearly)

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/charity")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 600, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_charity_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
