# Project Roadmap

This document outlines planned milestones and dependencies for the Ramadan Companion App.

---

## Version Goals

| Version | Target | Focus |
|----------|---------|-------|
| **V1.0** | Core release (Ramadan-ready) | Foundational features, stable backend, Auth |
| **V1.1** | Post-launch enhancements | Zikr tracker, small UX improvements |
| **V2.0** | Full suite | Community features, Places, Advanced features |

---

## V1.0 – Core Launch

**Objective:** Deliver a self-contained, privacy-respecting companion for Ramadan.

### Features
| Feature | Description | Dependencies |
|----------|-------------|---------------|
| Authentication | Email/password + OAuth (Google) | Supabase Auth |
| User Profile | Profile settings, preferences management | Supabase, Auth |
| Dashboard | Aggregated summary cards | Components, Prayer API, Supabase |
| Prayer Times & Qibla | Full daily schedule, countdown, static Qibla arrow | AlAdhan API |
| Ramadan Countdown | Pre-Ramadan and during-Ramadan timers | Hijri API, Prayer API |
| Quran & Hadith | Daily content + favorites | AlQuran Cloud, Sunnah.com, Supabase |
| Charity Tracker | Donation CRUD + Zakat calculator (protected) | Supabase, Auth |
| Settings | Location/method/theme management | Supabase |

### Technical
- Next.js 15 app with Tailwind + shadcn/ui  
- Supabase Auth: email/password + OAuth (Google) with brand logo
- Supabase database: `profiles`, `donations`, `favorites` with RLS
- Client/server Supabase client split (@supabase/ssr)
- AuthProvider React Context for auth state
- Middleware for protected routes
- LocalStorage persistence for public preferences  
- Deployment on Vercel (frontend) + Supabase (backend)  
- API proxy routes for AlAdhan/Quran/Hadith (to hide keys)

### Deliverables
- Responsive UI verified on mobile and desktop  
- Full authentication flow (email/password + OAuth)
- Protected features (charity, favorites require auth)
- Public dashboard (prayer times, Quran/Hadith viewable without auth)
- Light/dark theme toggle (in user menu)
- Minimal Islamic visual identity

---

## V1.1 – Post-Launch Enhancements

### Features
| Feature | Description |
|----------|-------------|
| Zikr & Dua Tracker | Local counter with dua library |
| Donation Charts | Simple bar/pie visualizations |
| “Share Daily Ayah/Hadith” | Preformatted social post copy |
| Mosque Finder (prototype) | Nearby mosques using Google Places |

### Technical
- Add `zikr_logs` table (optional)  
- Expand Supabase queries with aggregates  
- Introduce caching layer for public APIs  
- Optimize API route calls for rate limits

---

## V2.0 – Expanded Features

### Features
| Feature | Description |
|----------|-------------|
| Full Mosque & Halal Finder | Map + filters + directions |
| Cloud Sync for Zikr | Persist zikr progress across devices |
| Notifications | Iftar reminders, prayer alerts |
| Language Support | Arabic, Urdu, Bengali, Malay |
| Visual Themes | Ramadan night, neutral, modern |
| Social Features | Share achievements, community feed |

### Technical
- Add push notifications (Web APIs)  
- Create `daily_content` table with server cron job for global ayah/hadith  
- Expand `/api` routes for caching
- Multi-language support with i18n

---

## Dependencies Summary

| Dependency | Usage | Notes |
|-------------|--------|-------|
| **Supabase** | persistent user data | free tier sufficient |
| **AlAdhan API** | prayer times, Hijri, Qibla | no auth key needed |
| **AlQuran Cloud API** | Quran data | public access |
| **Sunnah.com API** | Hadith data | requires free API key |
| **Google Places API** | mosque/halal lookup | requires key; used in later version |
| **Vercel** | hosting | free plan fine for MVP |

---

## Design Milestones

| Stage | Deliverable | Goal |
|--------|--------------|------|
| UI Framework | Tailwind + shadcn/ui setup | base components ready |
| Branding | Colors, fonts, icon set finalized | consistent look |
| Dashboard Prototype | Static cards layout | align layout |
| Functional MVP | Working API calls + Supabase integration | functional V1 |
| Public Launch | Deployed, stable | production-ready |

---

## Long-Term Vision

A self-contained Islamic companion web app that:
- Works offline for core content
- Syncs securely across devices
- Expands beyond Ramadan for year-round use
- Encourages good deeds and learning through daily reminders
