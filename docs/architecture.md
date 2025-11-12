# Architecture Overview

## High-Level Project Structure

/src
/app
/[pages]
/api/auth/callback
/profile
/components
/auth (AuthProvider, AuthButton, LoginModal, UserMenu, ProtectedFeature)
/dashboard
/ui
/lib
/supabase (client.ts, server.ts)
/hooks (useAuth, useRequireAuth)
/types (auth.types.ts)
/docs
middleware.ts


## Authentication Flow

**Authentication:** Supabase Auth with email/password + OAuth (Google, GitHub)

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

## Core Integrations

| Feature | Source | Storage | Auth Required | Status |
|----------|---------|----------|---------------|--------|
| Authentication | Supabase Auth | httpOnly cookies | N/A | V1 |
| User Profile | Supabase | Cloud (RLS) | Yes | V1 |
| Prayer Times | AlAdhan API | Local cache | No | V1 |
| Qibla | AlAdhan / formula | None | No | V1 |
| Ramadan Countdown | Hijri API | Local | No | V1 |
| Quran & Hadith | External APIs | Supabase (favorites) | No (favorites require auth) | V1 |
| Charity Tracker | Supabase | Cloud (RLS) | Yes | V1 |
| Zikr Tracker | Local / Supabase | Local | No | Later |
| Mosque Finder | Google Places | None | No | Later |
| Halal Food Finder | Google Places | None | No | Later |

## Data Separation

| Storage | Used For | Auth Required | Examples |
|----------|-----------|---------------|-----------|
| LocalStorage | Preferences & offline data | No | theme, method, location |
| Supabase Auth | Authentication state | Yes | user session, JWT tokens |
| Supabase Database | Persistent user data | Yes | donations, favorites, profiles |
| APIs | Dynamic content | No | prayer times, Quran, hadith |

## Security

**Row-Level Security (RLS):** All user tables (`profiles`, `donations`, `favorites`) have RLS policies enforcing users can only access their own data.

**Authentication Methods:**
- Email/password
- Google OAuth (with brand logo)

**Protected Routes:**
- `/profile` - Requires authentication (enforced by middleware)

**Protected Features:**
- Charity tracker (wrapped with ProtectedFeature component)
- Favorites (requires auth to save)
