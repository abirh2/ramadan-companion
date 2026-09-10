package com.deencompanion.app;

import com.getcapacitor.BridgeActivity;
import com.deencompanion.app.widgets.WidgetPrefs;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(WidgetRefreshPlugin.class);
        super.onCreate(savedInstanceState);
        WidgetPrefs.purgeDeprecatedPrivateData(this);
    }
}
