# Architecture Overview

**Version 1.0 Complete** (November 2024)

## High-Level Project Structure

```
/src
  /app                  # Next.js App Router pages
    /[pages]            # Feature pages (times, charity, zikr, etc.)
    /api                # API proxy routes
      /auth/callback    # OAuth callback handler
      /prayertimes      # AlAdhan proxy
      /quran            # AlQuran Cloud proxy
      /hadith           # HadithAPI proxy
      /mosques          # Overpass API proxy
      /food             # Geoapify proxy
      /hijri            # Hijri calendar proxy
      /qibla            # Qibla API proxy
    /profile            # User profile page
    /about              # About page
    /admin              # Admin dashboard (admin-only)
  /components           # React components
    /auth               # Auth components
    /dashboard          # Dashboard cards
    /admin              # Admin components
    /ui                 # shadcn/ui components
  /lib                  # Utilities and configs
    /supabase           # Supabase clients (client.ts, server.ts)
  /hooks                # Custom React hooks
  /types                # TypeScript type definitions
  middleware.ts         # Route protection middleware
/docs                   # Project documentation
```

## Authentication Flow

**Authentication:** Supabase Auth with email/password + OAuth (Google)

1. User clicks "Login" → LoginModal opens
2. Email/password or OAuth provider selection
3. Supabase handles auth, sets httpOnly cookies
4. AuthProvider detects session, updates React context
5. Protected features (charity, favorites) now accessible
6. User menu shows profile link when authenticated

**Key Components:**
- `/src/lib/supabase/client.ts` - Client-side Supabase auth client
- `/src/lib/supabase/server.ts` - Server-side Supabase auth client (for middleware, API routes)
- `/src/components/auth/AuthProvider.tsx` - React Context providing auth state
- `/src/hooks/useAuth.ts` - Custom hook for accessing auth context
- `/src/middleware.ts` - Next.js middleware for route protection
- `/src/app/api/auth/callback/route.ts` - OAuth callback handler

## Data Flow
- **LocalStorage:** user preferences, theme, location (public data).  
- **Supabase Auth:** user authentication state (httpOnly cookies).
- **Supabase Database:** persistent user data (donations, favorites, profiles) - protected by RLS.  
- **External APIs:** prayer, Quran, hadith, maps/places.  
- **Next.js API Routes:** proxy and cache external APIs.

## Core Integrations (V1.0 Complete)

| Feature | Source | Storage | Auth Required | Status |
|----------|---------|----------|---------------|--------|
| **Authentication** | Supabase Auth | httpOnly cookies | N/A | ✅ V1.0 |
| **User Profile** | Supabase | Cloud (RLS) | Yes | ✅ V1.0 |
| **Prayer Times** | AlAdhan API + PrayTime (fallback) | Local cache | No | ✅ V1.0 |
| **Qibla Compass** | AlAdhan API | 24h cache | No | ✅ V1.0 |
| **Ramadan Countdown** | AlAdhan Hijri API | 1h cache | No | ✅ V1.0 |
| **Quran of the Day** | AlQuran Cloud API | 24h cache + Supabase (favorites) | No (favorites: Yes) | ✅ V1.0 |
| **Hadith of the Day** | HadithAPI | 24h cache + Supabase (favorites) | No (favorites: Yes) | ✅ V1.0 |
| **Charity Tracker** | Supabase | Cloud (RLS) | Yes | ✅ V1.0 |
| **Zikr & Duas** | localStorage | Local only | No | ✅ V1.0 |
| **Mosque Finder** | OpenStreetMap Overpass API | localStorage (distance_unit) | No | ✅ V1.0 |
| **Halal Food Finder** | Geoapify Places API | localStorage (distance_unit) | No | ✅ V1.0 |
| **Favorites System** | Supabase | Cloud (RLS) | Yes | ✅ V1.0 |
| **User Feedback** | Supabase | Cloud (open insert, admin read) | No | ✅ V1.0 |
| **Admin Dashboard** | Supabase | Cloud (admin-only RLS) | Yes (admin) | ✅ V1.0 |
| **About Page** | Static content | None | No | ✅ V1.0 |

## Data Separation

