# Privacy & Data Policy

## Principles
- No ads or third-party tracking scripts.
- Minimal data collection.
- Location data stored on device (localStorage) and optionally in Supabase when signed in.
- Zakat calculator data processed locally only.

## Public Pages

| Page | URL |
|------|-----|
| Privacy policy | `https://ramadan-companion.vercel.app/privacy` |
| Account & data deletion | `https://ramadan-companion.vercel.app/privacy/delete-account` |

Implementation: [`src/app/privacy/page.tsx`](../src/app/privacy/page.tsx), [`src/app/privacy/delete-account/page.tsx`](../src/app/privacy/delete-account/page.tsx)

## Storage Summary

| Data | Location | Retention |
|------|-----------|-----------|
| Preferences | LocalStorage (+ Supabase if signed in) | until cleared or account deleted |
| Donations | Supabase | until account deleted |
| Favorites | Supabase | until account deleted |
| Feedback | Supabase | account-linked feedback deleted on account deletion; anonymous feedback retained |
| Zikr Progress | LocalStorage | until cleared |
| Location | LocalStorage (+ Supabase if signed in) | until cleared or account deleted |
| Zakat Inputs | Memory only | temporary |
| Account (email, OAuth) | Supabase Auth | until account deleted |

**Auth:** Supabase Auth with optional sign-in for cross-device sync  
**Account deletion:** Self-service at `/privacy/delete-account`; email fallback for locked-out users

## Account Deletion

Signed-in users can delete their account immediately at `/privacy/delete-account`. The flow:

1. User confirms by typing `DELETE`
2. `POST /api/account/delete` first hard-deletes the user's `feedback` rows (service role), because free-text feedback can contain personal details
3. It then calls `auth.admin.deleteUser()` (service role)
4. CASCADE deletes: profiles, donations, favorites, quran_bookmarks, prayer_tracking, push_subscriptions
5. Account-linked feedback is removed; anonymous feedback (`user_id` NULL) is retained. A DB-level `ON DELETE CASCADE` on `feedback.user_id` is a safety net for deletions made outside the app route
6. Client clears localStorage via `clearLocalUserData()`

Email fallback: `abirh@alumni.upenn.edu` (processed within 30 days)

**Google Play Console:** Set delete account URL to `https://ramadan-companion.vercel.app/privacy/delete-account`

## Feedback Data
- User feedback (problem reports and suggestions) is stored in Supabase
- Submissions are anonymous by default - no personal information required
- Optionally linked to user profile if authenticated (for admin context only)
- Includes: page path, feedback type, content, timestamp, user agent
- Users cannot view submitted feedback (admin-only access via service role)
- Used solely for app improvement and bug tracking
- On account deletion, feedback linked to the account is deleted (its free-text can contain personal details); feedback submitted anonymously is retained

## User Transparency
- Make it clear when data is local vs stored in cloud.
- Privacy policy and delete-account pages linked from Footer and Profile settings.
