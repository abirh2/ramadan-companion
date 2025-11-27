# Phase 5: Local Testing & Verification

**Duration:** 2-3 days  
**Complexity:** Medium  
**Prerequisites:** Phases 1-4 complete

---

## Overview

This phase thoroughly tests the native app on both platforms to ensure feature parity with the PWA and verify all native integrations work correctly.

**Testing Areas:**
1. Core app functionality (all pages and features)
2. Native plugins (geolocation, compass, haptics, push)
3. Widgets (display, updates, tap behavior)
4. Performance and stability
5. Edge cases and error handling

---

## Prerequisites

### Device Requirements

**iOS Testing:**
- [ ] macOS with Xcode 15+
- [ ] Physical iOS device (iPhone, iOS 15+) OR iOS Simulator
- [ ] USB cable for device
- [ ] Apple Developer account (free tier OK)

**Android Testing:**
- [ ] Android Studio installed
- [ ] Physical Android device (API 24+) OR Android Emulator
- [ ] USB cable with data transfer enabled
- [ ] USB debugging enabled on device

---

## Step 1: iOS Testing Setup

### 1.1 Build and Install

```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion
npm run build
npx cap sync ios
npm run cap:open:ios
```

**In Xcode:**
1. Select your device from device dropdown (top toolbar)
2. Signing & Capabilities → Select your team
3. Click Run (⌘R) or Product → Run

**Expected:** App installs and launches on device.

### 1.2 iOS Testing Checklist - Core Features

Test each feature systematically:

**✅ App Launch**
- [ ] App launches without crashes
- [ ] Splash screen displays (2 seconds)
- [ ] Dashboard loads successfully
- [ ] No console errors in Xcode debug console

**✅ Navigation & Pages**
- [ ] Dashboard (/) - All cards visible
- [ ] Prayer Times (/times) - Times display correctly
- [ ] Quran (/quran) - Surah list loads
- [ ] Hadith (/hadith) - Collections load
- [ ] Calendar (/calendar) - Hijri calendar displays
- [ ] Zikr (/zikr) - Counter initializes
- [ ] Charity (/charity) - Forms load
- [ ] Favorites (/favorites) - List displays
- [ ] Places (/places/mosques) - Map loads
- [ ] Places (/places/food) - Map loads
- [ ] Profile (/profile) - Settings load
- [ ] About (/about) - Content displays

**✅ Authentication**
- [ ] Login modal opens
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] User menu displays after login
- [ ] Logout works
- [ ] Session persists after app restart

### 1.3 iOS Testing Checklist - Native Features

**✅ Geolocation**
- [ ] Permission prompt appears on first use
- [ ] "Use Current Location" detects location
- [ ] City name displays correctly
- [ ] Prayer times load for detected location
- [ ] Permission denial handled gracefully
- [ ] Location persists in app

**✅ Device Orientation (Qibla Compass)**
- [ ] Navigate to `/times#qibla`
- [ ] Toggle "Dynamic" mode
- [ ] Permission prompt appears (iOS 13+)
- [ ] After granting, compass rotates with device
- [ ] Arrow points toward Qibla direction
- [ ] Calibration warning shows if needed
- [ ] Toggle back to "Static" mode works

**✅ Haptic Feedback**
- [ ] Navigate to `/zikr`
- [ ] Tap counter button
- [ ] Feel haptic feedback on each tap
- [ ] Feedback is consistent and responsive
- [ ] Works even if audio disabled

**✅ Audio Playback**
- [ ] Navigate to `/quran` → select surah
- [ ] Tap "Listen" on any ayah
- [ ] Audio plays successfully
- [ ] Play/pause controls work
- [ ] Audio stops when navigating away
- [ ] Zikr click sound plays (if enabled)

**✅ Push Notifications**
- [ ] Navigate to notification settings
- [ ] Enable notifications
- [ ] Permission prompt appears
- [ ] After granting, "Notifications enabled" confirmation
- [ ] Wait for next prayer time OR trigger test notification
- [ ] Notification appears with prayer name and hadith quote
- [ ] Tapping notification opens app to `/times`
- [ ] Disable notifications works
- [ ] Per-prayer toggles work

