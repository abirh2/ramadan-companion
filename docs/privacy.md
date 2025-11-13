# Privacy & Data Policy

## Principles
- No ads or tracking scripts.
- Minimal data collection.
- Location data never stored permanently.
- Zakat calculator data processed locally only.

## Storage Summary

| Data | Location | Retention |
|------|-----------|-----------|
| Preferences | LocalStorage | until cleared |
| Donations | Supabase | persistent |
| Favorites | Supabase | persistent |
| Feedback | Supabase | persistent |
| Zikr Progress | LocalStorage | until cleared |
| Location | LocalStorage | optional |
| Zakat Inputs | Memory only | temporary |

**V1:** fully local or Supabase-only  
**Later:** optional Supabase Auth + cloud sync

## Feedback Data
- User feedback (problem reports and suggestions) is stored in Supabase
- Submissions are anonymous by default - no personal information required
- Optionally linked to user profile if authenticated (for admin context only)
- Includes: page path, feedback type, content, timestamp, user agent
- Users cannot view submitted feedback (admin-only access via service role)
- Used solely for app improvement and bug tracking

## User Transparency
- Make it clear when data is local vs stored in cloud.  
- Include a "Clear local data" button in Settings.
