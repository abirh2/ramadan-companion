# Phase 4: Native Widgets Implementation

**Duration:** 3–4 days  
**Complexity:** Medium-High  
**Prerequisites:** Phase 3 complete (or Phase 2 minimum)

---

## Overview

This phase implements three home screen widgets:

| Widget | Sizes (iOS) | Sizes (Android) | Deep-link |
|---|---|---|---|
| Prayer Times | Small, Medium | 2×2 | `/times` |
| Verse of the Day | Medium, Large | 3×2 | `/quran` or `/hadith` |
| Zikr Counter | Small, Medium | 2×2 | `/zikr` |

**Styling:** Apple glassmorphic — `.ultraThinMaterial` in SwiftUI, translucent frosted drawable on Android. Teal `#0f3d3e` accent. Minimal typography.

**Interactive zikr:** iOS 17+ supports an in-widget `Button` that increments the count without opening the app. iOS 15/16 and Android (all versions) open the app on tap.

---

## Architecture

```
React App (hooks)
    ↓
src/lib/widgetBridge.ts   ← writes all widget data to shared storage
    ↓
@capacitor/preferences    ← already installed
    ↓
iOS: UserDefaults (App Group: group.com.deencompanion.app)
Android: SharedPreferences ("CapacitorStorage")
    ↓
ios/App/DeenCompanionWidgets/   ← single WidgetBundle with 3 widget types
android/app/.../widgets/        ← 3 AppWidgetProvider classes
```

### Shared storage keys

**Prayer widget**
- `widget_prayer_name` — e.g. "Fajr"
- `widget_prayer_time` — e.g. "5:30 AM"
- `widget_prayer_countdown` — e.g. "2h 15m"
- `widget_prayer_update` — ISO timestamp

**Verse widget**
- `widget_verse_type` — `"quran"` or `"hadith"`
- `widget_verse_arabic` — Arabic text
- `widget_verse_translation` — English text
- `widget_verse_source` — e.g. "Surah Al-Fatiha 1:1"
- `widget_verse_update` — ISO timestamp

**Zikr widget**
- `widget_zikr_arabic` — Arabic phrase
- `widget_zikr_transliteration` — e.g. "SubhanAllah"
- `widget_zikr_count` — current count (string)
- `widget_zikr_target` — target count (string, "0" = no target)
- `widget_zikr_update` — ISO timestamp

---

## Files Created / Modified

### TypeScript

| File | Change |
|---|---|
| `src/lib/widgetBridge.ts` | **New** — unified bridge; exports `updatePrayerWidget`, `updateVerseWidget`, `updateZikrWidget`, `readWidgetZikrCount` |
| `capacitor.config.json` | Added `Preferences.group` for iOS App Group |
| `src/hooks/usePrayerTimes.ts` | Calls `updatePrayerWidget` after fetch + in countdown interval |
| `src/hooks/useQuranOfTheDay.ts` | Calls `updateVerseWidget` after fetch |
| `src/hooks/useHadithOfTheDay.ts` | Calls `updateVerseWidget` after fetch |
| `src/hooks/useZikr.ts` | Calls `updateZikrWidget` on state change; reconciles in-widget increments on foreground |

### iOS Swift

| File | Purpose |
|---|---|
| `ios/App/DeenCompanionWidgets/DeenCompanionWidgetsBundle.swift` | `@main` WidgetBundle entry point |
| `ios/App/DeenCompanionWidgets/SharedDefaults.swift` | Typed accessors for the shared UserDefaults suite |
| `ios/App/DeenCompanionWidgets/PrayerWidget.swift` | Prayer Times widget (Small + Medium) |
| `ios/App/DeenCompanionWidgets/VerseWidget.swift` | Verse of the Day widget (Medium + Large) |
| `ios/App/DeenCompanionWidgets/ZikrWidget.swift` | Zikr Counter widget (Small + Medium) |
| `ios/App/DeenCompanionWidgets/ZikrIntent.swift` | `@available(iOS 17.0, *)` AppIntent for in-widget increment |

### Android Kotlin + Resources

| File | Purpose |
|---|---|
| `android/.../widgets/WidgetPrefs.kt` | Shared helper for reading/writing CapacitorStorage SharedPreferences |
| `android/.../widgets/PrayerTimesWidget.kt` | Prayer Times AppWidgetProvider |
| `android/.../widgets/VerseWidget.kt` | Verse of the Day AppWidgetProvider |
| `android/.../widgets/ZikrWidget.kt` | Zikr Counter AppWidgetProvider |
| `android/.../widgets/ZikrIncrementReceiver.kt` | BroadcastReceiver for "+ Count" button tap |
| `res/layout/widget_prayer.xml` | Prayer widget layout |
| `res/layout/widget_verse.xml` | Verse widget layout (RTL Arabic) |
| `res/layout/widget_zikr.xml` | Zikr widget layout with button |
| `res/xml/widget_prayer_info.xml` | Prayer widget metadata |
| `res/xml/widget_verse_info.xml` | Verse widget metadata |
| `res/xml/widget_zikr_info.xml` | Zikr widget metadata |
| `res/drawable/widget_background.xml` | Frosted glass drawable (shared) |
| `AndroidManifest.xml` | Registers all 3 widgets + ZikrIncrementReceiver |

