#!/usr/bin/env bash
#
# Automated App Store screenshot workflow for Deen Companion.
#
# Renders the production web app (https://ramadan-companion.vercel.app) inside a
# standalone WKWebView harness on iOS simulators and captures clean, raw
# screenshots at the exact sizes App Store Connect accepts:
#
#   6.9" iPhone -> iPhone 16 Pro Max   -> 1320 x 2868 px
#   13"  iPad   -> iPad Pro 13-inch    -> 2064 x 2752 px
#
# Determinism comes only from localStorage keys the production app already reads
# (location_*, calculation_method, madhab, theme). No production code is changed.
#
# Output:
#   app-store-screenshots/iphone/NN-<screen>.png
#   app-store-screenshots/ipad/NN-<screen>.png
#
# Usage:
#   screenshot-workflow/capture.sh                # both devices, all screens
#   SHOT_BASE_URL=http://localhost:3000 screenshot-workflow/capture.sh
#
set -euo pipefail

# Ensure a full PATH and a UTF-8 locale even under minimal non-interactive shells.
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:${PATH:-}"
export LANG="${LANG:-en_US.UTF-8}" LC_ALL="${LC_ALL:-en_US.UTF-8}"

# --- Paths -------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT="$SCRIPT_DIR/ShotHarness.xcodeproj"
DERIVED="$SCRIPT_DIR/build"
APP_PATH="$DERIVED/Build/Products/Release-iphonesimulator/ShotHarness.app"
OUT_ROOT="$REPO_ROOT/app-store-screenshots"

BUNDLE_ID="com.deencompanion.shotharness"
BASE_URL="${SHOT_BASE_URL:-https://ramadan-companion.vercel.app}"

# Deterministic, predictable location (New York City) + fixed calc settings so
# prayer times, Qibla bearing, and nearby-mosque results never depend on
# simulator state or a location permission prompt. type='selected' also disables
# the app's background GPS re-check.
SEED_JSON='{
  "location_lat": "40.7128",
  "location_lng": "-74.0060",
  "location_city": "New York, USA",
  "location_type": "selected",
  "calculation_method": "2",
  "madhab": "0",
  "ramadan-companion-theme": "light",
  "installPromptDismissed": "true"
}'

# --- Screen catalogue (App Store display order) ------------------------------
# Each entry: "order|slug|route|ready_js|timeout|settle_ms"
# ready_js is a JS boolean that is true once the screen's remote content is in
# the DOM. The harness additionally waits until no spinner/skeleton remains.
SCREENS=(
  "01|home|/|!!document.querySelector('#next-prayer-heading') && document.querySelector('#next-prayer-heading').textContent.trim().length > 0|45|1500"
  "02|quran-reader|/quran/1|/Loading surah/.test(document.body.innerText) === false && document.querySelectorAll('main p, main [dir=\"rtl\"]').length > 0|45|1500"
  "03|qibla|/times#qibla|!!document.getElementById('qibla') && /[0-9]+(\\.[0-9]+)?\\u00b0/.test(document.getElementById('qibla').innerText)|45|1800"
  "04|zikr|/zikr|!!document.querySelector('#duas-title') || /Names of Allah/.test(document.body.innerText)|45|1500"
  "05|nearby-mosques|/places/mosques|/Searching near/.test(document.body.innerText) && document.querySelectorAll('.leaflet-container .leaflet-tile-loaded').length > 3|60|2500"
  "06|calendar|/calendar|/SUN/.test(document.body.innerText) && /SAT/.test(document.body.innerText) && /144[0-9]/.test(document.body.innerText)|45|1500"
)

# --- Devices -----------------------------------------------------------------
# name|simctl device type|expected width|expected height|output subdir
IPHONE_TYPE="$(xcrun simctl list devicetypes | sed -n 's/.*(\(com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro-Max\))/\1/p' | head -1)"
# 6.5" iPhone (iPhone 11 Pro Max / XS Max class) -> exactly 1242x2688, the size
# App Store Connect's 6.5" Display slot accepts. NOTE: iPhone 15/16 Plus are
# 6.7" (1290x2796) and would be rejected by the 6.5" slot, so use 11 Pro Max.
IPHONE65_TYPE="$(xcrun simctl list devicetypes | sed -n 's/.*(\(com.apple.CoreSimulator.SimDeviceType.iPhone-11-Pro-Max\))/\1/p' | head -1)"
IPAD_TYPE="$(xcrun simctl list devicetypes | sed -n 's/.*(\(com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch[^)]*\))/\1/p' | head -1)"
RUNTIME="$(xcrun simctl list runtimes | grep -oE 'com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+' | tail -1)"

DEVICES=(
  "iphone|${IPHONE_TYPE}|1320|2868|iphone"
  "iphone65|${IPHONE65_TYPE}|1242|2688|iphone-6.5"
  "ipad|${IPAD_TYPE}|2064|2752|ipad"
)

log()  { printf '\033[36m[shots]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[shots]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[shots]\033[0m %s\n' "$*" >&2; exit 1; }

# --- Build the harness once --------------------------------------------------
build_harness() {
  log "Building screenshot harness (Release, iphonesimulator)..."
  xcodebuild \
    -project "$PROJECT" \
    -scheme ShotHarness \
    -configuration Release \
    -sdk iphonesimulator \
    -derivedDataPath "$DERIVED" \
    build >/dev/null
  [ -d "$APP_PATH" ] || die "Harness app not found at $APP_PATH"
}

