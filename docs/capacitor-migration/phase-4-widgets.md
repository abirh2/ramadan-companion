# Phase 4: Native Widgets Implementation

**Duration:** 3-4 days  
**Complexity:** Medium-High  
**Prerequisites:** Phase 3 complete (or Phase 2 minimum)

---

## Overview

This phase implements home screen widgets displaying prayer times. Users can see next prayer information without opening the app.

**What You'll Create:**
1. iOS widget (Swift/WidgetKit) - Small and Medium sizes
2. Android widget (Kotlin) - 2x2 and 4x2 sizes
3. Widget data bridge (TypeScript)
4. Integration with prayer times hook

**Widget Features:**
- Shows next prayer name
- Shows next prayer time (12-hour format)
- Shows countdown/time remaining
- Tapping widget opens app to `/times` page
- Updates automatically when prayer times change

---

## Architecture Overview

```
React App (usePrayerTimes hook)
    ↓
Widget Bridge (widgetBridge.ts)
    ↓
Capacitor Preferences Plugin
    ↓
Native Storage (UserDefaults/SharedPreferences)
    ↓
Native Widgets (Swift/Kotlin)
```

**Data Flow:**
1. App calculates prayer times
2. Bridge writes to shared storage (Preferences plugin)
3. Widget reads from shared storage
4. Widget displays information
5. Updates every 1-5 minutes

---

## Step 1: Create Widget Data Bridge

### 1.1 Install Preferences Plugin

Already installed in Phase 2, but verify:

```bash
npm list @capacitor/preferences
```

If not installed:

```bash
npm install @capacitor/preferences
npx cap sync
```

### 1.2 Create `src/lib/widgetBridge.ts`

**New File:** `src/lib/widgetBridge.ts`

```typescript
import { Preferences } from '@capacitor/preferences';

export interface WidgetData {
  nextPrayer: string;       // e.g., "Fajr", "Dhuhr"
  nextPrayerTime: string;   // e.g., "5:30 AM"
  timeRemaining: string;    // e.g., "2h 15m" or "Now"
  lastUpdate: string;       // ISO timestamp
}

/**
 * Update widget data for native widgets to consume
 * Writes to Capacitor Preferences, which maps to:
 * - iOS: UserDefaults (App Group shared storage)
 * - Android: SharedPreferences
 */
export async function updateWidgetData(data: WidgetData): Promise<void> {
  try {
    // Store each field separately for native widget access
    await Promise.all([
      Preferences.set({ key: 'widget_nextPrayer', value: data.nextPrayer }),
      Preferences.set({ key: 'widget_nextPrayerTime', value: data.nextPrayerTime }),
      Preferences.set({ key: 'widget_timeRemaining', value: data.timeRemaining }),
      Preferences.set({ key: 'widget_lastUpdate', value: data.lastUpdate }),
    ]);

    console.log('[Widget] Data updated:', data);
  } catch (error) {
    console.error('[Widget] Failed to update data:', error);
  }
}

/**
 * Read widget data (for debugging)
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const [nextPrayer, nextPrayerTime, timeRemaining, lastUpdate] = await Promise.all([
      Preferences.get({ key: 'widget_nextPrayer' }),
      Preferences.get({ key: 'widget_nextPrayerTime' }),
      Preferences.get({ key: 'widget_timeRemaining' }),
      Preferences.get({ key: 'widget_lastUpdate' }),
    ]);

    if (!nextPrayer.value) return null;

    return {
      nextPrayer: nextPrayer.value,
      nextPrayerTime: nextPrayerTime.value || '',
      timeRemaining: timeRemaining.value || '',
      lastUpdate: lastUpdate.value || '',
    };
  } catch (error) {
    console.error('[Widget] Failed to read data:', error);
    return null;
  }
}
```

### 1.3 Integrate with Prayer Times Hook

**File:** `src/hooks/usePrayerTimes.ts`

**Add import at top:**

```typescript
import { updateWidgetData } from '@/lib/widgetBridge';
```

**Add after successful prayer times fetch (around line 390, after `setState`):**

