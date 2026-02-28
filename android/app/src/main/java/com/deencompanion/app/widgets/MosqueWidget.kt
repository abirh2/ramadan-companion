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
 * Nearest Mosque widget showing name, distance, and address.
 * Tapping opens the app to /places/mosques.
 */
class MosqueWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val name = WidgetPrefs.mosqueName(context).ifEmpty { "Open app" }
            val distance = WidgetPrefs.mosqueDistance(context)
            val address = WidgetPrefs.mosqueAddress(context)

            val views = RemoteViews(context.packageName, R.layout.widget_mosque)
            views.setTextViewText(R.id.widget_mosque_name, name)
            views.setTextViewText(R.id.widget_mosque_distance, distance)
            views.setTextViewText(R.id.widget_mosque_address, address)

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/places/mosques")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 800, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_mosque_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
