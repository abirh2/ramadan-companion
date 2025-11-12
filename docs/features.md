# Feature Specification – Ramadan Companion App

This document defines the functionality, design, and API usage for all core and secondary features.  
It provides enough detail for any developer or AI agent to implement the app end-to-end following our V1 goals.

---

## Table of Contents
1. Authentication
2. Dashboard
3. Prayer Times & Qibla Finder
4. Ramadan Countdown
5. Quran & Hadith Reminders
6. Charity & Zakat Tracker
7. Zikr & Dua Tracker
8. Mosque Finder
9. Halal Food Finder
10. Settings
11. Common Design & Interaction Standards
12. API Reference Links

---

## 1. Authentication

### Functionality
User authentication and profile management using Supabase Auth.

### Auth Methods
- **Email/Password:** Standard sign up and login
- **OAuth:** Google social login with brand logo
- **Session Management:** httpOnly cookies, automatic session refresh

### User Flow
1. **Anonymous browsing:** Users can view dashboard (prayer times, Quran, Hadith) without auth
2. **Protected features:** Charity tracker and favorites require authentication
3. **Login modal:** Click "Login" button in header → modal with tabs (Sign In / Sign Up)
4. **OAuth flow:** Click Google/GitHub → redirect to OAuth → callback → authenticated
5. **User menu:** When authenticated, user icon in header opens sheet with profile link, theme toggle, sign out

### Data
- `profiles` table auto-created on signup via trigger
- User preferences stored in profile (timezone, theme, calculation method, etc.)
- Protected by RLS - users can only access their own data

### UI Components
- `AuthButton` - Header button (shows "Login" or user icon)
- `LoginModal` - Email/password form with OAuth buttons
- `UserMenu` - Sheet with profile link, theme toggle, sign out
- `ProtectedFeature` - Wrapper component that shows login prompt if unauthenticated

### APIs
None (Supabase Auth handles all authentication)

**V1:** Full auth with email/password + OAuth  
**Later:** Profile pictures, social features, password reset flow

---

## 2. Dashboard

### Purpose
Centralized view of daily information and quick access to all modules.

### Layout
- **Hero Section:** Ramadan countdown card (larger, prominent, centered at top)
- **Grid Section:** Responsive grid of cards below hero (1 column mobile, 2 column desktop)
- Each card summarizes a module and links to its full page  
- Built with `shadcn/ui` Cards and Tailwind grid utilities

### Cards
| Card | Summary Data | Expanded Behavior |
|-------|---------------|-------------------|
| **Ramadan (Hero)** | countdown to Ramadan or iftar/suhoor | displays in hero section |
| Next Prayer | next prayer name/time & countdown | navigates to `/times` |
| Quran of the Day | short Arabic + translation | opens `/quran-hadith` |
| Hadith of the Day | English text + source | opens `/quran-hadith` |
| Charity Summary | totals (Ramadan & all-time) | opens `/charity` |
| Places (Placeholder) | mosques/halal food tabs | Coming Soon message |
| Zikr Summary | current zikr and progress | opens `/zikr` |

**Included in V1:** Ramadan (hero), Next Prayer, Quran, Hadith, Charity, Places (placeholder)  
**Later:** Zikr (full implementation), Places (full implementation)

### Visual Design
- Soft neutral background (`#f5f3f0`), deep-green accents (`#0f3d3e`).  
- Rounded cards (`rounded-2xl`) with subtle shadow.  
- Optional geometric pattern header and small icons (moon, lantern).

---

## 2. Prayer Times & Qibla Finder (`/times`)

### Functionality
Display accurate prayer times and Qibla direction based on user location with city selection for travel planning.

### Data Flow
- **Location Priority Chain:**
  1. Supabase `profile.location_lat/lng/city` (if authenticated and set)
  2. localStorage `location_lat/lng/city` (if previously set)
  3. Browser Geolocation API (with user permission)
  4. Mecca default fallback (21.4225, 39.8262)
- **Calculation method:** Supabase `profiles.calculation_method` → localStorage → default **Umm al-Qura (Method 4)**
- **Prayer Times API:** Next.js proxy `/api/prayertimes` → AlAdhan API  
    `GET https://api.aladhan.com/v1/timings/{DD-MM-YYYY}?latitude={lat}&longitude={lng}&method={method}&timezonestring={timezone}`
