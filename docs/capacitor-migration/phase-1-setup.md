# Phase 1: Capacitor Setup & Configuration

**Duration:** 1 day  
**Complexity:** Low  
**Prerequisites:** None

---

## Overview

This phase installs Capacitor and creates iOS and Android projects. By the end, you'll have native project folders ready for development.

**What You'll Do:**
1. Install Capacitor dependencies
2. Initialize Capacitor configuration
3. Add iOS and Android platforms
4. Configure Next.js for static export
5. Update build scripts
6. Update `.gitignore`

**What Changes:**
- New dependencies in `package.json`
- New files: `capacitor.config.ts`
- New directories: `ios/`, `android/`
- Modified: `next.config.ts`, `package.json`, `.gitignore`

---

## Step 1: Install Capacitor Core

### 1.1 Install Dependencies

```bash
cd /Users/ahossain/Documents/GitHub/ramadan-companion
npm install @capacitor/core @capacitor/cli --save-dev
```

**Expected Output:**
```
+ @capacitor/core@6.x.x
+ @capacitor/cli@6.x.x
```

### 1.2 Initialize Capacitor

```bash
npx cap init
```

**Prompts and Answers:**
```
? App name: Deen Companion
? App Package ID: com.deencompanion.app
? Web asset directory: out
```

**What This Creates:**
- `capacitor.config.ts` - Main Capacitor configuration file

---

## Step 2: Configure Next.js for Static Export

### 2.1 Update `next.config.ts`

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/next.config.ts`

**Current content:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'maplibre-gl'],
  
  async headers() {
    return [
      // Service worker headers...
    ];
  },
};

export default nextConfig;
```

**Add static export configuration:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEW: Enable static export for Capacitor
  output: 'export',
  
  // NEW: Required for static export
  images: {
    unoptimized: true,
  },
  
  // NEW: Better routing for static files
  trailingSlash: true,
  
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'maplibre-gl'],
  
  // Keep service worker headers for PWA fallback
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Why These Changes:**
- `output: 'export'` - Generates static HTML/CSS/JS that Capacitor can bundle
- `images.unoptimized: true` - Next.js Image optimization requires server, disable for static
- `trailingSlash: true` - Ensures `/times` becomes `/times/index.html` for better static routing

---

## Step 3: Add Platform Support

### 3.1 Install Platform Packages

```bash
npm install @capacitor/ios @capacitor/android
```

### 3.2 Add iOS Platform

```bash
npx cap add ios
```

**What This Creates:**
- `ios/` directory with complete Xcode project
- `ios/App/App.xcodeproj` - Xcode project file
- `ios/App/App/Info.plist` - iOS app configuration

**Expected Output:**
```
✔ Adding native Xcode project in ios
✔ Syncing Gradle
✔ add in 30s
```

### 3.3 Add Android Platform

```bash
npx cap add android
```

**What This Creates:**
- `android/` directory with complete Android Studio project
- `android/app/build.gradle` - Android app configuration
- `android/app/src/main/AndroidManifest.xml` - Android manifest

**Expected Output:**
```
✔ Adding native Android project in android
✔ Syncing Gradle
✔ add in 30s
```

---

## Step 4: Update Capacitor Configuration

### 4.1 Edit `capacitor.config.ts`

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/capacitor.config.ts`

The `npx cap init` command created a basic config. Enhance it:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deencompanion.app',
  appName: 'Deen Companion',
  webDir: 'out',
  
  server: {
    androidScheme: 'https', // Use HTTPS for Android WebView
    iosScheme: 'capacitor', // Default iOS scheme
  },
  
  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f3d3e', // Match app theme
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
```

**Configuration Explained:**
- `appId` - Bundle identifier (must be unique, reverse domain format)
- `appName` - Display name in app stores and device home screen
- `webDir` - Where Next.js builds static files (`out/` for static export)
- `server.androidScheme` - Use HTTPS to avoid mixed content issues
- `SplashScreen` - App launch screen configuration (uses app theme color)

---

## Step 5: Update Build Scripts

### 5.1 Add Capacitor Scripts to `package.json`

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/package.json`

Add new scripts in the `scripts` section:

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
    "capture:social": "tsx scripts/capture-pages.ts",
    
    "cap:sync": "npx cap sync",
    "cap:sync:ios": "npx cap sync ios",
    "cap:sync:android": "npx cap sync android",
    "cap:open:ios": "npx cap open ios",
    "cap:open:android": "npx cap open android",
    "cap:run:ios": "npx cap run ios",
    "cap:run:android": "npx cap run android",
    "cap:build": "npm run build && npx cap sync"
  }
}
```

