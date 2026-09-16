# App Store screenshot workflow

Automated, deterministic App Store screenshots for **Deen Companion**, captured
from real iOS simulators with `xcrun simctl`. No manual navigation, no prior
simulator state, and no changes to production behaviour.

## What it produces

Six screens per device, in App Store display order:

| Order | Screen                     | Route            |
|-------|----------------------------|------------------|
| 01    | Home / prayer dashboard    | `/`              |
| 02    | Quran reader               | `/quran/1`       |
| 03    | Qibla                      | `/times#qibla`   |
| 04    | Zikr                       | `/zikr`          |
| 05    | Nearby mosques / halal food| `/places/mosques`|
| 06    | Islamic calendar           | `/calendar`      |

Two device classes, at the exact pixel sizes App Store Connect accepts:

| Device       | Simulator             | Size (px)     | Output folder                     |
|--------------|-----------------------|---------------|-----------------------------------|
| 6.9" iPhone  | iPhone 16 Pro Max     | 1320 x 2868   | `app-store-screenshots/iphone`    |
| 6.5" iPhone  | iPhone 11 Pro Max     | 1242 x 2688   | `app-store-screenshots/iphone-6.5`|
| 13" iPad     | iPad Pro 13-inch      | 2064 x 2752   | `app-store-screenshots/ipad`      |

The 6.5" set exists because some App Store Connect records show the 6.5"
Display slot (1242 x 2688 / 1284 x 2778) as the primary iPhone size and expose
no 6.9" slot. Upload the `iphone-6.5` files there; use the `iphone` (6.9") set
if/when a 6.9" slot is available.

Files are named `NN-<screen>.png` (e.g. `03-qibla.png`) so they sort into the
intended App Store order.

## Run it

```
npm run shots:appstore
```

That single command builds the harness, boots both simulators, captures all
twelve screenshots, and validates every file is the exact App Store size.

Point it at a local dev server instead of production:

```
SHOT_BASE_URL=http://localhost:3000 npm run shots:appstore
```

## How it works

The shipping iOS app is a Capacitor WKWebView shell that loads the production
web app. This workflow renders that same production URL
(`https://ramadan-companion.vercel.app`) inside a **standalone** WKWebView
harness app (`screenshot-workflow/`), completely separate from `ios/App`, so
nothing in the product is modified.

- **Deterministic navigation** — one route per app launch, passed via the
  `SHOT_ROUTE` environment variable. No tapping or scripted UI walking.
- **Predictable location** — the harness seeds `localStorage` keys the app
  already reads (`location_lat/lng/city`, `location_type=selected`,
  `calculation_method`, `madhab`) at document start, so prayer times, the Qibla
  bearing, and nearby results are fixed to New York and never trigger a location
  permission prompt. `type=selected` also disables the app's background GPS
  re-check.
- **Waits for remote content** — after navigation the harness polls a
  per-screen readiness expression (plus "no loading spinner") before capturing,
  so screenshots never show a spinner or half-loaded state.
- **Clean frames** — the status bar is hidden, the PWA install banner is
  suppressed via its own dismissal keys, and first-boot system banners are
  given time to clear before any capture. No debug overlays or test indicators.
- **No credentials** — all six screens work fully signed-out, so no auth or
  secrets are involved.

## Files

- `Harness/` — the standalone WKWebView app (Swift).
- `ShotHarness.xcodeproj` — its self-contained Xcode project.
- `capture.sh` — orchestration: build, boot, seed, navigate, wait, capture,
  validate sizes.

Outputs under `app-store-screenshots/` and the local `build/` folder are
git-ignored. These are raw screenshots — device frames and marketing text are a
later step.
