package com.deencompanion.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "WidgetRefresh")
public class WidgetRefreshPlugin extends Plugin {
    private static final String PRAYER_WIDGET = "com.deencompanion.app.widgets.PrayerTimesWidget";
    private static final String ALL_PRAYERS_WIDGET = "com.deencompanion.app.widgets.AllPrayersWidget";

    @PluginMethod
    public void refresh(PluginCall call) {
        refreshProvider(PRAYER_WIDGET);
        refreshProvider(ALL_PRAYERS_WIDGET);
        call.resolve(new JSObject());
    }

    private void refreshProvider(String providerClassName) {
        AppWidgetManager manager = AppWidgetManager.getInstance(getContext());
        ComponentName provider = new ComponentName(getContext().getPackageName(), providerClassName);
        int[] ids = manager.getAppWidgetIds(provider);
        if (ids.length == 0) return;

        Intent intent = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.setComponent(provider);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        getContext().sendBroadcast(intent);
    }
}