**Script Descriptions:**
- `build:cap` - Build Next.js + sync to native projects
- `cap:sync` - Copy web assets to both platforms
- `cap:sync:ios` - Sync only iOS
- `cap:sync:android` - Sync only Android
- `cap:open:ios` - Open Xcode
- `cap:open:android` - Open Android Studio
- `cap:run:ios` - Build and run on iOS device/simulator
- `cap:run:android` - Build and run on Android device/emulator
- `cap:build` - Full build pipeline

---

## Step 6: Update `.gitignore`

### 6.1 Add Capacitor Build Artifacts

**File:** `/Users/ahossain/Documents/GitHub/ramadan-companion/.gitignore`

Add at the end of the file:

```
# Capacitor native projects
/ios/App/build
/ios/App/Pods
/ios/App/Podfile.lock
/android/app/build
/android/build
/android/.gradle
/android/local.properties

# Static export directory
/out

# Capacitor generated files (keep these in git for now)
# Uncomment later if you want to exclude them:
# /ios
# /android
```

**Note:** We keep `ios/` and `android/` in git initially. After confirming everything works, you can exclude them and regenerate as needed.

---

## Step 7: Test Build Pipeline

### 7.1 Build Static Export

```bash
npm run build
```

**Expected Output:**
```
Route (app)                              Size
┌ ○ /                                    5.2 kB
├ ○ /about                               2.1 kB
├ ○ /admin                               3.4 kB
...
○  (Static)  prerendered as static HTML
```

**Verify Output:**
```bash
ls out/
```

**Should contain:**
```
index.html
about/
admin/
calendar/
...
_next/
```

### 7.2 Sync to Native Projects

```bash
npx cap sync
```

**Expected Output:**
```
✔ Copying web assets from out to ios/App/App/public in 1.2s
✔ Copying web assets from out to android/app/src/main/assets/public in 1.1s
✔ Copying native bridge in 0.1s
✔ Syncing Gradle
✔ sync in 3.5s
```

### 7.3 Verify Native Projects Created

**iOS:**
```bash
ls ios/App/
```

**Should see:**
```
App/
App.xcodeproj/
App.xcworkspace/
Podfile
```

**Android:**
```bash
ls android/
```

**Should see:**
```
app/
build.gradle
gradle/
settings.gradle
```

---

## Step 8: Open Native IDEs (Optional)

### 8.1 Open Xcode (macOS only)

```bash
npm run cap:open:ios
```

**What Opens:**
- Xcode with `ios/App/App.xcworkspace`
- Select target device from dropdown
- Can build and run (⌘R)

### 8.2 Open Android Studio

```bash
npm run cap:open:android
```

**What Opens:**
- Android Studio with `android/` project
- Gradle sync will run automatically
- Select device from dropdown
- Can build and run

**Note:** Don't run the app yet - we'll do that in Phase 5 after migrating plugins.

---

## Verification Checklist

Before moving to Phase 2, verify:

- [ ] `capacitor.config.ts` exists with correct `appId` and `webDir`
- [ ] `ios/` directory exists with Xcode project
- [ ] `android/` directory exists with Android Studio project
- [ ] `npm run build` completes successfully
- [ ] `out/` directory contains static build
- [ ] `npx cap sync` completes without errors
- [ ] Xcode opens iOS project (if on macOS)
- [ ] Android Studio opens Android project
- [ ] `.gitignore` updated with Capacitor paths
- [ ] `package.json` includes new Capacitor scripts

---

## Troubleshooting

### Issue: `npx cap add ios` fails with "Command not found"

**Solution:** Ensure `@capacitor/cli` is installed:
```bash
npm install @capacitor/cli --save-dev
```

### Issue: `npm run build` fails with "Image Optimization" error

**Solution:** Verify `next.config.ts` has `images.unoptimized: true`

### Issue: Xcode won't open on macOS

**Solution:** Install Xcode from App Store first (15+ required)

### Issue: Android Studio Gradle sync fails

**Solution:** 
1. Ensure Java 17 is installed
2. Set `JAVA_HOME` environment variable
3. Re-sync Gradle: File → Sync Project with Gradle Files

### Issue: `out/` directory is empty after build

**Solution:** Check `next.config.ts` has `output: 'export'` configured

---

## Next Steps

✅ **Phase 1 Complete!** You now have:
- Capacitor installed and configured
- iOS and Android native projects
- Build pipeline working
- Ready for plugin migration

→ **Continue to [Phase 2: Plugin Installation & Migration](./phase-2-plugins.md)**

---

## Rollback Instructions

If you need to undo Phase 1:

```bash
# Remove Capacitor dependencies
npm uninstall @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Remove generated files/directories
rm -rf ios/ android/ out/ capacitor.config.ts

# Revert next.config.ts changes
git checkout next.config.ts

# Revert package.json changes
git checkout package.json

# Revert .gitignore changes
git checkout .gitignore
```

---

**Phase 1 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Issues Encountered:** None / [Describe]  
**Ready for Phase 2:** Yes / No

