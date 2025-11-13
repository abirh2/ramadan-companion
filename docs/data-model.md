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
|| distance_unit | text | 'mi' or 'km' (default: 'mi') | Planned - Stores user's preferred distance unit for mosque finder |

**V1:** Auth integrated, display_name, location (lat/lng/city), calculation_method, madhab, quran_translation, hadith_language all active  
**Later:** Profile picture, notifications, hijri_offset integration, language, theme, distance_unit integration

**SQL Migration Required:**
```sql
-- Add hadith_language column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hadith_language text DEFAULT 'english';
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
