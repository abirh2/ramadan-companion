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
12. About & Acknowledgements
13. User Feedback System
14. Admin Dashboard
15. PWA Installation
16. API Reference Links

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

**V1 Status:** ✅ **Complete** (November 2024) - Email/password + Google OAuth, profile management, protected routes, RLS security  

**Future Enhancements (V1.1+):**
- **V1.3:** Profile picture upload (Supabase Storage)
- **V1.3:** Password reset flow (Supabase Auth recovery)
- **V1.3:** Email verification
- **V1.3:** Account deletion option
- **V1.3:** Data export (GDPR compliance)
- **V2.0:** Social profile features (public/private, bio, interests)

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
| Places | mosques/halal food tabs with live data | opens `/places/mosques` or `/places/food` |
| Zikr Summary | current zikr and progress | opens `/zikr` |

**V1 Status:** ✅ **Complete** (November 2024) - Ramadan (hero), Next Prayer, Quran, Hadith, Charity, Places (mosques + halal food), Zikr, Admin (for admin users)

**Future Enhancements (V1.1+):**
- **V1.1:** Prayer time integration with mosque listings
- **V1.1:** Saved favorites for places
- **V1.3:** User reviews and ratings for mosques/restaurants
- **V2.0:** Community feed with shared content

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
- **Prayer Times Calculation (with automatic fallback):**
  - **Primary:** Next.js proxy `/api/prayertimes` → AlAdhan API  
    `GET https://api.aladhan.com/v1/timings/{DD-MM-YYYY}?latitude={lat}&longitude={lng}&method={method}&timezonestring={timezone}`
  - **Fallback:** PrayTime library (local calculation) when API unavailable
    - Uses `praytime` npm package (v3.2.0)
    - Supports all 7 calculation methods (same as AlAdhan)
    - Enables offline usage and network resilience
    - Transparent to users (automatic detection and fallback)
    - Calculation source tracked: `'api'` | `'local'` | `null`
- **Qibla API:** Next.js proxy `/api/qibla` → AlAdhan API  
    `GET https://api.aladhan.com/v1/qibla/{lat}/{lng}`
  - Qibla failures are independent and don't affect prayer times
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
- `usePrayerTimes()` hook - Core logic for fetching and calculating prayer times with automatic fallback
- `/src/lib/prayerTimes.ts` - Local prayer times calculation utility using PrayTime library
- `QiblaCompass` - SVG-based circular compass with rotated arrow (static + dynamic modes)
- `/src/lib/orientation.ts` - Device orientation utilities for dynamic compass
- `PrayerTimesSettings` - Calculation method selector + location management

### Behavior
1. **Auto-fetch location:** On first load, attempts geolocation → falls back to Mecca
2. **City selection:** Users can search for cities and select from results for travel planning
3. **Live countdown:** Next prayer countdown updates every second
4. **Calculation method:** 7 options (Umm al-Qura, ISNA, MWL, Egyptian, Karachi, Tehran, Jafari)
5. **Data persistence:** Location and method saved to Supabase profile (if authenticated) + localStorage
6. **Browser timezone:** Automatically uses `Intl.DateTimeFormat().resolvedOptions().timeZone`
7. **Automatic fallback:** If AlAdhan API unavailable (network error, timeout, API error), automatically calculates prayer times locally using PrayTime library. Fallback is transparent - users see accurate prayer times regardless of connectivity.

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
- AlAdhan API failures: Automatically falls back to local calculation (transparent to user)
- Local calculation failure: Shows error message only if both API and local calculation fail
- City search no results: Clear error message with suggestion
- Invalid coordinates: Validated before API calls
- Qibla API failures: Independent of prayer times, continues without Qibla direction

### Fallback Mechanism Details
**Implementation:** `/src/lib/prayerTimes.ts` + `/src/hooks/usePrayerTimes.ts`

**Calculation Method Mapping:**
- AlAdhan ID → PrayTime method: '0'→Jafari, '1'→Karachi, '2'→ISNA, '3'→Egypt, '4'→Makkah, '5'→MWL, '7'→Tehran
- Madhab: '0'→Standard (Shafi/Maliki/Hanbali), '1'→Hanafi

**Fallback Trigger:**
- Network errors (fetch failure)
- API errors (4xx/5xx responses)
- Timeout (>10 seconds)
- Malformed responses

**Validation:**
- All calculated prayer times validated for format (HH:MM)
- Chronological order verified (Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha)
- Invalid calculations rejected with error

**Benefits:**
- ✅ Offline support - prayer times work without internet
- ✅ Network resilience - survives API outages
- ✅ Same accuracy - identical calculation methods
- ✅ Transparent UX - users unaware of source
- ✅ Future-ready - foundation for advanced options (higher latitude adjustments, custom tuning)

### Dynamic Qibla Compass (Mobile Only)

**Feature:** Real-time compass that rotates as user moves their phone, always pointing toward Mecca.

**Platform Availability:**
- ✅ **iOS Safari:** Full support (requires permission)
- ✅ **Android Chrome/Edge/Firefox:** Full support (no permission needed)
- ❌ **iOS Chrome/Firefox/Edge:** Not supported (Apple WebKit restrictions)
- ❌ **Desktop:** Feature unavailable (no magnetometer sensor)

**User Experience:**
1. **Desktop:** Shows static compass only (no dynamic option)
2. **Mobile:** Shows toggle button "Dynamic" / "Static"
3. **iOS:** Permission prompt on first enable (similar to notifications)
4. **Android:** Immediate access, no permission needed

**Dynamic Mode Features:**
- Real-time rotation as device rotates
- Green arrow when aligned with Qibla (±5°)
- Accuracy indicator with calibration instructions
- "Hold phone flat" instruction for best results
- Smooth CSS transitions (0.3s ease-out)
- Low accuracy warning (>15°) with figure-8 calibration guide
- Toggle back to static mode anytime

**Technical Implementation:**
- **API:** DeviceOrientationEvent (native browser API, zero cost)
- **Calculation:** `rotation = qiblaBearing - deviceHeading`
- **Permission:** iOS 13+ requires `DeviceOrientationEvent.requestPermission()`
- **Accuracy:** Magnetometer-based, typically ±5-10° (affected by magnetic interference)
- **Fallback Chain:**
  1. Mobile + permission granted → Dynamic compass
  2. Mobile + permission denied → Static compass
  3. Desktop / no sensor → Static compass

**Limitations:**
- Requires device magnetometer (all modern phones have this)
- Accuracy affected by magnetic interference (metal objects, electronics)
- Best results when phone held flat (parallel to ground)
- Requires periodic calibration (figure-8 motion)
- Not available in iOS Chrome/Firefox (Apple restriction)

**Files:**
- `/src/lib/orientation.ts` - Device orientation utilities
- `/src/components/prayer-times/QiblaCompass.tsx` - Compass component with dynamic mode
- `/src/types/ramadan.types.ts` - CompassMode type

**V1 Status:** ✅ **Complete** (November 2024) - Daily times, countdown, Qibla compass (static + dynamic), city selection, location display, automatic fallback calculation, 7 calculation methods, madhab support

**Future Enhancements (V1.1+):**
- **V1.1:** Prayer time notifications (Web Push API)
- **V1.2:** Monthly/weekly prayer time calendar view
- **V1.3:** Advanced calculation options (higher latitude methods, manual time tuning)
- **V2.0:** Prayer time analytics and insights

---

## 2A. Prayer Tracking (`/times` integrated)

### Functionality
Enable users to track daily prayer completion with checkboxes, view completion summary, and access historical analytics with charts and trends.

### Data Flow
- **Guest Users (Not Authenticated):**
  - Today's completion stored in localStorage (`prayer_tracking_YYYY-MM-DD`)
  - Data resets at midnight (00:00 local time)
  - No historical analytics (current day only)
  - Auto-sync to database on sign-in

- **Authenticated Users:**
  - Persistent storage in Supabase `prayer_tracking` table
  - Historical data with cross-device sync
  - Full analytics: 7 days, 30 days, 90 days, all-time
  - One row per day with 5 boolean fields (fajr_completed, dhuhr_completed, asr_completed, maghrib_completed, isha_completed)

### Implementation Details

**Database Schema (`prayer_tracking` table):**
- `id` (uuid, PK), `user_id` (uuid, FK), `date` (date)
- Boolean fields: `fajr_completed`, `dhuhr_completed`, `asr_completed`, `maghrib_completed`, `isha_completed`
- `created_at`, `updated_at` timestamps
- UNIQUE constraint on (user_id, date)
- RLS policies: users can only view/modify their own records

**Core Hook (`usePrayerTracking`):**
- Dual-storage pattern (localStorage for guests, Supabase for authenticated)
- Fetches today's completion + historical data for authenticated users
- `togglePrayer(prayer)` - Toggle completion status (check/uncheck)
- `setTimeRange(range)` - Change analytics time range
- `refetch()` - Refresh data
- Auto-sync localStorage to database on sign-in
- Midnight reset detection (refetches at day change)

**UI Components:**
- `PrayerCheckbox` - Individual prayer checkbox with visual feedback (CheckCircle2/Circle icons)
- `PrayerCompletionSummary` - "3/5 prayers completed (60%)" display
- `PrayerStatistics` - Collapsible accordion with full analytics

**Page Integration (`/app/times/page.tsx`):**
- Checkboxes appear next to each prayer in schedule
- Completion summary in prayer schedule card header
- Statistics section below prayer schedule (collapsed by default)
- Works for both guest and authenticated users

### Analytics Features (Authenticated Users Only)

**Time Range Options:**
- 7 Days, 30 Days, 90 Days, All Time
- Selector buttons at top of statistics section

**Visualizations:**
1. **Statistics Summary (Grid):**
   - Overall completion rate (%)
   - Total prayers completed / total prayers
   - Days tracked
   - Perfect days (5/5 completions)

2. **Line Chart - Daily Completion Trend:**
   - X-axis: Date (MM/DD format)
   - Y-axis: Prayers completed (0-5 scale)
   - Shows daily completion pattern over time
   - Responsive, 250px height

3. **Pie Chart - Overall Completion:**
   - Completed vs Incomplete prayers
   - Donut chart with inner radius
   - Visual percentage breakdown

4. **Per-Prayer Breakdown:**
   - List view with progress bars for each prayer
   - Fajr, Dhuhr, Asr, Maghrib, Isha completion rates
   - Format: "24/30 (80%)"

5. **Most Consistent Prayer:**
   - Highlighted card showing prayer with highest completion rate
   - Award icon + percentage

**Charts Library:** Recharts (line/pie charts with responsive containers)

### Behavior

**Toggle Logic:**
- Click checkbox to mark prayer completed/incomplete
- Optimistic UI update (instant feedback)
- Saves to localStorage (guest) or database (authenticated)
- Recalculates total completion and percentage
- For authenticated users: refetches statistics after toggle

**Midnight Reset:**
- localStorage data for old dates cleaned up automatically
- Hook checks for date change every minute
- Refetches fresh data when new day detected

**Auto-Sync on Sign-In:**
- When user signs in, today's localStorage data migrates to database
- Only syncs if at least 1 prayer is completed
- Prevents overwriting existing database records
- Cleans up localStorage after sync

