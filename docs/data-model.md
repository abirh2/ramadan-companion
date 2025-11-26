# Supabase Data Model

## Table: profiles
Store per-user preferences and settings.

| Field | Type | Description | Status |
|--------|------|-------------|--------|
| id | uuid (PK) | references auth.users(id), auto-created on signup | **Active** |
| created_at | timestamptz | timestamp | **Active** |
| updated_at | timestamptz | timestamp, auto-updated via trigger | **Active** |
| display_name | text | optional user display name | **Active (V1)** |
| timezone | text | e.g. "America/New_York" | **Deprecated** - App uses browser auto-detection |
| location_type | text | 'coords' or 'city' | **Active (V1)** - Set via prayer times feature |
| location_lat | double precision | nullable | **Active (V1)** - Saved from browser geolocation or city search |
| location_lng | double precision | nullable | **Active (V1)** - Saved from browser geolocation or city search |
| location_city | text | nullable | **Active (V1)** - Display name for user's location |
| calculation_method | text | e.g. '2' (ISNA, default for North America), '4' (Umm al-Qura for Middle East) | **Active (V1)** - AlAdhan API method ID, auto-detected based on location on first visit |
| madhab | text | 'hanafi' or 'standard' | **Active (V1)** - Affects Asr calculation (0=Standard, 1=Hanafi) |
| hijri_offset_days | integer | default 0 | Planned |
| language | text | e.g. 'en' | Planned |
| theme | text | 'light', 'dark', or 'system' | Planned |
| quran_translation | text | e.g. 'en.asad' | **Active (V1)** - Stores user's preferred Quran translation |
| hadith_language | text | 'english', 'urdu', or 'arabic' (default: 'english') | **Active (V1)** - Stores user's preferred Hadith language |
| distance_unit | text | 'mi' or 'km' (default: 'mi') | Planned - Stores user's preferred distance unit for mosque finder |
| is_admin | boolean | default false | **Active (V1)** - Admin flag for accessing admin dashboard and managing feedback |

**V1:** Auth integrated, display_name, location (lat/lng/city), calculation_method, madhab, quran_translation, hadith_language, is_admin all active  
**Later:** Profile picture, notifications, hijri_offset integration, language, theme, distance_unit integration

**SQL Migration Required:**
```sql
-- Add hadith_language column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hadith_language text DEFAULT 'english';

-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT FALSE;

-- Add notification_preferences column to profiles table (V1.1)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"enabled": false, "prayers": {"Fajr": true, "Dhuhr": true, "Asr": true, "Maghrib": true, "Isha": true}}'::jsonb;
```

**Note on timezone:** The `timezone` field exists in the schema but is not used for storage. Instead, timezone is dynamically calculated from user coordinates:
- **Client-side (browser):** Automatically uses browser's detected timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`)
- **Server-side (notifications):** Automatically calculates timezone from user's lat/lng coordinates using `geo-tz` library
- **Benefit:** If user travels to new timezone, prayer times and notifications automatically adjust without manual configuration
- **No storage needed:** Timezone is always calculated from coordinates, ensuring accuracy even when user moves

**Dual-Storage Pattern:** All user preferences (location, calculation_method, madhab, quran_translation, hadith_language, notification_preferences) follow a dual-storage pattern:
- **Authenticated users:** Settings saved to both Supabase profile AND localStorage for cross-device sync
- **Guest users:** Settings saved to localStorage only for local persistence
- **Loading priority:** Supabase profile → localStorage → defaults

This ensures authenticated users get cross-device sync while guest users still have a personalized experience.

**Notification Preferences Structure:**
```json
{
  "enabled": false,
  "prayers": {
    "Fajr": true,
    "Dhuhr": true,
    "Asr": true,
    "Maghrib": true,
    "Isha": true
  }
}
```
- `enabled`: Master toggle for all notifications (boolean)
- `prayers`: Individual prayer toggles (all default to true when notifications are enabled)

**RLS Policies:**
- Users can view their own profile only
- Users can insert their own profile only
- Users can update their own profile only
- Profile auto-created via trigger on user signup

---

