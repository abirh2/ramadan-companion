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
 * Zikr Counter widget.
 * Displays the current phrase (Arabic + transliteration) and count.
 * The "+ Count" button fires a broadcast handled by ZikrIncrementReceiver,
 * which increments the count in SharedPreferences and reloads all instances.
 * Tapping the label area opens the app to /zikr.
 */
class ZikrWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val arabic = WidgetPrefs.zikrArabic(context)
            val transliteration = WidgetPrefs.zikrTransliteration(context)
            val count = WidgetPrefs.zikrCount(context)
            val target = WidgetPrefs.zikrTarget(context)

            val countText = if (target > 0) "$count / $target" else "$count"

            val views = RemoteViews(context.packageName, R.layout.widget_zikr)
            views.setTextViewText(R.id.widget_zikr_arabic, arabic)
            views.setTextViewText(R.id.widget_zikr_transliteration, transliteration)
            views.setTextViewText(R.id.widget_zikr_count, countText)

            // Tap on "+Count" button → broadcast increment action
            val incrementIntent = Intent(context, ZikrIncrementReceiver::class.java).apply {
                action = ZikrIncrementReceiver.ACTION_INCREMENT
            }
            val incrementPending = PendingIntent.getBroadcast(
                context,
                widgetId + 200,
                incrementIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_zikr_tap_btn, incrementPending)

            // Tap on the rest of the widget → open app to /zikr
            val appIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/zikr")
            }
            val appPending = PendingIntent.getActivity(
                context,
                widgetId + 250,
                appIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_zikr_root, appPending)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
