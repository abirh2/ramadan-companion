# Feature Specification – Ramadan Companion App

This document defines the functionality, design, and API usage for all core and secondary features.  
It provides enough detail for any developer or AI agent to implement the app end-to-end following our V1 goals.

---

## Table of Contents
1. Dashboard
2. Prayer Times & Qibla Finder
3. Ramadan Countdown
4. Quran & Hadith Reminders
5. Charity & Zakat Tracker
6. Zikr & Dua Tracker
7. Mosque Finder
8. Halal Food Finder
9. Settings
10. Common Design & Interaction Standards
11. API Reference Links

---

## 1. Dashboard

### Purpose
Centralized view of daily information and quick access to all modules.

### Layout
- Responsive grid of cards (1 column mobile, 2 column desktop).  
- Each card summarizes a module and links to its full page.  
- Built with `shadcn/ui` Cards and Tailwind grid utilities.

### Cards
| Card | Summary Data | Expanded Behavior |
|-------|---------------|-------------------|
| Next Prayer | next prayer name/time & countdown | navigates to `/times` |
| Ramadan | countdown to Ramadan or iftar/suhoor | opens Ramadan view |
| Quran of the Day | short Arabic + translation | opens `/quran-hadith` |
| Hadith of the Day | English text + source | opens `/quran-hadith` |
| Charity Summary | totals (Ramadan & all-time) | opens `/charity` |
| Zikr Summary | current zikr and progress | opens `/zikr` |
| Places | nearby mosque & halal counts | opens `/places` |

**Included in V1:** Next Prayer, Ramadan, Quran, Hadith, Charity  
**Later:** Zikr, Places

### Visual Design
- Soft neutral background (`#f5f3f0`), deep-green accents (`#0f3d3e`).  
- Rounded cards (`rounded-2xl`) with subtle shadow.  
- Optional geometric pattern header and small icons (moon, lantern).

---

## 2. Prayer Times & Qibla Finder (`/times`)

### Functionality
Display accurate prayer times and Qibla direction based on user location.

### Data Flow
- Location from localStorage (cached) or Geolocation API.
- Calculation method from Supabase `profiles` or default **Umm al-Qura**.
- API: **[AlAdhan Prayer Times API](https://aladhan.com/prayer-times-api)**  
    GET https://api.aladhan.com/v1/timings?latitude={lat}&longitude={lng}&method={method}
- Qibla bearing API:  
    GET https://api.aladhan.com/v1/qibla/{lat}/{lng}


### Behavior
1. Fetch prayer times and display schedule.  
2. Show next prayer with live countdown.  
3. Display Qibla bearing (degrees).  
4. User can change calculation method → persists to Supabase/localStorage.

### UI
- "Today's Prayers" table (Fajr → Isha).  
- Countdown text block.  
- Qibla compass card.  
- Dropdowns: Method, Madhab, Location.

**V1:** daily times + countdown + static Qibla arrow.  
**Later:** compass orientation using DeviceOrientationEvent.

---

## 3. Ramadan Countdown

### Functionality
Show countdown until Ramadan starts, and during Ramadan show iftar/suhoor timers.

### Data Source
- **[AlAdhan Hijri Calendar API](https://aladhan.com/islamic-calendar-api)**  
    GET https://api.aladhan.com/v1/gToH?date={YYYY-MM-DD}
- Uses `profiles.hijri_offset_days` for manual ±1 adjustment.

### Logic
- Before Ramadan → days remaining.  
- During Ramadan → countdown to next iftar (Maghrib) and suhoor end (Fajr).  
- Displays current Ramadan day number.

### UI
- Large digital timer text.  
- Subtext for day or next event.  
- Optional calendar modal.

**V1:** countdowns + offset setting.  
**Later:** full Hijri calendar display.

---

## 4. Quran & Hadith Reminders (`/quran-hadith`)

### Functionality
Show one ayah and one hadith per day (same for all users) and allow favorites.

### APIs
- **Quran:** [AlQuran Cloud API](https://alquran.cloud/api)  
Example: GET https://api.alquran.cloud/v1/ayah/{ayah_number}/en.asad
- **Hadith:** [Sunnah.com API](https://hadithapi.com/)  
Example: GET GET https://hadithapi.com/api/hadiths/?apiKey=<YOUR_API_KEY>

### Logic
- Deterministic daily selection:  
`index = (hash(YYYYMMDD) mod N)` ensures same content globally.  
- Favorites stored in Supabase `favorites` table.

### UI
Sections:
1. Today’s Ayah – Arabic (Amiri font) + translation.  
2. Today’s Hadith – English + source.  
3. Favorites list.

Buttons: Favorite, Unfavorite, Expand, Share.

**V1:** daily fetch + favorites CRUD.  
**Later:** search, category filters.

---

## 5. Charity & Zakat Tracker (`/charity`)

### Functionality
Track donations and calculate zakat locally.

### Data
Supabase `donations` table.

### Behavior
- Add/Edit/Delete donations.  
- Summaries: Ramadan total, yearly total, all-time total.  
- Local zakat calculator (2.5% on net assets).  
- Option to log zakat as a donation record.

### APIs
None (Supabase only).

### UI
Sections:
1. Totals (cards).  
2. Donation table/list.  
3. "Add Donation" dialog (Form → Supabase insert).  
4. Local Zakat calculator with “Log as donation” option.

**V1:** donations + calculator.  
**Later:** charts, recurring, CSV export.

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

## 9. Settings (`/settings`)

### Functionality
Edit preferences and theme.

### Data
Supabase `profiles` + localStorage sync.

### Fields
- Location (auto/manual)
- Calculation method
- Madhab
- Hijri offset
- Theme
- Language (future)
- Clear local data

**V1:** preferences + theme toggle.  
**Later:** notifications, localization.

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