**Guest User Prompt:**
- Statistics section shows sign-in prompt for guest users
- "Sign in to track your prayer history and view detailed statistics"
- Link to `/profile` page for authentication

### UI States

**Loading State:**
- Spinner in statistics section while fetching data
- Time range buttons disabled during load

**Empty State:**
- "No prayer tracking data yet" message with calendar icon
- Appears when no historical data exists
- Encourages user to start tracking

**Error State:**
- Handled gracefully with error messages
- Doesn't block checkbox functionality

### Utility Functions (`/src/lib/prayerTracking.ts`)

- `getTodayDateString()` - Returns YYYY-MM-DD for today
- `getDateRangeForTimeRange(range)` - Calculate start/end dates for time ranges
- `calculateStatistics(records, timeRange)` - Compute completion stats from records
- `saveTodayToLocalStorage(completion)` - Save today's data to localStorage
- `getTodayFromLocalStorage()` - Load today's data from localStorage
- `clearOldLocalStorageData()` - Remove past dates (cleanup)
- `syncLocalStorageToDatabase(userId)` - Migrate today's data on sign-in
- `prayerToColumnName(prayer)` - Convert prayer name to DB column name
- `hasCrossedMidnight(lastCheckDate)` - Detect day change

### Storage Strategy

**LocalStorage Keys:**
- Format: `prayer_tracking_YYYY-MM-DD`
- Stores `DailyPrayerCompletion` object as JSON
- Automatic cleanup of old dates

**Database Records:**
- One row per user per day
- Boolean flags for each prayer
- No deletion (preserve history)
- Updated via UPSERT pattern (check for existing record, then update or insert)

### Testing

**Hook Tests (`__tests__/usePrayerTracking.test.tsx`):**
- Guest user localStorage flow
- Authenticated user database flow
- Toggle prayer completion
- Time range changes
- Auto-sync on sign-in
- Midnight reset
- Error handling

**Component Tests:**
- `PrayerCheckboxes.test.tsx` - Checkbox rendering, toggle functionality, completion summary
- `PrayerStatistics.test.tsx` - Guest prompt, expand/collapse, time range selector, charts rendering, empty state

### Performance Considerations
- Statistics calculation happens client-side (no extra API calls)
- Checkbox toggles use optimistic updates (instant UI feedback)
- Time range changes trigger single database query
- Charts only render when section is expanded (lazy rendering)

**V1.1 Status:** ✅ **Complete** (November 2024) - Prayer completion tracking, dual-storage pattern, historical analytics with charts, time range filtering, per-prayer breakdown, guest user support, auto-sync

**Future Enhancements (V1.2+):**
- **V1.2:** Streak tracking (consecutive days with all prayers completed)
- **V1.2:** Prayer time proximity tracking ("prayed on time" vs "late")
- **V1.3:** Goal setting (target completion rates)
- **V1.3:** Reminders based on completion patterns
- **V2.0:** Social features (share progress with friends, community challenges)

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

**V1 Status:** ✅ **Complete** (November 2024) - Countdown display, Hijri offset setting, detailed timer format, browser timezone auto-detection, iftar/suhoor timers

**Future Enhancements (V1.1+):**
- **V1.2:** Full Hijri calendar view (month/year display)
- **V1.2:** Important Islamic dates (Eid, Laylat al-Qadr, Ashura, Day of Arafah)
- **V1.2:** Historical event annotations
- **V1.2:** Event reminders
- **V2.0:** Community events calendar (local lectures, study circles)

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
- **Weighted random daily selection:**
  - Uses date as deterministic seed - **same content globally for all users each day**
  - **Quran:** Weighted probability favoring:
    - Last Juz (30th) - Most memorized surahs (weight: 20)
    - Short impactful surahs (Al-Ikhlas, Al-Falaq, An-Nas) (weight: 18)
    - Surah Yaseen - "Heart of Quran" (weight: 16)
    - Surah Al-Kahf - Friday recitation (weight: 14)
    - Surah Ar-Rahman - Beautiful recitation (weight: 12)
    - Other sections balanced for full Quran coverage (weight: 8-15)
    - Cycles through all 6,236 ayahs with weighted probability
  - **Hadith:** Weighted probability by topic and authenticity:
    - Sahih Bukhari prioritized (slightly higher weight overall)
    - Books of Faith, Prayer, Fasting (weight: 18-22)
    - Books of Zakat, Good Manners, Tawheed (weight: 16-20)
    - Other practical topics (weight: 8-15)
    - Pool: ~15,000 hadiths across both Sahih collections
  - **Seeded randomness** ensures predictability (same seed = same ayah/hadith)
  - Balances impactful content with full collection coverage
- **Cross-reference detection & resolution (Hadith only):**
  - Some hadiths are cross-references (e.g., "A similar hadith has been narrated...") rather than complete text
  - API automatically detects cross-references using pattern matching
  - Fallback mechanism searches adjacent hadith numbers (±1, ±2, ±3...) up to 10 attempts
  - Search sequence is deterministic: original → +1 → -1 → +2 → -2 → +3 → -3, etc.
  - Users always receive complete hadiths with full Arabic text and English/Urdu translations
  - Maintains global consistency (same date = same hadith for all users, including fallback)
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
- `/components/favorites/FavoriteHadithItem.tsx` - Favorites list item with copy buttons
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
  - Large Arabic text (text-2xl/3xl, RTL, right-aligned) with copy button
  - English translation with translator attribution and copy button
  - Surah info card: Name, meaning, revelation type, number of ayahs
  - Translation selector dropdown (saves to profile/localStorage)
  - Favorite button (auth-protected, shows login modal if needed)
  - Share button (copy ayah + reference to clipboard)
  - Copy buttons provide instant feedback with checkmark icon
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
  - Copy buttons for Arabic and translation text separately
  - Surah reference and save date displayed
  - Share button per item (text label with icon)
  - Remove from favorites button (text label "Remove" with filled heart icon)
  - Empty state with call-to-action to view daily ayah
  - Count badge showing number of saved verses
  - Consistent button styling matching Hadith favorites
- **Hadith Favorites:**
  - List of all favorited hadiths with full text (Arabic + English)
  - Book, hadith number, chapter, status badge, and save date displayed
  - Copy buttons for Arabic and English text separately
  - Share button per item (copies formatted text to clipboard)
  - Remove from favorites button (filled heart icon)
  - Empty state with call-to-action to view daily hadith
  - Count badge showing number of saved hadiths
  - Error handling with retry button
- **Access:** Via UserMenu → Favorites menu item

**Buttons:**
- Favorite: Heart icon (outline when not favorited, filled red when favorited)
- Share: Text label "Share" with Share2 icon, copies formatted text to clipboard
- Remove: Text label "Remove" with filled heart icon (on favorites page)
- Copy: Copy icon that changes to green checkmark on success
- Translation selector: Dropdown with 4 translation options
- Language selector: Dropdown with 3 language options (Hadith)

**UI Consistency:**
- Both Quran and Hadith cards use identical button layouts and styling
- Copy buttons positioned next to Arabic text and translation/English text
- Action buttons (Share, Remove) at bottom with text labels
- Green checkmark feedback (2 seconds) on successful copy

**Typography:**
- Arabic: `text-lg`/`text-xl`/`text-2xl`, `dir="rtl"`, `lang="ar"`, serif font
- Translation: `text-sm`/`text-base`, `text-muted-foreground`
- Reference: `text-xs`, `text-muted-foreground`

**V1 Status:** ✅ **Complete** (November 2024) - Daily ayah (4 translations) + daily hadith (3 languages) + favorites system + translation/language preferences + dual-storage pattern + favorites list page + share functionality + weighted random selection

**Future Enhancements (V1.2+):**
- **V1.2:** Quran audio recitation (multiple reciters: Mishary, Abdul Basit, Sudais)
- **V1.2:** Hadith browser (6 major collections, search by topic/narrator)
- **V1.2:** Tafsir integration (Ibn Kathir commentary)
- **V1.2:** Notes on favorites (personal reflections)
- **V1.2:** Share to social media (WhatsApp, Twitter direct integration)
- **V2.0:** Word-by-word Quran translation display
- **V2.0:** Hadith narrator chains (isnad) visualization

---

## 5B. Quran Browser (`/quran`)

### Functionality
Full Quran browsing experience allowing users to select and read all 114 surahs with translations, bookmark reading positions, and navigate by Surah or Juz.

### Implementation Status
✅ **Fully Implemented (V1.1)** - November 2024

### API & Data

**AlQuran Cloud API:**
- **Surah List:** `GET /v1/surah` - Fetches metadata for all 114 surahs
- **Full Surah:** `GET /v1/surah/{number}/editions/{edition1},{edition2}` - Fetches complete surah with Arabic + translation
- **Editions Used:** `quran-uthmani` (Arabic), user-selected translation (default: `en.asad`)
- **Caching:** 7-day server-side cache for full surahs

**Local Data:**
- `quranData.ts` - Static metadata for all 114 surahs (names, ayah counts, revelation type)
- 30 Juz mappings with start/end surah and ayah positions

**Database:**
- `profiles.quran_translation` - Stores user's translation preference
- `quran_bookmarks` table - Stores reading positions (surah number + ayah number)
  - `user_id` (uuid) - Foreign key to profiles
  - `surah_number` (integer) - Surah being read (1-114)
  - `ayah_number` (integer) - Last ayah position
  - `updated_at` (timestamp) - Auto-updated on scroll
  - **Unique constraint:** (user_id, surah_number) - One bookmark per surah per user
  - **RLS Policies:** Users can only access their own bookmarks
  - **Dual-storage:** Bookmarks saved to both Supabase (authenticated users) and localStorage (guest users)

### UI & Navigation

**Landing Page (`/quran`):**
- **Tabbed Navigation:** Toggle between "By Surah" and "By Juz"
- **Surah Tab:**
  - **View Toggle:** Switch between List view and Grid view
  - **Search:** Filter surahs by name, translation, or number
  - **List View:** All 114 surahs with number badge, English/Arabic names, metadata (Meccan/Medinan, ayah count)
  - **Grid View:** Card-based layout with centered Arabic names and metadata
- **Juz Tab:**
  - 30 Juz cards showing start/end positions (surah:ayah format)
  - Click to navigate to starting surah at specific ayah

**Surah Reading Page (`/quran/[surahNumber]`):**
- **Header:**
  - Back button to return to browser
  - Surah info banner: Arabic name, English name, translation, revelation type, ayah count
- **Controls:**
  - Translation selector dropdown (saves to profile/localStorage)
  - Ayah range lookup: Jump to specific ayah number with "Go" button
- **Ayah Display:**
  - Vertical scrollable list of all ayahs in surah
  - Each ayah card contains:
    - **Ayah number badge:** "Surah:Ayah" format
    - **Arabic text:** Large (text-3xl), RTL, serif font, with proper line spacing
    - **Translation text:** Below Arabic, separated by border, in muted color
    - **Action buttons:**
      - **Copy:** Copies Arabic + translation + reference
      - **Favorite:** Adds to favorites (heart icon, shows login modal if unauthenticated)
      - **Bookmark:** Saves reading position
      - **Share:** Native share API or copy link to specific ayah
- **Auto-scroll:** Resumes to last bookmarked ayah or jumps to URL-specified ayah
- **Auto-bookmark:** Saves reading position on scroll (debounced, updates every 1 second)

