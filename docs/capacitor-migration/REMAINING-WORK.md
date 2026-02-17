# Capacitor Migration - Remaining Work

**Last Updated:** February 2026  
**Current Status:** Phase 2 Complete (29% overall)  
**Next Phase:** Phase 3 - Native Push Notifications

### Recent Fixes (February 2026)

- **InstallPrompt:** Hidden in native Capacitor app (iOS/Android) - no more "Download on iOS" banner when running in TestFlight/Play
- **Notifications (Native):** Native app now uses `@capacitor/local-notifications` for prayer times instead of cron/Web Push. Schedules locally on device; no server, Firebase, or cron needed. PWA/browser still uses Web Push + cron.
- **Notifications (PWA):** Location sync to profile when enabling notifications so cron job has coordinates
- **Splash screen:** iOS and Android now show app icon on theme background (#0f3d3e) instead of generic placeholder
- **App icon:** Android mipmap icons updated to match iOS (icon-512.png, theme background)
- **Qibla finder:** Native app uses Capacitor Motion directly; skip iOS DeviceOrientationEvent.requestPermission in native context; NSMotionUsageDescription added to Info.plist
- **Ramadan card:** Fixed transition when countdown hits zero - now correctly refetches and shows during-Ramadan state (iftar/suhoor countdown)
- **Location:** All features (prayer times, mosque finder, halal food, Qibla) use consistent `requestGeolocation()` from `location.ts`

---

## Table of Contents

1. [Current Status Summary](#current-status-summary)
2. [Phase 3: Native Push Notifications](#phase-3-native-push-notifications)
   - [Firebase Project Setup](#31-firebase-project-setup)
   - [iOS APNs Configuration](#32-ios-apns-configuration)
   - [Firebase Service Account](#33-firebase-service-account-credentials)
   - [Database Migration](#34-database-migration-supabase)
   - [Environment Variables](#35-environment-variables)
   - [Code Changes](#36-code-changes-required)
3. [Phase 4: Native Widgets](#phase-4-native-widgets)
4. [Phase 5: Local Testing](#phase-5-local-testing)
5. [Phase 6: TestFlight (iOS)](#phase-6-testflight-ios)
6. [Phase 7: Google Play (Android)](#phase-7-google-play-android)
7. [Quick Reference](#quick-reference)

---

## Current Status Summary

### Completed Work

**Phase 1: Capacitor Setup** - COMPLETE
- Capacitor v7.4.4 installed
- iOS and Android native projects generated
- Hybrid architecture implemented (apps load from Vercel URL)
- Build scripts added to `package.json`

**Phase 2: Plugin Migration** - COMPLETE
- Plugins installed: `@capacitor/geolocation`, `@capacitor/motion`, `@capacitor/haptics`, `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/keyboard`, `@capacitor/preferences`, `@capacitor/local-notifications`
- Platform-aware abstractions implemented (supports both PWA and native)
- Jest mocks configured for all plugins
- Native permissions configured

### Key Files Modified

| File | Changes |
|------|---------|
| `capacitor.config.json` | Main Capacitor configuration, LocalNotifications plugin |
| `src/lib/localNotifications.ts` | Local prayer notification scheduling (native only) |
| `src/lib/notifications.ts` | Permission handling (LocalNotifications on native) |
| `src/hooks/useNotifications.ts` | Native: local scheduling; PWA: Web Push + cron |
| `src/lib/location.ts` | Platform-aware geolocation |
| `src/lib/orientation.ts` | Platform-aware device motion |
| `src/lib/zikr.ts` | Platform-aware haptics |
| `jest.setup.js` | Capacitor plugin mocks |
| `ios/App/App/Info.plist` | Location permission description |
| `android/app/src/main/AndroidManifest.xml` | Location permissions |

### Architecture Decision

**Native Prayer Notifications (Local):** Native apps use `@capacitor/local-notifications` for prayer times. No server, Firebase, or cron required. Schedules on device using `calculatePrayerTimesLocal()` and user location. Reschedules on app launch and when preferences change. Phase 3 (FCM) is optional for future push use cases (announcements, etc.).

**Hybrid Approach** (not static export):
- Next.js runs on Vercel with all API routes intact
- Native apps load content from `https://ramadan-companion.vercel.app`
- PWA continues to work unchanged
- This was chosen because static export is incompatible with 22 API routes and dynamic pages

---

## Phase 3: Native Push Notifications

**Estimated Duration:** 4-5 days  
**Complexity:** High

This phase migrates from Web Push API to Firebase Cloud Messaging (FCM) for more reliable native push notifications.

### 3.1 Firebase Project Setup

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `Deen Companion`
4. Google Analytics: Optional (recommended for production analytics)
5. Click **"Create project"**
6. Wait ~30 seconds for project creation
7. Click **"Continue"** when ready

#### Step 2: Add iOS App to Firebase

1. In Firebase Console, click the **iOS icon** (Apple logo) in "Get started by adding Firebase to your app"
2. Fill in the form:
   - **Apple bundle ID:** `com.deencompanion.app`
     - This MUST match `appId` in your `capacitor.config.json`
   - **App nickname:** `Deen Companion iOS`
   - **App Store ID:** Leave blank for now
3. Click **"Register app"**
4. **Download `GoogleService-Info.plist`**
   - Click the download button
   - Save the file
5. Move the file to the correct location:
   ```bash
   mv ~/Downloads/GoogleService-Info.plist ios/App/App/GoogleService-Info.plist
   ```
6. Click **"Next"** through the remaining steps (we'll configure these differently)
7. Click **"Continue to console"**

#### Step 3: Add Android App to Firebase

1. Back in Firebase Console Project Overview, click the **Android icon** (robot logo)
2. Fill in the form:
   - **Android package name:** `com.deencompanion.app`
     - This MUST match `appId` in your `capacitor.config.json`
   - **App nickname:** `Deen Companion Android`
   - **Debug signing certificate SHA-1:** Leave blank (optional for push notifications)
3. Click **"Register app"**
4. **Download `google-services.json`**
   - Click the download button
   - Save the file
5. Move the file to the correct location:
   ```bash
   mv ~/Downloads/google-services.json android/app/google-services.json
   ```
6. Click **"Next"** through remaining steps
7. Click **"Continue to console"**

#### Step 4: Verify Cloud Messaging is Enabled

1. In Firebase Console, click the **gear icon** (Settings) next to "Project Overview"
2. Select **"Project settings"**
3. Go to **"Cloud Messaging"** tab
4. Verify "Cloud Messaging API (V1)" shows **"Enabled"**
   - If not enabled, click the link to enable it in Google Cloud Console

---

### 3.2 iOS APNs Configuration

Apple Push Notification service (APNs) is required for iOS push notifications. Firebase uses your APNs key to send notifications to iOS devices.

#### Step 1: Create APNs Authentication Key

1. Go to [Apple Developer - Keys](https://developer.apple.com/account/resources/authkeys/list)
   - Sign in with your Apple Developer account
2. Click the **"+"** button to create a new key
3. Fill in the form:
   - **Key Name:** `Deen Companion Push Notifications`
   - **Enable:** Check **"Apple Push Notifications service (APNs)"**
4. Click **"Continue"**
5. Review and click **"Register"**
6. **IMPORTANT - Download the key:**
   - Click **"Download"**
   - Save the `.p8` file securely
   - **WARNING:** You can only download this file ONCE. If lost, you must create a new key.
   - Suggested location: Store in a password manager or secure backup
7. **Note the Key ID:**
   - Displayed on the page after registration (e.g., `ABC123XYZ`)
   - Copy this value
8. **Note your Team ID:**
   - Found in top-right corner of any Apple Developer page
   - Or go to [Membership Details](https://developer.apple.com/account/#/membership)
   - Format: 10-character alphanumeric (e.g., `DEF456UVW`)

#### Step 2: Upload APNs Key to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) > Your Project
2. Click **gear icon** > **"Project settings"**
3. Go to **"Cloud Messaging"** tab
4. Scroll down to **"Apple app configuration"**
5. Under **"APNs Authentication Key"**, click **"Upload"**
6. Fill in the form:
   - **APNs Authentication Key:** Click "Browse" and select your `.p8` file
   - **Key ID:** Enter the Key ID you noted (e.g., `ABC123XYZ`)
   - **Team ID:** Enter your Team ID (e.g., `DEF456UVW`)
7. Click **"Upload"**
8. You should see a green checkmark confirming the upload

---

### 3.3 Firebase Service Account Credentials

The backend needs Firebase Admin SDK credentials to send push notifications.

#### Step 1: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com) > Your Project
2. Click **gear icon** > **"Project settings"**
3. Go to **"Service accounts"** tab
4. Ensure "Firebase Admin SDK" is selected
5. Click **"Generate new private key"**
6. Click **"Generate key"** in the confirmation dialog
7. A JSON file will download (e.g., `deen-companion-firebase-adminsdk-xxxxx.json`)

#### Step 2: Extract Required Values

Open the downloaded JSON file and extract these values:

```json
{
  "project_id": "deen-companion-xxxxx",        // -> FIREBASE_PROJECT_ID
  "client_email": "firebase-adminsdk-xxxxx@deen-companion-xxxxx.iam.gserviceaccount.com",  // -> FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"  // -> FIREBASE_PRIVATE_KEY
}
```

**IMPORTANT:** Keep this JSON file secure. It grants full admin access to your Firebase project. Do NOT commit it to git.

---

### 3.4 Database Migration (Supabase)

Add a column to store FCM tokens alongside existing Web Push subscriptions.

#### Step 1: Run SQL Migration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create a new query and paste:

```sql
-- Add FCM token column to push_subscriptions table
-- This allows storing both Web Push (existing) and FCM (native) subscriptions

ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Add index for faster lookups by FCM token
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_fcm_token 
ON push_subscriptions(fcm_token);

-- Optional: Add comment for documentation
COMMENT ON COLUMN push_subscriptions.fcm_token IS 'Firebase Cloud Messaging token for native app push notifications';
```

5. Click **"Run"**
6. Verify success message

#### Step 2: Verify Migration

Run this query to confirm the column was added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'push_subscriptions';
```

You should see `fcm_token` in the results.

---

### 3.5 Environment Variables

#### Local Development (`.env.local`)

Add these lines to your `.env.local` file:

```bash
# Firebase Cloud Messaging (for native push notifications)
FIREBASE_PROJECT_ID=deen-companion-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@deen-companion-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...[full key here]...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT for `FIREBASE_PRIVATE_KEY`:**
- Keep the `\n` characters in the string (they represent newlines)
- Wrap the entire value in double quotes
- Copy the exact value from the JSON file, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

#### Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (ramadan-companion)
3. Go to **Settings** > **Environment Variables**
4. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `FIREBASE_PROJECT_ID` | Your project ID | Production, Preview, Development |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Production, Preview, Development |
| `FIREBASE_PRIVATE_KEY` | Private key (with \n) | Production, Preview, Development |

5. Click **"Save"** for each
6. **Redeploy** your application for changes to take effect

#### Keep Existing Variables

Do NOT remove these existing variables (they're still used for PWA web push):
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_MAILTO`

This allows both Web Push (PWA) and FCM (native) to work during the transition period.

---

### 3.6 Code Changes Required

After completing the external setup above, these code changes are needed:

#### Install Dependencies

```bash
npm install firebase-admin @capacitor/push-notifications
npx cap sync
```

#### Files to Migrate

| File | Changes Required |
|------|------------------|
| `src/app/api/push/schedule/route.ts` | Replace `web-push` with `firebase-admin` for sending |
| `src/app/api/push/subscribe/route.ts` | Accept FCM token, store in `fcm_token` column |
| `src/app/api/push/unsubscribe/route.ts` | Delete by FCM token |
| `src/lib/notifications.ts` | Platform-aware: use Capacitor plugin on native, Web Push on browser |
| `src/hooks/useNotifications.ts` | Update to handle FCM token flow |

#### iOS Native Configuration (Xcode)

1. Open Xcode: `npm run cap:open:ios`
2. Select project > Target "App" > **Signing & Capabilities**
3. Click **"+ Capability"**
4. Add **"Push Notifications"**
5. Add **"Background Modes"** and check **"Remote notifications"**

#### Android Native Configuration

**File: `android/app/build.gradle`**

Add at the top:
```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'  // Add this line
}
```

**File: `android/build.gradle`** (project level)

Add in `buildscript > dependencies`:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

---

## Phase 4: Native Widgets

**Estimated Duration:** 3-4 days  
**Complexity:** Medium-High  
**Prerequisites:** Phase 3 complete (or Phase 2 minimum for basic widget)

### 4.1 Widget Data Bridge

Create `src/lib/widgetBridge.ts` to share prayer time data with native widgets.

### 4.2 iOS Widget

1. In Xcode: File > New > Target > Widget Extension
2. Name: `PrayerTimesWidget`
3. Configure App Groups for data sharing: `group.com.deencompanion.app`
4. Implement Swift widget code (see `phase-4-widgets.md`)

### 4.3 Android Widget

1. Create layout XML: `android/app/src/main/res/layout/prayer_times_widget.xml`
2. Create widget info: `android/app/src/main/res/xml/prayer_times_widget_info.xml`
3. Create Kotlin provider: `android/app/src/main/java/com/deencompanion/app/widgets/PrayerTimesWidget.kt`
4. Register in `AndroidManifest.xml`

See [phase-4-widgets.md](./phase-4-widgets.md) for complete implementation details.

---

## Phase 5: Local Testing

**Estimated Duration:** 2-3 days  
**Prerequisites:** Phases 1-4 complete

### iOS Testing Checklist

- [ ] App launches on device/simulator
- [ ] All pages render correctly
- [ ] Geolocation permission works
- [ ] Location detection accurate
- [ ] Compass rotates with device (requires physical device)
- [ ] Haptic feedback on zikr counter (requires physical device)
- [ ] Push notification permission prompt
- [ ] Test notification received
- [ ] Widget displays on home screen
- [ ] Widget updates automatically
- [ ] Widget tap opens app

### Android Testing Checklist

- [ ] App launches on device/emulator
- [ ] All pages render correctly
- [ ] Geolocation permission works
- [ ] Location detection accurate
- [ ] Compass rotates with device
- [ ] Haptic feedback on zikr counter
- [ ] Push notification permission prompt
- [ ] Test notification received
- [ ] Widget displays on home screen
- [ ] Widget updates automatically
- [ ] Widget tap opens app

### Core Features Checklist

- [ ] Prayer times display correctly
- [ ] Quran browser and audio work
- [ ] Hadith browser works
- [ ] Maps display (mosques, halal food)
- [ ] Authentication (login/signup/logout)
- [ ] Favorites save and load
- [ ] Donations tracking works
- [ ] Zikr counter increments

See [phase-5-local-testing.md](./phase-5-local-testing.md) for complete testing procedures.

---

## Phase 6: TestFlight (iOS)

**Estimated Duration:** 1-2 days  
**Prerequisites:** Phase 5 complete, Apple Developer account ($99/year)

### 6.1 Apple Developer Setup

1. **Create App ID:**
   - Go to [Identifiers](https://developer.apple.com/account/resources/identifiers/list)
   - Register new App ID: `com.deencompanion.app`
   - Enable capabilities: Push Notifications, App Groups

2. **Create Distribution Certificate:**
   - Xcode > Settings > Accounts > Manage Certificates
   - Create "Apple Distribution" certificate

3. **Create Provisioning Profile:**
   - Go to [Profiles](https://developer.apple.com/account/resources/profiles/list)
   - Create "App Store Connect" distribution profile

### 6.2 App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app:
   - Platform: iOS
   - Name: Deen Companion
   - Bundle ID: `com.deencompanion.app`
   - SKU: `deen-companion-001`
3. Fill required information:
   - Privacy Policy URL
   - Category: Lifestyle
   - Age Rating

### 6.3 App Assets Required

| Asset | Size | Notes |
|-------|------|-------|
| App Icon | 1024x1024 | PNG, no alpha |
| Screenshots (6.7") | 1290x2796 | iPhone 15 Pro Max |
| Screenshots (6.5") | 1242x2688 | iPhone 11 Pro Max |
| Screenshots (5.5") | 1242x2208 | iPhone 8 Plus |

### 6.4 Build and Upload

1. In Xcode: Product > Archive
2. Organizer > Distribute App > App Store Connect
3. Upload
4. In App Store Connect: Configure TestFlight, invite testers

See [phase-6-testflight.md](./phase-6-testflight.md) for complete instructions.

---

## Android Native Configuration

This section documents all Android-specific configuration required before publishing to Google Play. Most items are already complete.

### Completed Configuration

| Item | Status | Location |
|------|--------|----------|
| App ID | Done | `com.deencompanion.app` in `build.gradle` |
| App name | Done | "Deen Companion" in `strings.xml` |
| Launcher icons (all densities) | Done | `mipmap-*/ic_launcher*.png` + adaptive XML |
| Splash screen (portrait + landscape) | Done | `drawable-*/splash.png` + `splash.xml` |
| Theme colors | Done | `values/colors.xml` (Primary, PrimaryDark, Accent) |
| Splash background color | Done | `values/ic_launcher_background.xml` (#0f3d3e) |
| INTERNET permission | Done | `AndroidManifest.xml` |
| Fine + Coarse location | Done | `AndroidManifest.xml` |
| SCHEDULE_EXACT_ALARM | Done | `AndroidManifest.xml` (for local notifications) |
| POST_NOTIFICATIONS | Done | `AndroidManifest.xml` (required Android 13+) |
| Google Services config | Done | `app/google-services.json` present |
| Capacitor plugins synced | Done | 8 plugins registered |

### Signing Configuration (Required Before Release)

1. **Generate a release keystore** (if not already done):

```bash
mkdir -p android/keys

keytool -genkey -v \
  -keystore android/keys/deen-companion-release.keystore \
  -alias deen-companion \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

2. **Add keystore to .gitignore** (already done if `android/keys/` is listed).

3. **Configure signing in `android/app/build.gradle`:**

Add a `signingConfigs` block and reference it in `buildTypes.release`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../keys/deen-companion-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: ""
            keyAlias "deen-companion"
            keyPassword System.getenv("KEY_PASSWORD") ?: ""
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Google Play Store Assets

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| Hi-res icon | 512x512 | PNG (alpha OK) | Use existing `icon-512.png` |
| Feature graphic | 1024x500 | JPG or PNG | Branded banner shown at top of listing |
| Phone screenshots | 1080x1920+ | PNG or JPG | Min 2, max 8 (take from device) |
| 7" tablet screenshots | 1200x1920 | PNG or JPG | Optional but recommended |
| 10" tablet screenshots | 1920x1200 | PNG or JPG | Optional |

**Generating feature graphic:**
Use any image editor. Suggested content: app icon centered on #0f3d3e background with "Deen Companion" text. 1024x500 px.

**Taking screenshots:**
1. Build and run on emulator or device: `nvm use 22 && npx cap run android`
2. Navigate to each key screen (prayer times, Quran, Qibla, notifications)
3. Capture screenshots via Android Studio or `adb exec-out screencap -p > screen.png`
4. Crop status bar if desired

### Play Console Content Setup

Complete these sections in Google Play Console before publishing:

1. **App access:** No restrictions (fully accessible)
2. **Ads declaration:** No ads
3. **Content rating:** Complete IARC questionnaire (Reference: Religion/Spirituality, no violence/gambling)
4. **Target audience:** 13+ (general audience)
5. **Data safety:** Declare location usage (prayer times, Qibla), no data shared with third parties
6. **Privacy policy URL:** Required -- host at `https://ramadan-companion.vercel.app/privacy` or external URL

---

## Phase 7: Google Play (Android)

**Estimated Duration:** 1-2 days  
**Prerequisites:** Phase 5 complete, Google Play Developer account ($25 one-time)

### 7.1 Google Play Console Setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Create developer account ($25 one-time fee)
3. Create new app:
   - App name: Deen Companion
   - Default language: English
   - App or game: App
   - Free or paid: Free

### 7.2 App Configuration

Complete these sections in Play Console:
- App access (no restrictions)
- Ads declaration (no ads)
- Content rating questionnaire
- Target audience
- Data safety questionnaire
- Privacy policy URL

### 7.3 App Assets Required

| Asset | Size | Notes |
|-------|------|-------|
| App Icon | 512x512 | PNG with alpha OK |
| Feature Graphic | 1024x500 | JPG or PNG |
| Screenshots | Various | Min 2, max 8 |

### 7.4 Generate Production Keystore

**CRITICAL: Back up this keystore securely. If lost, you cannot update your app.**

```bash
mkdir -p android/keys

keytool -genkey -v \
  -keystore android/keys/deen-companion-release.keystore \
  -alias deen-companion \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Save the password in a password manager.

### 7.5 Build and Upload

```bash
cd android
./gradlew bundleRelease
```

Upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console > Internal Testing.

See [phase-7-play-console.md](./phase-7-play-console.md) for complete instructions.

---

## Quick Reference

### External Service URLs

| Service | URL |
|---------|-----|
| Firebase Console | https://console.firebase.google.com |
| Apple Developer | https://developer.apple.com |
| App Store Connect | https://appstoreconnect.apple.com |
| Google Play Console | https://play.google.com/console |
| Supabase Dashboard | https://app.supabase.com |
| Vercel Dashboard | https://vercel.com/dashboard |

### Environment Variables Summary

**Required for Phase 3:**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Keep Existing (for PWA compatibility):**
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_MAILTO=...
```

### File Locations Reference

| Purpose | Location |
|---------|----------|
| Capacitor Config | `capacitor.config.json` |
| iOS Project | `ios/App/` |
| Android Project | `android/app/` |
| Firebase iOS Config | `ios/App/App/GoogleService-Info.plist` |
| Firebase Android Config | `android/app/google-services.json` |
| Push Schedule API | `src/app/api/push/schedule/route.ts` |
| Notifications Library | `src/lib/notifications.ts` |
| Widget Bridge (to create) | `src/lib/widgetBridge.ts` |

### Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server

# Capacitor
npm run cap:sync              # Sync web to native
npm run cap:sync:ios          # Sync iOS only
npm run cap:sync:android      # Sync Android only
npm run cap:open:ios          # Open Xcode
npm run cap:open:android      # Open Android Studio

# Build
npm run build                 # Build Next.js
npm run build:cap             # Build + sync to Capacitor

# Testing
npm run test:ci               # Run tests
```

---

## Next Steps

1. Complete Phase 3 external setup (Firebase, APNs, Supabase migration)
2. Add environment variables locally and to Vercel
3. Implement code changes for push notifications
4. Test on physical devices
5. Continue to Phase 4 (Widgets)

---

**Questions?** Check the individual phase guides in this folder or the [progress-tracker.md](./progress-tracker.md) for current status.
