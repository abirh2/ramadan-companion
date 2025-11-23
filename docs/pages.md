# Page & Data Requirements (V1.1 Complete)

**Last Updated:** November 2024  
**Status:** All pages fully implemented and deployed

**Note:** All pages include a Feedback button at the bottom for users to report problems or suggest improvements. Feedback is submitted anonymously to Supabase and optionally linked to user profile if authenticated.

---

## / (Dashboard)

**V1.0 Status:** ✅ **Complete**

**Cards and Data Sources:**
- **Ramadan Countdown** (Hero card): Hijri API + prayer times for iftar/suhoor
- **Next Prayer:** AlAdhan API + user preferences (calculation method, madhab, location)
- **Quran of the Day:** AlQuran Cloud API with weighted random selection
- **Hadith of the Day:** HadithAPI with weighted random selection
- **Charity Summary:** Supabase (This Ramadan + All Time totals)
- **Zikr Summary:** localStorage (current phrase, count, progress)
- **Places:** Mosque + Halal Food tabs with live data from APIs
- **Admin Card:** Only visible to admin users (feedback metrics, user count)

**Future Enhancements (V1.1+):**
- **V1.1:** Interactive widgets (drag to reorder)
- **V1.1:** Customizable card visibility (hide/show cards)
- **V2.0:** Widget system (choose which cards to display)
- **V2.0:** Community feed widget

---

## /times (Prayer Times & Qibla)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Daily prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)
- Live next prayer countdown (updates every second)
- Qibla compass with bearing and compass direction
- 7 calculation methods (Umm al-Qura, ISNA, MWL, Egyptian, Karachi, Tehran, Jafari)
- Madhab support (Shafi/Maliki/Hanbali, Hanafi)
- Location management (search cities, use current location, manual coordinates)
- Automatic fallback to local calculation (PrayTime library)
- Browser timezone auto-detection

**Data Sources:**
- AlAdhan API (primary) + PrayTime library (fallback)
- Nominatim API for city search
- Supabase profile for preferences storage
- localStorage for guest user preferences

**Future Enhancements (V1.1+):**
- **V1.1:** Prayer time notifications (Web Push API)
- **V1.1:** Prayer tracking (mark completed, daily progress)
- **V1.2:** Monthly/weekly calendar view
- **V1.3:** Phone compass (DeviceOrientationEvent)
- **V1.3:** Advanced settings (high latitude methods, manual time tuning)

---

## /charity (Charity & Zakat Tracker)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Full CRUD for donations (create, read, update, delete)
- Monthly tracking with two view modes (calendar grid, list accordion)
- View toggle with localStorage persistence
- Summary totals (This Ramadan, This Year, All Time)
- Interactive charts (line, bar, pie)
- Zakat calculator with auto-populate
- Type categorization (zakat, sadaqah, other)
- Optional metadata (charity name, URL, category, notes)
- Auth-protected (ProtectedFeature wrapper)
- RLS enforcement (users see only their own data)

**Data Sources:**
- Supabase (donations table)
- Recharts for visualizations
- LocalStorage for view preference

**Future Enhancements (V1.1+):**
- **V1.1:** Recurring donation tracking
- **V1.1:** Multi-currency support with conversion
- **V1.1:** CSV export for taxes
- **V1.1:** Enhanced insights (trends, patterns)
- **V1.3:** Email receipts
- **V1.3:** Tax year summaries
- **V2.0:** Charity recommendations database
- **V2.0:** Fundraising campaigns

---

## /quran-hadith (Daily Quran & Hadith)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Daily Quran ayah (weighted random selection, same globally)
- 4 translation options (Asad, Sahih International, Pickthall, Yusuf Ali)
- Daily hadith (Sahih Bukhari + Muslim, weighted selection)
- 3 language options for hadith (English, Urdu, Arabic)
- Favorites system (auth-protected)
- Translation/language preference storage (dual-storage pattern)
- Share functionality (copy formatted text to clipboard)
- Surah metadata display
- Hadith grading with color-coded badges
- Copy buttons for Arabic and translation text separately

**Data Sources:**
- AlQuran Cloud API (Quran)
- HadithAPI (Hadith)
- Supabase (favorites table, profile preferences)
- localStorage (guest preferences)

**Future Enhancements (V1.1+):**
- **V1.2:** Notes on favorites
- **V1.2:** Reading progress tracking
- **V2.0:** Word-by-word translation

---

## /quran (Quran Browser)

**V1.1 Status:** ✅ **Complete**