- **Qibla API:** Next.js proxy `/api/qibla` → AlAdhan API  
    `GET https://api.aladhan.com/v1/qibla/{lat}/{lng}`
- **City Geocoding:** OpenStreetMap Nominatim API (free, no API key)
  - Search: `GET https://nominatim.openstreetmap.org/search?q={city}&format=json&limit=5`
  - Reverse: `GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json`

### Implementation Details

**Dashboard Card (`NextPrayerCard`):**
- Shows next prayer name with live countdown (updates every second)
- Displays prayer time in 12-hour format
- Shows calculation method and location city
- Clickable card navigates to `/times` page
- Loading and error states handled gracefully

**Full Prayer Times Page (`/app/times/page.tsx`):**
- Hero section: Large next prayer countdown
- Complete prayer schedule (Fajr → Isha + Sunrise)
- Qibla compass with bearing and direction
- Settings panel for calculation method and location
- Responsive layout (mobile single-column, desktop 2-column)

**Key Components:**
- `usePrayerTimes()` hook - Core logic for fetching and calculating prayer times
- `QiblaCompass` - SVG-based circular compass with rotated arrow
- `PrayerTimesSettings` - Calculation method selector + location management

### Behavior
1. **Auto-fetch location:** On first load, attempts geolocation → falls back to Mecca
2. **City selection:** Users can search for cities and select from results for travel planning
3. **Live countdown:** Next prayer countdown updates every second
4. **Calculation method:** 7 options (Umm al-Qura, ISNA, MWL, Egyptian, Karachi, Tehran, Jafari)
5. **Data persistence:** Location and method saved to Supabase profile (if authenticated) + localStorage
6. **Browser timezone:** Automatically uses `Intl.DateTimeFormat().resolvedOptions().timeZone`

### UI
- **Dashboard Card:**
  - Next prayer name + countdown
  - 12-hour time format
  - Location city display with MapPin icon
  - Calculation method name

- **Full Page (`/times`):**
  - Hero: Next prayer countdown (large, prominent)
  - Prayer schedule table with time remaining
  - Qibla compass (circular SVG, 200x200px)
  - Settings: Calculation method dropdown, location search, "Use Current Location" button
  
### Caching Strategy
- Prayer times: 1 hour cache (changes once daily)
- Qibla direction: 24 hour cache (never changes for a location)
- Countdown: Client-side only, updates every second (no API calls)

### Error Handling
- Geolocation denied: Falls back to Mecca, shows message
- API failures: User-friendly error messages with retry suggestion
- City search no results: Clear error message with suggestion
- Invalid coordinates: Validated before API calls

**V1 Status:** ✅ Complete - daily times + countdown + static Qibla arrow + city selection + location display  
**Later:** Compass orientation using DeviceOrientationEvent (phone compass integration)

---

## 3. Ramadan Countdown

### Functionality
Show countdown until Ramadan starts, and during Ramadan show iftar/suhoor timers.

