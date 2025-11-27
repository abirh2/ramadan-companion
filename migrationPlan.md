# PWA to Capacitor Native App Migration Plan

## Overview

This plan converts the Deen Companion PWA into native iOS and Android apps using Capacitor, implementing prayer time widgets and native push notifications while preserving all existing functionality.

## Phase 0: Pre-Migration Assessment

### Current Architecture Analysis

**Browser APIs in Use:**

- `navigator.geolocation` - Used in [`src/lib/location.ts`](src/lib/location.ts:14-46)
- `DeviceOrientationEvent` - Used in [`src/lib/orientation.ts`](src/lib/orientation.ts:153-200) for dynamic Qibla compass
- Web Push API - Used in [`src/lib/notifications.ts`](src/lib/notifications.ts:196-238) and [`src/hooks/useNotifications.ts`](src/hooks/useNotifications.ts:87-150)
- `navigator.vibrate` - Used in [`src/lib/zikr.ts`](src/lib/zikr.ts:250-261) for haptic feedback
- `AudioContext` - Used in [`src/lib/zikr.ts`](src/lib/zikr.ts:215-245) for click sounds
- HTML5 `<audio>` - Used in [`src/components/quran/AyahAudioPlayer.tsx`](src/components/quran/AyahAudioPlayer.tsx:33) for Quran recitation

**Storage Systems:**

- `localStorage` - Extensively used (235 occurrences across 36 files) for dual-storage pattern
- Supabase database - All authenticated user data

**Push Notification Backend:**

- Vercel cron job at [`src/app/api/push/schedule/route.ts`](src/app/api/push/schedule/route.ts)
- Uses `web-push` library with VAPID keys
- Stores subscriptions in `push_subscriptions` table
- Runs every 5 minutes checking prayer times for all users

**External APIs (All HTTP-based, Capacitor-compatible):**

- AlAdhan API (prayer times, qibla, calendar)
- AlQuran Cloud API (quran, audio, tafsirs)
- HadithAPI (hadith collections)
- Nominatim/Overpass (geocoding, mosques)
- Geoapify (halal food)
- Frankfurter (currency exchange)

### Compatibility Assessment

| Component | Current | Capacitor Plugin | Migration Effort |

|-----------|---------|------------------|------------------|

| Geolocation | `navigator.geolocation` | `@capacitor/geolocation` | LOW - Simple replacement |

| DeviceOrientation | `DeviceOrientationEvent` | `@capacitor/motion` | MEDIUM - API differences |

| Push Notifications | Web Push API | `@capacitor/push-notifications` + FCM/APNs | HIGH - Backend changes |

| Haptic Feedback | `navigator.vibrate` | `@capacitor/haptics` | LOW - Direct replacement |

| Audio Playback | HTML5 Audio | Native (no plugin) | NONE - Works as-is |

| localStorage | Browser API | Native (no plugin) | NONE - Works as-is |

| Service Worker | PWA | Limited use in Capacitor | LOW - Reduce reliance |

| All External APIs | fetch() | Native (no plugin) | NONE - Works as-is |

**Estimated Compatibility: 96%** - Only widgets and native push require platform-specific code.

## Phase 1: Capacitor Setup & Configuration

### 1.1 Install Capacitor Core

```bash
npm install @capacitor/core @capacitor/cli --save-dev
npx cap init
```

**Configuration Values:**

- App name: "Deen Companion"
- App ID: `com.deencompanion.app` (or your preferred bundle ID)
- Web directory: `out` (for Next.js static export)

### 1.2 Add Platform Support