**Navigation Menu:**
- Dropdown menu in header next to AuthButton
- Links to: Quran Browser, Prayer Times, Daily Quran & Hadith, Charity Tracker, Favorites, Zikr & Duas

### Hooks & State Management

**Custom Hooks:**
- `useFullSurah(surahNumber)` - Fetches complete surah with translation, handles loading/error states
- `useQuranBookmarks()` - Manages CRUD operations for bookmarks, dual-storage pattern
- `useQuranFavorites()` - Integrates with existing favorites system for individual ayahs

**State Persistence:**
- **Bookmarks:** Saved to Supabase (authenticated) + localStorage (guest)
- **Translation preference:** Saved to profile (authenticated) + localStorage (fallback)
- **View mode (List/Grid):** Saved to localStorage only

### Components

**Pages:**
- `/quran/page.tsx` - Landing page with tabs
- `/quran/[surahNumber]/page.tsx` - Dynamic surah reading page

**Components:**
- `SurahSelector` - Search and view toggle controls
- `SurahList` - List view of all surahs
- `SurahGrid` - Grid view of all surahs
- `JuzList` - 30 Juz cards with navigation
- `SurahReader` - Main reading interface with scroll tracking
- `SurahHeader` - Surah info banner
- `AyahCard` - Individual ayah display (Arabic + translation)
- `AyahActions` - Copy/favorite/bookmark/share buttons
- `AyahRangeLookup` - Jump to specific ayah
- `TranslationSelector` - Dropdown for translation selection

### Technical Details

**API Route:** `/api/quran/surah/[number]/route.ts`
- Validates surah number (1-114)
- Fetches from AlQuran Cloud API with specified translation
- Returns paired data: Arabic + translation for each ayah
- Implements 7-day caching via Next.js `revalidate`

**Type Definitions:**
```typescript
interface FullSurahResponse {
  surah: QuranSurah
  ayahs: AyahPair[]
  translation: QuranTranslationId
}

interface AyahPair {
  numberInSurah: number
  globalNumber: number
  arabic: QuranAyah
  translation: QuranAyah
}

interface BookmarkData {
  id?: string
  user_id: string
  surah_number: number
  ayah_number: number
  created_at?: string
  updated_at?: string
}
```

**V1.1 Status:** ✅ **Complete** (November 2024) - Full surah browser with 114 surahs, Juz navigation, bookmarks, favorites integration, search, multiple views, translation switching, auto-scroll resume, ayah sharing

**Future Enhancements (V1.2+):**
- **V1.2:** Reading progress statistics (total ayahs read, completion percentage)
- **V1.2:** Quran audio recitation per ayah (play/pause controls)
- **V1.2:** Tafsir (commentary) integration for each ayah
- **V1.2:** Word-by-word translation view
- **V1.2:** Night reading mode with adjusted colors
- **V1.2:** Ayah-level notes and reflections
- **V2.0:** Offline mode with downloaded surahs
- **V2.0:** Reading streaks and achievements

---

## 6. Charity & Zakat Tracker (`/charity`)

### Functionality
Comprehensive donation tracking with multi-currency support, monthly insights, visualizations, and zakat calculator. **Requires authentication.**

### Implementation Status
✅ **Fully Implemented (V1.1)**
- Full CRUD operations for donations
- **Multi-currency support with live exchange rates (Frankfurter API)**
- **Currency view toggle: original currencies vs. converted to preferred currency**
- Monthly tracking with calendar and list views
- Interactive charts (line, bar, pie)
- Zakat calculator with currency selection
- Dashboard integration with live totals
- View toggle with localStorage persistence

### Data
Supabase `donations` table with RLS policies.

**Database Fields:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - Foreign key to profiles table
- `amount` (numeric) - Donation amount (stored in original currency)
- `currency` (text) - Currency code (ISO 4217, e.g., 'USD', 'EUR', 'GBP')
- `type` (text) - 'zakat', 'sadaqah', or 'other'
- `category` (text) - Optional category (e.g., Education, Medical)
- `charity_name` (text) - Name of charity/organization
- `charity_url` (text) - Optional URL
- `date` (date) - Donation date
- `notes` (text) - Optional notes
- `is_recurring` (boolean) - Future use
- `created_at`, `updated_at` - Auto timestamps

**Note:** Donations are stored in their original currency to preserve accuracy. Currency conversions for display are performed using live exchange rates from fawazahmed0 Currency API (200+ currencies, daily updates, CDN-hosted with fallback).

**RLS Policies:**
- Users can only view, create, update, and delete their own donations
- Enforced at database level via `user_id` matching

### Behavior

**Protected Access:**
- Page wrapped with `ProtectedFeature` component
- Unauthenticated users see login prompt
- All operations require valid user session

**Donation Management:**
- **Add:** Click "Add Donation" → modal form → select currency → save to Supabase
- **Edit:** Click edit icon on any donation → pre-filled modal (including currency) → update
- **Delete:** Click delete icon → confirmation dialog → permanent removal
- Form fields: amount (required), **currency selector** (required), type (required), date (required), charity name, category, notes
- **Currency Selector:** Searchable dropdown with flag emojis, supports 200+ currencies including gold (XAU) and silver (XAG) for zakat nisab reference (excludes ILS and cryptocurrencies)
- Real-time validation: amount > 0, required fields checked
- Success/error feedback with toast-style messages

**Multi-Currency Features:**
- **Currency View Toggle:** Switch between "Original Currencies" and "Convert to [USD]" modes
- **Preferred Currency Selector:** Choose display currency for conversions (defaults to USD)
- **Live Exchange Rates:** Powered by fawazahmed0 Currency API with 24-hour caching and CDN fallback
- **View Mode Persistence:** User's preference saved to localStorage
- **Automatic Conversion:** Summary totals, charts, and statistics always display in preferred currency when in converted mode
- **Original Currency Preservation:** Donations stored in their original currency for accuracy
- **Precious Metals Support:** Gold (XAU) and Silver (XAG) included for zakat nisab calculations

**Monthly Tracking:**
- **Two view modes:** Calendar grid and List accordion
- **Toggle buttons:** Switch between views (preference saved to localStorage)
- **Calendar View:**
  - 12-month grid for selected year
  - Each month card shows: total, count, visual indicator
  - Click month to expand and see all donations
  - Year selector with prev/next buttons
  - Inline edit/delete actions per donation
- **List View:**
  - Accordion grouped by month (most recent first)
  - Month header shows total and count
  - Expanded: full table with columns (date, amount, type, charity, actions)
  - Better for detailed review and quick editing

**Summary Totals:**
- **This Ramadan:** Sum of donations during current Ramadan period
- **This Year:** Sum of donations in current calendar year
- **All Time:** Lifetime total of all donations
- Displayed in 3 prominent cards at top of page
- **Displays in preferred currency** with conversion indicator
- **Converting state:** Shows "Converting..." during exchange rate fetches
- Real-time updates after add/edit/delete

**Charts & Visualizations:**
- **Line Chart:** Monthly donation trends over time (X: months, Y: amount in preferred currency)
- **Bar Chart:** Last 12 months comparison with visual bars
- **Pie Chart:** Breakdown by type (zakat vs sadaqah vs other) with percentages
- **Currency Note:** "All amounts shown in [USD]" displayed below charts
- **Always Converted:** Charts always show amounts in preferred currency for consistency
- Built with recharts library (responsive, mobile-friendly)
- Empty state: "Add donations to see charts"
- Color-coded type badges: Green (zakat), Blue (sadaqah), Gray (other)

**Zakat Calculator:**
- Expandable/collapsible section
- **Currency Selector:** Choose currency for zakat calculation (at top of calculator)
- Input fields: Cash, Savings, Gold, Silver, Business Assets, Debts (all in selected currency)
- Live calculation: (Total Assets - Debts) × 2.5%
- Display breakdown: Total Assets, Debts, Net Zakatable Wealth, Zakat Due (formatted in selected currency)
- "Log as Donation" button pre-fills form with calculated amount, selected currency, and type=zakat
- Educational note about consulting scholars

**Recommended Charities Placeholder:**
- Descriptive card with icon (HeartHandshake, Sparkles)
- Title: "Recommended Charities & Causes"
- Description: Coming soon message explaining future feature
- Dashed border styling to indicate placeholder status

### APIs

**Currency Exchange Rates (fawazahmed0 API):**
- `/api/currency?base={currency}&symbols={comma-separated}` - Get exchange rates
  - Primary: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.min.json`
  - Fallback: `https://latest.currency-api.pages.dev/v1/currencies/{base}.min.json`
  - 24-hour cache (rates update daily)
  - Supports 200+ currencies including gold (XAU) and silver (XAG)
  - Automatically filters out ILS (Israeli Shekel) and cryptocurrencies
  - Returns: `{ base: 'USD', date: '2025-11-16', rates: { EUR: 0.92, XAU: 0.00048, ... } }`

- `/api/currency/list` - Get list of all supported currencies
  - Primary: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json`
  - Fallback: `https://latest.currency-api.pages.dev/v1/currencies.min.json`
  - 7-day cache (static data)
  - Filters out cryptocurrencies and ILS
  - Returns sorted array: `[{ code: 'USD', name: 'United States Dollar' }, { code: 'XAU', name: 'Gold' }, ...]`
  - Excludes ILS (Israeli Shekel)

**Donation CRUD:**
- All operations through Supabase client with RLS enforcement

### Key Components

**Pages:**
- `/app/charity/page.tsx` - Main charity tracker page

**Hooks:**
- `/hooks/useDonations.ts` - Fetch donations, calculate summaries, loading/error states

**Utilities:**
- `/lib/donations.ts` - CRUD operations (getDonations, addDonation, updateDonation, deleteDonation, getMonthlyTotals, getRamadanTotal)

**Types:**
- `/types/donation.types.ts` - TypeScript interfaces (Donation, DonationFormData, MonthlyTotal, ZakatCalculation, DonationSummary, DonationFilters)

**Components:**
- `/components/charity/DonationForm.tsx` - Add/Edit modal dialog
- `/components/charity/MonthlyView.tsx` - Calendar-style monthly grid
- `/components/charity/ListViewAccordion.tsx` - Accordion list grouped by month
- `/components/charity/ChartsSection.tsx` - Line, bar, and pie charts
- `/components/charity/ZakatCalculator.tsx` - Collapsible zakat calculator
- `/components/charity/RecommendedCharities.tsx` - Placeholder component
- `/components/dashboard/CharityCard.tsx` - Dashboard card with live data and link

### UI Details

**Dashboard Card:**
- Shows "This Ramadan" and "All Time" totals
- Loading state with spinner
- Error state shows $0.00
- Click card to navigate to `/charity` page
- Hover effect for interactivity feedback
- Count badge: "X donations recorded"

**Main Page Layout:**
- Header: Back button, page title, AuthButton
- Summary cards row (3 columns on desktop, stacked on mobile)
- Action bar: View toggle buttons + Add Donation button
- Empty state: Icon, message, CTA button
- Monthly view section (conditional based on toggle)
- Charts section (hidden if no donations)
- Zakat calculator (collapsible)
- Recommended charities placeholder
- All sections responsive and mobile-optimized

