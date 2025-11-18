# iOS Notifications - Fixed with Web Push API

## Current State (V1.2) - ✅ **IMPLEMENTED**

### ✅ **Web Push API Migration Complete**

The notification system has been migrated from client-side `setTimeout()` to Web Push API with backend cron job scheduling. This resolves the iOS background notification limitation.

**Web Push API Implementation:**
- ✅ Notifications work **even when app is closed or backgrounded**
- ✅ Works on **all platforms**: iOS Safari, Android Chrome, Desktop browsers
- ✅ Backend cron job handles scheduling
- ✅ Push subscriptions stored in Supabase

### Browser Support on iOS

Due to Apple's WebKit restrictions:
- ✅ **Safari**: Full Web Push API support - **notifications work in background**
- ❌ **Chrome**: No notification support (uses WebKit, blocked by Apple)
- ❌ **Firefox**: No notification support (uses WebKit, blocked by Apple)
- ❌ **Edge**: No notification support (uses WebKit, blocked by Apple)

**User Guidance:** iOS users are shown:
1. Clear messaging that iOS Chrome/Firefox/Edge don't support notifications
2. Instructions to use Safari and install PWA to home screen
3. ✅ **NEW**: Confirmation that notifications work even when app is closed (Safari only)

---

## Root Cause Analysis

### Technical Details

**setTimeout Limitation:**
```typescript
// Current implementation (notifications.ts:251-255)
const timeoutId = setTimeout(() => {
  showNotification(prayerName, prayerTime)
  scheduledNotifications.delete(prayerName)
}, timeUntil) // ❌ Paused when iOS PWA is backgrounded
```

**iOS Behavior:**
- iOS suspends PWA JavaScript when app moves to background
- `setTimeout` and `setInterval` are paused
- Service workers become inactive shortly after backgrounding
- No background execution for non-push-based timers

**Current Architecture:**
```
User enables notifications
  → Client-side setTimeout schedules notification
  → PWA goes to background on iOS
  → JavaScript paused
  → setTimeout never fires
  → ❌ NO NOTIFICATION
```

---

## Proper Solution: Web Push API Implementation

### Overview

To make notifications work in iOS PWA background, we need to implement the **Web Push API** with an external push service.

### Required Architecture

```
User enables notifications
  → Subscribe to push service (FCM/OneSignal/web-push)
  → Send subscription to backend
  → Backend calculates prayer times
  → Backend schedules push via push service
  → Push service delivers to device (works in background)
  → Service worker receives push event
  → Shows notification
  → ✅ NOTIFICATION WORKS
```

---

## Implementation Plan

### Phase 1: Backend Push Service Setup

**Option A: Firebase Cloud Messaging (FCM)**
- Pros: Free tier, reliable, Google-backed
- Cons: Requires Firebase project setup
- Cost: Free (up to millions of messages)

**Option B: OneSignal**
- Pros: Free tier, easy setup, good docs
- Cons: Third-party dependency
- Cost: Free (up to 10k subscribers)

**Option C: Self-Hosted web-push**
- Pros: Full control, no third-party
- Cons: Requires backend server, VAPID keys management
- Cost: Server hosting only

### Phase 2: Frontend Changes

**1. Add Push Subscription**
```typescript
// New: Register push subscription
async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready
  
  // Check if already subscribed
  let subscription = await registration.pushManager.getSubscription()
  
  if (!subscription) {
    // Subscribe with VAPID public key
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
  }
  
  return subscription
}
```

**2. Send Subscription to Backend**
```typescript
// Send subscription to backend for storage
async function saveSubscription(subscription: PushSubscription, userId: string) {
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      userId,
      preferences: notificationPreferences
    })
  })
}
```

**3. Update Service Worker**
```javascript
// public/sw.js - Already has push handler, just needs proper integration
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  // Data comes from backend push service
  const title = data.title || 'Prayer Time Reminder'
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192-maskable.png',
    tag: data.tag,
    data: { url: '/times' }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})
```

### Phase 3: Backend Implementation

**1. Store Push Subscriptions**
```sql
-- New table: push_subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- p256dh and auth keys
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
```

**2. Prayer Time Calculation & Scheduling**
```typescript
// Backend API route or serverless function
async function schedulePrayerNotifications(userId: string) {
  // Get user's location and preferences
  const profile = await getProfile(userId)
  
  // Calculate prayer times
  const prayerTimes = calculatePrayerTimes(profile.location, profile.calculation_method)
  
  // Get user's push subscriptions
  const subscriptions = await getPushSubscriptions(userId)
  
  // Schedule notifications via push service
  for (const prayer of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
    if (profile.notification_preferences.prayers[prayer]) {
      const prayerTime = prayerTimes[prayer]
      const quote = getRandomPrayerQuote(prayer)
      
      await schedulePushNotification({
        subscription,
        scheduledTime: prayerTime,
        title: `Time for ${prayer} Prayer`,
        body: `${quote.text} - ${quote.source}`,
        data: { url: '/times', prayer }
      })
    }
  }
}
```

**3. Push Service Integration**

**Using web-push (self-hosted):**
```typescript
import webpush from 'web-push'

// Set VAPID keys
webpush.setVAPIDDetails(
  'mailto:admin@ramadan-companion.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Send push notification
async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (error) {
    if (error.statusCode === 410) {
      // Subscription expired - remove from database
      await removeSubscription(subscription.endpoint)
    }
    throw error
  }
}
```

### Phase 4: Deployment & Testing

