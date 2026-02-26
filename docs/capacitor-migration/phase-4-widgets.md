# Phase 4: Native Widgets Implementation

**Duration:** 3-4 days  
**Complexity:** Medium-High  
**Prerequisites:** Phase 3 complete (or Phase 2 minimum)

---

## Overview

This phase implements home screen widgets with material and transparent variants:

| Widget | Sizes (iOS) | Sizes (Android) | Deep-link |
|---|---|---|---|
| Next Prayer | Small, Medium | 2x2 | `/times` |
| Daily Prayers | Medium | -- | `/times` |
| Verse of the Day | Medium, Large | 3x2 | `/quran` or `/hadith` |
| Zikr Counter | Small, Medium | 2x2 | `/zikr` |

Each iOS widget has two variants:
- **Material** -- `.ultraThinMaterial` glassmorphic background (default)
- **Clear** -- transparent background for seamless wallpaper integration

**Styling:** Teal `#0f3d3e` accent. Minimal typography.

**Interactive zikr:** iOS 17+ supports an in-widget `Button` (both small and medium) that increments the count without opening the app. iOS 15/16 and Android open the app on tap.

**Live countdown:** The Next Prayer widget generates its own timeline entries (one per minute) from a stored target Date. The countdown updates independently of the app -- no per-second bridge writes needed.

---

## Architecture

```
React App (hooks)
    |
src/lib/widgetBridge.ts   <- writes all widget data to shared storage
    |
@capacitor/preferences    <- already installed
    |
iOS: UserDefaults (App Group: group.com.deencompanion.app)
Android: SharedPreferences ("CapacitorStorage")
    |
ios/App/DeenCompanionWidgets/   <- single WidgetBundle with 8 widget configs
android/app/.../widgets/        <- 3 AppWidgetProvider classes
```

### Shared storage keys

**Next Prayer widget**
- `widget_prayer_name` -- e.g. "Fajr"
- `widget_prayer_time` -- 12hr format e.g. "5:30 AM"
- `widget_prayer_target_time` -- ISO 8601 date of next prayer (iOS widget computes countdown)
- `widget_prayer_countdown` -- pre-computed countdown string (Android backward compat)
- `widget_prayer_update` -- ISO timestamp

**All Prayers widget**
- `widget_all_prayers_fajr` -- 12hr format
- `widget_all_prayers_dhuhr` -- 12hr format
- `widget_all_prayers_asr` -- 12hr format
- `widget_all_prayers_maghrib` -- 12hr format
- `widget_all_prayers_isha` -- 12hr format
- `widget_all_prayers_next` -- name of next prayer (for highlighting)
- `widget_all_prayers_update` -- ISO timestamp

**Verse widget**
- `widget_verse_type` -- `"quran"` or `"hadith"`
- `widget_verse_arabic` -- Arabic text (truncated to 300 chars for widgets)
- `widget_verse_translation` -- English text (truncated to 250 chars for widgets)
- `widget_verse_source` -- e.g. "Surah Al-Fatiha 1:1"
- `widget_verse_update` -- ISO timestamp

**Zikr widget**
- `widget_zikr_arabic` -- Arabic phrase
- `widget_zikr_transliteration` -- e.g. "SubhanAllah"
- `widget_zikr_count` -- current count (string)
- `widget_zikr_target` -- target count (string, "0" = no target)
- `widget_zikr_update` -- ISO timestamp

---

## Files Created / Modified

### TypeScript

| File | Change |
|---|---|
| `src/lib/widgetBridge.ts` | Bridge with `updatePrayerWidget`, `updateAllPrayersWidget`, `updateVerseWidget`, `updateZikrWidget`, `readWidgetZikrCount`, `to12Hour` helper, content truncation |
| `capacitor.config.json` | `Preferences.group` for iOS App Group |
| `src/hooks/usePrayerTimes.ts` | Pushes next prayer + all 5 prayers on fetch and prayer transitions (not every second) |
| `src/hooks/useQuranOfTheDay.ts` | Calls `updateVerseWidget` after fetch |
| `src/hooks/useHadithOfTheDay.ts` | Calls `updateVerseWidget` after fetch |
| `src/hooks/useZikr.ts` | Calls `updateZikrWidget` on state change; reconciles in-widget increments on foreground |

### iOS Swift

| File | Purpose |
|---|---|
| `DeenCompanionWidgetsBundle.swift` | `@main` WidgetBundle -- 8 widget configs (4 material + 4 clear) |
| `SharedDefaults.swift` | Typed accessors for shared UserDefaults (all prayer + verse + zikr keys) |
| `PrayerWidget.swift` | Next Prayer widget (Small + Medium) with multi-entry timeline countdown + Clear variant |
| `AllPrayersWidget.swift` | Daily Prayers widget (Medium) showing all 5 times in 12hr format + Clear variant |
| `VerseWidget.swift` | Verse of the Day widget (Medium + Large) with line limits + Clear variant |
| `ZikrWidget.swift` | Zikr Counter widget (Small + Medium) with interactive Button on both sizes (iOS 17+) + Clear variant |
| `ZikrIntent.swift` | `@available(iOS 17.0, *)` AppIntent for in-widget increment |

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

