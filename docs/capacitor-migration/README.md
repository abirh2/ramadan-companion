# Capacitor Migration Roadmap

**Last Updated:** November 26, 2024  
**Status:** Planning Phase  
**Target Platforms:** iOS & Android  
**Estimated Timeline:** 14-19 days

---

## Overview

This roadmap guides the migration of Deen Companion from a Progressive Web App (PWA) to native iOS and Android apps using Capacitor. The migration will add:

✅ **Native app distribution** via App Store and Google Play  
✅ **Home/lock screen widgets** for prayer times  
✅ **Native push notifications** using FCM/APNs  
✅ **Better native integration** (geolocation, haptics, device sensors)

**Key Principle:** Incremental migration. Each phase is self-contained and can be completed independently.

---

## Project Context

**Current State:**
- Next.js 16 PWA with full offline support
- 96% Capacitor-compatible codebase
- Web Push notifications (works but limited on iOS)
- 53 features across 10+ pages
- Supabase backend, external APIs (all HTTP-based)

**What Changes:**
- Browser APIs → Capacitor plugins (geolocation, device orientation, haptics)
- Web Push → Native push (FCM/APNs)
- Add native widgets (Swift for iOS, Kotlin for Android)
- Static export for Capacitor bundling

**What Stays the Same:**
- React components and UI (100% preserved)
- Supabase database and auth
- All external APIs (AlAdhan, AlQuran, Nominatim, etc.)
- localStorage and caching strategies
- 96% of existing code

---

## Migration Phases

### [Phase 1: Capacitor Setup & Configuration](./phase-1-setup.md)
**Duration:** 1 day  
**Complexity:** Low  
**Prerequisites:** None

- Install Capacitor core and CLI
- Add iOS and Android platforms
- Configure Next.js for static export
- Update build scripts and `.gitignore`

**Outcome:** iOS and Android projects created, ready for development.

---

### [Phase 2: Plugin Installation & Migration](./phase-2-plugins.md)
**Duration:** 2-3 days  
**Complexity:** Medium  
**Prerequisites:** Phase 1 complete

- Install Capacitor plugins (geolocation, motion, haptics)
- Migrate `src/lib/location.ts` (geolocation)
- Migrate `src/lib/orientation.ts` (device orientation)
- Migrate `src/lib/zikr.ts` (haptics)
- Test all migrated features

**Outcome:** All browser APIs replaced with native plugins, feature parity maintained.

---

### [Phase 3: Native Push Notifications](./phase-3-push-notifications.md)
**Duration:** 4-5 days  
**Complexity:** High  
**Prerequisites:** Phase 2 complete

- Set up Firebase Cloud Messaging (FCM)
- Migrate backend from `web-push` to `firebase-admin`
- Update push subscription endpoints
- Migrate frontend to `@capacitor/push-notifications`
- Update database schema for FCM tokens

**Outcome:** Native push notifications working on both platforms, replacing Web Push.

---

### [Phase 4: Native Widgets](./phase-4-widgets.md)
**Duration:** 3-4 days  
**Complexity:** Medium-High  
**Prerequisites:** Phase 3 complete (for full functionality)

- Implement iOS widget (Swift/WidgetKit)
- Implement Android widget (Kotlin)
- Create widget data bridge (`src/lib/widgetBridge.ts`)
- Integrate with prayer times hook
- Test widget updates

**Outcome:** Prayer times widgets on home screen for both platforms.

---

### [Phase 5: Local Testing](./phase-5-local-testing.md)
**Duration:** 2-3 days  
**Complexity:** Medium  
**Prerequisites:** Phases 1-4 complete

- Set up iOS testing (Xcode, device/simulator)
- Set up Android testing (Android Studio, device/emulator)
- Run comprehensive test checklist
- Fix bugs and issues
- Verify feature parity with PWA

**Outcome:** Fully functional native apps tested locally on both platforms.

---

### [Phase 6: TestFlight Preparation (iOS)](./phase-6-testflight.md)
**Duration:** 1-2 days  
**Complexity:** Medium  
**Prerequisites:** Phase 5 complete

- Create App Store Connect account/app
- Prepare app assets (icons, screenshots)
- Configure app signing and provisioning
- Archive and upload to TestFlight
- Invite internal testers

**Outcome:** iOS app available for internal testing via TestFlight.

---