### Data Source
- **[AlAdhan Hijri Calendar API](https://aladhan.com/islamic-calendar-api)**  
    - Current Hijri date: `GET https://api.aladhan.com/v1/gToH/{DD-MM-YYYY}`
    - Ramadan dates: `GET https://api.aladhan.com/v1/hToGCalendar/9/{hijriYear}` (month 9 = Ramadan)
    - Prayer times (for iftar/suhoor): `GET https://api.aladhan.com/v1/timings/{timestamp}?latitude={lat}&longitude={lng}&method=4&timezonestring={timezone}`
- Uses localStorage `hijri_offset_days` for manual ±1 adjustment
- **Timezone:** Always uses browser auto-detected timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`)

### Logic
- **Before Ramadan:** Detailed countdown showing "Xd Yh Zm Ws" (days, hours, minutes, seconds)
- **During Ramadan:** Countdown to next iftar (Maghrib) or suhoor end (Fajr) in "HH:MM:SS" format
- Displays current Ramadan day number (Day 1-30)
- Auto-updates every second

### UI
- **Hero card** on dashboard (larger than other cards, centered at top)
- Large digital timer text with detailed breakdown
- Subtext for day number, next event, or Ramadan start date
- Expected start date with "Adjust in Settings" hint

**V1:** countdowns + offset setting + detailed timer format + browser timezone  
**Later:** full Hijri calendar display

---

## 5. Quran & Hadith Reminders (`/quran-hadith`)

### Functionality
Show one ayah and one hadith per day (same for all users) and allow favorites. **Favorites require authentication.**

### Implementation Status
**Quran Feature:** ✅ **Fully Implemented (V1)**
- Dashboard card displays daily ayah with live data
- Dedicated `/quran-hadith` page with expanded view
- Favorites system with authentication protection
- Translation preferences (4 options: Asad, Sahih International, Pickthall, Yusuf Ali)
- Dual-storage pattern (Supabase + localStorage)
- Share functionality (copy to clipboard)

**Hadith Feature:** ✅ **Fully Implemented (V1)**
- Dashboard card displays daily hadith with live data
- Dedicated hadith section on `/quran-hadith` page
- Favorites system with authentication protection
- Language preferences (3 options: English, Urdu, Arabic)
- Dual-storage pattern (Supabase + localStorage)
- Share functionality (copy to clipboard)
- Status badges (Sahih/Hasan/Da'eef)

### APIs
- **Quran:** [AlQuran Cloud API](https://alquran.cloud/api)  
  - Endpoint: `GET https://api.alquran.cloud/v1/ayah/{ayah_number}/editions/quran-uthmani,{translation}`
  - Multi-edition support: Arabic (quran-uthmani) + Translation in single call
  - Proxied through `/api/quran?translation={id}`
- **Hadith:** [HadithAPI](https://hadithapi.com/)
  - Endpoint: `GET https://hadithapi.com/api/hadiths/?apiKey={key}&hadithNumber={num}&book={book}&paginate=1`
  - Collections: Sahih Bukhari + Sahih Muslim
  - Languages: English, Urdu, Arabic
  - Proxied through `/api/hadith?language={id}`

### Logic
- **Deterministic daily selection:**
  - **Quran:** `ayahNumber = ((year * 10000 + month * 100 + day) % 6236) + 1`
    - Cycles through all 6236 ayahs of the Quran
  - **Hadith:** `globalIndex = (dateNumber % TOTAL_HADITHS)`
    - Pool: ~15,000 hadiths (Sahih Bukhari ~7563 + Sahih Muslim ~7563)
    - Distributes selection across both collections
  - Ensures same content globally for all users each day
  - No randomness - predictable and consistent
- **Daily content viewable without auth**
- **Favorites stored in Supabase `favorites` table with RLS**
- **Favorite button shows login prompt if not authenticated**
- **Translation preference:**
  - Authenticated users: Saved to Supabase profile + localStorage (cross-device sync)
  - Guest users: Saved to localStorage only
  - Load priority: Profile → localStorage → default (en.asad)

### Implementation Details

**Key Components:**

**Quran:**
- `/app/api/quran/route.ts` - API proxy with 24-hour caching
- `/hooks/useQuranOfTheDay.ts` - Fetch daily ayah with translation preference
- `/hooks/useQuranFavorites.ts` - Manage favorite state with auth protection
- `/components/dashboard/QuranCard.tsx` - Dashboard card with live data
- `/components/quran/TranslationSelector.tsx` - Translation preference selector
- `/types/quran.types.ts` - TypeScript types for all Quran data

**Hadith:**
- `/app/api/hadith/route.ts` - HadithAPI proxy with 24-hour caching
- `/hooks/useHadithOfTheDay.ts` - Fetch daily hadith with language preference
- `/hooks/useHadithFavorites.ts` - Manage favorite state with auth protection
- `/components/dashboard/HadithCard.tsx` - Dashboard card with live data
- `/components/hadith/LanguageSelector.tsx` - Language preference selector
- `/types/hadith.types.ts` - TypeScript types for all Hadith data

**Shared:**
- `/app/quran-hadith/page.tsx` - Full page view with both Quran and Hadith sections
- `/lib/favorites.ts` - Supabase CRUD utilities for favorites (Quran + Hadith)

**Database:**
- `profiles.quran_translation` - Stores user's Quran translation preference
- `profiles.hadith_language` - Stores user's Hadith language preference
- `favorites` table - Stores favorited ayahs and hadiths with metadata
  - **Quran favorites:**
    - `item_type`: 'quran'
    - `source_id`: Ayah number (1-6236)
    - `source_name`: 'AlQuran Cloud'
    - `metadata`: Full ayah data (Arabic, translation, surah info)
  - **Hadith favorites:**
    - `item_type`: 'hadith'
    - `source_id`: "{bookSlug}:{hadithNumber}"
    - `source_name`: 'HadithAPI'
    - `metadata`: Full hadith data (English, Urdu, Arabic, narrator, book, chapter, status)

### UI

**Dashboard Card:**
- Displays daily ayah: Arabic (RTL, Uthmani script) + English translation
- Surah reference (e.g., "Surah Al-Baqara (2:255)")
- Heart icon for favorites (shows login modal if not authenticated)
- Clickable card navigates to `/quran-hadith`
- Loading and error states

**Dedicated Page (`/quran-hadith`):**
- **Quran Section:**
  - Large Arabic text (text-2xl/3xl, RTL, right-aligned)
  - English translation with translator attribution
  - Surah info card: Name, meaning, revelation type, number of ayahs
  - Translation selector dropdown (saves to profile/localStorage)
  - Favorite button (auth-protected, shows login modal if needed)
  - Share button (copy ayah + reference to clipboard)
- **Hadith Section:**
  - Large Arabic text (text-2xl/3xl, RTL, right-aligned) with copy button
  - Selected language translation (English/Urdu/Arabic) with copy button for English
  - Narrator attribution
  - Hadith info card: Book name, hadith number, chapter (English + Arabic), status badge
  - Arabic chapter name displayed in Arabic script below English chapter name
  - Status badge with color coding (Green: Sahih, Blue: Hasan, Amber: Da'eef)
  - Source attribution: HadithAPI with book name and scholar (e.g., "Imam Muslim")
  - Reference note explaining hadith numbering follows HadithAPI edition
  - Language selector dropdown (saves to profile/localStorage)
  - Favorite button (auth-protected, shows login modal if needed)
  - Share button (copy hadith + reference to clipboard)
  - Copy buttons provide instant feedback with checkmark icon

**Favorites Page (`/favorites`):**
- **Auth-protected:** Must be signed in to view
- **Tabbed interface:** Separate tabs for Quran and Hadith favorites
- **Quran Favorites:**
  - List of all favorited ayahs with full text (Arabic + translation)
  - Surah reference and save date displayed
  - Remove from favorites button (filled heart icon)
  - Share button per item
  - Empty state with call-to-action to view daily ayah
  - Count badge showing number of saved verses
- **Hadith Favorites:**
  - List of all favorited hadiths with full text (Arabic + English/Urdu)
  - Book, hadith number, status badge, and save date displayed
  - Remove from favorites button (filled heart icon)
  - Share button per item
  - Empty state with call-to-action to view daily hadith
  - Count badge showing number of saved hadiths
- **Access:** Via UserMenu → Favorites menu item

**Buttons:**
- Favorite: Heart icon (outline when not favorited, filled red when favorited)
- Share: Copy icon, copies formatted text to clipboard
- Translation selector: Dropdown with 4 translation options

**Typography:**
- Arabic: `text-lg`/`text-xl`/`text-2xl`, `dir="rtl"`, `lang="ar"`, serif font
- Translation: `text-sm`/`text-base`, `text-muted-foreground`
- Reference: `text-xs`, `text-muted-foreground`

**V1 Status:** ✅ **Complete** - Daily ayah and hadith fetch (public) + favorites CRUD (auth required) + translation/language preferences + dual-storage pattern + favorites list page  
**Later:** Search functionality, category filters, browse by chapter/book

---

## 6. Charity & Zakat Tracker (`/charity`)

### Functionality
Track donations and calculate zakat locally. **Requires authentication.**

### Data
Supabase `donations` table with RLS policies.

### Behavior
- **Protected feature:** Must be signed in to access
- Add/Edit/Delete donations (user_id matches authenticated user)
- Summaries: Ramadan total, yearly total, all-time total  
- Local zakat calculator (2.5% on net assets)  
- Option to log zakat as a donation record

### APIs
None (Supabase only).

### UI
Sections:
1. ProtectedFeature wrapper (shows login prompt if not authenticated)
2. Totals (cards)
3. Donation table/list
4. "Add Donation" dialog (Form → Supabase insert with user_id)
5. Local Zakat calculator with "Log as donation" option

**V1:** donations + calculator with auth protection + RLS  
**Later:** charts, recurring, CSV export

---

## 6. Zikr & Dua Tracker (`/zikr`)

### Functionality
Simple tasbeeh counter and dua list.

### Data
- LocalStorage for current zikr progress.  
- Optional static JSON for duas.

### Behavior
- Select phrase → tap to increment count.  
- Save progress locally.  
- Reset daily.

### UI
- Zikr selector dropdown.  
- Central circular count display.  
- Dua cards underneath.

**V1:** local only.  
**Later:** Supabase logs, streak tracking.

---

## 7. Mosque Finder (`/places/mosques`)

### Functionality
List nearby mosques.

### API
- **[Google Places API – Nearby Search](https://developers.google.com/maps/documentation/places/web-service/search-nearby)**  
    GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
    ?location={lat},{lng}
    &radius=5000
    &type=mosque
    &key={API_KEY}

### Behavior
- Use stored or current location.  
- Show list (name, address, distance, rating).  
- Open in Google Maps link.

**Later:** full map + filters.

---

## 8. Halal Food Finder (`/places/halal-food`)

### Functionality
Find halal restaurants near user.

### API
- **Google Places API (same as above)**  
    type=restaurant&keyword=halal

### Behavior
List view identical to mosque finder.

**Later only.**

---

## 9. Settings (Profile Page `/profile`)

### Functionality
Edit user profile and preferences.

### Data
Supabase `profiles` table with authenticated user data.

### Fields (V1)
- **Display Name:** Optional name for user profile
- **Email:** Read-only, from auth system
- **Theme:** Available via theme toggle in header (not in settings form)

### Fields (Deprecated)
- ~~Timezone~~ - Removed in favor of browser auto-detection

### Fields (Future)
- Location (auto/manual)
- Calculation method
- Madhab
- Hijri offset
- Language
- Notification preferences

### Notes
- **Timezone handling:** App uses browser-detected timezone automatically (`Intl.DateTimeFormat().resolvedOptions().timeZone`). No user configuration needed.
- **LocalStorage:** Used for hijri_offset_days until profile integration complete

**V1:** display name + email (read-only) + theme in header  
**Later:** location, calculation method, madhab, hijri offset, language, notifications

---

## 10. Common Design & Interaction Standards

### Layout
- Mobile-first, responsive grid.  
- Max width 800px desktop.  
- Sticky header bar with page title + theme toggle.

### Components
All using `shadcn/ui`:
- Card, Button, Dialog, Input, Tabs, Sheet.

### Colors
| Role | Hex |
|------|------|
| Primary | #0f3d3e |
| Accent | #d4af37 (gold) |
| Background | #f5f3f0 |
| Text | #1a1a1a |
| Muted | #6b7280 |

### Fonts
- Headings: Outfit / Manrope  
- Arabic: Amiri  
- Body: system sans-serif

### Icons
- Lucide React for UI.  
- Iconify Islamic icons (crescent, lantern) for subtle visual accents.

---

## 11. API Reference Links

| Category | API | Documentation |
|-----------|-----|---------------|
| Prayer Times | AlAdhan Prayer Times API | https://aladhan.com/prayer-times-api |
| Qibla | AlAdhan Qibla API | https://aladhan.com/qibla-api#overview |
| Hijri Calendar | AlAdhan Islamic Calendar API | https://aladhan.com/islamic-calendar-api |
| Quran | AlQuran Cloud API | https://alquran.cloud/api |
| Hadith | Sunnah.com API | https://hadithapi.com/|
| Places (Mosque & Halal Food) | Google Places API | https://developers.google.com/maps/documentation/places/web-service/search-nearby |
| Supabase | Database & Auth | https://supabase.com/docs |