**✅ Widgets**
- [ ] Long-press home screen
- [ ] Add Widget → Find "Prayer Times"
- [ ] Add Small widget
- [ ] Widget displays next prayer information
- [ ] Open app → navigate to `/times`
- [ ] Wait 1-2 minutes
- [ ] Widget updates with current data
- [ ] Tap widget → app opens to `/times`
- [ ] Try Medium widget size
- [ ] Both sizes display correctly

### 1.4 iOS Testing Checklist - Data Persistence

**✅ Local Storage**
- [ ] Add favorite Quran ayah
- [ ] Close app (swipe up)
- [ ] Reopen app
- [ ] Favorite still exists

**✅ Prayer Tracking**
- [ ] Mark prayer as completed
- [ ] Close and reopen app
- [ ] Prayer completion persists

**✅ Settings Persistence**
- [ ] Change calculation method
- [ ] Change theme
- [ ] Change translation
- [ ] Close and reopen app
- [ ] All settings persist

**✅ Authentication Session**
- [ ] Login with account
- [ ] Close app completely
- [ ] Reopen app
- [ ] Still logged in

### 1.5 iOS Testing Checklist - Edge Cases

**✅ Offline Mode**
- [ ] Enable Airplane Mode
- [ ] Open app
- [ ] Prayer times display (from cache/local calculation)
- [ ] Cached pages load
- [ ] Graceful error for API-dependent features

**✅ Background/Foreground**
- [ ] Open app
- [ ] Home button (background app)
- [ ] Wait 30 seconds
- [ ] Reopen app
- [ ] App resumes correctly
- [ ] No data loss

**✅ Low Memory**
- [ ] Open many apps
- [ ] Switch back to Deen Companion
- [ ] App restores state
- [ ] No crashes

---

## Step 2: Android Testing Setup

### 2.1 Build and Install

```bash
npm run build
npx cap sync android
npm run cap:open:android
```

**In Android Studio:**
1. Connect device via USB (USB debugging enabled)
2. Select device from device dropdown
3. Run → Run 'app' (Shift+F10)

**Expected:** App installs and launches on device.

### 2.2 Android Testing Checklist - Core Features

Run the same checklist as iOS (Section 1.2 above):
- [ ] App Launch
- [ ] Navigation & Pages
- [ ] Authentication

### 2.3 Android Testing Checklist - Native Features

Run the same checklist as iOS (Section 1.3 above):
- [ ] Geolocation (no permission needed on Android)
- [ ] Device Orientation (no permission needed)
- [ ] Haptic Feedback
- [ ] Audio Playback
- [ ] Push Notifications
- [ ] Widgets

### 2.4 Android Testing Checklist - Data Persistence

Run the same checklist as iOS (Section 1.4 above):
- [ ] Local Storage
- [ ] Prayer Tracking
- [ ] Settings Persistence
- [ ] Authentication Session

### 2.5 Android Testing Checklist - Edge Cases

Run the same checklist as iOS (Section 1.5 above):
- [ ] Offline Mode
- [ ] Background/Foreground
- [ ] Low Memory

---

## Step 3: Cross-Platform Testing

### 3.1 Test Dual-Storage Pattern

**Goal:** Verify data syncs between localStorage and Supabase for authenticated users.

**Test Procedure:**
1. **iOS Device:**
   - Login with account
   - Change location to "New York"
   - Add Quran favorite
   - Mark Fajr prayer as completed

2. **Android Device:**
   - Login with SAME account
   - **Expected:** Location shows "New York"
   - **Expected:** Quran favorite appears
   - **Expected:** Fajr marked as completed

3. **Verify Sync:**
   - [ ] Location synced
   - [ ] Calculation method synced
   - [ ] Favorites synced
   - [ ] Prayer tracking synced
   - [ ] Notification preferences synced

### 3.2 Test Guest vs Authenticated Behavior

