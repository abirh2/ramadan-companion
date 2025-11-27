# Capacitor Migration - Quick Reference Guide

**Last Updated:** November 26, 2024

---

## Common Commands

### Build & Sync
```bash
# Full build pipeline
npm run build
npx cap sync

# Build for specific platform
npx cap sync ios
npx cap sync android

# Combined (build + sync)
npm run build:cap
```

### Open Native IDEs
```bash
# iOS (Xcode)
npm run cap:open:ios

# Android (Android Studio)
npm run cap:open:android
```

### Run on Devices
```bash
# iOS
npm run cap:run:ios

# Android
npm run cap:run:android
```

### Clean & Rebuild
```bash
# Clean Next.js build
rm -rf out/ .next/

# Full rebuild
npm run build
npx cap sync

# Clean native projects
cd ios && xcodebuild clean && cd ..
cd android && ./gradlew clean && cd ..
```

---

## File Locations

### Configuration Files
- `capacitor.config.ts` - Main Capacitor configuration
- `next.config.ts` - Next.js static export settings
- `.env.local` - Environment variables (Firebase, Supabase, API keys)

### Native Projects
- `ios/App/App.xcodeproj` - Xcode project
- `android/app/build.gradle` - Android app configuration
- `ios/App/App/Info.plist` - iOS app info
- `android/app/src/main/AndroidManifest.xml` - Android manifest

### Widgets
- `ios/App/PrayerTimesWidget/PrayerTimesWidget.swift` - iOS widget
- `android/app/src/main/java/com/ramadancompanion/app/widgets/PrayerTimesWidget.kt` - Android widget
- `src/lib/widgetBridge.ts` - Widget data bridge

### Push Notifications
- `src/app/api/push/schedule/route.ts` - Backend notification scheduler
- `src/app/api/push/subscribe/route.ts` - Subscribe endpoint
- `src/lib/notifications.ts` - Frontend notification utilities
- `src/hooks/useNotifications.ts` - Notification hook

---

## Plugin API Quick Reference

### Geolocation
```typescript
import { Geolocation } from '@capacitor/geolocation';

// Check permissions
const permission = await Geolocation.checkPermissions();

// Request permissions
const result = await Geolocation.requestPermissions();

// Get current position
const position = await Geolocation.getCurrentPosition({
  timeout: 10000,
  enableHighAccuracy: true,
});

// coords: { latitude, longitude, accuracy, ... }
```

### Motion (Device Orientation)
```typescript
import { Motion } from '@capacitor/motion';

// Start listening
const listener = await Motion.addListener('orientation', (event) => {
  console.log('Alpha (heading):', event.alpha);
  console.log('Beta (tilt forward/back):', event.beta);
  console.log('Gamma (tilt left/right):', event.gamma);
});

// Stop listening
await listener.remove();
```

### Haptics
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Light impact
await Haptics.impact({ style: ImpactStyle.Light });

// Medium impact
await Haptics.impact({ style: ImpactStyle.Medium });

// Heavy impact
await Haptics.impact({ style: ImpactStyle.Heavy });

// Notification
await Haptics.notification({ type: 'SUCCESS' }); // SUCCESS, WARNING, ERROR
```

### Push Notifications
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Request permissions
const permission = await PushNotifications.requestPermissions();

// Register for notifications
await PushNotifications.register();

// Listen for registration
PushNotifications.addListener('registration', (token) => {
  console.log('FCM token:', token.value);
});

// Listen for notifications
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Notification received:', notification);
});

// Remove all listeners
await PushNotifications.removeAllListeners();
```

### Preferences (Storage)
```typescript
import { Preferences } from '@capacitor/preferences';

// Set value
await Preferences.set({ key: 'name', value: 'John' });

// Get value
const { value } = await Preferences.get({ key: 'name' });

// Remove value
await Preferences.remove({ key: 'name' });

// Clear all
await Preferences.clear();
```

---

## Version Numbers

### iOS
**File:** `ios/App/App/Info.plist`
```xml
<key>CFBundleShortVersionString</key>
<string>1.0</string>  <!-- User-facing version -->

<key>CFBundleVersion</key>
<string>1</string>  <!-- Build number, increment each upload -->
```