### [Phase 7: Google Play Preparation (Android)](./phase-7-play-console.md)
**Duration:** 1-2 days  
**Complexity:** Medium  
**Prerequisites:** Phase 5 complete

- Create Google Play Console account/app
- Prepare app assets (icons, screenshots, descriptions)
- Generate signed APK/AAB
- Upload to internal testing track
- Invite internal testers

**Outcome:** Android app available for internal testing via Google Play.

---

## Quick Start Guide

### For First-Time Setup

1. **Read this README** to understand the full scope
2. **Review [Phase 1](./phase-1-setup.md)** to understand initial setup
3. **Create a backup branch:**
   ```bash
   git checkout -b capacitor-migration
   ```
4. **Follow Phase 1 step-by-step**
5. **Test thoroughly before moving to Phase 2**

### For Resuming Migration

1. **Check [Progress Tracker](./progress-tracker.md)** to see completed phases
2. **Review next uncompleted phase guide**
3. **Complete all steps in that phase**
4. **Update progress tracker**
5. **Move to next phase**

---

## Important Notes

### Environment Variables

Capacitor apps require additional environment variables for native features:

**Firebase Cloud Messaging (Phase 3):**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

**Remove after migration:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Web Push)
- `VAPID_PRIVATE_KEY` (Web Push)
- `VAPID_MAILTO` (Web Push)

### Backward Compatibility

During migration, the PWA will continue to work. You can deploy both:
- **Web version:** Continue hosting on Vercel as PWA
- **Native apps:** Distributed via App Store and Google Play

Users can choose their preferred platform.

### Testing Strategy

After each phase:
1. ✅ Run `npm run build` to ensure no build errors
2. ✅ Run `npm run test:ci` to verify tests pass
3. ✅ Test on actual devices (iOS and Android)
4. ✅ Verify core features still work
5. ✅ Update progress tracker

### Getting Help

**Stuck on a phase?**
- Review the specific phase guide's "Troubleshooting" section
- Check Capacitor docs: https://capacitorjs.com/docs
- Check plugin-specific docs (links in each phase guide)
- Ask in Capacitor Discord: https://discord.gg/UPYYRhtyzp

**Found an issue with this roadmap?**
- Document in `progress-tracker.md` under "Issues Encountered"
- Update phase guide with solution for future reference

---

## Success Criteria

Migration is complete when:

✅ All 7 phases finished  
✅ App runs on iOS and Android  
✅ All PWA features work in native app  
✅ Widgets display prayer times  
✅ Push notifications work natively  
✅ Internal testers can install from TestFlight and Play Console  
✅ No critical bugs reported

---

## File Structure

```
docs/capacitor-migration/
├── README.md                      # This file
├── progress-tracker.md            # Track completion and issues
├── phase-1-setup.md              # Capacitor setup guide
├── phase-2-plugins.md            # Plugin migration guide
├── phase-3-push-notifications.md # Push notification migration
├── phase-4-widgets.md            # Native widgets implementation
├── phase-5-local-testing.md      # Local testing procedures
├── phase-6-testflight.md         # iOS TestFlight setup
├── phase-7-play-console.md       # Android Play Console setup
├── reference/
│   ├── api-compatibility.md      # API compatibility matrix
│   ├── troubleshooting.md        # Common issues and solutions
│   └── code-examples.md          # Code snippets reference
```

---

## Timeline Overview

```
Week 1: Setup + Plugins + Push Notifications
├── Days 1-2:   Phase 1 (Setup) + Phase 2 (Plugins)
├── Days 3-5:   Phase 3 (Push Notifications)
└── Day 6-7:    Phase 4 (Widgets) - Start

Week 2: Widgets + Testing + Distribution
├── Days 8-9:   Phase 4 (Widgets) - Complete
├── Days 10-12: Phase 5 (Local Testing)
└── Days 13-14: Phase 6 & 7 (TestFlight + Play Console)

Week 3: Buffer for issues and refinement
```

**Note:** Timeline assumes ~6-8 hours work per day. Adjust based on your availability.

---

## Next Steps

1. ✅ Read this entire README
2. ✅ Review [Phase 1 Guide](./phase-1-setup.md)
3. ✅ Create backup branch: `git checkout -b capacitor-migration`
4. ✅ Start Phase 1: [Capacitor Setup](./phase-1-setup.md)

---

**Ready to begin?** → [Start Phase 1: Capacitor Setup](./phase-1-setup.md)

