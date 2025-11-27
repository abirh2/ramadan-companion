# Phase 2: Plugin Installation & Migration

**Duration:** 2-3 days  
**Complexity:** Medium  
**Prerequisites:** Phase 1 complete

---

## Overview

This phase replaces browser APIs with Capacitor plugins for native functionality.

**What You'll Migrate:**
1. Geolocation API → `@capacitor/geolocation`
2. DeviceOrientation API → `@capacitor/motion`
3. Vibration API → `@capacitor/haptics`

**What Stays the Same:**
- HTML5 Audio (works natively, no changes needed)
- localStorage (works natively, no changes needed)
- All external API calls (HTTP-based, no changes needed)

---

## Step 1: Install Capacitor Plugins

### 1.1 Install All Required Plugins

```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion

npm install @capacitor/geolocation \
            @capacitor/motion \
            @capacitor/haptics \
            @capacitor/splash-screen \
            @capacitor/status-bar \
            @capacitor/keyboard \
            @capacitor/preferences
```

**Plugin Purposes:**
- `geolocation` - Replaces `navigator.geolocation`
- `motion` - Replaces `DeviceOrientationEvent` for compass
- `haptics` - Replaces `navigator.vibrate` for zikr feedback
- `splash-screen` - Native splash screen control
- `status-bar` - Status bar styling
- `keyboard` - Keyboard behavior control
- `preferences` - Enhanced localStorage for widgets (Phase 4)

### 1.2 Sync Plugins to Native Projects

```bash
npx cap sync
```

**Expected Output:**
```
✔ Copying web assets
✔ Updating iOS plugins
✔ Updating Android plugins
✔ sync in 2s
```

---

## Step 2: Migrate Geolocation API

### 2.1 Update `src/lib/location.ts`

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/src/lib/location.ts`

**Current Function (lines 14-46):**
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
        resolve({
          lat,
          lng,
          city: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          type: 'detected',
        })
      },
      (error) => {
        console.error('Geolocation error:', error.message)
        resolve(null)
      },
      {
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  })
}
```

**New Implementation:**

```typescript
// Add import at top of file
import { Geolocation } from '@capacitor/geolocation';

// Replace requestGeolocation function
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

    // Reverse geocode to get city name
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

**Key Changes:**
- ✅ Import `Geolocation` from `@capacitor/geolocation`
- ✅ Check permissions before requesting location
- ✅ Use `async/await` instead of callbacks (cleaner)
- ✅ Same return type, same behavior

### 2.2 Test Geolocation

**Build and sync:**
```bash
npm run build
npx cap sync
```

**Test on device:**
1. Open Xcode or Android Studio
2. Run app on physical device (geolocation doesn't work in simulators reliably)
3. Navigate to `/times` page
4. Click "Use Current Location" button
5. **Expected:** Permission prompt appears
6. Grant permission
7. **Expected:** Location detected, prayer times load

**Success Criteria:**
- [ ] Permission prompt appears
- [ ] After granting, location is detected
- [ ] City name displays correctly
- [ ] Prayer times load based on location

---

## Step 3: Migrate DeviceOrientation API (Qibla Compass)

### 3.1 Update `src/lib/orientation.ts`

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/src/lib/orientation.ts`

**Add Import (line 1):**

```typescript
import { Motion } from '@capacitor/motion';
```

**Replace `startOrientationTracking` function (lines 153-200):**

```typescript
export function startOrientationTracking(callback: OrientationCallback): () => void {
  if (!hasOrientationSupport()) {
    console.warn('[Orientation] DeviceOrientation API not supported')
    return () => {}
  }

  let isActive = true;
  let listener: any = null;

  const initializeTracking = async () => {
    try {
      // iOS requires permission for device orientation
      if (isIOS() && needsOrientationPermission()) {
        const permission = await (DeviceOrientationEvent as any).requestPermission?.();
        if (permission !== 'granted') {
          console.warn('[Orientation] Permission denied');
          isActive = false;
          return;
        }
      }

      // Start listening to device orientation with Motion plugin
      listener = await Motion.addListener('orientation', (event) => {
        if (!isActive) return;

        // Motion plugin provides alpha, beta, gamma
        // alpha: 0-360 degrees (0 = North, clockwise)
        const alpha = event.alpha !== null ? event.alpha : 0;

        const heading: DeviceHeading = {
          alpha: normalizeHeading(alpha),
          accuracy: null, // Motion API doesn't provide accuracy
          timestamp: Date.now(),
        };

        callback(heading);
      });

      console.log('[Orientation] Tracking started successfully');
    } catch (error) {
      console.error('[Orientation] Failed to start tracking:', error);
      isActive = false;
    }
  };

  // Initialize tracking
  initializeTracking();

  // Return cleanup function
  return () => {
    isActive = false;
    if (listener) {
      listener.remove();
      listener = null;
    }
  };
}
```