### Android
**File:** `android/app/build.gradle`
```gradle
defaultConfig {
    versionCode 1       // Increment each upload
    versionName "1.0"   // User-facing version
}
```

---

## Environment Variables

### Required for Native Apps
```bash
# Firebase Cloud Messaging (Phase 3)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# External APIs (existing)
GEOAPIFY_API_KEY=xxx
CRON_SECRET=xxx
```

### Removed After Migration
```bash
# No longer needed (replaced by FCM)
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
# VAPID_PRIVATE_KEY=xxx
# VAPID_MAILTO=xxx
```

---

## Common Issues & Quick Fixes

### "Module not found: @capacitor/..."
```bash
npm install
npx cap sync
```

### "Could not find or load main class"
```bash
cd android
./gradlew clean
./gradlew build
```

### iOS build fails with "No such module"
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

### Widget shows "Loading..." forever
1. Verify App Group configured in both targets
2. Open app and navigate to `/times`
3. Check console for "[Widget] Data updated" message
4. Wait 5 minutes for widget refresh

### Push notifications not received
**iOS:**
- Verify APNs key uploaded to Firebase
- Check device Settings → Notifications → [App] → Allow Notifications

**Android:**
- Verify `google-services.json` in `android/app/`
- Check notification permission granted

### Static export fails
**Check `next.config.ts` has:**
```typescript
output: 'export',
images: { unoptimized: true },
```

---

## Testing Checklist (Quick)

### Before Each Build
- [ ] `npm run build` succeeds
- [ ] `npm run test:ci` passes
- [ ] `npm run lint` clean
- [ ] No TypeScript errors

### Before Upload
- [ ] Test on physical device (not just simulator)
- [ ] All core features work
- [ ] No crashes
- [ ] Version/build number incremented
- [ ] Release notes written

---

## Support Resources

### Official Documentation
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Next.js Static Export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)

### Plugin-Specific Docs
- [Geolocation](https://capacitorjs.com/docs/apis/geolocation)
- [Motion](https://capacitorjs.com/docs/apis/motion)
- [Haptics](https://capacitorjs.com/docs/apis/haptics)
- [Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Preferences](https://capacitorjs.com/docs/apis/preferences)

### Platform Guides
- [iOS App Store Connect](https://developer.apple.com/app-store-connect/)
- [Google Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com)
- [TestFlight](https://developer.apple.com/testflight/)

### Community
- [Capacitor Discord](https://discord.gg/UPYYRhtyzp)
- [Capacitor GitHub](https://github.com/ionic-team/capacitor)
- [Stack Overflow: capacitor](https://stackoverflow.com/questions/tagged/capacitor)

---

## Emergency Rollback

If something goes catastrophically wrong:

```bash
# 1. Checkout clean state
git checkout main

# 2. Remove Capacitor
npm uninstall @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
rm -rf ios/ android/ capacitor.config.ts

# 3. Revert Next.js config
git checkout next.config.ts

# 4. Rebuild as PWA
npm install
npm run build

# 5. Deploy PWA
# (Your existing Vercel deployment process)
```

PWA will continue to work while you debug native issues.

---

## Phase Status Tracker

Quick reference for where you are:

| Phase | Status | Key Deliverable |
|-------|--------|-----------------|
| **Phase 1** | [ ] | Capacitor setup, native projects created |
| **Phase 2** | [ ] | Browser APIs → Capacitor plugins |
| **Phase 3** | [ ] | Native push notifications (FCM) |
| **Phase 4** | [ ] | Home screen widgets |
| **Phase 5** | [ ] | Comprehensive local testing |
| **Phase 6** | [ ] | TestFlight distribution (iOS) |
| **Phase 7** | [ ] | Play Console distribution (Android) |

---

## Key Contacts & Credentials

**Store Accounts:**
- Apple Developer: [email/team]
- Google Play: [email]

**Firebase:**
- Project ID: [project-id]
- Console: https://console.firebase.google.com/project/[project-id]

**App Store Connect:**
- App ID: [ios-bundle-id]
- Link: https://appstoreconnect.apple.com

**Google Play Console:**
- Package name: [android-package-name]
- Link: https://play.google.com/console

---

**Last Updated:** November 26, 2024  
**Roadmap Version:** 1.0  
**For Questions:** See individual phase guides or [Phase 0: README](./README.md)

