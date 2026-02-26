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
 * Verse of the Day widget.
 * Displays the daily Quran verse or Hadith (whichever was fetched most recently
 * by the web app). Arabic text is shown RTL; English translation is below.
 * Tapping opens the app to /quran or /hadith based on the stored type.
 */
class VerseWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { id -> update(context, appWidgetManager, id) }
    }

    companion object {
        fun update(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
            val type = WidgetPrefs.verseType(context)
            val arabic = WidgetPrefs.verseArabic(context).ifEmpty {
                "Open the app to load today's verse."
            }
            val translation = WidgetPrefs.verseTranslation(context)
            val source = WidgetPrefs.verseSource(context)

            val label = if (type == "hadith") "Hadith of the Day" else "Verse of the Day"
            val deepLinkRoute = if (type == "hadith") "/hadith" else "/quran"

            val views = RemoteViews(context.packageName, R.layout.widget_verse)
            views.setTextViewText(R.id.widget_verse_label, label)
            views.setTextViewText(R.id.widget_verse_arabic, arabic)
            views.setTextViewText(R.id.widget_verse_translation, translation)
            views.setTextViewText(R.id.widget_verse_source, source)

            // Tap → open app to the correct section
            val tapIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("route", deepLinkRoute)
            }
            val pendingIntent = PendingIntent.getActivity(
                context, widgetId + 100, tapIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_verse_root, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