The Swift files are in `ios/App/DeenCompanionWidgets/`. The project uses `PBXFileSystemSynchronizedRootGroup`, so Xcode automatically discovers new files in the directory -- no manual file-add steps needed.

### 2.1 Open the project

```bash
npm run cap:open:ios
```

### 2.2 Widget Extension target

If the `DeenCompanionWidgetsExtension` target already exists (it should), skip to 2.3. Otherwise:

1. In Xcode: **File -> New -> Target**
2. Search for **Widget Extension**
3. Product Name: `DeenCompanionWidgets`
4. Language: **Swift**
5. **Uncheck** "Include Configuration Intent"
6. Click **Finish** -> **Activate** the new scheme when prompted

### 2.3 Configure App Groups

**On the App target (not the widget):**
1. Select the project file -> target **App**
2. **Signing & Capabilities** tab -> **+ Capability** -> **App Groups**
3. Click **+** -> Identifier: `group.com.deencompanion.app`
4. Ensure the checkbox is **checked**

**On the Widget target:**
1. Select target **DeenCompanionWidgets**
2. **Signing & Capabilities** -> **+ Capability** -> **App Groups**
3. Check the **same group**: `group.com.deencompanion.app`

### 2.4 Build and test

1. Select scheme **App** -> Build and run on device
2. Navigate to any page in the app to populate prayer data
3. Long-press home screen -> **+** -> search "Deen Companion"
4. You should see 8 widgets: 4 material + 4 clear variants
5. Verify: Next Prayer, Daily Prayers, Verse of the Day, Zikr Counter

---

## Step 3: Android Build

The Kotlin files and XML resources are already in place. No manual IDE steps required.

```bash
npx cap sync android
npm run cap:open:android
```

---

## Verification Checklist

### iOS
- [ ] `DeenCompanionWidgetsExtension` target compiles without errors
- [ ] App Groups capability added to both targets with same ID
- [ ] All 8 widgets appear in the iOS widget picker (4 material + 4 clear)
- [ ] Next Prayer widget shows next prayer + live countdown (updates every minute)
- [ ] Daily Prayers widget shows all 5 prayers in 12hr format with next prayer highlighted
- [ ] Verse widget shows Arabic + English text (truncated appropriately)
- [ ] Zikr widget (small, iOS 17+): tapping increments count in-widget
- [ ] Zikr widget (medium, iOS 17+): tapping increments count in-widget
- [ ] Zikr widget (iOS 15/16): opens app to `/zikr`
- [ ] Zikr count reconciles correctly when returning to app after in-widget increments
- [ ] Clear variants display with transparent background

### Android
- [ ] All 3 widgets appear in Android widget picker
- [ ] Prayer widget updates within a minute of opening the app
- [ ] Verse widget shows today's verse/hadith
- [ ] Zikr "+" button increments count without opening app
- [ ] Tapping Zikr widget body opens app to `/zikr`

---

## Troubleshooting

### iOS: Widget shows "---" / "Open app" forever

1. Verify App Group ID matches **exactly** in both targets: `group.com.deencompanion.app`
2. Check `capacitor.config.json` has `Preferences.group` set to the same ID
3. Run the app, navigate to any page to trigger first data write
4. Check Xcode console for `[widgetBridge]` log lines

### iOS: Countdown not updating

The Next Prayer widget generates timeline entries from `widget_prayer_target_time`. If this key is empty, the widget falls back to a static display. Ensure the app has been opened at least once to populate the target time.

### iOS: ZikrIntent not available

Ensure `ZikrIntent.swift` is in the widget extension target, not the app target. The `@available(iOS 17.0, *)` guard prevents it running on older devices.

### Android: Widget not in picker

1. Verify all 3 `<receiver>` entries are in `AndroidManifest.xml`
2. **Build -> Clean Project -> Make Project**
3. Reinstall app

### Widget doesn't update after app sends new data

iOS widgets update on their own timeline (1-minute minimum). To force a reload, kill and relaunch the app. On Android, the update period is set in `widget_*_info.xml`.

---

## Next Steps

-> **Continue to [Phase 5: Local Testing](./phase-5-local-testing.md)**

---

**Phase 4 Status:** [ ] Complete  
**Time Spent:** ___ hours  
**Issues Encountered:** None / [Describe]  
**Ready for Phase 5:** Yes / No
