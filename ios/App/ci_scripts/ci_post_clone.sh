#!/bin/sh
# Xcode Cloud: install Node deps, sync Capacitor, then CocoaPods.
# Pods/ is gitignored; this script must run before every archive.
set -e

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

cd "$CI_PRIMARY_REPOSITORY_PATH"

echo "Installing npm dependencies..."
npm ci

echo "Syncing Capacitor iOS..."
npx cap sync ios

echo "Installing CocoaPods..."
cd ios/App
pod install
