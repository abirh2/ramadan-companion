# Page & Data Requirements

## / (Dashboard)
**Cards and Data Sources**
- Next Prayer: prayer API + user prefs  
- Ramadan Countdown: Hijri API + prayer times  
- Quran of the Day: AlQuran API  
- Hadith of the Day: Sunnah API  
- Charity Summary: Supabase (donations)
- Zikr Summary: localStorage (later)

**V1:** Prayer, Ramadan, Quran, Hadith, Charity  
**Later:** Zikr stats, Places summary

---

## /times
- Daily prayer times (API)
- Qibla bearing (API or local calculation)
- Change method/madhab (update Supabase)

**V1:** Full feature  
**Later:** Weekly/monthly view

---

## /charity
- CRUD for donations (Supabase)
- Zakat calculator (local only)
- Charity list (static JSON)

**V1:** Donations + calculator  
**Later:** Charts, recurring, public charity database

---

## /quran-hadith
- Daily ayah/hadith (same as Dashboard)
- Expanded view with translation selector
- Favorite button (auth-protected)
- Share functionality

**V1:** ✅ Complete - Daily ayah, translation options, favorites  
**Later:** Hadith implementation, search, filtering, topic tagging

---

## /favorites
- Auth-protected page (requires sign-in)
- Tabbed interface: Quran / Hadith
- List of all favorited items
- Full ayah display with Arabic + translation
- Remove from favorites button
- Share button per item
- Empty states with CTAs
- Count badges showing number of items

**V1:** ✅ Complete - Quran favorites list  
**Later:** Hadith favorites, category filters, notes, export

---

## /zikr
- Zikr counter (local)
- Dua list (static JSON)

**Later:** Sync to Supabase, streak tracking

---

## /places/mosques
- Google Places API (query: mosque)
- Map + list view

**Later only**

---

## /places/halal-food
- Google Places API (query: halal restaurant)

**Later only**

---

## /settings
- Read/write profile (Supabase)
- Theme, location, method

**V1:** Minimal preferences  
**Later:** Notifications, language selection