## Table: donations
Track zakat and sadaqah donations with multi-currency support.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | unique record ID |
| user_id | uuid (FK) | references profiles.id, CASCADE delete |
| created_at | timestamptz | auto timestamp |
| updated_at | timestamptz | auto timestamp, auto-updated via trigger |
| amount | numeric(10,2) | donation amount (stored in original currency) |
| currency | text | ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP') |
| type | text | 'zakat', 'sadaqah', or 'other' |
| category | text | optional category |
| charity_name | text | name of charity |
| charity_url | text | optional URL |
| date | date | donation date |
| notes | text | optional notes |
| is_recurring | boolean | default false |

**V1:** CRUD for donations with RLS  
**V1.1:** ✅ Multi-currency support with live exchange rates (Frankfurter API), currency view toggle, preferred currency selector  
**Later:** Recurring donations

**Multi-Currency Implementation:**
- Donations stored in their original currency for accuracy
- Currency conversions performed at display time using live exchange rates
- Frankfurter API provides ~30+ currencies (excluding ILS)
- User can toggle between "Original Currencies" and "Convert to [Preferred Currency]" views
- Preferred currency stored in localStorage (not in profiles table)
- Exchange rates cached for 24 hours
- Summary totals and charts always show in preferred currency when in converted mode

**RLS Policies:**
- Users can view their own donations only
- Users can create donations (user_id must match authenticated user)
- Users can update their own donations only
- Users can delete their own donations only

---

## Table: favorites
Store saved Quran ayahs and hadiths.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid (PK) |  |
| user_id | uuid (FK) | references profiles.id, CASCADE delete |
| created_at | timestamptz |  |
| item_type | text | 'quran' or 'hadith' |
| source_id | text | API reference |
| source_name | text | API name |
| title | text | short label |
| excerpt | text | snippet text |
| metadata | jsonb | optional details |

**V1:** Save/remove favorites with RLS  
**Later:** Cloud sync and global feed

**RLS Policies:**
- Users can view their own favorites only
- Users can create favorites (user_id must match authenticated user)
- Users can delete their own favorites only

---

## Table: feedback
Store user feedback and suggestions for app improvements.

| Field | Type | Description | Status |
|--------|------|-------------|--------|
| id | uuid (PK) | unique record ID, auto-generated | **Active (V1)** |
| created_at | timestamptz | auto timestamp | **Active (V1)** |
| page_path | text | page where feedback was submitted (e.g., '/', '/times') | **Active (V1)** |
| feedback_type | text | 'problem' or 'suggestion' | **Active (V1)** |
| content | text | user's feedback message | **Active (V1)** |
| user_id | uuid (FK) | references profiles.id, nullable, SET NULL on delete | **Active (V1)** |
| user_agent | text | browser/device info for troubleshooting | **Active (V1)** |
| metadata | jsonb | optional additional data | **Active (V1)** |
| status | text | 'new', 'reviewed', or 'resolved' (default: 'new') | **Active (V1)** - Workflow state tracking |
| priority | text | 'low', 'medium', or 'high' (default: 'medium') | **Active (V1)** - Issue prioritization |
| category | text | 'bug', 'feature-request', 'ui-ux', 'performance', 'other' (nullable) | **Active (V1)** - Admin categorization |
| admin_notes | text | internal notes for admin use (nullable) | **Active (V1)** - Admin workflow notes |
| reviewed_at | timestamptz | timestamp when status changed from 'new' (nullable) | **Active (V1)** - Review tracking |
| reviewed_by | uuid (FK) | references profiles.id, admin who reviewed (nullable) | **Active (V1)** - Admin accountability |

**Purpose:** Allow users to report problems and suggest improvements directly from any page. Supports anonymous submissions (user_id nullable) while optionally attaching user ID for authenticated users.

**V1:** Anonymous feedback collection with admin dashboard for workflow management  
**Later:** Email notifications, feedback trends and sentiment analysis, attachments/screenshots for bug reports

**Workflow:**
- Users submit feedback (status = 'new', priority = 'medium')
- Admins view all feedback in admin dashboard (`/admin`)
- Admins can:
  - Update status (new → reviewed → resolved)
  - Set priority (low/medium/high)
  - Assign category for organization
  - Add internal notes
  - Track review metadata (who reviewed, when)

