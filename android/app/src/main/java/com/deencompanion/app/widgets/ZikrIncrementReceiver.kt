package com.deencompanion.app.widgets

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent

/**
 * Receives the INCREMENT_ZIKR broadcast sent when the user taps the
 * "+ Count" button on the Zikr widget. Increments the count in
 * SharedPreferences and immediately refreshes all ZikrWidget instances.
 */
class ZikrIncrementReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_INCREMENT) return

        val newCount = WidgetPrefs.zikrCount(context) + 1
        WidgetPrefs.setZikrCount(context, newCount)

        // Refresh all ZikrWidget instances
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(
            ComponentName(context, ZikrWidget::class.java)
        )
        ids.forEach { id -> ZikrWidget.update(context, manager, id) }
    }

    companion object {
        const val ACTION_INCREMENT = "com.deencompanion.app.ZIKR_INCREMENT"
    }
}