**Guest User:**
- [ ] Can use all core features
- [ ] Cannot access favorites
- [ ] Cannot access charity tracker
- [ ] Prayer tracking stores in localStorage only
- [ ] Settings persist in localStorage only

**Authenticated User:**
- [ ] All features accessible
- [ ] Favorites work
- [ ] Charity tracker works
- [ ] Prayer tracking syncs to database
- [ ] Settings sync to profile

---

## Step 4: Performance Testing

### 4.1 App Launch Time

**Test:**
1. Force quit app
2. Start timer
3. Launch app
4. Stop timer when dashboard visible

**Expected:** < 3 seconds on modern devices.

### 4.2 Page Navigation Speed

**Test:**
1. Navigate between pages quickly
2. Observe loading states and transitions

**Expected:** Smooth transitions, no lag or stuttering.

### 4.3 Memory Usage

**iOS (Xcode):**
1. Debug → Instruments → Memory
2. Run app through all pages
3. Check for memory leaks

**Android (Android Studio):**
1. Run → Profile 'app'
2. Memory Profiler
3. Navigate through app
4. Check for memory leaks

**Expected:** Stable memory usage, no continuous growth.

### 4.4 Network Requests

**Test:**
1. Monitor network tab in debugger
2. Navigate to pages with API calls
3. Verify requests are efficient

**Expected:** No unnecessary duplicate requests, proper caching.

---

## Step 5: Bug Tracking & Reporting

### 5.1 Create Bug Report Template

For each bug found, document:

```markdown
### Bug #X: [Short Title]

**Platform:** iOS / Android / Both  
**Severity:** Critical / High / Medium / Low  
**Reproducibility:** Always / Sometimes / Rare

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Logs:**
[Attach if applicable]

**Workaround:**
[If any]

**Fix Status:** [ ] Not Started / [ ] In Progress / [ ] Fixed / [ ] Verified
```

### 5.2 Log Issues in Progress Tracker

Add issues to `progress-tracker.md` under "Issues Encountered" section.

---

## Verification Checklist

Before moving to Phase 6/7, verify:

**iOS:**
- [ ] All core features tested and working
- [ ] All native features tested and working
- [ ] Widgets working and updating
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] Test checklist 100% complete

**Android:**
- [ ] All core features tested and working
- [ ] All native features tested and working
- [ ] Widgets working and updating
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] Test checklist 100% complete

**Cross-Platform:**
- [ ] Data syncs between devices for authenticated users
- [ ] Guest and authenticated flows both work
- [ ] No platform-specific regressions

**Documentation:**
- [ ] All bugs documented
- [ ] Fixes applied and verified
- [ ] Progress tracker updated

---

## Common Issues & Fixes

### Issue: App crashes on launch

**Debug:**
1. Check Xcode/Android Studio crash logs
2. Look for missing dependencies or plugin initialization errors

**Solution:** Ensure all plugins synced: `npx cap sync`

### Issue: Geolocation permission doesn't persist

**iOS:** Check `Info.plist` has usage descriptions  
**Android:** Check `AndroidManifest.xml` has permissions

### Issue: Widget shows stale data

**Solution:** Open app and navigate to `/times` to trigger update. Verify `updateWidgetData()` is being called.

### Issue: Push notifications not received

**Debug:** Check device settings → app permissions → notifications enabled

**iOS:** Verify APNs certificate configured in Firebase  
**Android:** Verify `google-services.json` present

### Issue: Maps not loading

**Solution:** Ensure internet connection. Check MapLibre GL dependencies synced.

---

## Next Steps

✅ **Phase 5 Complete!** You now have:
- Fully tested iOS app
- Fully tested Android app
- Bug list documented and fixed
- Performance verified
- Ready for distribution

**Choose Next:**
- → **iOS Users:** [Phase 6: TestFlight Preparation](./phase-6-testflight.md)
- → **Android Users:** [Phase 7: Google Play Preparation](./phase-7-play-console.md)
- → **Both:** Do Phase 6 and 7 in parallel

---

**Phase 5 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Critical Bugs Found:** ___ / Fixed: ___  
**Ready for Distribution:** Yes / No