**Indexes:**
- `idx_feedback_created_at` (created_at DESC) - Query by submission date
- `idx_feedback_type` (feedback_type) - Filter by problem vs suggestion  
- `idx_feedback_page_path` (page_path) - Group feedback by page
- `idx_feedback_status` (status) - Filter by workflow status
- `idx_feedback_priority` (priority) - Filter by priority level
- `idx_feedback_category` (category) - Filter by category

**RLS Policies:**
- **INSERT:** Anyone (anonymous or authenticated) can submit feedback (`TO anon, authenticated WITH CHECK (true)`)
- **SELECT:** Only admins can view all feedback (`EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)`)
- **UPDATE:** Only admins can update feedback (same admin check)
- **DELETE:** Not allowed (preserve feedback history)

**Privacy & Security:**
- Anonymous submissions allowed to reduce friction
- No PII collected beyond optional user_id
- User-agent stored for troubleshooting context only
- Admin-only access ensures users cannot view other feedback
- Regular users cannot query or view feedback table

**Admin Access:**
Admins access feedback via:
- Admin dashboard at `/admin` with full workflow management UI
- Alternatively: Supabase Dashboard → Table Editor → `feedback` table (direct database access)

---

## Table: prayer_tracking
Track daily prayer completion for authenticated users.

| Field | Type | Description | Status |
|--------|------|-------------|--------|
| id | uuid (PK) | unique record ID, auto-generated | **Active (V1.1)** |
| user_id | uuid (FK) | references profiles.id, CASCADE delete | **Active (V1.1)** |
| date | date | prayer date (YYYY-MM-DD format) | **Active (V1.1)** |
| fajr_completed | boolean | Fajr prayer completed (default: false) | **Active (V1.1)** |
| dhuhr_completed | boolean | Dhuhr prayer completed (default: false) | **Active (V1.1)** |
| asr_completed | boolean | Asr prayer completed (default: false) | **Active (V1.1)** |
| maghrib_completed | boolean | Maghrib prayer completed (default: false) | **Active (V1.1)** |
| isha_completed | boolean | Isha prayer completed (default: false) | **Active (V1.1)** |
| created_at | timestamptz | auto timestamp | **Active (V1.1)** |
| updated_at | timestamptz | auto timestamp, auto-updated via trigger | **Active (V1.1)** |

**Purpose:** Enable users to track their daily prayer completion with historical analytics. Supports completion rate tracking, trends analysis, and per-prayer breakdown.

**V1.1:** Prayer completion tracking with historical statistics (7/30/90 days, all-time), line charts, pie charts, and per-prayer analytics  
**Later:** Streak tracking, reminders based on completion patterns, goal setting

**Data Model Design:**
- One row per day per user (UNIQUE constraint on user_id + date)
- Boolean fields for each of the 5 daily prayers
- Supports toggling (mark complete/incomplete)
- No timestamp tracking (tracks completion only, not timing)

**Dual-Storage Pattern:**
- **Guest users:** Today's data stored in localStorage only (resets at midnight)
- **Authenticated users:** Persistent database storage with cross-device sync
- **Auto-sync:** localStorage data migrates to database on sign-in

**Indexes:**
- `idx_prayer_tracking_user_date` (user_id, date DESC) - Query by user and date range
- `idx_prayer_tracking_user_id` (user_id) - Query all records for user

**RLS Policies:**
- **SELECT:** Users can view their own prayer tracking only (`auth.uid() = user_id`)
- **INSERT:** Users can insert their own prayer tracking only (`auth.uid() = user_id`)
- **UPDATE:** Users can update their own prayer tracking only (`auth.uid() = user_id`)
- **DELETE:** Not allowed (preserve history)

**Triggers:**
- `prayer_tracking_updated_at` - Auto-update updated_at timestamp on record modification

**Integration:**
- UI: `/times` page with checkboxes next to each prayer
- Analytics: Collapsible statistics section with line/pie charts
- Hook: `usePrayerTracking` with dual-storage pattern
- Utilities: `prayerTracking.ts` for localStorage and calculation functions

---

## Table: zikr_logs (Future)
Track daily zikr counts across devices.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK |
| date | date | day of activity |
| phrase | text | zikr phrase |
| count | int | total count |

**Later:** aggregate zikr history
