# Supabase Data Model

## Table: profiles
Store per-user preferences and settings.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | generated client-side |
| created_at | timestamptz | timestamp |
| updated_at | timestamptz | timestamp |
| display_name | text | optional |
| timezone | text | e.g. "America/New_York" |
| location_type | text | 'coords' or 'city' |
| location_lat | double precision | nullable |
| location_lng | double precision | nullable |
| location_city | text | nullable |
| calculation_method | text | e.g. 'umm_al_qura' |
| madhab | text | e.g. 'hanafi' |
| hijri_offset_days | integer | default 0 |
| language | text | e.g. 'en' |
| theme | text | 'light', 'dark', or 'system' |

**V1:** Core fields for preferences  
**Later:** Auth integration, profile picture, notifications

---

## Table: donations
Track zakat and sadaqah donations.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | unique record ID |
| user_id | uuid (FK) | references profiles.id |
| created_at | timestamptz | auto timestamp |
| updated_at | timestamptz | auto timestamp |
| amount | numeric(10,2) | donation amount |
| currency | text | default USD |
| type | text | 'zakat', 'sadaqah', or 'other' |
| category | text | optional category |
| charity_name | text | name of charity |
| charity_url | text | optional URL |
| date | date | donation date |
| notes | text | optional notes |
| is_recurring | boolean | default false |

**V1:** CRUD for donations  
**Later:** Recurring donations, multi-currency summaries

---

## Table: favorites
Store saved Quran ayahs and hadiths.

| Field | Type | Description |
|--------|------|-------------|
| id | uuid (PK) |  |
| user_id | uuid (FK) |  |
| created_at | timestamptz |  |
| item_type | text | 'quran' or 'hadith' |
| source_id | text | API reference |
| source_name | text | API name |
| title | text | short label |
| excerpt | text | snippet text |
| metadata | jsonb | optional details |

**V1:** Save/remove favorites  
**Later:** Cloud sync and global feed

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
