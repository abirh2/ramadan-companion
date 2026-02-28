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
 * Qibla Direction widget showing compass bearing to Mecca.
 * Tapping opens the app to /times (where Qibla is displayed).
 */
class QiblaWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val direction = WidgetPrefs.qiblaDirection(context).ifEmpty { "--" }
            val compass = WidgetPrefs.qiblaCompass(context)
            val city = WidgetPrefs.qiblaCity(context)

            val views = RemoteViews(context.packageName, R.layout.widget_qibla)
            views.setTextViewText(R.id.widget_qibla_degrees, "${direction}\u00B0")
            views.setTextViewText(R.id.widget_qibla_compass, compass)
            views.setTextViewText(R.id.widget_qibla_city, city)

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/times")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 700, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_qibla_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
