# Architecture Overview

## High-Level Project Structure

/src
/app
/[pages]
/components
/lib
/hooks
/types
/docs


## Data Flow
- **LocalStorage:** user preferences, theme, location.  
- **Supabase:** persistent user data (donations, favorites, etc.).  
- **External APIs:** prayer, Quran, hadith, maps/places.  
- **Next.js API Routes:** proxy and cache external APIs.

## Core Integrations

| Feature | Source | Storage | Status |
|----------|---------|----------|--------|
| Prayer Times | AlAdhan API | Local cache | V1 |
| Qibla | AlAdhan / formula | None | V1 |
| Ramadan Countdown | Hijri API | Local | V1 |
| Quran & Hadith | External APIs | Supabase (favorites) | V1 |
| Charity Tracker | Supabase | Cloud | V1 |
| Zikr Tracker | Local / Supabase | Local | Later |
| Mosque Finder | Google Places | None | Later |
| Halal Food Finder | Google Places | None | Later |

## Data Separation

| Storage | Used For | Examples |
|----------|-----------|-----------|
| LocalStorage | Preferences & offline data | theme, method, location |
| Supabase | Persistent user data | donations, favorites |
| APIs | Dynamic content | prayer times, Quran, hadith |