**Features:**
- Browse all 114 surahs with search functionality
- Tabbed navigation (By Surah / By Juz)
- Multiple view modes (List / Grid)
- Full surah reading with Arabic + translation
- 4 translation options (Asad, Sahih International, Pickthall, Yusuf Ali)
- Per-ayah bookmarks (one per surah)
- Audio recitation with 6 verified reciters
- Tafsir (commentary) with 20+ sources
- Copy, favorite, share per ayah
- Ayah range lookup (jump to specific ayah)
- "Go to Bookmark" button for saved positions
- Bookmark indicators on main page

**Data Sources:**
- AlQuran Cloud API (surah content, audio)
- Quran.com API (tafsir)
- Supabase (quran_bookmarks table, profile preferences)
- localStorage (guest bookmarks, preferences)

**Pages:**
- `/quran` - Main browser with surah/juz selection
- `/quran/[surahNumber]` - Individual surah reading page

**Future Enhancements (V1.3+):**
- **V1.3:** Reading progress statistics
- **V1.3:** Continuous surah playback
- **V1.3:** Tafsir preference persistence
- **V2.0:** Word-by-word translation
- **V2.0:** Offline mode

---

## /hadith (Hadith Browser)

**V1.2 Status:** ✅ **Complete**

**Features:**
- Browse 7 major hadith collections (Kutub al-Sittah + Mishkat)
- Hierarchical navigation (Books → Chapters → Hadiths)
- Search functionality at each level
- Bilingual support (English / Urdu translations)
- Arabic text always displayed
- Grading badges (Sahih/Hasan/Da'eef with color coding)
- **Clickable grading badges** open dialog with detailed explanations
- **Info icon** near language selector for quick grading reference
- **Chapter titles** in breadcrumb (not just "Chapter N")
- Copy buttons (separate for Arabic and translation)
- Favorites integration
- Load More pagination (5 hadiths per load)
- Return to Top button
- Source attribution with numbering disclaimer

**Data Sources:**
- HadithAPI (books, chapters, hadiths)
- Supabase (favorites table with hadith items)
- localStorage (language preference for guests)

**Available Collections:**
1. Sahih Bukhari
2. Sahih Muslim
3. Jami' Al-Tirmidhi
4. Sunan Abu Dawood
5. Sunan Ibn-e-Majah
6. Sunan An-Nasa'i
7. Mishkat Al-Masabih

**Note:** Musnad Ahmad and Al-Silsila Sahiha are excluded because HadithAPI has chapter metadata but no actual hadith content (hadiths_count: 0). Collections are filtered at the API level to show only those with content.

**Pages:**
- `/hadith` - Main browser with collections list
- `/hadith/[bookSlug]` - Chapters list for a collection
- `/hadith/[bookSlug]/[chapterNumber]` - Hadiths list for a chapter

**Future Enhancements (V1.3+):**
- **V1.3:** Search within hadith text
- **V1.3:** Hadith by topic navigation
- **V1.3:** Bookmark system for hadiths
- **V1.3:** Cross-reference related hadiths
- **V2.0:** Offline mode

---

## /favorites (Saved Content)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Auth-protected page (requires sign-in)
- Tabbed interface (Quran / Hadith tabs)
- Quran favorites list with full ayah text
- Hadith favorites list with full hadith text
- Copy buttons for Arabic and translation/English separately
- Share buttons per item
- Remove from favorites buttons
- Empty states with CTAs
- Count badges showing totals
- Error handling with retry

**Data Sources:**
- Supabase (favorites table)
- Auth context for user authentication

**Future Enhancements (V1.1+):**
- **V1.2:** Category filters
- **V1.2:** Notes on favorites (personal reflections)
- **V1.2:** Export to PDF/JSON
- **V2.0:** Search within favorites
- **V2.0:** Sort options (date, surah, collection)

---

## /zikr (Zikr & Duas)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Tasbeeh counter with 5 standard phrases
- Goal tracking (default targets, custom targets, free count)
- Fajr auto-reset (Islamic day boundary)
- Audio and haptic feedback (toggleable)
- Circular progress ring visualization
- 20 duas across 8 categories
- Dua cards with Arabic, transliteration, translation
- Copy functionality for duas
- State persistence (localStorage)
- Offline-capable (no network required)

**Data Sources:**
- localStorage (zikr_state, feedback preferences)
- Static JSON (duas library)
- usePrayerTimes hook (for Fajr reset time)

**Future Enhancements (V1.1+):**
- **V1.1:** Expanded dua library (50 → 100+ duas)
- **V1.2:** Wird programs (structured routines)
- **V1.2:** Salawat, Istighfar counters
- **V1.2:** Audio pronunciations for duas
- **V1.2:** Dua search and filtering
- **V1.3:** Cloud sync (Supabase)
- **V1.3:** Streak tracking
- **V1.3:** Custom phrase creation
- **V2.0:** Group challenges

---

## /places/mosques (Mosque Finder)

**V1.0 Status:** ✅ **Complete**

**Features:**
- OpenStreetMap Overpass API integration
- Interactive map (MapLibre GL with OSM tiles)
- List view with distance sorting
- Location search (Nominatim autocomplete)
- Current location button (browser geolocation)
- Search radius selector (1-10 miles)
- Distance unit toggle (miles/kilometers)
- Detail dialog with full info
- Platform-aware directions (Apple Maps for iOS, Google Maps for others)
- Fallback mosque names (generated from address)

**Data Sources:**
- OpenStreetMap Overpass API (mosque data)
- Nominatim API (geocoding)
- MapLibre GL (map rendering)
- localStorage (distance_unit preference)
- Supabase profile (distance_unit for authenticated users)

**Future Enhancements (V1.1+):**
- **V1.1:** Save favorite mosques
- **V1.1:** Prayer time integration
- **V1.3:** User reviews and ratings
- **V1.3:** Photo uploads
- **V1.3:** Facility filters
- **V2.0:** Operating hours filter
- **V2.0:** Call directly from app

---

## /places/food (Halal Food Finder)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Geoapify Places API integration
- Triple search strategy (sequential for quota conservation)
- Interactive map (MapLibre GL)
- List view with distance sorting
- Location search (Nominatim)
- Current location button
- Search radius selector (1-10 miles)
- Distance unit toggle (miles/kilometers)
- Detail dialog with cuisine, facilities, hours
- Facility badges (takeaway, delivery, wheelchair)
- Platform-aware directions
- Retry logic with exponential backoff
- Dynamic timeouts based on radius

**Data Sources:**
- Geoapify Places API (halal food data)
- Nominatim API (geocoding)
- MapLibre GL (map rendering)
- localStorage (distance_unit preference)
- Supabase profile (distance_unit for authenticated users)

**Future Enhancements (V1.1+):**
- **V1.1:** Save favorite restaurants
- **V1.3:** User reviews and ratings
- **V1.3:** Photo uploads
- **V1.3:** Dietary filters (vegan, gluten-free)
- **V1.3:** Price range filtering
- **V1.3:** Cuisine filters
- **V2.0:** Operating hours filter
- **V2.0:** Call/order directly from app

---

## /profile (Settings & Profile)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Display name (editable)
- Email (read-only, from auth)
- Theme toggle (in header, not in form)
- Location preferences (stored automatically from prayer times page)
- Calculation method (stored from prayer times)
- Madhab (stored from prayer times)
- Quran translation preference
- Hadith language preference
- Distance unit preference
- Auth-protected (middleware enforcement)

**Data Sources:**
- Supabase (profiles table)
- Auth context

**Future Enhancements (V1.1+):**
- **V1.1:** Profile picture upload
- **V1.2:** Hijri offset manual adjustment
- **V1.3:** Password reset flow
- **V1.3:** Email verification
- **V1.3:** Multi-language interface
- **V1.3:** Notification preferences
- **V1.3:** Custom themes
- **V1.3:** Account deletion
- **V1.3:** Data export (GDPR)
- **V2.0:** Goal tracking
- **V2.0:** Customizable dashboard

---

## /about (About & Acknowledgements)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Three tabs (Creator, About App, Acknowledgements)
- URL-synced tab navigation
- Creator profile with photo, contact, education, projects
- App mission, features, tech stack, privacy principles
- API and library acknowledgements with disclaimers
- Copy-to-clipboard for contact info
- Footer links on all pages
- Mobile-responsive tabs

**Data Sources:**
- Static content
- Public creator profile image

**Future Enhancements (V1.1+):**
- **V1.2:** Changelog section
- **V1.3:** Contribution guide
- **V2.0:** Support section (FAQs, troubleshooting)

---

## /admin (Admin Dashboard)

**V1.0 Status:** ✅ **Complete**

**Features:**
- Admin-only access (RLS + ProtectedAdmin component)
- Feedback management tab with filters
- Inline editing (status, priority, category)
- Admin notes textarea
- Review tracking (reviewed_at, reviewed_by)
- Analytics tab (total users, feedback metrics)
- Admin card on main dashboard
- Search and pagination

**Data Sources:**
- Supabase (feedback table, profiles table)
- Admin context (is_admin flag)

**Future Enhancements (V1.1+):**
- **V1.2:** Enhanced analytics (feature usage, engagement)
- **V1.3:** Email notifications on new feedback
- **V2.0:** Bulk operations
- **V2.0:** CSV export
- **V2.0:** Multiple admin roles
- **V2.0:** Audit log
- **V2.0:** Dashboard customization

---

## /calendar

**Purpose:** View and explore the Islamic (Hijri) calendar with important dates and school-based filtering

**Status:** ✅ **Complete** (V1.2)

### Layout

**Desktop:**
- Calendar grid (center, flex-1)
- Right sidebar (320px width)
- Responsive two-column layout

**Mobile:**
- Calendar grid (full width)
- Sidebar below calendar
- Stacked single-column layout

### Components

**Main Components:**
- `CalendarControls` - Month/year navigation and view toggle
- `GregorianCalendar` - 7-column grid (Sun-Sat) with Hijri dates in cells
- `IslamicCalendar` - 7-column grid (Sat-Fri) with Gregorian dates in cells
- `CalendarSidebar` - Tabbed interface with important dates and date details

**Sidebar Tabs:**
1. **Important Dates** - List of significant Islamic dates with school filters
2. **Date Details** - Selected date info in both calendars

### Features

**Calendar Views:**
- Toggle between Gregorian and Islamic calendar
- Month/year navigation (Previous/Next/Today buttons)
- Visual indicators for today, selected date, and important dates
- Color-coded badges and icons for significant dates

**Important Dates:**
- High significance: Ramadan, Eid al-Fitr, Eid al-Adha, Laylat al-Qadr, Ashura
- Medium significance: Islamic New Year, Mawlid, Laylat al-Miraj, Laylat al-Bara'ah
- Low significance: Sacred months

**School Filtering:**
- Filter dates by Sunni schools: Hanafi, Shafi, Maliki, Hanbali
- All schools selected by default
- Select All / Deselect All buttons
- Displays count of enabled filters

**Interaction:**
- Click any date to view details in sidebar
- Important date cards are clickable
- Keyboard navigation support
- ARIA labels for accessibility

### Data Storage

**localStorage:**
- `calendar_view` - Selected calendar view (gregorian/islamic)
- `calendar_school_filters` - JSON object of enabled schools

**Supabase Profile (future):**
- Will sync preferences across devices for authenticated users

### API Integration

Uses three API endpoints:
- `/api/calendar/gregorian-month` - Fetch Gregorian month with Hijri conversions
- `/api/calendar/hijri-month` - Fetch Hijri month with Gregorian conversions
- `/api/calendar/convert` - Individual date conversion

### Visual Design

**Color Coding:**
- Today: Accent border with light background
- Selected: Accent background with foreground text
- Important dates: Orange border (unselected state)
- Significance badges: Red (high), Blue (medium), Gray (low)

**Icons:**
- 🌙 Ramadan, Islamic New Year
- 🕌 Eid al-Fitr, Eid al-Adha
- ⭐ Laylat al-Qadr, Laylat al-Miraj
- 📿 Ashura, first 10 days, six days of Shawwal
- 🌟 Laylat al-Bara'ah, last 10 nights
- ⛰️ Day of Arafah
- 🕊️ Sacred months

### Mobile Experience

**Responsive Adjustments:**
- Calendar controls stack vertically on small screens
- Sidebar moves below calendar on mobile
- Touch-friendly date cells with adequate spacing
- Scrollable important dates list

**Accessibility:**
- Skip links for keyboard navigation
- ARIA labels on all interactive elements
- Screen reader announcements for date selection
- Focus indicators on all controls

### Future Enhancements

- **V1.3:** Export calendar to iCal/Google Calendar
- **V1.3:** Set reminders for important dates
- **V2.0:** Community events calendar overlay
- **V2.0:** Local mosque event integration

---

## Summary

**Total Pages:** 11 (10 from V1.0, +1 calendar from V1.2)  
**Auth-Protected:** 3 (/profile, /charity, /admin)  
**Public:** 8 (/, /times, /quran-hadith, /favorites, /zikr, /places/mosques, /places/food, /about, /calendar)  
**With Feedback Button:** All 11 pages