```typescript
// Update widget with next prayer data
if (prayerTimes && nextPrayer) {
  await updateWidgetData({
    nextPrayer: nextPrayer.name,
    nextPrayerTime: nextPrayer.time,
    timeRemaining: nextPrayer.timeRemaining || 'Now',
    lastUpdate: new Date().toISOString(),
  });
}
```

**Test data bridge:**

```bash
npm run build
npx cap sync
```

Run app and navigate to `/times`. Check console for `[Widget] Data updated` message.

---

## Step 2: iOS Widget Implementation

### 2.1 Create Widget Extension in Xcode

```bash
npm run cap:open:ios
```

**In Xcode:**

1. File → New → Target
2. Search for "Widget Extension"
3. Product Name: `PrayerTimesWidget`
4. **Uncheck** "Include Configuration Intent"
5. Language: Swift
6. Click "Finish"
7. **Activate scheme** when prompted

**Result:** New folder `PrayerTimesWidget/` created in project navigator.

### 2.2 Configure App Groups (for shared storage)

**Main App Target:**
1. Select project → Target "App"
2. Signing & Capabilities tab
3. "+ Capability" → App Groups
4. Click "+" to add new group
5. Identifier: `group.com.ramadancompanion.app`
6. Ensure checkbox is **checked**

**Widget Target:**
1. Select Target "PrayerTimesWidget"
2. Signing & Capabilities tab
3. "+ Capability" → App Groups
4. Check **same group**: `group.com.ramadancompanion.app`

### 2.3 Create Widget Swift Code

**File:** `ios/App/PrayerTimesWidget/PrayerTimesWidget.swift`

Replace entire file content:

```swift
import WidgetKit
import SwiftUI

// MARK: - Widget Data Model
struct PrayerTimesEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let nextPrayerTime: String
    let timeRemaining: String
}

// MARK: - Widget Provider
struct PrayerTimesProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerTimesEntry {
        PrayerTimesEntry(
            date: Date(),
            nextPrayer: "Fajr",
            nextPrayerTime: "5:30 AM",
            timeRemaining: "2h 15m"
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (PrayerTimesEntry) -> Void) {
        let entry = loadPrayerTimes()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimesEntry>) -> Void) {
        let entry = loadPrayerTimes()
        
        // Update every 5 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
    
    // Load prayer times from UserDefaults (shared with main app)
    private func loadPrayerTimes() -> PrayerTimesEntry {
        let sharedDefaults = UserDefaults(suiteName: "group.com.ramadancompanion.app")
        
        let nextPrayer = sharedDefaults?.string(forKey: "widget_nextPrayer") ?? "Fajr"
        let nextPrayerTime = sharedDefaults?.string(forKey: "widget_nextPrayerTime") ?? "Loading..."
        let timeRemaining = sharedDefaults?.string(forKey: "widget_timeRemaining") ?? "—"
        
        return PrayerTimesEntry(
            date: Date(),
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            timeRemaining: timeRemaining
        )
    }
}

// MARK: - Widget Views
struct SmallWidgetView: View {
    var entry: PrayerTimesEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Next Prayer")
                .font(.caption2)
                .foregroundColor(.secondary)
            
            Text(entry.nextPrayer)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Color(red: 0.06, green: 0.24, blue: 0.24)) // #0f3d3e
            
            Text(entry.nextPrayerTime)
                .font(.headline)
            
            Spacer()
            
            HStack {
                Image(systemName: "clock.fill")
                    .font(.caption2)
                    .foregroundColor(.green)
                Text(entry.timeRemaining)
                    .font(.caption)
                    .foregroundColor(.green)
            }
        }
        .padding()
    }
}

struct MediumWidgetView: View {
    var entry: PrayerTimesEntry
    
    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Next Prayer")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(entry.nextPrayer)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.06, green: 0.24, blue: 0.24))
                
                Text(entry.nextPrayerTime)
                    .font(.title3)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 8) {
                Image(systemName: "clock.fill")
                    .font(.title2)
                    .foregroundColor(.green)
                
                Text(entry.timeRemaining)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
            }
        }
        .padding()
    }
}

// MARK: - Widget Entry View
struct PrayerTimesWidgetEntryView: View {
    var entry: PrayerTimesEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration
@main
struct PrayerTimesWidget: Widget {
    let kind: String = "PrayerTimesWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimesProvider()) { entry in
            PrayerTimesWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("View next prayer time and countdown.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview
struct PrayerTimesWidget_Previews: PreviewProvider {
    static var previews: some View {
        PrayerTimesWidgetEntryView(entry: PrayerTimesEntry(
            date: Date(),
            nextPrayer: "Fajr",
            nextPrayerTime: "5:30 AM",
            timeRemaining: "2h 15m"
        ))
        .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
```

