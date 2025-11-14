# Ramadan Companion App

> **Version 1.0 Complete** (November 2024) | Live and deployed on Vercel

A modern, minimal web app built for Muslims to assist with daily worship and reflection—especially during Ramadan.

## Purpose
Help Muslims structure their Ramadan days with accurate prayer times, reminders, charity tracking, and inspirational content—all in one simple, privacy-respecting app.

## Current Status (V1.0)
✅ All 10 features complete and deployed:
- Prayer Times & Qibla with offline fallback
- Ramadan Countdown with Hijri calendar
- Daily Quran & Hadith with favorites
- Charity Tracker with charts and zakat calculator
- Zikr Counter with 20 duas
- Mosque Finder (OpenStreetMap)
- Halal Food Finder (Geoapify)
- User Feedback System
- Admin Dashboard
- About Page with acknowledgements

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript  
- **UI:** TailwindCSS + shadcn/ui + Lucide Icons  
- **Database:** Supabase (PostgreSQL + Auth + RLS + Storage)  
- **Authentication:** Email/password + Google OAuth  
- **Maps:** MapLibre GL + OpenStreetMap tiles
- **Charts:** Recharts (line, bar, pie)
- **Hosting:** Vercel (Frontend) + Supabase (Backend)  
- **APIs:**  
  - Prayer Times: AlAdhan API + PrayTime library (fallback)  
  - Hijri Calendar: AlAdhan API  
  - Quran: AlQuran Cloud API  
  - Hadith: HadithAPI
  - Mosques: OpenStreetMap Overpass API
  - Halal Food: Geoapify Places API
  - Geocoding: Nominatim API

## Core Principles
- ✅ Minimal UI with soft Islamic aesthetic  
- ✅ Mobile-first design, responsive on laptop  
- ✅ Privacy-first — user data stays secure with Supabase RLS  
- ✅ Free APIs and free hosting tiers (no cost to users)
- ✅ Offline-capable (prayer times work without internet)

## Documentation Index

### Core Documentation
- **[Architecture](./architecture.md)** - System architecture and technical decisions
- **[Features](./features.md)** - Detailed feature specifications and UI guidelines
- **[Pages](./pages.md)** - Page-by-page data requirements and status
- **[Data Model](./data-model.md)** - Database schema and relationships
- **[API Structure](./api-structure.md)** - API endpoints and external integrations
- **[Design Guidelines](./design-guidelines.md)** - UI/UX patterns and best practices
- **[Testing](./testing.md)** - Testing standards and conventions
- **[Roadmap](./roadmap.md)** - Development phases and future enhancements

### Implementation Guides
- **[Authentication Setup](./auth-setup.md)** - Supabase auth configuration and usage
- **[Quran Implementation](./quran-implementation.md)** - Complete Quran feature implementation guide