```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

**Generated Directories:**

- `ios/` - Xcode project
- `android/` - Android Studio project

### 1.3 Configure Next.js for Static Export

**File: [`next.config.ts`](next.config.ts)**

Add static export configuration:

```typescript
const nextConfig: NextConfig = {
  output: 'export', // Enable static export for Capacitor
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better routing for static files
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'maplibre-gl'],
  
  // Remove service worker headers (less relevant for native apps)
  // Keep manifest.json headers for PWA fallback
}
```

### 1.4 Capacitor Configuration

**File: `capacitor.config.ts` (will be created)**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deencompanion.app',
  appName: 'Deen Companion',
  webDir: 'out',
  server: {
    androidScheme: 'https', // Use HTTPS for Android
    iosScheme: 'capacitor', // Default iOS scheme
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f3d3e',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
```

### 1.5 Update Build Scripts

**File: [`package.json`](package.json:9-17)**

Add Capacitor-specific scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:cap": "next build && npx cap sync",
    "start": "next start",
    "lint": "eslint",
    "test": "jest --watch",
    "test:ci": "jest --ci",
    "test:coverage": "jest --coverage",
    "cap:sync": "npx cap sync",
    "cap:open:ios": "npx cap open ios",
    "cap:open:android": "npx cap open android",
    "cap:run:ios": "npx cap run ios",
    "cap:run:android": "npx cap run android"
  }
}
```

### 1.6 Update `.gitignore`

**File: [`.gitignore`](.gitignore)**

Add Capacitor build artifacts:

```
# Capacitor
/ios/App/build
/ios/App/Pods
/android/app/build
/android/build
/android/.gradle
/out
```

## Phase 2: Plugin Installation & Migration

### 2.1 Install Required Capacitor Plugins

```bash
npm install @capacitor/geolocation \
            @capacitor/motion \
            @capacitor/push-notifications \
            @capacitor/haptics \
            @capacitor/splash-screen \
            @capacitor/status-bar \
            @capacitor/keyboard
```

### 2.2 Migrate Geolocation API

**Files to modify:**

- [`src/lib/location.ts`](src/lib/location.ts) - Main geolocation logic

**Current Implementation (lines 14-46):**

```typescript
export async function requestGeolocation(): Promise<LocationData | null> {
  if (!navigator.geolocation) {
    console.error('Geolocation is not supported by this browser')
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const city = await reverseGeocode(lat, lng)
        resolve({ lat, lng, city: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, type: 'detected' })
      },
      (error) => {
        console.error('Geolocation error:', error.message)
        resolve(null)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  })
}
```

**New Implementation:**

```typescript
import { Geolocation } from '@capacitor/geolocation';

export async function requestGeolocation(): Promise<LocationData | null> {
  try {
    // Request permissions first
    const permission = await Geolocation.checkPermissions();
    
    if (permission.location !== 'granted') {
      const requestResult = await Geolocation.requestPermissions();
      if (requestResult.location !== 'granted') {
        console.error('Geolocation permission denied');
        return null;
      }
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      timeout: 10000,
      maximumAge: 300000,
      enableHighAccuracy: true,
    });

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const city = await reverseGeocode(lat, lng);

    return {
      lat,
      lng,
      city: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      type: 'detected',
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return null;
  }
}
```

**Testing Checklist:**

- [ ] Location permission prompt appears on first use
- [ ] Location coordinates match device location
- [ ] Reverse geocoding produces correct city name
- [ ] Error handling works when permission denied

### 2.3 Migrate DeviceOrientation API (Qibla Compass)

**Files to modify:**

- [`src/lib/orientation.ts`](src/lib/orientation.ts) - Device orientation utilities

**Current Implementation (lines 153-200):** Uses `DeviceOrientationEvent`

**New Implementation:** Use `@capacitor/motion` plugin

```typescript
import { Motion } from '@capacitor/motion';