### 2.4 Update Capacitor Configuration for iOS

**File:** `capacitor.config.ts`

Add preference configuration for App Groups:

```typescript
ios: {
  contentInset: 'always',
  // Configure App Group for widget data sharing
  backgroundColor: '#0f3d3e',
},
plugins: {
  Preferences: {
    group: 'group.com.ramadancompanion.app', // Must match App Group ID
  },
  // ... other plugins
},
```

### 2.5 Build and Test iOS Widget

**In Xcode:**
1. Select scheme: `PrayerTimesWidget` (not "App")
2. Select device/simulator
3. Run (⌘R)

**Expected:** Widget preview appears showing prayer times data.

**Add to Home Screen:**
1. Stop widget preview
2. Run main app scheme: "App"
3. Build and run on device
4. Navigate to `/times` to populate widget data
5. Long-press home screen → "+" → Search "Prayer"
6. Select "Prayer Times" widget
7. Choose Small or Medium size
8. "Add Widget"

**Expected:** Widget appears on home screen with actual prayer times.

---

## Step 3: Android Widget Implementation

### 3.1 Create Widget Layout XML

**File:** `android/app/src/main/res/layout/prayer_times_widget.xml`

Create if doesn't exist:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_background">

    <TextView
        android:id="@+id/next_prayer_label"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Next Prayer"
        android:textSize="12sp"
        android:textColor="#888888"
        android:fontFamily="sans-serif-medium" />

    <TextView
        android:id="@+id/next_prayer_name"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Fajr"
        android:textSize="24sp"
        android:textStyle="bold"
        android:textColor="#0f3d3e"
        android:layout_marginTop="4dp" />

    <TextView
        android:id="@+id/next_prayer_time"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="5:30 AM"
        android:textSize="18sp"
        android:textColor="#000000"
        android:layout_marginTop="4dp" />

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="8dp">

        <TextView
            android:id="@+id/time_remaining"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="2h 15m"
            android:textSize="14sp"
            android:textColor="#00AA00"
            android:drawableLeft="@android:drawable/ic_menu_recent_history"
            android:drawablePadding="4dp"
            android:gravity="center_vertical" />
    </LinearLayout>

</LinearLayout>
```

### 3.2 Create Widget Background Drawable

**File:** `android/app/src/main/res/drawable/widget_background.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#FFFFFF" />
    <corners android:radius="16dp" />
    <stroke
        android:width="1dp"
        android:color="#E0E0E0" />
</shape>
```

### 3.3 Create Widget Info XML

**File:** `android/app/src/main/res/xml/prayer_times_widget_info.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:targetCellWidth="2"
    android:targetCellHeight="2"
    android:updatePeriodMillis="300000"
    android:previewImage="@mipmap/ic_launcher"
    android:initialLayout="@layout/prayer_times_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
```

### 3.4 Create Widget Provider Kotlin Class

**File:** `android/app/src/main/java/com/ramadancompanion/app/widgets/PrayerTimesWidget.kt`

Create directory structure if needed, then create file:

```kotlin
package com.ramadancompanion.app.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.ramadancompanion.app.R
import com.ramadancompanion.app.MainActivity

/**
 * Prayer Times Widget
 * Displays next prayer name, time, and countdown
 */
class PrayerTimesWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update all widget instances
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            // Read from SharedPreferences (written by Capacitor Preferences plugin)
            val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
            
            val nextPrayer = prefs.getString("widget_nextPrayer", "Fajr") ?: "Fajr"
            val nextPrayerTime = prefs.getString("widget_nextPrayerTime", "Loading...") ?: "Loading..."
            val timeRemaining = prefs.getString("widget_timeRemaining", "—") ?: "—"

            // Construct the RemoteViews object
            val views = RemoteViews(context.packageName, R.layout.prayer_times_widget)
            
            views.setTextViewText(R.id.next_prayer_label, "Next Prayer")
            views.setTextViewText(R.id.next_prayer_name, nextPrayer)
            views.setTextViewText(R.id.next_prayer_time, nextPrayerTime)
            views.setTextViewText(R.id.time_remaining, timeRemaining)

            // Create intent to open main app when widget is tapped
            val intent = Intent(context, MainActivity::class.java).apply {
                putExtra("route", "/times") // Deep link to prayer times page
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // Tell the AppWidgetManager to update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
```

### 3.5 Register Widget in AndroidManifest.xml

**File:** `android/app/src/main/AndroidManifest.xml`

Add inside `<application>` tag (before closing `</application>`):

```xml
<receiver
    android:name=".widgets.PrayerTimesWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/prayer_times_widget_info" />
</receiver>
```

### 3.6 Build and Test Android Widget

```bash
npx cap sync android
npm run cap:open:android
```

**In Android Studio:**
1. Build → Make Project (⌘F9)
2. Run → Run 'app' (Shift+F10)
3. App installs on device

**Add Widget to Home Screen:**
1. Long-press home screen
2. Widgets → Find "Prayer Times"
3. Drag to home screen
4. Resize if needed

**Expected:** Widget shows next prayer information.

**Update Widget:**
1. Open main app
2. Navigate to `/times`
3. Widget should update within ~5 minutes

---

## Verification Checklist

- [ ] `src/lib/widgetBridge.ts` created
- [ ] `usePrayerTimes` calls `updateWidgetData()`
- [ ] iOS widget extension created in Xcode
- [ ] iOS App Groups configured
- [ ] iOS widget displays on home screen
- [ ] iOS widget updates when app changes prayer times
- [ ] Android widget layout XML created
- [ ] Android widget Kotlin code created
- [ ] Android widget registered in manifest
- [ ] Android widget displays on home screen
- [ ] Android widget updates when app changes prayer times
- [ ] Tapping widget opens app to `/times` page
- [ ] Widget shows placeholder when no data available

---

## Troubleshooting

### iOS: Widget shows "Loading..." forever

**Solution:** 
1. Verify App Group ID matches in both targets
2. Check Capacitor Preferences plugin configured with group
3. Rebuild and reinstall app
4. Open app and navigate to `/times` to populate data

### Android: Widget not found in widget list

**Solution:**
1. Verify widget registered in `AndroidManifest.xml`
2. Check `prayer_times_widget_info.xml` exists
3. Rebuild: Build → Clean Project → Build → Make Project
4. Reinstall app

### Widget doesn't update after app changes

**iOS Solution:** Widgets update on timeline. Either wait 5 minutes or force refresh in Settings → Widget Preview.

**Android Solution:** Increase `updatePeriodMillis` to lower value (minimum is 30 minutes in Android 8+). For more frequent updates, use `AlarmManager` in widget provider.

### Widget crashes on tap

**Solution:** Verify pending intent flags include `PendingIntent.FLAG_IMMUTABLE` (required in Android 12+).

---

## Next Steps

✅ **Phase 4 Complete!** You now have:
- Prayer times widgets on iOS home screen
- Prayer times widgets on Android home screen
- Widget data bridge working
- Widgets update automatically

→ **Continue to [Phase 5: Local Testing](./phase-5-local-testing.md)**

---

**Phase 4 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Issues Encountered:** None / [Describe]  
**Ready for Phase 5:** Yes / No

