# Phase 3: Native Push Notifications Migration

**Duration:** 4-5 days  
**Complexity:** High  
**Prerequisites:** Phase 2 complete

---

## Overview

This phase migrates from Web Push API to native push notifications using Firebase Cloud Messaging (FCM). This enables more reliable notifications on both platforms.

**What Changes:**
- Backend: `web-push` → `firebase-admin`
- Frontend: Web Push API → `@capacitor/push-notifications`
- Database: Add `fcm_token` column to `push_subscriptions` table
- Environment: Replace VAPID keys with Firebase credentials

**Why This Change:**
- ✅ Better reliability on iOS (no background limitations)
- ✅ Consistent behavior across platforms
- ✅ Support for future features (data messages, topics)

---

## Prerequisites Checklist

Before starting:
- [ ] Phase 1 and 2 complete
- [ ] App builds and runs on both platforms
- [ ] Google account for Firebase Console
- [ ] Apple Developer account (free tier OK for development)

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Project name: "Deen Companion"
4. Enable Google Analytics: Optional (recommended for production)
5. Click "Create project"
6. Wait for project creation (~30 seconds)

### 1.2 Add iOS App to Firebase

1. In Firebase Console → Project Overview
2. Click iOS icon (⊕)
3. **Apple bundle ID:** `com.ramadancompanion.app`
   - Must match `appId` in `capacitor.config.ts`
4. **App nickname:** "Deen Companion iOS"  
5. **App Store ID:** Leave blank for now
6. Click "Register app"
7. **Download `GoogleService-Info.plist`**
8. Click "Next" through remaining steps
9. Click "Continue to console"

**Place downloaded file:**
```bash
# Move to iOS project
mv ~/Downloads/GoogleService-Info.plist ios/App/App/GoogleService-Info.plist
```

### 1.3 Add Android App to Firebase

1. In Firebase Console → Project Overview
2. Click Android icon (robot ⊕)
3. **Android package name:** `com.ramadancompanion.app`
   - Must match `appId` in `capacitor.config.ts`
4. **App nickname:** "Deen Companion Android"
5. **Debug signing certificate SHA-1:** Leave blank (optional for push)
6. Click "Register app"
7. **Download `google-services.json`**
8. Click "Next" through remaining steps
9. Click "Continue to console"

**Place downloaded file:**
```bash
# Move to Android project
mv ~/Downloads/google-services.json android/app/google-services.json
```

### 1.4 Enable Cloud Messaging API