---

## Step 1: Verify TypeScript Build

```bash
nvm use 22 && npm run build
npx cap sync
```

Expected: Build succeeds. Console should not report any widgetBridge import errors.

---

## Step 2: iOS Setup in Xcode

The Swift files are ready in `ios/App/DeenCompanionWidgets/`. You must link them to Xcode manually.

### 2.1 Open the project

```bash
npm run cap:open:ios
```

### 2.2 Create the Widget Extension target

1. In Xcode: **File → New → Target**
2. Search for **Widget Extension**
3. Product Name: `DeenCompanionWidgets`
4. Language: **Swift**
5. **Uncheck** "Include Configuration Intent"
6. Click **Finish** → **Activate** the new scheme when prompted

Xcode creates `ios/App/DeenCompanionWidgets/` with a placeholder Swift file. **Delete the auto-generated Swift files** (DeenCompanionWidgets.swift, Assets.xcassets if empty) — the real files are already in that folder from this repo.

### 2.3 Add Swift files to the target

In the Xcode Project Navigator, select the `DeenCompanionWidgets` folder. For each of the six files below, ensure **Target Membership** includes `DeenCompanionWidgets` (check the checkbox in the File Inspector panel):

- `DeenCompanionWidgetsBundle.swift`
- `SharedDefaults.swift`
- `PrayerWidget.swift`
- `VerseWidget.swift`
- `ZikrWidget.swift`
- `ZikrIntent.swift`

### 2.4 Configure App Groups

**On the App target (not the widget):**
1. Select the project file → target **App**
2. **Signing & Capabilities** tab → **+ Capability** → **App Groups**
3. Click **+** → Identifier: `group.com.deencompanion.app`
4. Ensure the checkbox is **checked**

**On the Widget target:**
1. Select target **DeenCompanionWidgets**
2. **Signing & Capabilities** → **+ Capability** → **App Groups**
3. Check the **same group**: `group.com.deencompanion.app`

> Both targets must share the same App Group for `SharedDefaults` to work.

### 2.5 Build and test

1. Select scheme **DeenCompanionWidgets** → Run (⌘R) → verify no compile errors
2. Switch back to scheme **App** → Build and run on device
3. Navigate to `/times` in the app to populate prayer data
4. Long-press home screen → **+** → search "Deen Companion"
5. You should see three widgets: Prayer Times, Verse of the Day, Zikr Counter

---

## Step 3: Android Build

The Kotlin files and XML resources are already in place. No manual IDE steps required.

```bash
npx cap sync android
npm run cap:open:android
```

In Android Studio:
1. **Build → Make Project** (⌘F9)
2. **Run → Run 'app'** (Shift+F10) on device/emulator

**Add widgets:**
1. Long-press home screen → Widgets
2. Find "Deen Companion" — three widgets will be listed
3. Drag each to the home screen

---

## Verification Checklist

### iOS
- [ ] `DeenCompanionWidgets` target compiles without errors
- [ ] App Groups capability added to both targets with same ID
- [ ] All 3 widgets appear in the iOS widget picker
- [ ] Prayer widget shows next prayer + countdown
- [ ] Verse widget shows Arabic + English text
- [ ] Zikr widget shows current phrase + count
- [ ] Tapping Prayer widget opens app to `/times`
- [ ] Tapping Verse widget opens app to `/quran` or `/hadith`
- [ ] Tapping Zikr widget (iOS 17+): increments count in-widget
- [ ] Tapping Zikr widget (iOS 15/16): opens app to `/zikr`
- [ ] Zikr count reconciles correctly when returning to app after in-widget increments

### Android
- [ ] All 3 widgets appear in Android widget picker
- [ ] Prayer widget updates within a minute of opening the app
- [ ] Verse widget shows today's verse/hadith
- [ ] Zikr "+" button increments count without opening app
- [ ] Tapping Zikr widget body opens app to `/zikr`

---

## Troubleshooting

### iOS: Widget shows "—" / "Open app" forever

1. Verify App Group ID matches **exactly** in both targets: `group.com.deencompanion.app`
2. Check `capacitor.config.json` has `Preferences.group` set to the same ID
3. Run the app, navigate to `/times` to trigger first data write
4. Check Xcode console for `[widgetBridge]` log lines

### iOS: ZikrIntent not available (runtime error)

Ensure `ZikrIntent.swift` is in the widget extension target, not the app target. The `@available(iOS 17.0, *)` guard prevents it running on older devices.

### Android: Widget not in picker

1. Verify all 3 `<receiver>` entries are in `AndroidManifest.xml`
2. **Build → Clean Project → Make Project**
3. Reinstall app

### Android: Zikr count not updating

The `ZikrIncrementReceiver` requires `android:exported="false"` and the `ZIKR_INCREMENT` action in the manifest. Confirm both entries exist.

### Widget doesn't update after app sends new data

iOS widgets update on their own timeline (1-minute minimum). To force a reload, kill and relaunch the app. On Android, the update period is set in `widget_*_info.xml`.

---

## Next Steps

→ **Continue to [Phase 5: Local Testing](./phase-5-local-testing.md)**

---

**Phase 4 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Issues Encountered:** None / [Describe]  
**Ready for Phase 5:** Yes / No
