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
| calculation_method | text | e.g. '4' (Umm al-Qura) | **Active (V1)** - AlAdhan API method ID |
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
```

**Note on timezone:** The `timezone` field exists in the schema but is not used by the application. The app automatically uses the browser's detected timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) for all time-based calculations. This provides accurate times for the user's current location without requiring manual configuration.

**Dual-Storage Pattern:** All user preferences (location, calculation_method, madhab, quran_translation, hadith_language) follow a dual-storage pattern:
- **Authenticated users:** Settings saved to both Supabase profile AND localStorage for cross-device sync
- **Guest users:** Settings saved to localStorage only for local persistence
- **Loading priority:** Supabase profile → localStorage → defaults

This ensures authenticated users get cross-device sync while guest users still have a personalized experience.

**RLS Policies:**
- Users can view their own profile only
- Users can insert their own profile only
- Users can update their own profile only
- Profile auto-created via trigger on user signup

---

## Table: donations
Track zakat and sadaqah donations.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | unique record ID |
| user_id | uuid (FK) | references profiles.id, CASCADE delete |
| created_at | timestamptz | auto timestamp |
| updated_at | timestamptz | auto timestamp, auto-updated via trigger |
| amount | numeric(10,2) | donation amount |
| currency | text | default USD |
| type | text | 'zakat', 'sadaqah', or 'other' |
| category | text | optional category |
| charity_name | text | name of charity |
| charity_url | text | optional URL |
| date | date | donation date |
| notes | text | optional notes |
| is_recurring | boolean | default false |

**V1:** CRUD for donations with RLS  
**Later:** Recurring donations, multi-currency summaries

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
