# Ramadan Companion App

A modern, minimal web app built for Muslims to assist with daily worship and reflection—especially during Ramadan.

## Purpose
Help Muslims structure their Ramadan days with accurate prayer times, reminders, charity tracking, and inspirational content—all in one simple, privacy-respecting app.

## Tech Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript  
- **UI:** TailwindCSS + shadcn/ui + Lucide Icons  
- **Database:** Supabase (PostgreSQL + JS client)  
- **Auth:** Anonymous UUID (V1) → Supabase Auth (Later)  
- **Hosting:** Vercel (Frontend) + Supabase (Backend)  
- **APIs:**  
  - Prayer Times: AlAdhan API  
  - Hijri Calendar: AlAdhan API  
  - Quran: AlQuran Cloud API  
  - Hadith: Sunnah.com API  
  - Maps/Places: Google Places API (for Halal & Mosques)

## Core Principles
- Minimal UI with soft Islamic aesthetic.  
- Mobile-first design, responsive on laptop.  
- Privacy-first — user data stays local or secure in Supabase.  
- Works mostly with free APIs and free hosting tiers.