// Replace startOrientationTracking function
export function startOrientationTracking(callback: OrientationCallback): () => void {
  if (!hasOrientationSupport()) {
    console.warn('[Orientation] Motion API not supported');
    return () => {};
  }

  let isActive = true;

  const startTracking = async () => {
    try {
      // Request permissions (iOS only)
      if (isIOS()) {
        const permission = await (DeviceOrientationEvent as any).requestPermission?.();
        if (permission !== 'granted') {
          console.warn('[Orientation] Permission denied');
          return;
        }
      }

      // Start listening to device orientation
      const listener = await Motion.addListener('orientation', (event) => {
        if (!isActive) return;

        // event.alpha, event.beta, event.gamma
        const heading: DeviceHeading = {
          alpha: normalizeHeading(event.alpha || 0),
          accuracy: null, // Motion plugin doesn't provide accuracy
          timestamp: Date.now(),
        };

        callback(heading);
      });

      // Return cleanup function
      return () => {
        isActive = false;
        listener.remove();
      };
    } catch (error) {
      console.error('[Orientation] Failed to start tracking:', error);
      return () => {};
    }
  };

  const cleanup = startTracking();
  return () => {
    isActive = false;
    cleanup.then(fn => fn && fn());
  };
}
```

**Note:** Capacitor Motion API has different behavior than web DeviceOrientationEvent. May need adjustment for iOS compass heading calibration.

### 2.4 Migrate Haptic Feedback

**Files to modify:**

- [`src/lib/zikr.ts`](src/lib/zikr.ts:250-261) - Haptic feedback function

**Current Implementation:**

```typescript
export function triggerHapticFeedback(): void {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) {
    return
  }

  try {
    navigator.vibrate(10) // 10ms pulse
  } catch (error) {
    console.debug('Haptic feedback failed:', error)
  }
}
```

**New Implementation:**

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function triggerHapticFeedback(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.debug('Haptic feedback failed:', error);
  }
}
```

**Update all call sites** to handle async:

- [`src/hooks/useZikr.ts`](src/hooks/useZikr.ts) - Line 8 import, usage in counter increment

### 2.5 Audio Playback (No Changes Required)

HTML5 Audio works natively in Capacitor. No migration needed for:

- [`src/components/quran/AyahAudioPlayer.tsx`](src/components/quran/AyahAudioPlayer.tsx:33)
- [`src/lib/zikr.ts`](src/lib/zikr.ts:215-245) - AudioContext for click sounds

**Testing Checklist:**

- [ ] Quran audio playback works
- [ ] Zikr click sounds work
- [ ] Audio continues when app is backgrounded (iOS may pause)

## Phase 3: Native Push Notifications Migration

### 3.1 Firebase Cloud Messaging (FCM) Setup

**For Android:**

1. Create Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app with package name: `com.ramadancompanion.app`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

**For iOS:**

1. In same Firebase project, add iOS app with bundle ID: `com.ramadancompanion.app`
2. Download `GoogleService-Info.plist`
3. Place in `ios/App/App/GoogleService-Info.plist`

### 3.2 Update Backend Push Notification System

**Files to modify:**

- [`src/app/api/push/schedule/route.ts`](src/app/api/push/schedule/route.ts) - Cron job
- [`src/app/api/push/subscribe/route.ts`](src/app/api/push/subscribe/route.ts) - Subscribe endpoint
- [`src/app/api/push/unsubscribe/route.ts`](src/app/api/push/unsubscribe/route.ts) - Unsubscribe endpoint

**Install FCM Admin SDK:**

```bash
npm install firebase-admin
```

**Replace `web-push` with `firebase-admin`:**

Current (lines 3, 10-14 in schedule/route.ts):

```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_MAILTO || 'mailto:admin@deen-companion.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
```

New:

```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}
```

**Update subscription storage:** Modify `push_subscriptions` table schema:

```sql
-- Add FCM token column
ALTER TABLE push_subscriptions ADD COLUMN fcm_token TEXT;

-- For migration period, keep endpoint for web push compatibility
-- After full migration, can drop endpoint, p256dh, auth columns
```

**Update send notification logic** (schedule/route.ts lines 172-196):

Current:

```typescript
await webpush.sendNotification(
  { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
  payload
)
```

New:

```typescript
await admin.messaging().send({
  token: sub.fcm_token,
  notification: {
    title: `Time for ${prayerName} - ${format12Hour(prayerTime)}`,
    body: `${quote.text} - ${quote.source}`,
  },
  data: {
    url: '/times',
    prayer: prayerName,
  },
  android: {
    priority: 'high',
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
      },
    },
  },
});
```

### 3.3 Frontend Push Notification Changes

**Files to modify:**

- [`src/lib/notifications.ts`](src/lib/notifications.ts:196-238) - subscribeToPush function
- [`src/hooks/useNotifications.ts`](src/hooks/useNotifications.ts:87-150) - requestPermission function

**Replace Web Push subscription with FCM token:**

Current (notifications.ts lines 197-238):

```typescript
export async function subscribeToPush(): Promise<PushSubscription | null> {
  // ... Web Push logic
}
```

New:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

export async function subscribeToPush(): Promise<{ fcmToken: string } | null> {
  try {
    // Request permission
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      return null;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Get FCM token
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve({ fcmToken: token.value });
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}
```

**Update subscribe API endpoint** (api/push/subscribe/route.ts):

Change payload format:

```typescript
const body = await request.json()
const { fcmToken } = body

if (!fcmToken) {
  return NextResponse.json({ error: 'FCM token required' }, { status: 400 })
}

const { error: dbError } = await supabase
  .from('push_subscriptions')
  .upsert({
    user_id: user.id,
    fcm_token: fcmToken,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,fcm_token'
  })
```

### 3.4 Environment Variables for FCM

**Add to `.env.local`:**

```bash
# Firebase Cloud Messaging (replaces VAPID keys)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Keep existing vars
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEOAPIFY_API_KEY=...
CRON_SECRET=...
```

**Remove (no longer needed):**

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_MAILTO`

## Phase 4: Native Widgets Implementation

### 4.1 iOS Widget (Swift/WidgetKit)

**Create widget directory:** `ios/App/PrayerTimesWidget/`

**File: `ios/App/PrayerTimesWidget/PrayerTimesWidget.swift`**

```swift
import WidgetKit
import SwiftUI

struct PrayerTimesProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayerTimesEntry {
        PrayerTimesEntry(date: Date(), nextPrayer: "Fajr", nextPrayerTime: "5:30 AM", timeRemaining: "2h 15m")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (PrayerTimesEntry) -> ()) {
        loadPrayerTimes { entry in
            completion(entry)
        }
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimesEntry>) -> ()) {
        loadPrayerTimes { entry in
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 1, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }
    
    private func loadPrayerTimes(completion: @escaping (PrayerTimesEntry) -> Void) {
        // Read from UserDefaults (shared with main app)
        let sharedDefaults = UserDefaults(suiteName: "group.com.ramadancompanion.app")
        
        let nextPrayer = sharedDefaults?.string(forKey: "nextPrayer") ?? "Fajr"
        let nextPrayerTime = sharedDefaults?.string(forKey: "nextPrayerTime") ?? "5:30 AM"
        let timeRemaining = sharedDefaults?.string(forKey: "timeRemaining") ?? "Loading..."
        
        let entry = PrayerTimesEntry(
            date: Date(),
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            timeRemaining: timeRemaining
        )
        
        completion(entry)
    }
}

struct PrayerTimesEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let nextPrayerTime: String
    let timeRemaining: String
}

struct PrayerTimesWidgetEntryView: View {
    var entry: PrayerTimesProvider.Entry
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

struct SmallWidgetView: View {
    var entry: PrayerTimesEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Next Prayer")
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text(entry.nextPrayer)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(entry.nextPrayerTime)
                .font(.headline)
            
            Spacer()
            
            Text(entry.timeRemaining)
                .font(.caption)
                .foregroundColor(.green)
        }
        .padding()
    }
}

struct MediumWidgetView: View {
    var entry: PrayerTimesEntry
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text("Next Prayer")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(entry.nextPrayer)
                    .font(.title)
                    .fontWeight(.bold)
                
                Text(entry.nextPrayerTime)
                    .font(.title3)
            }
            
            Spacer()
            
            VStack {
                Spacer()
                Text(entry.timeRemaining)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
                Spacer()
            }
        }
        .padding()
    }
}

@main
struct PrayerTimesWidget: Widget {
    let kind: String = "PrayerTimesWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimesProvider()) { entry in
            PrayerTimesWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("View next prayer time and countdown")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

**File: `ios/App/PrayerTimesWidget/Info.plist`**

Standard widget Info.plist with bundle ID: `com.ramadancompanion.app.PrayerTimesWidget`

### 4.2 Android Widget (Kotlin)

**Create widget directory:** `android/app/src/main/java/com/ramadancompanion/app/widgets/`

**File: `PrayerTimesWidget.kt`**

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

class PrayerTimesWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
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
            // Read from SharedPreferences
            val prefs = context.getSharedPreferences("RamadanCompanion", Context.MODE_PRIVATE)
            val nextPrayer = prefs.getString("nextPrayer", "Fajr") ?: "Fajr"
            val nextPrayerTime = prefs.getString("nextPrayerTime", "5:30 AM") ?: "5:30 AM"
            val timeRemaining = prefs.getString("timeRemaining", "Loading...") ?: "Loading..."

            // Construct RemoteViews
            val views = RemoteViews(context.packageName, R.layout.prayer_times_widget)
            
            views.setTextViewText(R.id.next_prayer_label, "Next Prayer")
            views.setTextViewText(R.id.next_prayer_name, nextPrayer)
            views.setTextViewText(R.id.next_prayer_time, nextPrayerTime)
            views.setTextViewText(R.id.time_remaining, timeRemaining)

            // Set click intent to open app
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
```

**File: `android/app/src/main/res/layout/prayer_times_widget.xml`**

```xml
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
        android:textColor="#888888" />

    <TextView
        android:id="@+id/next_prayer_name"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Fajr"
        android:textSize="24sp"
        android:textStyle="bold"
        android:textColor="#000000"
        android:layout_marginTop="4dp" />

    <TextView
        android:id="@+id/next_prayer_time"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="5:30 AM"
        android:textSize="18sp"
        android:textColor="#000000"
        android:layout_marginTop="4dp" />

    <TextView
        android:id="@+id/time_remaining"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="2h 15m"
        android:textSize="14sp"
        android:textColor="#00AA00"
        android:layout_marginTop="8dp" />

</LinearLayout>
```

**Register widget in `AndroidManifest.xml`:**

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

### 4.3 Widget Data Bridge (React Native Side)

**Create new file: `src/lib/widgetBridge.ts`**

```typescript
import { Preferences } from '@capacitor/preferences';

export interface WidgetData {
  nextPrayer: string;
  nextPrayerTime: string;
  timeRemaining: string;
  lastUpdate: string;
}

/**
 * Save prayer times data for widget consumption
 * iOS: Writes to UserDefaults (App Group)
 * Android: Writes to SharedPreferences
 */
export async function updateWidgetData(data: WidgetData): Promise<void> {
  try {
    // Store each field separately for native widget access
    await Promise.all([
      Preferences.set({ key: 'nextPrayer', value: data.nextPrayer }),
      Preferences.set({ key: 'nextPrayerTime', value: data.nextPrayerTime }),
      Preferences.set({ key: 'timeRemaining', value: data.timeRemaining }),
      Preferences.set({ key: 'lastUpdate', value: data.lastUpdate }),
    ]);

    // Trigger widget update on native side
    // iOS: WidgetCenter.shared.reloadAllTimelines()
    // Android: Broadcast intent to widget provider
    
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
      Preferences.get({ key: 'nextPrayer' }),
      Preferences.get({ key: 'nextPrayerTime' }),
      Preferences.get({ key: 'timeRemaining' }),
      Preferences.get({ key: 'lastUpdate' }),
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

**Integrate into prayer times hook** ([`src/hooks/usePrayerTimes.ts`](src/hooks/usePrayerTimes.ts)):

Add after successful prayer times fetch (around line 390):

```typescript
import { updateWidgetData } from '@/lib/widgetBridge';

// ... inside fetchData function, after setting state ...

// Update widget with prayer time data
if (prayerTimes && nextPrayer) {
  await updateWidgetData({
    nextPrayer: nextPrayer.name,
    nextPrayerTime: nextPrayer.time,
    timeRemaining: nextPrayer.timeRemaining || 'Now',
    lastUpdate: new Date().toISOString(),
  });
}
```

## Phase 5: Local Testing Setup

### 5.1 iOS Local Testing

**Requirements:**

- macOS with Xcode 15+
- iOS device or simulator
- Apple Developer account (free for local testing)

**Steps:**

1. Build Next.js static export:
```bash
npm run build
```

2. Sync with iOS:
```bash
npx cap sync ios
```

3. Open Xcode:
```bash
npx cap open ios
```

4. Configure signing:

            - Select project → Signing & Capabilities
            - Team: Select your Apple Developer account
            - Bundle Identifier: `com.ramadancompanion.app` (or your preferred ID)

5. Add widget target:

            - File → New → Target → Widget Extension
            - Name: "PrayerTimesWidget"
            - Bundle ID: `com.ramadancompanion.app.PrayerTimesWidget`

6. Configure App Groups (for widget data sharing):

            - Main app: Signing & Capabilities → + Capability → App Groups → Add `group.com.ramadancompanion.app`
            - Widget: Same steps

7. Run on device:

            - Select device/simulator from dropdown
            - Click Run (⌘R)

8. Test widget:

            - Long-press home screen → Add Widget → Find "Prayer Times"

### 5.2 Android Local Testing

**Requirements:**

- Android Studio
- Android device or emulator (API 24+)

**Steps:**

1. Build Next.js static export:
```bash
npm run build
```

2. Sync with Android:
```bash
npx cap sync android
```

3. Open Android Studio:
```bash
npx cap open android
```

4. Configure signing (for local testing, auto-generated debug key works):

            - Build → Generate Signed Bundle / APK → APK
            - Create new keystore (save for future use)

5. Run on device:

            - Connect device via USB (enable USB debugging)
            - Select device from dropdown
            - Click Run (▶)

6. Test widget:

            - Long-press home screen → Widgets → Find "Prayer Times"

### 5.3 Testing Checklist

**Core Functionality:**

- [ ] App launches successfully
- [ ] All pages render correctly
- [ ] Prayer times display accurately
- [ ] Qibla compass works (dynamic mode on mobile)
- [ ] Quran audio playback works
- [ ] Hadith browsing works
- [ ] Maps display (mosques, halal food)
- [ ] Authentication (login/signup/logout)
- [ ] Favorites save/load correctly
- [ ] Donations tracking works
- [ ] Zikr counter increments with haptic feedback

**Native Features:**

- [ ] Geolocation permission requested
- [ ] Location detected accurately
- [ ] Push notification permission requested
- [ ] Notifications received at prayer times
- [ ] Haptic feedback on zikr counter
- [ ] Widget displays on home screen
- [ ] Widget updates automatically
- [ ] Widget opens app on tap

**Offline Mode:**

- [ ] App works without internet (cached pages)
- [ ] Prayer times calculated locally when offline
- [ ] localStorage persists data

## Phase 6: TestFlight Preparation (iOS)

### 6.1 App Store Connect Setup

1. Create App ID at [developer.apple.com](https://developer.apple.com):

            - Identifier: `com.ramadancompanion.app`
            - Capabilities: Push Notifications, App Groups

2. Create app in App Store Connect:

            - Name: "Deen Companion"
            - Bundle ID: `com.deencompanion.app`
            - Primary language: English
            - Category: Lifestyle

### 6.2 App Assets

**Required Assets:**

- App Icon: 1024x1024 PNG (no alpha channel)
- Screenshots: 6.7", 6.5", 5.5" sizes
- App description (4000 chars)
- Keywords
- Support URL
- Privacy policy URL

**Generate from existing:**

- Use [`public/icon-512.png`](public/icon-512.png) as base
- Upscale to 1024x1024
- Use screenshot automation from [`scripts/capture-pages.ts`](scripts/capture-pages.ts)

### 6.3 Archive & Upload

1. In Xcode:

            - Product → Archive
            - Organizer → Distribute App → App Store Connect
            - Upload

2. In App Store Connect:

            - Select build for TestFlight
            - Provide export compliance info
            - Add internal testers

### 6.4 TestFlight Testing

- Send invites to testers
- Collect feedback
- Iterate on issues
- Submit for App Review when ready

## Phase 7: Google Play Preparation (Android)

### 7.1 Google Play Console Setup

1. Create app at [play.google.com/console](https://play.google.com/console):

            - App name: "Deen Companion"
            - Default language: English
            - App/Game: App
            - Free/Paid: Free

2. Complete app details:

            - Category: Lifestyle
            - Content rating
            - Privacy policy
            - Target audience

### 7.2 App Assets

**Required Assets:**

- App icon: 512x512 PNG
- Feature graphic: 1024x500
- Screenshots: Phone (min 2), Tablet (optional)
- Short description (80 chars)
- Full description (4000 chars)

### 7.3 Generate Signed APK

1. In Android Studio:

            - Build → Generate Signed Bundle / APK
            - Select "Android App Bundle" (AAB)
            - Use production keystore
            - Release build variant

2. Upload to Google Play:

            - Production → Create new release
            - Upload AAB file
            - Release notes

### 7.4 Internal Testing Track

- Create internal testing track
- Upload AAB
- Add testers via email
- Send test link

## Success Criteria

### Phase 1-2 (Setup & Plugins)

- [ ] Capacitor installed and configured
- [ ] iOS and Android projects created
- [ ] All plugins installed
- [ ] Geolocation migrated and tested
- [ ] DeviceOrientation migrated and tested
- [ ] Haptic feedback migrated and tested

### Phase 3 (Push Notifications)

- [ ] FCM configured for both platforms
- [ ] Backend migrated to FCM
- [ ] Frontend push registration working
- [ ] Test notification received on device

### Phase 4 (Widgets)

- [ ] iOS widget displays prayer times
- [ ] Android widget displays prayer times
- [ ] Widget data updates from app
- [ ] Widget tap opens app

### Phase 5 (Local Testing)

- [ ] App runs on iOS device/simulator
- [ ] App runs on Android device/emulator
- [ ] All core features work
- [ ] All native features work
- [ ] No critical bugs

### Phase 6-7 (Distribution)

- [ ] TestFlight build uploaded and approved
- [ ] Internal testers can install iOS app
- [ ] Google Play Console configured
- [ ] Internal testers can install Android app
- [ ] User feedback collected and addressed

## Risk Mitigation

**High Risk:**

- Push notification backend migration may break existing web users
        - Mitigation: Support both Web Push and FCM during transition period

**Medium Risk:**

- Widget data synchronization may be unreliable
        - Mitigation: Implement fallback to last known good data

**Low Risk:**

- Static export may break API routes
        - Mitigation: Keep Next.js backend running, app calls via HTTPS

## Timeline Estimate

- Phase 1-2: 3-4 days (setup + plugin migration)
- Phase 3: 4-5 days (push notifications migration)
- Phase 4: 3-4 days (native widgets)
- Phase 5: 2-3 days (local testing + fixes)
- Phase 6-7: 2-3 days (TestFlight/Play Console setup)

**Total: 14-19 days** for complete migration with widgets and distribution setup.

## Next Steps

1. Review and approve this plan
2. Create backup branch: `git checkout -b capacitor-migration`
3. Begin Phase 1: Capacitor Setup
4. Test incrementally after each phase
5. Document issues and solutions as they arise