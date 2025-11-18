# Agent Operational Doctrine - Ramadan Companion

## Project-Specific Engineering Patterns

This document captures durable, high-impact patterns learned from actual implementation work on this project. These are not theoretical best practices—they are battle-tested lessons from real failures and successes.

---

## Authentication & Feature Gating

### Web Push Requires Authentication

**Pattern:** Web Push API requires user_id for database storage. Always check for authentication before allowing subscription.

**Implementation Rule:**
- ✅ **BEFORE marking feature complete:** Verify guest user sees login prompt with clear explanation
- ✅ **UI State Required:** "Sign In to Enable" message with link to `/profile` or auth flow
- ✅ **Database Design:** Push subscriptions MUST have `user_id` foreign key; cannot be anonymous

**Why This Matters:**
- Web Push subscriptions are stored server-side and require user association
- Backend cron jobs need user context to calculate prayer times and send notifications
- Guest users cannot receive notifications without authentication

**Example:**
```typescript
// In NotificationSettings component:
if (!user) {
  return (
    <Card>
      <LogIn icon />
      <h3>Prayer Notifications</h3>
      <p>Sign in to enable notifications...</p>
      <Button href="/profile">Sign In to Enable</Button>
    </Card>
  )
}
```

**Applied to:** Prayer time notifications, any Web Push feature
**Last Updated:** November 2024

---

## State-Changing Operations

### Verify Inverse Operations Pattern

**Pattern:** For any state-changing operation, explicitly verify the inverse operation works correctly. Don't assume symmetry.

**Critical Operations to Test:**
- ✅ Enable/Disable
- ✅ Subscribe/Unsubscribe
- ✅ Create/Delete
- ✅ Save/Cleanup

**Implementation Rule:**
When implementing features with state transitions:
1. **Implement forward path** (enable, subscribe, create)
2. **Implement reverse path** (disable, unsubscribe, delete)
3. **Verify reverse path cleans up ALL resources:**
   - Browser state
   - Database records
   - localStorage/sessionStorage
   - External service subscriptions
4. **Test the sequence:** forward → reverse → verify no orphans

**Why This Matters:**
- Resource leaks compound over time
- Zombie records waste backend resources
- Incomplete cleanup breaks re-enablement flow

**Example - Push Notification Cleanup:**
```typescript
// ❌ BROKEN - endpoint captured AFTER unsubscribe (returns null)
const unsubscribed = await unsubscribeFromPush()
const subscription = await registration.pushManager.getSubscription() // null!
await deleteFromDatabase(subscription.endpoint) // never executes

// ✅ CORRECT - capture endpoint BEFORE destroying
const subscription = await registration.pushManager.getSubscription()
await subscription.unsubscribe() // destroy browser subscription
await deleteFromDatabase(subscription.endpoint) // cleanup database
```

**Applied to:** Notifications, favorites, donations, all CRUD operations
**Last Updated:** November 2024

---

## User Questions as Debugging Signals

### "What Happens When..." Questions Reveal Implementation Gaps

**Pattern:** When user asks "what happens when X?", treat it as a signal that code path X was not verified during implementation.

**User Question Types:**
- "What happens when user disables notifications?" → Check cleanup path
- "What happens when user logs out?" → Check state persistence
- "What happens when user has multiple devices?" → Check multi-device behavior
- "Does this work for guest users?" → Check authentication requirements

**Implementation Rule:**
1. **Don't assume or speculate** - Read actual code
2. **Trace execution path** for the scenario user asked about
3. **Verify with tests or manual execution**
4. **If gap found:** Fix immediately and document

**Why This Matters:**
- User questions expose untested code paths
- "What happens when..." often means "I don't see how this handles..."
- These questions reveal missing UX states or documentation gaps

**Example from Session:**
- User asked: "is the subscription deleted properly?" 
- → I read the code
- → **FOUND BUG:** Subscription removed from browser but NOT from database
- → Fixed by reordering operations

**Applied to:** All feature implementation, debugging, code reviews
**Last Updated:** November 2024

---

## Documentation Completeness

### Multi-Device Behavior Must Be Documented

**Pattern:** When implementing features that sync across devices or have per-device state, explicitly document the multi-device behavior.

**Documentation Requirements:**
- ✅ **Device independence:** Does enabling on one device enable on all?
- ✅ **Subscription management:** How are per-device subscriptions handled?
- ✅ **Database schema:** `UNIQUE(user_id, device_id)` or similar constraints
- ✅ **Example scenarios:** iPhone + Desktop combinations

**Implementation Rule:**
Add "Multi-Device Behavior" section to feature docs with:
1. Independence statement (if devices are independent)
2. Database uniqueness constraints
3. Backend delivery logic (send to all vs send to one)
4. 3+ example scenarios covering edge cases

**Why This Matters:**
- Users expect cross-device consistency
- Developers need to understand subscription cardinality
- Backend logic depends on correct multi-device assumptions

**Example:**
```markdown
## Multi-Device Behavior
- Each device is independent: Enabling on iPhone doesn't enable on Desktop
- Database schema: UNIQUE(user_id, endpoint) allows multiple subscriptions
- Backend sends to ALL active subscriptions for a user
- Examples:
  - iPhone enabled, Desktop never enabled → Only iPhone receives ✅
  - iPhone enabled, Desktop enabled → Both receive ✅
  - User disables on iPhone → Only Desktop continues ✅
```

**Applied to:** Notifications, favorites sync, prayer tracking, all cross-device features
**Last Updated:** November 2024

---

## Testing & Verification

### Test Both Directions for Stateful Features

**Pattern:** For features with enable/disable, create/delete, subscribe/unsubscribe flows, write tests for BOTH directions.

**Test Coverage Required:**
```typescript
describe('Notification Management', () => {
  describe('Enable Flow', () => {
    it('should request permission')
    it('should create subscription')
    it('should save to database')
  })
  
  describe('Disable Flow', () => {
    it('should unsubscribe from browser')
    it('should delete from database')
    it('should clean up localStorage')
  })
  
  describe('Re-enable Flow', () => {
    it('should work after disable')
    it('should not have orphaned records')
  })
})
```

**Applied to:** All stateful features
**Last Updated:** November 2024

---

## Change Log

**November 2024:**
- Initial doctrine creation
- Added Web Push authentication requirement pattern
- Added inverse operations verification pattern
- Added user question debugging pattern
- Added multi-device documentation pattern

---

**Document Maintenance:**
- Update this file when new patterns emerge from real implementation work
- Remove patterns that prove to be project-specific edge cases (not durable)
- Keep examples concrete and tied to actual code in this project