# --- Per-device capture ------------------------------------------------------
capture_device() {
  local dev_name="$1" dev_type="$2" exp_w="$3" exp_h="$4" subdir="$5"
  [ -n "$dev_type" ] || die "No simulator device type resolved for $dev_name"

  local udid outdir
  outdir="$OUT_ROOT/$subdir"
  mkdir -p "$outdir"

  local sim_name="DeenShots-${dev_name}"
  # Reuse an existing sim of this name, else create a fresh one (no prior state).
  udid="$(xcrun simctl list devices | sed -n "s/.*${sim_name} (\([0-9A-F-]*\)) (.*/\1/p" | head -1)"
  if [ -z "$udid" ]; then
    log "Creating simulator ${sim_name}..."
    udid="$(xcrun simctl create "$sim_name" "$dev_type" "$RUNTIME")"
  fi

  log "[$dev_name] Erasing simulator for a clean, state-free run..."
  xcrun simctl shutdown "$udid" >/dev/null 2>&1 || true
  xcrun simctl erase "$udid" >/dev/null
  xcrun simctl boot "$udid" >/dev/null
  xcrun simctl bootstatus "$udid" -b >/dev/null

  # Cosmetic: clean status bar (full battery, no carrier clutter). Status bar is
  # hidden by the harness anyway, but this keeps any transient frame tidy.
  xcrun simctl status_bar "$udid" override \
    --time "9:41" --batteryState charged --batteryLevel 100 \
    --cellularMode active --cellularBars 4 --wifiBars 3 >/dev/null 2>&1 || true

  # Let first-boot system banners (e.g. "Ready for Apple Intelligence") auto-
  # dismiss before any capture, so they never land in a screenshot.
  sleep 12

  log "[$dev_name] Installing harness..."
  xcrun simctl install "$udid" "$APP_PATH" >/dev/null

  # Resolve the app's writable Documents dir so the harness can drop its
  # readiness sentinel where the script can poll it.
  local data_container done_file
  data_container="$(xcrun simctl get_app_container "$udid" "$BUNDLE_ID" data)"
  done_file="$data_container/Documents/shot-done.txt"
  mkdir -p "$data_container/Documents"

  local entry order slug route ready timeout settle
  for entry in "${SCREENS[@]}"; do
    IFS='|' read -r order slug route ready timeout settle <<< "$entry"
    log "[$dev_name] Capturing ${order}-${slug}  (${route})"

    rm -f "$done_file"
    xcrun simctl terminate "$udid" "$BUNDLE_ID" >/dev/null 2>&1 || true

    # simctl passes host env vars prefixed with SIMCTL_CHILD_ into the launched
    # app (with the prefix stripped), so the harness receives plain SHOT_* vars.
    SIMCTL_CHILD_SHOT_BASE_URL="$BASE_URL" \
    SIMCTL_CHILD_SHOT_ROUTE="$route" \
    SIMCTL_CHILD_SHOT_SEED_JSON="$SEED_JSON" \
    SIMCTL_CHILD_SHOT_READY_JS="$ready" \
    SIMCTL_CHILD_SHOT_TIMEOUT="$timeout" \
    SIMCTL_CHILD_SHOT_SETTLE_MS="$settle" \
    SIMCTL_CHILD_SHOT_DONE_FILE="$done_file" \
    xcrun simctl launch --terminate-running-process "$udid" "$BUNDLE_ID" >/dev/null

    # Poll for the readiness sentinel.
    local waited=0 status="" max=$((timeout + 15))
    while [ "$waited" -lt "$max" ]; do
      if [ -f "$done_file" ]; then
        status="$(cat "$done_file" 2>/dev/null || echo '')"
        break
      fi
      sleep 1
      waited=$((waited + 1))
    done

    if [ "$status" != "ok" ]; then
      warn "[$dev_name] ${slug}: readiness '${status:-none}' after ${waited}s - capturing anyway"
    fi

    local out="$outdir/${order}-${slug}.png"
    xcrun simctl io "$udid" screenshot --type=png "$out" >/dev/null
    verify_size "$out" "$exp_w" "$exp_h" "$dev_name/$slug"
  done

  xcrun simctl status_bar "$udid" clear >/dev/null 2>&1 || true
  xcrun simctl shutdown "$udid" >/dev/null 2>&1 || true
  log "[$dev_name] Done -> $outdir"
}

# --- Validate exact App Store pixel dimensions -------------------------------
verify_size() {
  local file="$1" want_w="$2" want_h="$3" label="$4"
  [ -f "$file" ] || die "Missing screenshot: $file"
  local dims w h
  dims="$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w" "h}')"
  w="${dims% *}"; h="${dims#* }"
  if [ "$w" != "$want_w" ] || [ "$h" != "$want_h" ]; then
    warn "$label: got ${w}x${h}, App Store expects ${want_w}x${want_h}"
  else
    log "  [ok] ${label}  ${w}x${h}"
  fi
}

# --- Main --------------------------------------------------------------------
main() {
  command -v xcrun >/dev/null || die "xcrun not found - install Xcode + command line tools"
  [ -n "$RUNTIME" ] || die "No iOS simulator runtime installed"
  log "Base URL: $BASE_URL"
  log "iOS runtime: $RUNTIME"

  build_harness

  local d
  for d in "${DEVICES[@]}"; do
    IFS='|' read -r name type w h subdir <<< "$d"
    capture_device "$name" "$type" "$w" "$h" "$subdir"
  done

  log "All screenshots written under: $OUT_ROOT"
}

main "$@"