1. **Generate VAPID Keys:**
```bash
npx web-push generate-vapid-keys
```

2. **Add Environment Variables:**
```
VAPID_PUBLIC_KEY=<public_key>
VAPID_PRIVATE_KEY=<private_key>
PUSH_SERVICE_URL=<if using external service>
```

3. **Test Flow:**
   - Desktop: Enable notifications → Close browser → Verify notification fires
   - iOS: Enable notifications → Close PWA → Verify notification fires
   - Android: Enable notifications → Close PWA → Verify notification fires

---

## Migration Strategy

### Option 1: Parallel Implementation (Recommended)

1. Keep setTimeout for desktop/Android (works reasonably well)
2. Add Web Push API for iOS users
3. Feature detection: Use Web Push if available, fallback to setTimeout

**Benefits:**
- Gradual rollout
- Backward compatible
- No disruption to current users

### Option 2: Full Migration

1. Implement Web Push API completely
2. Remove setTimeout-based scheduling
3. All platforms use proper push notifications

**Benefits:**
- Cleaner architecture
- Better reliability across all platforms
- Future-proof

---

## Timeline Estimate

**Quick Fix (Current - V1.1):**
- ✅ iOS browser detection
- ✅ Clear limitation warnings
- ✅ User guidance for alternatives

**Proper Fix (V1.2):**
- Backend push service setup: 2-3 days
- Frontend subscription flow: 1-2 days
- Service worker updates: 1 day
- Testing & debugging: 2-3 days
- **Total: ~1-2 weeks**

---

## Alternative Solutions

### 1. Native iOS Shortcuts Integration

**Pros:**
- Uses native iOS capabilities
- Reliable background execution
- No backend required

**Cons:**
- User must manually set up shortcuts
- Not automatic
- Requires prayer times API to be public

### 2. Calendar Integration

**Pros:**
- Native iOS calendar reminders work reliably
- One-time setup
- Familiar iOS UX

**Cons:**
- Requires calendar permission
- Manual setup by user
- Not real-time (prayer times change daily)

### 3. Progressive Enhancement

**Current Approach (V1.1):**
- Show clear limitations
- Guide users to native alternatives
- Set expectations correctly

**Pros:**
- No backend work
- Honest UX
- Users can make informed decisions

**Cons:**
- Feature incomplete on iOS
- User may be disappointed

---

## Conclusion

**Current State:** iOS notifications have fundamental limitations due to setTimeout-based scheduling. Users are now properly informed and guided to alternatives.

**Recommended Next Step:** Implement Web Push API in V1.2 for proper background notification support across all platforms.

**Priority:** MEDIUM - Feature works on desktop/Android, iOS users have clear guidance and alternatives

---

## References

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [iOS PWA Capabilities](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [web-push npm package](https://www.npmjs.com/package/web-push)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js/client)
- [OneSignal Web Push Guide](https://documentation.onesignal.com/docs/web-push-quickstart)

---

## Implemented Solution (V1.2)

### Architecture

**Backend Cron Job + Web Push API:**
```
Daily Cron (midnight UTC)
  ↓
Calculate prayer times for all users
  ↓
Send push notifications via Web Push API
  ↓
Service Worker receives push
  ↓
Show notification (works even when app closed)
```

### Implementation Details

**Frontend:**
- `subscribeToPush()` - Subscribe user to push notifications with VAPID key
- `unsubscribeFromPush()` - Unsubscribe from push notifications
- Push subscription saved to Supabase `push_subscriptions` table

**Backend:**
- `/api/push/subscribe` - Save push subscription to database
- `/api/push/unsubscribe` - Remove push subscription from database
- `/api/push/schedule` - Cron job endpoint that sends notifications

**Service Worker:**
- `push` event handler - Receives push and displays notification
- `notificationclick` event handler - Opens app to `/times` page

**Database:**
- `push_subscriptions` table - Stores endpoint, p256dh, auth keys per user

**Vercel Cron:**
```json
{
  "crons": [
    {
      "path": "/api/push/schedule",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Benefits

✅ **Works on all platforms** - iOS Safari, Android Chrome, Desktop browsers  
✅ **Background notifications** - Works even when app is closed  
✅ **Reliable** - Backend scheduling eliminates client-side timer issues  
✅ **Scalable** - Handles notifications for all users efficiently  
✅ **Cross-device** - Users can have multiple subscriptions (phone, tablet, desktop)  
✅ **Proper cleanup** - Subscription removal from both browser and database (bug fixed Nov 2024)

### Authentication Requirement

🔐 **Web Push API requires authentication.** Users must be logged in to enable notifications because:
- Push subscriptions need a user ID for database storage
- Backend needs to associate subscriptions with user profiles
- Location and preference data requires authentication

**UI Behavior:**
- Guest users see "Sign In to Enable" prompt
- Clicking prompt redirects to `/profile` page for authentication
- After login, user can enable notifications normally

### Bug Fixes (November 2024)

**Subscription Cleanup Bug:**
- **Issue:** Disabling notifications removed subscription from browser but NOT from database
- **Root Cause:** Code tried to get subscription endpoint AFTER unsubscribing (returned null)
- **Fix:** Capture subscription endpoint BEFORE unsubscribing, then send to backend for deletion
- **Result:** Proper cleanup prevents zombie subscriptions and wasted backend resources

---

**Document Version:** 2.0  
**Last Updated:** November 2024  
**Status:** ✅ Implemented - Web Push API Migration Complete

