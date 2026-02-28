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
 * Hadith of the Day widget. Reads from dedicated hadith keys
 * (separate from verse/quran data). Tapping opens the app to /hadith.
 */
class HadithWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val arabic = WidgetPrefs.hadithArabic(context)
            val translation = WidgetPrefs.hadithTranslation(context).ifEmpty {
                "Open the app to load today's hadith."
            }
            val source = WidgetPrefs.hadithSource(context)

            val views = RemoteViews(context.packageName, R.layout.widget_hadith)
            views.setTextViewText(R.id.widget_hadith_arabic, arabic)
            views.setTextViewText(R.id.widget_hadith_translation, "\u201C$translation\u201D")
            views.setTextViewText(R.id.widget_hadith_source, source)

            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", "/hadith")
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 300, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_hadith_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