1. In Firebase Console → Project Settings (gear icon)
2. Navigate to "Cloud Messaging" tab
3. **Cloud Messaging API:** Should show as enabled
4. Note the **Server key** (we'll use this later)

---

## Step 2: iOS APNs Configuration

### 2.1 Create APNs Key in Apple Developer

1. Go to [Apple Developer](https://developer.apple.com/account/resources/authkeys/list)
2. Click "+" to create new key
3. **Key Name:** "Deen Companion Push Notifications"
4. **Enable:** Apple Push Notifications service (APNs)
5. Click "Continue" → "Register"
6. **Download `.p8` file** (save securely - can't download again)
7. Note **Key ID** (e.g., `ABC123XYZ`)
8. Note **Team ID** (top right of page, e.g., `DEF456UVW`)

### 2.2 Upload APNs Key to Firebase

1. In Firebase Console → Project Settings → Cloud Messaging
2. Scroll to "Apple app configuration"
3. Click "Upload" under APNs Authentication Key
4. Select downloaded `.p8` file
5. Enter **Key ID** and **Team ID**
6. Click "Upload"

---

## Step 3: Backend Migration (API Routes)

### 3.1 Install Firebase Admin SDK

```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion
npm install firebase-admin
```

### 3.2 Create Firebase Credentials File

Create `.env.local` entries for Firebase (or add to existing):

```bash
# Firebase Cloud Messaging (replaces Web Push/VAPID)
FIREBASE_PROJECT_ID=deen-companion-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@deen-companion-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**How to get these values:**

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Extract values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` in the string)

**Important:** Keep private key secure. Add `.env.local` to `.gitignore` (already done).

### 3.3 Update Database Schema

**SQL Migration:**

```sql
-- Add FCM token column to push_subscriptions table
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token 
ON push_subscriptions(fcm_token);

-- Optional: Keep old columns during transition period
-- Later, you can drop: endpoint, p256dh, auth
```

**Run migration in Supabase:**
1. Supabase Dashboard → SQL Editor
2. Paste SQL above
3. Run query

### 3.4 Migrate `src/app/api/push/schedule/route.ts`

**File:** `src/app/api/push/schedule/route.ts`

**Replace imports (lines 1-7):**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import * as admin from 'firebase-admin' // NEW
import { getRandomPrayerQuote } from '@/lib/prayerQuotes'
import { calculatePrayerTimesLocal } from '@/lib/prayerTimes'
import { getTimezoneFromCoordinates } from '@/lib/timezone'
import type { PrayerName } from '@/types/notification.types'
```

**Replace Firebase initialization (lines 9-14):**

```typescript
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

**Replace notification sending logic (lines 160-196):**

```typescript
// Generate notification payload
const payload = {
  notification: {
    title: `Time for ${prayerName} - ${format12Hour(prayerTime)}`,
    body: `${quote.text} - ${quote.source}`,
  },
  data: {
    url: '/times',
    prayer: prayerName,
    prayerTime: prayerTime,
  },
  android: {
    priority: 'high' as const,
    notification: {
      icon: 'ic_notification',
      color: '#0f3d3e', // App theme color
      sound: 'default',
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
        contentAvailable: true,
      },
    },
  },
};

// Send to all user's subscriptions
for (const sub of subscriptions) {
  // Skip if no FCM token
  if (!sub.fcm_token) {
    console.warn(`[Push] No FCM token for subscription ${sub.id}`);
    continue;
  }

  try {
    await admin.messaging().send({
      token: sub.fcm_token,
      ...payload,
    });
    results.success++;
  } catch (error: any) {
    console.error(`[Push] Failed to send to ${sub.fcm_token}:`, error);
    
    // Handle invalid tokens
    if (error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token') {
      // Delete expired subscription
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', sub.id);
      console.log(`[Push] Deleted expired subscription ${sub.id}`);
    }
    
    results.failed++;
  }
}
```

### 3.5 Migrate `src/app/api/push/subscribe/route.ts`

**File:** `src/app/api/push/subscribe/route.ts`

**Update subscription handling (lines 14-42):**

```typescript
// Parse FCM token from request
const body = await request.json()
const { fcmToken } = body

if (!fcmToken || typeof fcmToken !== 'string') {
  return NextResponse.json(
    { error: 'Invalid FCM token format' },
    { status: 400 }
  )
}

// Get user agent for tracking
const userAgent = request.headers.get('user-agent') || null

// Upsert subscription (update if token exists, insert if new)
const { error: dbError } = await supabase
  .from('push_subscriptions')
  .upsert({
    user_id: user.id,
    fcm_token: fcmToken,
    user_agent: userAgent,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,fcm_token' // Prevent duplicate tokens per user
  })

if (dbError) {
  console.error('[API] Database error:', dbError)
  throw dbError
}

return NextResponse.json({ success: true })
```

### 3.6 Update `src/app/api/push/unsubscribe/route.ts`

**File:** `src/app/api/push/unsubscribe/route.ts`

**Update unsubscribe logic (lines 13-25):**

```typescript
const { fcmToken } = await request.json()

if (!fcmToken) {
  return NextResponse.json({ error: 'FCM token required' }, { status: 400 })
}

// Delete subscription by FCM token
const { error: dbError } = await supabase
  .from('push_subscriptions')
  .delete()
  .eq('user_id', user.id)
  .eq('fcm_token', fcmToken)

if (dbError) throw dbError

return NextResponse.json({ success: true })
```

---

## Step 4: Frontend Migration

### 4.1 Install Push Notifications Plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

### 4.2 Migrate `src/lib/notifications.ts`

**File:** `src/lib/notifications.ts`

**Add import (line 1):**

```typescript
import { PushNotifications } from '@capacitor/push-notifications';
```

**Replace `subscribeToPush` function (lines 196-238):**

```typescript
/**
 * Subscribe to push notifications using FCM
 * Returns FCM token or null if failed
 */
export async function subscribeToPush(): Promise<{ fcmToken: string } | null> {
  if (!isNotificationSupported()) return null;

  try {
    // Request permission
    const permission = await PushNotifications.requestPermissions();
    
    if (permission.receive !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return null;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Wait for registration token
    return new Promise((resolve, reject) => {
      // Listen for successful registration
      PushNotifications.addListener('registration', (token) => {
        console.log('[Notifications] FCM token received:', token.value);
        resolve({ fcmToken: token.value });
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('[Notifications] Registration error:', error);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Push registration timeout'));
      }, 10000);
    });
  } catch (error) {
    console.error('[Notifications] Subscribe failed:', error);
    return null;
  }
}
```

**Replace `unsubscribeFromPush` function:**

```typescript
/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    // Remove all listeners
    await PushNotifications.removeAllListeners();
    
    // Note: FCM tokens remain valid until explicitly deleted server-side
    // The backend will handle token deletion
    
    return true;
  } catch (error) {
    console.error('[Notifications] Unsubscribe failed:', error);
    return false;
  }
}
```

**Remove VAPID helper function** (lines 260-273) - no longer needed.

### 4.3 Migrate `src/hooks/useNotifications.ts`

**File:** `src/hooks/useNotifications.ts`

**Update `requestPermission` function (lines 87-150):**

```typescript
const requestPermission = useCallback(async (): Promise<boolean> => {
  try {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    // Request notification permission and get FCM token
    const result = await subscribeToPush()

    if (!result) {
      setState((prev) => ({
        ...prev,
        permission: getNotificationPermission(),
        loading: false,
      }))
      return false
    }

    // Save FCM token to backend
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken: result.fcmToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }
    } catch (error) {
      console.error('[useNotifications] Failed to save subscription:', error)
      // Don't fail completely - user can retry
    }

    // Automatically enable notifications with all prayers on
    const newPreferences: NotificationPreferences = {
      enabled: true,
      prayers: {
        Fajr: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true,
      },
    }

    await saveNotificationPreferences(newPreferences, profile)

    setState((prev) => ({
      ...prev,
      permission: 'granted',
      preferences: newPreferences,
      loading: false,
    }))

    return true
  } catch (error) {
    console.error('[useNotifications] Permission request failed:', error)
    setState((prev) => ({
      ...prev,
      loading: false,
      error: error instanceof Error ? error.message : 'Permission request failed',
    }))
    return false
  }
}, [profile])
```

**Update `disableAll` function (lines 211-248):**

```typescript
const disableAll = useCallback(async (): Promise<void> => {
  try {
    // Get current FCM token to delete from backend
    // (PushNotifications plugin doesn't provide a direct way to get token)
    // We'll fetch from localStorage if available, or just unsubscribe
    
    // Unsubscribe from push (removes listeners)
    await unsubscribeFromPush()
    
    // Note: FCM token deletion happens server-side when user re-subscribes
    // or via backend cleanup job for inactive tokens

    // Update preferences
    const newPreferences: NotificationPreferences = {
      ...state.preferences,
      enabled: false,
    }

    await saveNotificationPreferences(newPreferences, profile)

    setState((prev) => ({
      ...prev,
      preferences: newPreferences,
    }))
  } catch (error) {
    console.error('[useNotifications] Failed to disable all:', error)
    setState((prev) => ({
      ...prev,
      error: error instanceof Error ? error.message : 'Failed to disable all',
    }))
  }
}, [state.preferences, profile])
```

---

## Step 5: Configure Native Projects

### 5.1 iOS Configuration

**File:** `ios/App/App/Info.plist`

Add notification permissions:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

**Enable Push Notifications capability:**
1. Open Xcode: `npm run cap:open:ios`
2. Select project → Target "App" → Signing & Capabilities
3. Click "+ Capability"
4. Add "Push Notifications"

### 5.2 Android Configuration

**File:** `android/app/build.gradle`

Add Google Services plugin (should be auto-added by Capacitor):

```gradle
// At top of file
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services' // Add this line
}
```

**File:** `android/build.gradle` (project level)

Add Google Services classpath:

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

---

## Step 6: Update Environment Variables

### 6.1 Add Firebase Variables to `.env.local`

```bash
# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=deen-companion-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@deen-companion-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...xxxxx...\n-----END PRIVATE KEY-----\n"

# Keep existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEOAPIFY_API_KEY=...
CRON_SECRET=...
```

### 6.2 Remove Old VAPID Variables

Delete (no longer needed):
```bash
# Remove these:
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
# VAPID_MAILTO=...
```

### 6.3 Update Vercel Environment Variables

If deploying to Vercel:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
3. Remove old VAPID variables

---

## Step 7: Test Push Notifications

### 7.1 Build and Deploy

```bash
npm run build
npx cap sync
```

### 7.2 Test on iOS Device

1. Open Xcode: `npm run cap:open:ios`
2. Select physical device (push doesn't work in simulator)
3. Run app (⌘R)
4. Navigate to `/times` or any page with notification settings
5. Enable notifications
6. **Expected:** Permission prompt appears
7. Grant permission
8. **Expected:** "Notifications enabled" confirmation

**Trigger test notification:**
- Wait for next prayer time, OR
- Call schedule API manually: `curl -X POST https://your-app.vercel.app/api/push/schedule -H "Authorization: Bearer YOUR_CRON_SECRET"`

**Expected:** Notification appears at prayer time.

### 7.3 Test on Android Device

1. Open Android Studio: `npm run cap:open:android`
2. Select physical device
3. Run app
4. Enable notifications
5. **Expected:** Permission prompt
6. Grant permission
7. Test notification delivery (wait for prayer time or trigger manually)

---

## Verification Checklist

Before moving to Phase 4, verify:

**Backend:**
- [ ] `firebase-admin` installed
- [ ] Firebase credentials in `.env.local`
- [ ] Database has `fcm_token` column
- [ ] `api/push/schedule/route.ts` uses Firebase
- [ ] `api/push/subscribe/route.ts` saves FCM tokens
- [ ] Build succeeds with no errors

**Frontend:**
- [ ] `@capacitor/push-notifications` installed
- [ ] `src/lib/notifications.ts` uses Capacitor plugin
- [ ] `src/hooks/useNotifications.ts` updated
- [ ] TypeScript compiles without errors

**Native Configuration:**
- [ ] iOS has Push Notifications capability
- [ ] Android has `google-services.json`
- [ ] APNs key uploaded to Firebase

**Testing:**
- [ ] iOS notification permission prompt works
- [ ] Android notification permission prompt works
- [ ] Test notification received on iOS
- [ ] Test notification received on Android
- [ ] Notifications arrive at correct prayer times
- [ ] No crashes or errors

---

## Troubleshooting

### Issue: Firebase initialization fails

**Error:** "Credential implementation provided to initializeApp() via the 'credential' property failed to fetch a valid Google OAuth2 access token"

**Solution:** Check `FIREBASE_PRIVATE_KEY` has correct format with `\n` newlines:
```bash
# Should be:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
```

### Issue: iOS notifications not received

**Solutions:**
1. Verify APNs key uploaded to Firebase
2. Check device has internet connection
3. Check app is in foreground (test background later)
4. Verify FCM token saved to database

### Issue: Android notifications not received

**Solutions:**
1. Verify `google-services.json` is in correct location
2. Check Firebase project has Cloud Messaging enabled
3. Verify app has notification permission granted
4. Check Logcat for FCM errors

### Issue: "No such module 'Firebase'" error in Xcode

**Solution:**
```bash
cd ios/App
pod install
```

### Issue: Database migration fails

**Solution:** Run SQL manually in Supabase SQL Editor. Ensure `push_subscriptions` table exists first.

---

## Next Steps

✅ **Phase 3 Complete!** You now have:
- Firebase Cloud Messaging configured
- Native push notifications working
- Backend migrated from Web Push
- Both iOS and Android receiving notifications

→ **Continue to [Phase 4: Native Widgets](./phase-4-widgets.md)**

---

**Phase 3 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Issues Encountered:** None / [Describe]  
**Ready for Phase 4:** Yes / No