**Key Changes:**
- ✅ Use `Motion.addListener('orientation', ...)` instead of window event
- ✅ Still handles iOS permission request
- ✅ Returns cleanup function to stop listening
- ✅ Same callback interface, existing components work unchanged

**Note:** The Motion plugin's `alpha` value behaves slightly differently than `webkitCompassHeading`. You may need to fine-tune compass calibration in Phase 5 testing.

### 3.2 Test Compass

**Build and sync:**
```bash
npm run build
npx cap sync
```

**Test on device:**
1. Run app on physical device (compass requires magnetometer)
2. Navigate to `/times#qibla`
3. Toggle "Dynamic" compass mode
4. **Expected:** Permission prompt (iOS only)
5. Grant permission
6. **Expected:** Compass arrow rotates as you turn device

**Success Criteria:**
- [ ] Permission prompt on iOS
- [ ] Compass rotates smoothly
- [ ] Arrow points toward Qibla direction
- [ ] No console errors

---

## Step 4: Migrate Vibration API (Haptic Feedback)

### 4.1 Update `src/lib/zikr.ts`

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/src/lib/zikr.ts`

**Add Import (line 1):**

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';
```

**Replace `triggerHapticFeedback` function (lines 250-261):**

```typescript
export async function triggerHapticFeedback(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    // Silently fail - haptic feedback is optional
    console.debug('Haptic feedback failed:', error);
  }
}
```

**Key Changes:**
- ✅ Use `Haptics.impact()` instead of `navigator.vibrate()`
- ✅ Function is now `async` (returns Promise)
- ✅ `ImpactStyle.Light` = gentle tap (similar to 10ms vibration)
- ✅ Still fails silently if haptics unavailable