**Form Dialog:**
- Modal overlay with backdrop
- Title changes: "Add Donation" vs "Edit Donation"
- Inline validation feedback
- Required field indicators (*)
- Date picker defaults to today
- Cancel and submit buttons
- Loading state during save

**Delete Confirmation:**
- Separate dialog for deletion
- Shows donation details (amount, type, charity, date)
- Destructive action styling (red button)
- Loading state during deletion
- Cannot undo warning

**Color Scheme:**
- Primary: HSL primary color from theme
- Success/Zakat: Green (#10b981)
- Info/Sadaqah: Blue (#3b82f6)
- Neutral/Other: Gray (#6b7280)
- Destructive: Red from theme
- Muted backgrounds for secondary info

### Currency & Localization
- **V1:** USD only (hardcoded)
- **V1.1:** Multi-currency support (200+ currencies via fawazahmed0 API, excludes ILS and cryptocurrencies, includes gold/silver for zakat nisab)
- Format: `Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })`
- Display: Currency-specific format with 2 decimal places (e.g., $0.00, €0.00, £0.00)
- Input: Number input with step="0.01"
- Fallback mechanism: Primary CDN → Fallback CDN for reliability

### State Management
- React hooks + local component state (no global store)
- `useDonations` hook fetches data per page/component
- Refetch pattern after mutations (add/edit/delete)
- View preference persisted to localStorage (key: `charity_view_mode`)
- Default view: 'calendar'

### Error Handling
- Network errors: Display error message with retry button
- Validation errors: Inline field errors
- RLS violations: Caught at Supabase level (shouldn't happen with proper auth)
- Empty states: Friendly messages with CTAs
- Loading states: Spinners and skeleton placeholders

### Performance Considerations
- Single query fetches all user donations (indexed by user_id)
- Monthly grouping done client-side (JavaScript map/reduce)
- Charts only render when donations exist
- Lazy calculation of summaries (computed in useDonations hook)
- View toggle doesn't refetch data (just changes display)
- LocalStorage write on view change (minimal overhead)

**V1 Status:** ✅ **Complete** (November 2024) - Full CRUD, monthly tracking (calendar/list views), charts (line/bar/pie), zakat calculator, dashboard integration, auth protection, RLS enforcement, This Ramadan/This Year/All Time summaries

**Future Enhancements (V1.1+):**
- **V1.1:** Recurring donation tracking (monthly/yearly recurring commitments)
- **V1.1:** Multi-currency support with live conversion (USD, EUR, GBP, CAD)
- **V1.1:** CSV export for tax purposes
- **V1.1:** Enhanced donation insights (trends, patterns, comparisons)
- **V1.3:** Email receipts for donations
- **V1.3:** Tax year summaries (fiscal year support)
- **V2.0:** Charity recommendations database with ratings
- **V2.0:** Impact tracking (where donations went)
- **V2.0:** Donation reminders (push notifications)
- **V2.0:** Charity fundraising campaigns

---

## 7. Zikr & Dua Tracker (`/zikr`)

### Functionality
Interactive tasbeeh counter with goal tracking and comprehensive dua library for daily worship.

### Implementation Status
✅ **Fully Implemented (V1)**
- Tasbeeh counter with 5 standard phrases
- Goal tracking with visual progress indicators
- Daily auto-reset at Fajr (Islamic day boundary)
- Audio and haptic feedback on increment
- Free count mode (no target) and custom targets
- Comprehensive dua library (20 duas across 8 categories)
- Dashboard integration with live counter state

### Data
**LocalStorage:**
- `zikr_state`: Counter state (phraseId, count, target, lastResetDate)
- `zikr_feedback_enabled`: Audio/haptic preferences

**No Supabase in V1** - fully local, works offline

### Standard Phrases
| Phrase | Arabic | Default Target |
|--------|--------|----------------|
| SubhanAllah | سُبْحَانَ ٱللَّٰهِ | 33 |
| Alhamdulillah | ٱلْحَمْدُ لِلَّٰهِ | 33 |
| Allahu Akbar | ٱللَّٰهُ أَكْبَرُ | 34 |
| Astaghfirullah | أَسْتَغْفِرُ ٱللَّٰهَ | 100 |
| La ilaha illallah | لَا إِلَٰهَ إِلَّا ٱللَّٰهُ | 100 |

### Behavior

**Counter Mechanics:**
- Tap/click anywhere on circular counter to increment
- Visual scale animation on tap for feedback
- Circular progress ring shows completion percentage (when target set)
- Count persists to localStorage automatically
- Goal reached message when target achieved

**Daily Reset at Fajr:**
- Automatically resets counter at Fajr prayer time
- Fajr time fetched from `usePrayerTimes` hook
- Follows Islamic day boundary (new day begins at Fajr)
- Fallback to midnight if Fajr time unavailable
- User-facing explanation displayed on page
- Reset logic: `if current time > today's Fajr AND lastResetDate < today`

**Target Modes:**
1. **Default Target Mode**: Uses phrase-specific recommended count (e.g., 33x for SubhanAllah)
2. **Custom Target Mode**: User sets any count goal (e.g., 50, 200, etc.)
3. **Free Count Mode**: No target, unlimited counting with ∞ symbol

**Feedback System:**
- **Audio**: 50ms sine wave beep (800Hz) using Web Audio API
- **Haptic**: 10ms vibration pulse using Vibration API
- **Visual**: Scale animation on button press
- **Toggleable**: User can enable/disable audio and haptic independently
- **Graceful degradation**: Features fail silently if APIs unavailable

**Phrase Switching:**
- Select any of 5 standard phrases from dropdown
- Counter resets to 0 when switching phrases
- Target resets to phrase's default (or stays in free count mode)
- Arabic, transliteration, and meaning displayed

### Dua Library

**20 Essential Duas Across 8 Categories:**

| Category | Count | Examples |
|----------|-------|----------|
| Morning | 3 | Morning protection, Ayatul Kursi, Seeking forgiveness |
| Evening | 3 | Evening protection, Seeking refuge, Bismillah protection |
| Meals | 2 | Before eating, After eating |
| Travel | 2 | Departure, Protection during travel |
| Sleep | 1 | Before sleep |
| Home | 2 | Entering home, Leaving home |
| Worship | 3 | Entering mosque, Leaving mosque, After wudu |
| General | 4 | Forgiveness, Difficulty, Gratitude, Protection |

**Dua Card Format:**
- Arabic text (large, RTL, serif font)
- Transliteration (italicized)
- English translation
- Authentic reference (Quran/Hadith source)
- Copy button (copies full formatted text to clipboard)
- Responsive grid layout (1 column mobile, 2 columns desktop)

### Key Components

**Pages:**
- `/app/zikr/page.tsx` - Main zikr page with counter and dua library

**Hooks:**
- `/hooks/useZikr.ts` - State management, Fajr reset logic, feedback integration

**Utilities:**
- `/lib/zikr.ts` - LocalStorage operations, audio/haptic functions, reset logic
- `/lib/duas.ts` - Static dua data array with helper functions

**Types:**
- `/types/zikr.types.ts` - TypeScript interfaces (ZikrPhrase, ZikrState, Dua, ZikrFeedbackPreferences)

**Components:**
- `/components/zikr/ZikrCounter.tsx` - Circular counter with tap area, progress ring
- `/components/zikr/ZikrPhraseSelector.tsx` - Phrase dropdown, target settings panel
- `/components/zikr/DuaCard.tsx` - Single dua display with copy functionality
- `/components/zikr/DuaList.tsx` - Categorized grid of all duas
- `/components/dashboard/ZikrCard.tsx` - Dashboard summary card

### UI

**Dashboard Card:**
- Current phrase name (transliteration)
- Count display with target (e.g., "23 / 33" or "15 ∞")
- Progress bar (if target set)
- Arabic text of current phrase
- English meaning
- Color-coded: green when goal reached, primary otherwise
- Click navigates to `/zikr` page

**Full Page (`/zikr`):**
- **Header**: Back button, page title, AuthButton
- **Counter Section** (hero):
  - Arabic phrase with transliteration and meaning
  - Large circular counter (280x280px SVG)
  - Progress ring (only visible if target set)
  - Count display (center of circle)
  - Target display below count
  - Goal reached message (green, animated)
  - Tap prompt on hover
- **Phrase Selector**:
  - Dropdown with all 5 phrases
  - Target settings toggle button
  - Expandable panel: Default target, Free count, Custom target input
- **Controls Card**:
  - Reset counter button (disabled when count = 0)
  - Audio feedback toggle (with Volume icon)
  - Haptic feedback toggle (with Smartphone icon)
- **Fajr Reset Info Card**:
  - Moon emoji
  - "Daily Reset at Fajr" heading
  - Explanation of Islamic day boundary
  - Muted background color
- **Duas Section**:
  - Section header with count
  - Categorized display (8 categories)
  - Responsive grid layout

### Progress Display Logic
```typescript
if (hasTarget) {
  // Show "23/33" and circular progress ring
  progress = (count / target) * 100
  color = isGoalReached ? 'green' : 'primary'
} else {
  // Show "23 ∞" with infinity symbol
  // No progress ring
}
```

### Fajr Reset Logic
```typescript
shouldReset = (currentTime > todaysFajr) && (lastResetDate < today)

// Edge cases handled:
// - User opens app before Fajr: counter persists
// - User opens app after Fajr: counter resets
// - Fajr time unavailable: fallback to midnight reset
// - Timezone changes: uses browser timezone
```

### Performance & Accessibility
- **Offline-first**: Fully functional without network
- **Instant feedback**: Audio/haptic within 10ms
- **Persistent state**: Auto-saves on every increment
- **Accessibility**:
  - ARIA labels on counter button
  - Keyboard navigation support
  - Screen reader friendly
  - High contrast progress indicators
- **Mobile optimized**:
  - Large tap target (280x280px)
  - Touch-friendly controls
  - Active state animations

### Error Handling
- LocalStorage write failures: Silent fail, continue operation
- Audio API unavailable: Skip audio feedback
- Vibration API unavailable: Skip haptic feedback
- Fajr time fetch failure: Fall back to midnight reset
- Invalid stored state: Reset to default

**V1 Status:** ✅ **Complete** (November 2024) - Tasbeeh counter (5 phrases), goal tracking, Fajr auto-reset, audio/haptic feedback, 20 duas (8 categories), dashboard integration, free count mode, custom targets

**Future Enhancements (V1.1+):**
- **V1.1:** Expanded dua library (50 → 100+ duas with new categories)
- **V1.2:** Expanded dhikr tracking (wird programs, Salawat, Istighfar counters)
- **V1.2:** Dua audio pronunciations
- **V1.2:** Dua search and filtering by category
- **V1.3:** Cloud sync for cross-device persistence (Supabase)
- **V1.3:** Streak tracking and achievements
- **V1.3:** Custom phrase creation
- **V2.0:** Notification reminders for daily zikr
- **V2.0:** Historical statistics (weekly/monthly trends)
- **V2.0:** Group zikr challenges (compete with friends/family)

---

## 8. Mosque Finder (`/places/mosques`)

### Functionality
Find and display nearby mosques with interactive map and list views.

### API
- **OpenStreetMap Overpass API** (free, no API key required)
  ```
  POST https://overpass-api.de/api/interpreter
  data=[out:json];node["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lng});out;
  ```
  
- **Response Structure:**
  ```json
  {
    "elements": [
      {
        "type": "node",
        "id": 2809904792,
        "lat": 40.8750571,
        "lon": -73.8801588,
        "tags": {
          "name": "North Bronx Islamic Center",
          "addr:street": "East 206th Street",
          "addr:housenumber": "216",
          "addr:city": "Bronx",
          "addr:state": "NY",
          "addr:postcode": "10467",
          "phone": "+1-xxx-xxx-xxxx",
          "website": "https://example.com",
          "opening_hours": "Mo-Su 05:00-22:00"
        }
      }
    ]
  }
  ```

### Features (V1 - Implemented)
**Dashboard Card:**
- Displays nearest mosque with name, distance, and address snippet
- Quick "Get Directions" button opens native maps app
- "View All" button navigates to full mosque finder page

**Dedicated Page (`/places/mosques`):**
- **Location Search:** Nominatim autocomplete search with 5 suggestions as user types
- **Current Location:** Button to use browser geolocation
- **Search Radius:** Adjustable selector (1, 2, 3, 5, 10 miles) - default 3 miles
- **Distance Units:** Toggle between miles (default) and kilometers - persists to localStorage + profile
- **List View:** Scrollable cards showing:
  - Mosque name (with fallback for unnamed mosques: "Mosque near [street]")
  - Distance (in user's preferred unit)
  - Full address (if available)
  - Phone number (if available)
  - Website link (if available)
  - "Get Directions" button
- **Map View:** Interactive MapLibre map with:
  - OpenStreetMap tiles (free)
  - Mosque markers (green pins with hover tooltips)
  - User location marker (blue)
  - Auto-zoom to fit all results
  - Click marker or list item to open detail dialog
- **Detail Dialog:** Full mosque information with:
  - Name and distance
  - Complete address with copy button
  - Coordinates
  - Additional info: phone, website, hours, wheelchair access, denomination
  - "Get Directions" button (platform-aware: Apple Maps for iOS, Google Maps for others)

### Data Flow
1. User's location retrieved from profile → localStorage → browser geolocation
2. Search parameters (lat, lng, radius in meters) sent to `/api/mosques`
3. API route queries Overpass API for mosques within radius
4. Results parsed, distances calculated using Haversine formula (in km)
5. Mosques sorted by distance (nearest first)
6. Client displays distances in user's preferred unit (mi/km)

### Distance Calculation
- **Haversine formula** for accurate Earth-surface distances
- Internal storage: kilometers (matches API standard)
- Display: user's preference (miles default, kilometers optional)
- Conversion: 1 mile = 1.60934 km

### Geocoding
- **Nominatim API** for location search (free OpenStreetMap service)
- Autocomplete with 500ms debounce
- Returns up to 5 suggestions with display names
- Fallback: Simple search using first result

### Navigation Integration
- Platform detection via user agent
- iOS Safari: `maps://?daddr={lat},{lng}&q={name}` (opens Apple Maps)
- Android/Desktop: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` (opens Google Maps)
- Opens in new tab or triggers native app

### Fallback Handling
- Missing mosque names: Generated from address ("Mosque near East 189th Street")
- Incomplete addresses: Display available components only
- No location permission: Prompt user to search manually
- No results: Suggest increasing radius or changing location

**V1 Status:** ✅ **Complete** (November 2024) - OpenStreetMap integration, interactive map (MapLibre GL), list view with distance sorting, location search (Nominatim), distance unit toggle (mi/km), directions (platform-aware), detail dialog with full info

**Future Enhancements (V1.1+):**
- **V1.1:** Save favorite mosques (Supabase favorites table)
- **V1.1:** Prayer time integration (show next prayer time for each mosque)
- **V1.3:** User reviews and ratings (facilities, cleanliness, programs)
- **V1.3:** Photo uploads (community contributions)
- **V1.3:** Facility filters (wheelchair access, parking, women's section)
- **V2.0:** Operating hours filter
- **V2.0:** Call directly from app (tel: links)

---

## 9. Halal Food Finder (`/places/food`)

### Functionality
Find and display halal restaurants and food places with interactive map and list views using comprehensive search strategies.

### API
- **Geoapify Places API** with THREE parallel search strategies for maximum coverage:
  1. **Strict Name Search:** `name=halal` + `categories=catering.restaurant,catering.fast_food`
  2. **Halal Category:** `categories=halal` (explicit halal categorization)
  3. **Cuisine-Based:** Traditional halal cuisines (Pakistani, Turkish, Lebanese, Syrian, Arab, Kebab)
  
  ```
  GET https://api.geoapify.com/v2/places?
    categories={categories}&
    filter=circle:{lng},{lat},{radiusMeters}&
    bias=proximity:{lng},{lat}&
    limit=100&
    apiKey={GEOAPIFY_API_KEY}
  ```
  
- **Response Structure:**
  ```json
  {
    "type": "FeatureCollection",
    "features": [{
      "properties": {
        "name": "Azal Restaurant & Halal",
        "lat": 40.8454573,
        "lon": -73.8658065,
        "formatted": "...",
        "categories": ["catering", "catering.restaurant", "halal"],
        "catering": {
          "cuisine": "middle_eastern",
          "diet": { "halal": true }
        },
        "contact": { "phone": "+1-xxx-xxx-xxxx" },
        "opening_hours": "Mo-Su 12:00-23:00",
        "facilities": { "takeaway": true, "delivery": true },
        "distance": 3413,
        "place_id": "..."
      }
    }]
  }
  ```

### Features (V1 - Implemented)

**Dashboard Card:**
- Displays nearest halal food place with name, distance, and cuisine
- Quick "Get Directions" button opens native maps app
- "View All" button navigates to full food finder page
- Loading and error states handled gracefully

**Dedicated Page (`/places/food`):**
- **Location Search:** Nominatim autocomplete search with 5 suggestions
- **Current Location:** Button to use browser geolocation
- **Search Radius:** Adjustable selector (1, 2, 3, 5, 10 miles) - default 3 miles
- **Distance Units:** Toggle between miles and kilometers - persists to localStorage + profile
- **List View:** Scrollable cards showing:
  - Restaurant name (with cuisine-based fallback for unnamed places)
  - Distance (in user's preferred unit)
  - Cuisine type (e.g., Pakistani, Turkish, Middle Eastern)
  - Full address (if available)
  - Phone number (if available)
  - Website link (if available)
  - Facility badges (Takeaway, Delivery, Wheelchair Accessible)
  - "Get Directions" button
- **Map View:** Interactive MapLibre map with:
  - OpenStreetMap tiles (free)
  - Food place markers (orange pins with hover tooltips)
  - User location marker (blue)
  - Auto-zoom to fit all results
  - Click marker or list item to open detail dialog
- **Detail Dialog:** Full restaurant information with:
  - Name and distance
  - Cuisine type
  - Halal certification indicator (if explicitly marked)
  - Categories (displayed as badges)
  - Complete address
  - Opening hours (if available)
  - Contact information (phone, website)
  - Facility information (takeaway, delivery, wheelchair access)
  - "Get Directions" and "Call" buttons

### Data Flow
1. User's location retrieved from profile → localStorage → browser geolocation
2. Search parameters (lat, lng, radius in meters) sent to `/api/food`
3. API route makes sequential Geoapify API calls (conserves quota):
   - First: Strict name search
   - Second (if needed): Category search
   - Third (if needed): Cuisine search
4. Results merged and deduplicated by `place_id`
5. Distances calculated using Haversine formula (in km)
6. Food places sorted by distance (nearest first)
7. Client displays distances in user's preferred unit (mi/km)

### Sequential Search Strategy
**Smart API quota management:**
- **Primary:** Strict name search (`name=halal`) - most specific results
- **Fallback 1:** Category search (`categories=halal`) - only if < 5 results
- **Fallback 2:** Cuisine search (Pakistani, Turkish, Lebanese, etc.) - only if still < 5 results
- Sequential approach conserves API quota by avoiding unnecessary calls
- Results are deduplicated when multiple strategies are used

### Retry Logic & Timeout Management
- Each API call retries 2-3 times with exponential backoff (1s, 2s delays)
- Dynamic timeout based on search radius:
  - Small radius (< 3 mi): 15-20 seconds
  - Medium radius (3-6 mi): 20-30 seconds
  - Large radius (> 6 mi): 30-45 seconds (capped)
- Result limits scaled by radius to prevent timeouts:
  - Small radius: 50 results per strategy
  - Medium radius: 30 results per strategy
  - Large radius: 20 results per strategy
- Continues with partial results if some strategies fail
- User-friendly error messages for rate limits/overload

### Data Parsing
- Extracts cuisine from `catering.cuisine` or `datasource.raw.cuisine`
- Diet information from `catering.diet.halal` or `datasource.raw['diet:halal']`
- Contact info from `contact` or `datasource.raw` (phone, website)
- Facilities from `facilities` or `datasource.raw` (wheelchair, takeaway, delivery)
- Opening hours from `opening_hours` or `datasource.raw.opening_hours`

### Distance Calculation
- Haversine formula for accurate Earth-surface distances
- Internal storage: kilometers (from Geoapify `distance` field or calculated)
- Display: user's preference (miles default, kilometers optional)
- Conversion: 1 mile = 1.60934 km

### Navigation Integration
- Platform detection via user agent
- iOS Safari: Opens Apple Maps with destination
- Android/Desktop: Opens Google Maps with directions
- Direct phone call links for contact numbers

### Fallback Handling
- Missing names: Generated from cuisine or location ("Turkish Restaurant", "Restaurant on Main St")
- Incomplete data: Display only available fields
- No location permission: Prompt user to search manually
- No results: Suggest increasing radius or changing location
- API failures: Continue with results from successful strategies

### Data Source Attribution
- Powered by Geoapify and OpenStreetMap
- Disclaimer about verifying halal certification with establishment
- Transparent about search methodology (name + category + cuisine based)

**V1 Status:** ✅ **Complete** (November 2024) - Geoapify integration, triple search strategy (sequential for quota conservation), interactive map (MapLibre GL), list view with distance sorting, location search, distance unit toggle (mi/km), directions, cuisine display, facility badges

**Future Enhancements (V1.1+):**
- **V1.1:** Save favorite restaurants (Supabase favorites table)
- **V1.3:** User reviews and ratings (food quality, halal certification verification)
- **V1.3:** Photo uploads (food, restaurant interior)
- **V1.3:** Dietary filters (vegan, gluten-free, nut-free)
- **V1.3:** Price range filtering
- **V1.3:** Cuisine filters (Pakistani, Turkish, Lebanese, etc.)
- **V2.0:** Operating hours filter (open now, closes soon)
- **V2.0:** Delivery/takeout availability
- **V2.0:** Call/order directly from app

---

## 10. Settings (Profile Page `/profile`)

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

**V1 Status:** ✅ **Complete** (November 2024) - Display name, email (read-only), theme toggle (in header), location preferences (lat/lng/city), calculation method, madhab, Quran translation, hadith language, distance unit

**Future Enhancements (V1.1+):**
- **V1.1:** Profile picture upload (Supabase Storage)
- **V1.2:** Hijri offset manual adjustment
- **V1.3:** Multi-language interface (Arabic, Urdu)
- **V1.3:** Notification preferences (granular control for prayer times, Quran, charity)
- **V1.3:** Custom themes (Ramadan night, neutral, modern)
- **V2.0:** Goal tracking (spiritual goals, habit formation)
- **V2.0:** Customizable dashboard (widget system)

---

## 11. Common Design & Interaction Standards

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

## 12. About & Acknowledgements (`/about`)

### Functionality
Information about the app creator, app mission, and acknowledgements for open-source libraries and APIs used.

### Access
- **Footer links:** Available on all pages via footer navigation
- **Direct URL:** `/about` with tab parameter support (`/about?tab=acknowledgements`)

### Page Structure
Single page with three tabs using shadcn/ui Tabs component:
1. **Creator Tab** - Information about Abir Hossain
2. **About App Tab** - App mission, features, technology stack, privacy principles
3. **Acknowledgements Tab** - APIs, open-source libraries, disclaimers

### Creator Tab
- **Profile image:** Circular 120px image from `/public/creator-profile.jpg`
- **Contact info:** 
  - LinkedIn: https://www.linkedin.com/in/abir-hossain-0b6a4ab3/
  - Email: abirh@alumni.upenn.edu (with copy-to-clipboard)
- **Education:** UPenn MSE in Computer Science, BSE in Computer Engineering (2025)
- **Professional:** Developer I at FTI Consulting - Data & Analytics Software Solutions
- **Bio:** Highlights passion for Islam and software development
- **Notable Projects:**
  - Langmates: AI-powered K-12 language learning platform (Norman Gross Award winner)
  - BlissAlarm: IoT device for Islamic prayer time notifications

### About App Tab
- **Mission statement:** Help Muslims maintain daily worship routines
- **Key features overview:** Prayer times, Ramadan countdown, Quran/Hadith, charity tracker, zikr counter, places finder
- **Technology stack:** Next.js 16, React 19, TypeScript, TailwindCSS, Supabase, MapLibre GL
- **Privacy principles:** 
  - Secure storage with Supabase RLS
  - Most features work without auth
  - Local storage for location data
  - No tracking, ads, or third-party analytics
- **Future roadmap:** Prayer notifications, Quran audio, advanced zikr tracking, community features

### Acknowledgements Tab

**APIs & Data Sources:**
- **AlAdhan API** - Prayer times, Hijri calendar, Qibla
  - Warning: Community-driven, accuracy varies by region
- **AlQuran Cloud API** - Quran content and translations
  - Warning: Translations are interpretations, consult scholars
- **HadithAPI.com** - Hadith collections (Sahih Bukhari & Sahih Muslim)
  - Warning: Check authentication grades and chains
- **OpenStreetMap Overpass API** - Mosque locations
  - Warning: Community-contributed, may be incomplete/outdated
- **Nominatim** - Geocoding services
  - Warning: Volunteer-run with rate limits

**Open Source Libraries:**
- Next.js (Vercel) - MIT License
- React (Meta) - MIT License
- Supabase - Apache 2.0 License
- TailwindCSS - MIT License
- shadcn/ui (Radix UI) - MIT License
- MapLibre GL - BSD 3-Clause License
- Recharts - MIT License
- Lucide Icons - ISC License

**Disclaimers:**
- Prayer times are calculated mathematically—verify with local mosque
- Religious content translations require scholarly consultation for detailed understanding
- Location data is community-contributed—verify before visiting
- App provided as-is for informational purposes

### UI Components
- **Footer component:** `src/components/Footer.tsx`
  - Links to "About" and "Acknowledgements" (tab navigation)
  - Copyright notice with current year
  - Positioned after page content in root layout
  - Minimal styling with border-top and muted text
- **About page:** `src/app/about/page.tsx`
  - Tabs for navigation between sections
  - URL search param handling for direct tab navigation
  - Consistent header with back button
  - Card-based layout for content sections
  - Copy-to-clipboard for contact info
  - Responsive design for mobile/desktop

### Design Pattern
- **Tab navigation:** URL-synced with search params (`?tab=creator`, `?tab=app`, `?tab=acknowledgements`)
- **Default tab:** Creator tab when no param specified
- **Footer placement:** Global in root layout, appears on all pages
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation
- **Mobile-responsive:** Tabs stack vertically on small screens

**V1 Status:** ✅ **Complete** (November 2024) - Creator tab (profile, contact, education, projects), About App tab (mission, features, tech stack, privacy), Acknowledgements tab (APIs, libraries, disclaimers), tab navigation, copy-to-clipboard

**Future Enhancements (V1.1+):**
- **V1.2:** Changelog section (version history with dates)
- **V1.3:** Contribution guide (how to contribute code, translations, content)
- **V2.0:** Support section (FAQs, troubleshooting, community support)

---

## 13. User Feedback System

### Purpose
Allow users to report problems and suggest improvements directly from any page in the app. Supports anonymous feedback to reduce friction while optionally attaching user ID for authenticated users.

### Functionality
- **Universal availability:** Feedback button appears at bottom of every page
- **Two feedback types:** 
  - Report a Problem (bug reports, issues, errors)
  - Suggest an Improvement (feature requests, enhancements)
- **Anonymous by default:** No authentication required to submit feedback
- **Optional user ID:** If authenticated, automatically attaches user ID for follow-up
- **Simple validation:** Minimum 10 characters, maximum 5000 characters
- **Success confirmation:** Visual feedback on successful submission

### User Flow
1. User scrolls to bottom of any page and clicks "Feedback" button
2. Dialog opens with radio selection (Problem / Suggestion)
3. User selects feedback type (defaults to "Report a Problem")
4. User enters feedback text in textarea (validated for 10+ characters)
5. User clicks "Submit Feedback" button
6. System saves to Supabase `feedback` table with page path, type, content
7. Success message displays with checkmark icon
8. Dialog auto-closes after 2 seconds
9. Form resets for next use

### Data Model

**Table: `feedback`**
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  page_path TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('problem', 'suggestion')),
  content TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent TEXT,
  metadata JSONB
);
```

**Indexes:**
- `idx_feedback_created_at` - Query by submission date
- `idx_feedback_type` - Filter by problem vs suggestion
- `idx_feedback_page_path` - Group by page

**RLS Policies:**
- `INSERT`: Anyone (anonymous or authenticated) can submit feedback
- `SELECT`: Only admins via service role (users cannot view feedback)

### UI Components

**`FeedbackButton` component** (`src/components/FeedbackButton.tsx`)
- Props: `pagePath` (string) - current page route
- Renders centered button at bottom of page with border-top separator
- Opens dialog on click with feedback form
- Handles form state, validation, submission, success/error states
- Resets form on close

**UI Elements:**
- Button: "Feedback" with MessageSquare icon
- Dialog with radio group for feedback type selection
- Textarea for feedback content (120px min-height, resize disabled)
- Character count reminder ("Minimum 10 characters")
- Privacy notice: "Your feedback is anonymous..."
- Submit button with loading state (Loader2 spinner)
- Success screen with CheckCircle icon

### Integration Pattern

**Each page includes:**
```tsx
import { FeedbackButton } from '@/components/FeedbackButton'

// At end of <main> section, before closing tag
<FeedbackButton pagePath="/current-page-path" />
```

**Integrated pages (10 total):**
1. Home (`/`)
2. About (`/about`)
3. Prayer Times (`/times`)
4. Quran & Hadith (`/quran-hadith`)
5. Charity Tracker (`/charity`)
6. Favorites (`/favorites`)
7. Zikr & Duas (`/zikr`)
8. Mosque Finder (`/places/mosques`)
9. Halal Food (`/places/food`)
10. Profile (`/profile`)

### Validation Rules
- **Content length:** 10-5000 characters
- **Type selection:** Required (defaults to 'problem')
- **Submission throttling:** None (allow multiple submissions)
- **No spam protection:** V1 relies on Supabase rate limiting

### Privacy & Security
- **Anonymous submissions allowed:** Reduces friction for feedback
- **No PII collected:** Only optional user_id if authenticated
- **User-agent stored:** For troubleshooting (browser/device context)
- **Admin-only access:** Users cannot view other feedback
- **No email notifications:** V1 - admins check dashboard manually

### Error Handling
- **Validation errors:** Display below textarea in red
- **Submission errors:** Display in error card with retry option
- **Network errors:** Generic error message ("Please try again")
- **Success timeout:** Auto-close after 2 seconds
- **Form persistence:** Errors keep form content for retry

### Technical Implementation

**Files created:**
- `src/types/feedback.types.ts` - TypeScript interfaces
- `src/lib/feedback.ts` - Submission utility functions
- `src/components/ui/radio-group.tsx` - Radio UI component (shadcn/ui)
- `src/components/FeedbackButton.tsx` - Main feedback component

**Files modified:**
- `supabase-migrations.sql` - Added feedback table and RLS policies
- All 10 page components - Added FeedbackButton integration

**Dependencies:**
- `@radix-ui/react-radio-group` - Radio button primitive
- Existing: Dialog, Button, Lucide icons

### Admin Access Pattern
Admins access feedback via Supabase dashboard:
1. Log into Supabase project dashboard
2. Navigate to Table Editor → `feedback` table
3. Query/filter by `page_path`, `feedback_type`, `created_at`
4. Export as CSV for analysis if needed

**V1 Status:** ✅ **Complete** (November 2024) - Anonymous feedback submission (all 10 pages), problem/suggestion type selection, character validation (10-5000), user-agent tracking, optional user_id attachment, success confirmation

**Future Enhancements (V1.1+):**
- **V1.3:** Email notifications to admins on new feedback
- **V2.0:** Sentiment analysis (positive/negative/neutral classification)
- **V2.0:** Spam protection (rate limiting, content filtering)
- **V2.0:** Feedback trends (most reported pages, common issues)
- **V2.0:** Attachments/screenshots for bug reports

---

## 14. Admin Dashboard

### Purpose
Admin-only dashboard for managing user feedback, monitoring system health, and viewing analytics.

### Access Control
- **Admin detection:** `is_admin` boolean field in `profiles` table
- **Initial admin:** Set via SQL: `UPDATE profiles SET is_admin = TRUE WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com')`
- **Route protection:** `/admin` page wrapped in `ProtectedAdmin` component
- **RLS enforcement:** Admin-only RLS policies on feedback table

### Dashboard Integration

**AdminCard Component** (`/src/components/dashboard/AdminCard.tsx`)
- **Visibility:** Only appears for admin users (`is_admin = true`)
- **Location:** Main dashboard grid, below existing feature cards
- **Displays:**
  - Issues need review count (status = 'new')
  - Total users count
  - Feedback health percentage (% reviewed)
- **Action:** Clickable card navigates to `/admin`

### Admin Dashboard Page (`/admin`)

**Layout:**
- Protected route requiring admin access
- Header with Shield icon and description
- Tabs: "Feedback Management" | "Analytics"

**Tab 1: Feedback Management**

**Components:**
- `FeedbackFilters` - Filter controls with active filter count
- `FeedbackTable` - Feedback items with inline editing

**Filters:**
- Status: All, New, Reviewed, Resolved
- Priority: All, Low, Medium, High
- Category: All, Bug, Feature Request, UI/UX, Performance, Other
- Page: All pages + list of actual page paths
- Search: Content text search (client-side)

**Feedback Table:**
- **Compact row view:**
  - Expand/collapse toggle
  - Date/time submitted
  - Type badge (Problem/Suggestion with color coding)
  - Page path (code badge)
  - Content preview (truncated)
  - Status dropdown (inline edit)
  - Priority dropdown (inline edit)
  - Category dropdown (inline edit)
  
- **Expanded row details:**
  - Full content text
  - Metadata: User ID (truncated), User agent (truncated)
  - Admin notes textarea with Save/Cancel buttons
  - Review tracking: "Reviewed on [date] by [admin_id]"

**Inline Editing:**
- Status change auto-sets `reviewed_at` and `reviewed_by`
- Priority and category update immediately
- Admin notes require explicit Save button
- All updates show loading state
- Errors display as alert dialogs

**Tab 2: Analytics**

**Metric Cards:**
1. **Total Users:** Count from profiles table
2. **Total Feedback:** All submissions count
3. **Unresolved Issues:** Count where status = 'new'
4. **Reviewed Percentage:** (reviewed + resolved) / total * 100

**Future Expansion Note:**
Card displaying planned analytics features:
- Feature usage stats (prayer times, donations, favorites)
- User engagement metrics (DAU, WAU, retention)
- Geographic distribution
- API performance monitoring
- Feedback trends and sentiment analysis

### Feedback Workflow

**User submission → Admin review → Resolution:**

1. **New feedback arrives:**
   - status = 'new'
   - priority = 'medium'
   - category = null
   - admin_notes = null

2. **Admin reviews:**
   - Views in Feedback Management tab
   - Filters by status = 'new' to see unreviewed items
   - Reads content and decides action

3. **Admin workflow actions:**
   - **Set priority:** High (urgent bugs), Medium (normal), Low (nice-to-have)
   - **Assign category:** Bug, Feature Request, UI/UX, Performance, Other
   - **Update status:** 
     - 'reviewed' = acknowledged, will address
     - 'resolved' = completed/fixed/implemented
   - **Add admin notes:** Internal tracking, related issues, implementation notes

4. **Tracking metadata:**
   - `reviewed_at`: Timestamp when status changed from 'new'
   - `reviewed_by`: Admin user ID who made the change

### Data Model Extensions

**profiles table:**
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
```

**feedback table:**
```sql
ALTER TABLE feedback ADD COLUMN status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved'));
ALTER TABLE feedback ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE feedback ADD COLUMN category TEXT;
ALTER TABLE feedback ADD COLUMN admin_notes TEXT;
ALTER TABLE feedback ADD COLUMN reviewed_at TIMESTAMPTZ;
ALTER TABLE feedback ADD COLUMN reviewed_by UUID REFERENCES profiles(id);

CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_priority ON feedback(priority);
CREATE INDEX idx_feedback_category ON feedback(category);
```

**RLS Policies:**
```sql
-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));

-- Admins can update feedback
CREATE POLICY "Admins can update feedback"
ON feedback FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE));
```

### Technical Implementation

**New files:**
- `src/hooks/useAdmin.ts` - Admin detection hook
- `src/hooks/useFeedback.ts` - Feedback CRUD operations
- `src/hooks/useAnalytics.ts` - Analytics data fetching
- `src/components/admin/ProtectedAdmin.tsx` - Route protection wrapper
- `src/components/admin/FeedbackTable.tsx` - Feedback display and editing
- `src/components/admin/FeedbackFilters.tsx` - Filter controls
- `src/components/admin/AnalyticsPanel.tsx` - Analytics metrics display
- `src/components/dashboard/AdminCard.tsx` - Dashboard quick access card
- `src/app/admin/page.tsx` - Admin dashboard page

**Modified files:**
- `src/types/auth.types.ts` - Added is_admin to Profile interface
- `src/types/feedback.types.ts` - Extended with workflow fields, filters, stats
- `src/app/page.tsx` - Added AdminCard to dashboard
- `supabase-migrations.sql` - Added admin system migrations
- `docs/data-model.md` - Updated profiles and feedback table documentation

**Dependencies:**
- All existing shadcn/ui components (Card, Button, Select, Input, Tabs, Dialog)
- Existing hooks (useAuth, Supabase client)
- Lucide icons (Shield, Filter, ChevronDown/Up, Save, AlertCircle, MessageSquare, etc.)

### User Experience

**For Admin Users:**
1. See AdminCard on main dashboard with key metrics
2. Click AdminCard → Navigate to `/admin`
3. View Feedback Management tab by default
4. Filter feedback to find relevant items
5. Expand rows to read full content
6. Update status, priority, category inline
7. Add internal notes for tracking
8. Switch to Analytics tab to view system health
9. Monitor unresolved issues count daily

**For Non-Admin Users:**
- AdminCard never appears (returns null)
- `/admin` route shows 403 Access Denied page
- No feedback SELECT permission (RLS blocks all queries)
- Cannot see admin-only UI elements

### Error Handling

- **403 Access Denied:** Non-admin users redirected with clear message
- **RLS policy blocks:** Queries fail silently with no data returned
- **Update failures:** Alert dialog shows error message
- **Network errors:** Generic error handling with retry option
- **Loading states:** Spinners during async operations

### Security Considerations

- **RLS enforcement:** Database-level security, client cannot bypass
- **Admin flag in profiles:** Single source of truth for admin status
- **No client-side admin checks for security:** Only for UX (hiding UI)
- **Server-side validation:** All updates validated by RLS policies
- **Audit trail:** reviewed_by field tracks admin actions

**V1 Status:** ✅ **Complete** (November 2024) - Admin dashboard page, feedback management (filters, inline editing, status/priority/category), analytics panel (total users, feedback metrics), admin card on dashboard, RLS-enforced admin access, review tracking (reviewed_at, reviewed_by)

**Future Enhancements (V1.1+):**
- **V1.2:** Enhanced analytics (feature usage stats, user engagement metrics, geographic distribution)
- **V1.3:** Email notifications on new feedback (digest emails)
- **V2.0:** Bulk operations (bulk status updates, bulk categorization)
- **V2.0:** Feedback export to CSV
- **V2.0:** Multiple admin roles (super-admin/moderator/viewer with different permissions)
- **V2.0:** Audit log for admin actions (track who changed what and when)
- **V2.0:** Dashboard customization (rearrange widgets, choose metrics)

---

## 15. PWA Installation

### Purpose
Enable users to install Ramadan Companion as a progressive web app on their devices for native app experience with offline support.

### Implementation Status
✅ **Fully Implemented (V1.1)** - November 2024

### Functionality

**Core Features:**
- Installable on iOS (Safari 16.4+), Android (Chrome/Edge), and Desktop (Chrome/Edge/Brave)
- Works offline with intelligent service worker caching
- Smart install prompts that respect user engagement
- Platform-specific installation instructions
- Foundation ready for Web Push notifications (V1.2)

**User Experience:**
- Users can add app to home screen/app drawer
- Launches in standalone mode (no browser UI)
- Instant loading with cached content
- Seamless offline experience
- App shortcuts for quick access (Prayer Times, Quran, Zikr)

### Technical Implementation

**Web App Manifest (`/public/manifest.json`):**
```json
{
  "name": "Ramadan Companion",
  "short_name": "Ramadan",
  "display": "standalone",
  "background_color": "#f5f3f0",
  "theme_color": "#0f3d3e",
  "icons": [192x192, 512x512, maskable variants],
  "shortcuts": [Prayer Times, Quran & Hadith, Zikr Counter]
}
```

**Service Worker (`/public/sw.js`):**
- **Cache-First Strategy:** Static assets (JS, CSS, images) for instant loading
- **Network-First Strategy:** API routes and HTML pages for fresh content with offline fallback
- **Versioned Caches:** `static-v1`, `api-v1`, `pages-v1` for clean updates
- **Cached Resources:**
  - Critical pages: `/`, `/times`, `/quran-hadith`, `/zikr`, `/charity`, `/favorites`
  - API routes: `/api/prayertimes`, `/api/quran`, `/api/hadith`, `/api/hijri`, `/api/qibla`
  - Static assets: Manifest, icons, fonts, Next.js bundles

**Smart Install Prompt Component:**
- Detects `beforeinstallprompt` event (PWA installability)
- Tracks user engagement: page views (2+ visits) OR location enabled
- **Platform-specific banners:**
  - **Desktop/Android Chrome:** Standard install button with native prompt
  - **iOS Safari:** Manual installation instructions with link to detailed guide
  - **iOS Chrome/Firefox/Edge:** "Open in Safari" message with copy link button (iOS restricts PWA installation to Safari only)
- Dismissible banner with 7-day cooldown
- Triggers native platform install dialog
- Auto-hides when app is already installed (standalone mode detection)

**Install Instructions Page:**
- Comprehensive guide in `/about?tab=install`
- Platform-specific instructions: iOS Safari, Android Chrome, Desktop
- Benefits explanation (offline, faster, notifications coming soon)
- Troubleshooting section
- Visual indicators (icons) for each platform

### Data Flow

**Installation Triggers:**
1. App meets PWA criteria (manifest + HTTPS + service worker)
2. User visits 2+ times OR enables location (engagement indicator)
3. Not dismissed in last 7 days
4. Not already installed (standalone mode check)

**Installation Process:**
1. Browser fires `beforeinstallprompt` event
2. App stores event for later use
3. Smart prompt appears if engagement criteria met
4. User clicks "Install" → native dialog shown
5. User accepts → app added to home screen/app drawer
6. Future launches open in standalone mode

**Offline Behavior:**
1. Service worker intercepts network requests
2. Checks cache first for static assets (instant load)
3. Tries network for dynamic content (fresh data)
4. Falls back to cache if network unavailable (offline mode)
5. Prayer times work offline using local PrayTime calculation

### Browser Compatibility

| Platform | Support | Notes |
|----------|---------|-------|
| iOS Safari 16.4+ | ✅ Full | Must install via "Add to Home Screen" |
| Android Chrome | ✅ Full | Auto-prompt + manual install |
| Desktop Chrome/Edge | ✅ Full | Install icon in address bar |
| Other browsers | ⚠️ Partial | Graceful degradation, no install prompt |

### Storage & State

**LocalStorage Keys:**
- `installPromptDismissed` - Whether user dismissed prompt
- `installPromptDismissedAt` - Timestamp of dismissal (7-day cooldown)
- `pageViewCount` - Number of visits (engagement tracking)
- `locationEnabled` - Whether location was enabled (engagement indicator)

**Service Worker Scope:**
- Scope: `/` (entire app)
- Registration: On app load via `ServiceWorkerRegistration` component
- Updates: Automatic detection with user notification prompt

### Key Files

**Assets:**
- `public/manifest.json` - PWA manifest configuration
- `public/sw.js` - Service worker implementation (7KB)
- `public/icon-192.png` - Standard app icon
- `public/icon-512.png` - Large app icon
- `public/icon-192-maskable.png` - Android adaptive icon (safe zone)
- `public/icon-512-maskable.png` - Large maskable icon
- `public/apple-touch-icon.png` - iOS-specific icon (180x180)
- `public/favicon.ico` - Browser favicon

**Components:**
- `src/components/ServiceWorkerRegistration.tsx` - SW registration handler
- `src/components/InstallPrompt.tsx` - Smart install banner UI
- `src/types/pwa.types.ts` - TypeScript definitions

**Configuration:**
- `src/app/layout.tsx` - PWA metadata, theme colors, manifest link
- `next.config.ts` - Service worker headers, cache control

**Pages:**
- `/about?tab=install` - Installation guide with platform instructions

### Verification Checklist

**Lighthouse PWA Audit (should score ~100):**
- ✅ Web app manifest meets requirements
- ✅ Service worker registered
- ✅ HTTPS (via Vercel)
- ✅ Viewport meta tag configured
- ✅ Icons provided (all sizes)
- ✅ Theme color configured
- ✅ Display mode set to standalone

**Manual Testing:**
- ✅ Install prompt appears after 2+ visits
- ✅ iOS Safari: "Add to Home Screen" works
- ✅ Android Chrome: Install banner and manual install work
- ✅ Desktop: Install icon in address bar functional
- ✅ Offline mode: Critical pages load without network
- ✅ App shortcuts: Quick access links work
- ✅ Standalone mode: Opens without browser UI

### Future Enhancements (V1.2+)

**V1.2 - Web Push Notifications:**
- Prayer time notification scheduling
- User permission flow UI
- Notification preferences (which prayers to notify)
- Background sync for prayer time updates
- Notification action handlers (Open app, Dismiss, Snooze)

**V1.3 - Advanced PWA Features:**
- Background sync for offline data submission
- Periodic background sync for prayer time updates
- Share target API (share to app from other apps)
- File handling (import/export data)

**V2.0 - Native Capabilities:**
- Badging API (unread notification count)
- Contacts API (for community features)
- Native file system access
- Screen wake lock (for prayer times display)

### Performance Metrics

**Cache Efficiency:**
- Static assets: ~100% cache hit rate after first visit
- API responses: 70-80% cache hit rate (network-first with fallback)
- Critical pages: ~95% cache hit rate

**Installation Rates (Target):**
- 20-30% of engaged users (2+ visits)
- 40-50% when explicitly prompted

**Offline Usage:**
- Prayer times: 100% functional (local calculation)
- Zikr counter: 100% functional (localStorage)
- Cached content: Available for 7 days

**V1.1 Status:** ✅ **Complete** (November 2024) - Full PWA infrastructure, smart install prompts, offline caching, platform-specific guides, service worker foundation for notifications

---

## 16. API Reference Links

| Category | API | Documentation |
|-----------|-----|---------------|
| Prayer Times | AlAdhan Prayer Times API | https://aladhan.com/prayer-times-api |
| Qibla | AlAdhan Qibla API | https://aladhan.com/qibla-api#overview |
| Hijri Calendar | AlAdhan Islamic Calendar API | https://aladhan.com/islamic-calendar-api |
| Quran | AlQuran Cloud API | https://alquran.cloud/api |
| Hadith | HadithAPI.com | https://hadithapi.com/|
| Mosques | OpenStreetMap Overpass API | https://wiki.openstreetmap.org/wiki/Overpass_API |
| Halal Food | Geoapify Places API | https://www.geoapify.com/places-api |
| Geocoding | Nominatim API | https://nominatim.org/release-docs/latest/api/Overview/ |
| Supabase | Database & Auth | https://supabase.com/docs |




---

## Prayer Time Notifications (V1.2)

### Functionality
Enable users to receive browser notifications at exact prayer times with motivational reminders from authentic hadith. **Now powered by Web Push API for reliable background notifications.**

### Implementation Status
✅ **Fully Implemented (V1.2 - November 2024)** - **Web Push API Migration Complete**

### Features
- **✅ NEW: Web Push API** - Notifications work even when app is closed or backgrounded
- **✅ NEW: Backend scheduling** - Vercel cron job handles notification timing
- **✅ NEW: iOS support** - Background notifications now work on iOS Safari
- **🔐 Requires Authentication** - Users must be logged in to enable notifications (Web Push requires user ID)
- **Browser-based notifications** using Web Push API and Service Worker
- **Per-prayer control** - Enable/disable individual prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- **Master toggle** - Enable/disable all notifications at once
- **Motivational hadith quotes** - 10 curated quotes from Sahih collections
- **Push subscriptions** - Stored in Supabase for multi-device support
- **Multi-device independence** - Each device has separate subscription; enabling on phone doesn't affect desktop
- **Cross-device sync** - Preferences sync across devices; notifications only sent to devices with active subscriptions
- **Proper cleanup** - Disabling notifications removes subscription from both browser and database

### User Flow
1. **User must be logged in** (if not, shows "Sign In to Enable" prompt with link to `/profile`)
2. User navigates to `/times` page
3. Clicks "Enable Notifications" button in NotificationSettings card
4. Browser requests notification permission
5. On grant, Web Push subscription is created and saved to database
6. All 5 prayers are enabled by default
7. User can toggle individual prayers on/off
8. Notifications appear at exact prayer times with hadith quotes
9. Clicking notification opens `/times` page
10. Disabling notifications removes subscription from browser and database

### Technical Implementation

**Components:**
- `NotificationSettings` - Main UI component on `/times` page
- `useNotifications` - Hook for permission and preference management
- `notifications.ts` - Push subscription and browser API logic
- `prayerQuotes.ts` - Curated hadith quote collection
- Service Worker - Push and click event handlers

**API Routes (V1.2):**
- `/api/push/subscribe` - Save push subscription to database
- `/api/push/unsubscribe` - Remove push subscription from database
- `/api/push/schedule` - Cron job endpoint for sending notifications

**Database (V1.2):**
- `push_subscriptions` table - Stores Web Push subscriptions (endpoint, p256dh, auth keys)

**Notification Format:**
```
Title: "Time for Fajr Prayer - 5:30 AM"
Body: "Whoever prays Fajr is under Allah's protection - Sahih Muslim"
Icon: App icon (192x192)
Click Action: Opens /times page
```

**Hadith Quote Collection:**
- 10 authentic quotes from Sahih Bukhari, Sahih Muslim, and verified Sahih collections
- Prayer-specific quotes (Fajr virtue, Asr paradise, Isha congregation)
- General prayer importance quotes
- Proper source attribution included

**Scheduling Logic (V1.2 - Web Push API):**
- **Backend cron job** runs every 5 minutes via external cron service (see `docs/external-cron-setup.md`)
- **For each user with notifications enabled:**
  1. Detect user's timezone from their coordinates (using `geo-tz` library)
  2. Calculate today's prayer times in user's local timezone
  3. Get current time in user's timezone
  4. Check if current time is AT or AFTER any prayer time (within 5-minute window)
  5. If match found, fetch all active push subscriptions for that user
  6. Send push notification via Web Push API to each subscription
  7. Service Worker receives push and displays notification
- **Timezone Handling:**
  - Timezone automatically detected from user's lat/lng coordinates
  - Uses offline `geo-tz` library (no external API calls required)
  - Prayer times calculated in user's actual timezone (e.g., "America/New_York", "Asia/Dubai")
  - **Automatic travel adjustment:** If user travels to new timezone, next notification uses new timezone
  - No manual timezone configuration needed
- **Time Matching:**
  - 5-minute polling interval with 5-minute window AFTER prayer time
  - Notifications sent only AT or AFTER prayer time (never before)
  - Window matches cron interval to guarantee zero missed notifications
  - Worst case: prayer at 5:30:01, cron at 5:35 (needs 5-minute window to catch)
  - Example: Fajr at 5:30 AM EST → notification sent between 5:30-5:35 AM EST (not UTC)
- **Benefits:**
  - Works when app is closed or backgrounded (iOS, Android, Desktop)
  - No client-side setTimeout limitations
  - Location AND timezone updates automatically reflected in next polling cycle
  - Scalable for all users
  - Reliable delivery
  - Correct local times in notification messages

**Multi-Device Behavior:**
- **Each device is independent:** Enabling notifications on iPhone doesn't enable on Desktop
- **Database schema:** `UNIQUE(user_id, endpoint)` allows multiple subscriptions per user
- **Notification delivery:** Backend sends to ALL active subscriptions for a user
- **Example scenarios:**
  - iPhone enabled, Desktop never enabled → Only iPhone receives notifications ✅
  - iPhone enabled, Desktop enabled → Both receive notifications ✅
  - User disables on iPhone → Only Desktop continues receiving notifications ✅

**Subscription Cleanup (Bug Fix - Nov 2024):**
- **Critical fix:** Subscription endpoint captured BEFORE browser unsubscribe
- **Cleanup flow:** 
  1. Get subscription endpoint from browser
  2. Unsubscribe from browser push
  3. Delete subscription from database using saved endpoint
- **Previous bug:** Endpoint was captured AFTER unsubscribe, causing database orphans
- **Result:** No zombie subscriptions; backend doesn't waste resources on dead endpoints

**Preference Storage:**
```json
{
  "enabled": true,
  "prayers": {
    "Fajr": true,
    "Dhuhr": true,
    "Asr": false,
    "Maghrib": true,
    "Isha": true
  }
}
```

### UI Locations

**Primary:** `/times` page - NotificationSettings card in right sidebar
- Permission request button
- Master enable/disable toggle
- Individual prayer checkboxes with descriptions
- Status indicator (X prayers enabled)

**Secondary:** `/profile` page - Notification Preferences summary (read-only)
- Shows enabled/disabled status
- Lists enabled prayers with checkmarks
- "Manage" link to `/times` page
- Only visible if notifications are enabled

### Browser Compatibility
- ✅ Chrome/Edge (Desktop & Android) - **Full Web Push support**
- ✅ Safari (iOS 16.4+, macOS) - **✅ NEW: Background notifications work on iOS**
- ✅ Firefox (Desktop) - **Full Web Push support**
- ⚠️ iOS Chrome/Firefox - Must use Safari (iOS WebKit restriction)

### Permission States

**Not Logged In:**
- Shows "Sign In to Enable" prompt
- Explains authentication requirement for Web Push
- Links to `/profile` page for login

**Not Supported:**
- Shows compatibility message
- Suggests using Chrome, Edge, or Safari
- iOS users directed to Safari (only browser with Web Push support)

**Default (Not Requested):**
- Shows "Enable Notifications" button
- Explains feature benefits (background notifications, hadith quotes)

**Denied:**
- Shows instructions to re-enable in browser settings
- Step-by-step guide for unblocking
- Links to browser settings help

**Granted:**
- Shows full preferences UI
- Master toggle and individual prayer controls
- Status indicator showing enabled prayer count
- iOS tip about installing PWA to home screen

### Error Handling
- Graceful degradation when notification API unavailable
- Silent failure for optional browser features
- User-friendly error messages
- Permission denial handled with instructions

### Testing
- Comprehensive test suite for `useNotifications` hook
- Component tests for `NotificationSettings` UI
- Covers 12+ scenarios including:
  - Browser support detection
  - Permission flow (grant, deny, already granted)
  - Individual prayer toggles
  - Enable/disable all
  - Guest vs authenticated user storage
  - Error handling

**V1.1 Status:** ✅ **Complete** (November 2024)

**Future Enhancements (V1.2+):**
- **V1.2:** Reminder timing options (5/10/15 minutes before prayer)
- **V1.2:** Custom notification sounds
- **V1.2:** Snooze functionality
- **V1.3:** Notification history log
- **V2.0:** Advanced scheduling (weekday/weekend differences)