| Storage | Used For | Auth Required | Examples |
|----------|-----------|---------------|-----------|
| LocalStorage | Preferences & offline data | No | theme, method, location, distance_unit |
| Supabase Auth | Authentication state | Yes | user session, JWT tokens |
| Supabase Database | Persistent user data | Yes | donations, favorites, profiles |
| APIs | Dynamic content | No | prayer times, Quran, hadith |

## Security

**Row-Level Security (RLS):** All user tables have RLS policies enforcing proper access control:
- `profiles` - Users can only access their own profile
- `donations` - Users can only access their own donations
- `favorites` - Users can only access their own favorites
- `feedback` - Anyone can insert (anonymous), only admins can read
- Admin queries require `is_admin = TRUE` check

**Authentication Methods:**
- Email/password (Supabase Auth)
- Google OAuth (with brand logo)

**Protected Routes:**
- `/profile` - Requires authentication (enforced by middleware)
- `/admin` - Requires admin flag (enforced by ProtectedAdmin component + RLS)

**Protected Features:**
- Charity tracker (wrapped with ProtectedFeature component)
- Favorites (requires auth to save)
- Admin dashboard (requires is_admin flag)

**API Security:**
- All API keys stored server-side in `.env.local`
- No sensitive keys exposed to client
- API routes proxy external services to hide credentials
- Rate limiting via external API providers

---

## External APIs

### Prayer Times & Islamic Data
- **AlAdhan API** (https://aladhan.com)
  - Prayer times calculation
  - Hijri calendar conversion
  - Qibla direction
  - No API key required, free public access
  - Cached: Prayer times (1h), Hijri (1h), Qibla (24h)

- **PrayTime Library** (praytime npm package)
  - Local prayer time calculation (fallback)
  - Supports all 7 calculation methods
  - Offline-capable
  - Used when AlAdhan API unavailable

### Quran & Hadith
- **AlQuran Cloud API** (https://alquran.cloud)
  - Quran text and translations
  - 4 translations integrated (Asad, Sahih International, Pickthall, Yusuf Ali)
  - No API key required, public access
  - Cached: 24 hours per ayah

- **HadithAPI** (https://hadithapi.com)
  - Sahih Bukhari and Sahih Muslim collections
  - English, Urdu, Arabic text
  - Authentication grades (Sahih/Hasan/Da'eef)
  - Requires free API key
  - Cached: 24 hours per hadith

### Maps & Places
- **OpenStreetMap Overpass API** (https://overpass-api.de)
  - Mosque locations worldwide
  - Community-contributed data
  - Free, no API key required
  - Fair use policy (rate limiting)
  - Cached: 1 hour

- **Nominatim API** (https://nominatim.openstreetmap.org)
  - Geocoding and reverse geocoding
  - Address search with autocomplete
  - Free OSM service, rate-limited
  - No API key required
  - Cached: Per search

- **Geoapify Places API** (https://www.geoapify.com)
  - Halal food locations
  - Cuisine and facility data
  - Requires API key (free tier available)
  - Sequential search strategy (quota conservation)
  - Cached: 1 hour

- **MapLibre GL** (https://maplibre.org)
  - Open-source map rendering
  - Uses OpenStreetMap tiles
  - Client-side library
  - No API key required

---

## Caching Strategy

| API | Cache Duration | Rationale |
|-----|----------------|-----------|
| Prayer times | 1 hour | Times change once daily, frequent checks needed |
| Qibla direction | 24 hours | Never changes for a location |
| Hijri calendar | 1 hour | Date changes once daily |
| Quran ayah | 24 hours | Same ayah globally all day |
| Hadith | 24 hours | Same hadith globally all day |
| Mosque data | 1 hour | Community data may update |
| Food places | 1 hour | Business data may change |

All caching implemented via Next.js `revalidate` option in `fetch()` calls.

---

## Performance Optimizations

**V1.0 Implemented:**
- Next.js App Router with React Server Components
- API route caching (1h - 24h based on data type)
- Lazy loading for heavy components
- Image optimization via Next.js Image component
- MapLibre GL for efficient map rendering
- Local prayer time fallback (no API needed)
- LocalStorage for instant preference loading

**Planned (V1.1+):**
- Service worker for offline caching
- Code splitting improvements
- Bundle size reduction
- WebP image format
- CDN integration for static assets