### 4.2 Update Call Sites (Make Async)

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/src/hooks/useZikr.ts`

Find where `triggerHapticFeedback()` is called (likely in increment function).

**Before:**
```typescript
triggerHapticFeedback()
```

**After:**
```typescript
triggerHapticFeedback() // Can keep non-awaited for fire-and-forget
// OR
await triggerHapticFeedback() // If you want to wait
```

**Recommendation:** Keep non-awaited (fire-and-forget) for better UX responsiveness.

### 4.3 Test Haptics

**Build and sync:**
```bash
npm run build
npx cap sync
```

**Test on device:**
1. Run app on physical device (haptics don't work in simulators)
2. Navigate to `/zikr`
3. Tap counter button
4. **Expected:** Feel gentle haptic feedback with each tap

**Success Criteria:**
- [ ] Haptic feedback on each zikr counter tap
- [ ] Feels like gentle tap/vibration
- [ ] No delays or lag
- [ ] No console errors

---

## Step 5: Verify Audio Playback (No Changes)

### 5.1 Test Quran Audio

**Files:** No changes needed to:
- `src/components/quran/AyahAudioPlayer.tsx`
- `src/lib/quranAudio.ts`
- `src/lib/zikr.ts` (AudioContext for click sounds)

HTML5 Audio and AudioContext work natively in Capacitor.

**Test on device:**
1. Navigate to `/quran` → Select any surah
2. Tap "Listen" button on any ayah
3. **Expected:** Audio plays successfully

**Test zikr click sound:**
1. Navigate to `/zikr`
2. Ensure audio feedback enabled in settings
3. Tap counter button
4. **Expected:** Hear click sound

**Success Criteria:**
- [ ] Quran audio plays and stops correctly
- [ ] Audio controls work (play/pause)
- [ ] Zikr click sound plays
- [ ] No audio issues or glitches

---

## Step 6: Update TypeScript for Plugin Types

### 6.1 Check Plugin Type Definitions

Plugins include TypeScript definitions automatically. Verify imports resolve:

```bash
npx tsc --noEmit
```

**Expected:** No type errors from Capacitor plugin imports.

If you see errors like `Cannot find module '@capacitor/geolocation'`, ensure plugins are installed:

```bash
npm list @capacitor/geolocation @capacitor/motion @capacitor/haptics
```

---

## Step 7: Run Full Test Suite

### 7.1 Build Application

```bash
npm run build
```

**Expected:** Build succeeds without errors.

### 7.2 Run Tests

```bash
npm run test:ci
```

**Note:** Some tests may fail because they're written for browser APIs. Update mocks as needed:

**Example: Mock Capacitor Geolocation in Tests**

Create `jest.setup.js` mock:

```javascript
// Mock Capacitor Geolocation
jest.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    checkPermissions: jest.fn().mockResolvedValue({ location: 'granted' }),
    requestPermissions: jest.fn().mockResolvedValue({ location: 'granted' }),
    getCurrentPosition: jest.fn().mockResolvedValue({
      coords: {
        latitude: 21.4225,
        longitude: 39.8262,
      },
    }),
  },
}));
```

Add similar mocks for `@capacitor/motion` and `@capacitor/haptics`.

---

## Step 8: Sync and Test on Devices

### 8.1 Sync to Native Projects

```bash
npx cap sync
```

### 8.2 Test on iOS Device

```bash
npm run cap:open:ios
```

1. Select your physical iOS device
2. Build and run (⌘R)
3. Test geolocation, compass, haptics, audio
4. Check for crashes or errors

### 8.3 Test on Android Device

```bash
npm run cap:open:android
```

1. Select your physical Android device (USB debugging enabled)
2. Build and run
3. Test all migrated features
4. Check for crashes or errors

---

## Verification Checklist

Before moving to Phase 3, verify:

**Code Changes:**
- [ ] `src/lib/location.ts` uses `@capacitor/geolocation`
- [ ] `src/lib/orientation.ts` uses `@capacitor/motion`
- [ ] `src/lib/zikr.ts` uses `@capacitor/haptics`
- [ ] All imports resolve without TypeScript errors
- [ ] `npm run build` succeeds

**Device Testing (iOS):**
- [ ] Geolocation permission prompt appears
- [ ] Location detected accurately
- [ ] Compass rotates with device movement
- [ ] Haptic feedback on zikr counter
- [ ] Quran audio plays

**Device Testing (Android):**
- [ ] Geolocation permission prompt appears
- [ ] Location detected accurately
- [ ] Compass rotates with device movement
- [ ] Haptic feedback on zikr counter
- [ ] Quran audio plays

**Core Features Still Work:**
- [ ] Prayer times display correctly
- [ ] All pages load without crashes
- [ ] Authentication works
- [ ] Favorites work
- [ ] No critical console errors

---

## Troubleshooting

### Issue: Permission prompts don't appear

**iOS Solution:**
- Check `Info.plist` has location usage descriptions
- Add if missing:
  ```xml
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>We need your location to calculate accurate prayer times.</string>
  ```

**Android Solution:**
- Check `AndroidManifest.xml` has location permissions
- Should be auto-added by Capacitor, but verify:
  ```xml
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  ```

### Issue: Compass doesn't rotate on Android

**Solution:** Motion sensor may need calibration. Have user perform figure-8 motion with device.

### Issue: Haptics don't work

**iOS:** Haptics work on iPhone 7+ with Taptic Engine. Older devices won't feel feedback.  
**Android:** Check device supports vibration. Some manufacturers disable it in settings.

### Issue: Build fails with "Cannot find module @capacitor/..."

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

### Issue: TypeScript errors after migration

**Solution:** Ensure `@types` packages are up to date:
```bash
npm update @types/node @types/react
```

---

## Next Steps

✅ **Phase 2 Complete!** You now have:
- All browser APIs replaced with Capacitor plugins
- Geolocation working natively
- Compass using device sensors
- Haptic feedback working
- All features tested on devices

→ **Continue to [Phase 3: Native Push Notifications](./phase-3-push-notifications.md)**

---

## Rollback Instructions

If you need to undo Phase 2:

```bash
# Uninstall plugins
npm uninstall @capacitor/geolocation @capacitor/motion @capacitor/haptics \
              @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard \
              @capacitor/preferences

# Revert code changes
git checkout src/lib/location.ts
git checkout src/lib/orientation.ts
git checkout src/lib/zikr.ts
git checkout src/hooks/useZikr.ts # if modified
```

---

**Phase 2 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Issues Encountered:** None / [Describe]  
**Ready for Phase 3:** Yes / No

