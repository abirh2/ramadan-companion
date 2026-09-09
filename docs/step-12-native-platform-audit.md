# Step 12 native platform audit

Audit date: 2026-09-09
Scope: Capacitor iOS and Android wrappers, widgets, shared data, notifications, deep links, app assets, launch experience, and system chrome.

## Existing implementation

- Capacitor 8.1 wraps the hosted Next.js application with bundle IDs `com.deencompanion.app` (iOS) and `com.deencompanion.lite` (Android). The native display name is already **Deen Companion**.
- Installed native plugins cover App lifecycle/deep links, Browser, Geolocation, Haptics, Keyboard, Local Notifications, Preferences, Push Notifications, Splash Screen, and Status Bar. Apple Sign In is also installed.
- iOS has a WidgetKit extension and App Group entitlement (`group.com.deencompanion.app`). It currently bundles Next Prayer, Daily Prayers, Prayer List, Quran verse, hadith, zikr, Hijri date, charity, Qibla, and mosque widgets.
- The iOS Next Prayer widget already declares small, medium, and Lock Screen accessory families. It builds prayer-boundary timelines, but currently prefers a separate Swift prayer calculator and stores precise latitude/longitude in the shared container.
- Android has equivalent `AppWidgetProvider` implementations using `RemoteViews`. The Next Prayer widget requests one-minute periodic updates, which Android clamps to a minimum of 30 minutes, and also prefers a separate Kotlin prayer calculator.
- The web layer already writes individual widget keys plus a 14-day prayer schedule through Capacitor Preferences. iOS mirrors those keys into App Group `UserDefaults`; Android reads the Preferences `SharedPreferences` file directly.
- Prayer notifications support both local seven-day scheduling and push registration. Local notification payloads already include `/times`, but no app-level listener routes notification taps.
- Custom OAuth URL schemes are configured. Existing widget links use a different iOS scheme, while Android widgets attach an unused `route` extra, so prayer-widget taps do not reliably navigate to Prayer Times.
- The web shell already declares `viewport-fit=cover` and uses safe-area CSS variables. No runtime code currently synchronizes status-bar icon style with light/dark theme.
- The iOS app icon and launch mark use the established teal/ivory/muted-gold crescent and remain recognizable at small sizes. Legacy Android launcher PNGs match it, but the adaptive-icon resource resolves to the default Android robot vector on modern Android.
- Launch screens are minimal and teal. The Capacitor splash is held for a fixed two seconds, which creates avoidable launch latency and can expose a transition mismatch with the app canvas.
- Quran sharing uses the Web Share API when available and preserves copy as a separate action. Hadith currently offers copy actions only.
- There are no native app shortcuts/quick actions and no background task dedicated to widget data refresh.

## Audit health score

| Dimension | Score | Key finding |
| --- | ---: | --- |
| Accessibility | 3/4 | Native widget text is mostly semantic, but Android uses an emoji/header treatment and fixed layouts with limited resizing behavior. |
| Performance | 2/4 | Prayer logic is duplicated in Swift and Kotlin; iOS reloads all widget timelines broadly; Android requests a refresh cadence the OS will not honor. |
| Appearance & theming | 2/4 | iOS supports light/dark, but both widget implementations contain raw colors and Android imitates iOS translucency instead of using an opaque host-appropriate surface. |
| Platform conformance | 2/4 | WidgetKit/RemoteViews foundations are correct, but prayer deep links, Android adaptive icon wiring, and the iOS 26-only widget target are release-impacting defects. |
| Adaptivity | 2/4 | iOS declares useful families; Android exposes resizable widgets but the primary layout does not meaningfully adapt across sizes. |
| **Total** | **11/20** | **Acceptable — significant native integration work remains.** |

## Prioritized findings

- **P1 — Widget prayer data duplicates the calculation engine and exposes precise coordinates.** Native calculators can drift from the web calculation source and the App Group/SharedPreferences contain more location data than the widget needs.
- **P1 — Prayer-widget deep links are not end-to-end.** iOS widget URLs use an undeclared scheme and Android `route` extras are not consumed by `MainActivity` or the web app.
- **P1 — Modern Android uses the template robot adaptive foreground.** The branded raster exists, but a version-qualified vector overrides it.
- **P1 — The WidgetKit extension deployment target is iOS 26.0.** This excludes the widget from otherwise-supported iOS versions and conflicts with the declared iOS 16 Lock Screen support.
- **P2 — Stale and first-launch states are ambiguous.** Missing data can appear as dashes or a mixture of an old prayer and “Open app,” rather than one explicit recovery message.
- **P2 — Refresh requests do not match OS guarantees.** Android ignores sub-30-minute `updatePeriodMillis`; iOS reloads every widget timeline instead of only changed kinds.
- **P2 — System chrome is only partially integrated.** Safe-area CSS exists, but status/navigation bar colors and icon contrast are not synchronized with the app theme.
- **P2 — The launch hold is longer than necessary.** A fixed two-second splash delays access after the native launch screen is already ready.
- **P3 — Android widget styling is iOS-shaped.** The semi-transparent “frosted” background and emoji header should be replaced with a simpler Android-native branded hierarchy.

## Positive findings to preserve

- Strong, recognizable crescent artwork and consistent Deen Companion naming.
- Correct native widget technologies on both platforms rather than embedded web UI.
- App Group entitlements are present on both the iOS app and widget extension.
- Prayer payloads are already generated by the app and a multi-day cache already exists, so a normalized bridge can replace native calculation without a new dependency.
- Notification copy is concise and prayer-specific; copy/share behavior does not alter religious text.
- Existing safe-area CSS, dark theme, and native plugin set provide the foundations for an integrated result.

## Build baseline

- Web tests/build initially selected system Node 16.11.1 and could not run Next.js 16. The repository declares Node 24+; verification should use the workspace-bundled Node runtime.
- Android Gradle initially could not access the user Gradle cache under sandbox restrictions.
- Xcode 26.3 is installed, but the simulator service was unavailable in the initial sandboxed invocation. Native compilation will be retried after the changes; device screenshots still require a bootable Simulator/emulator.
