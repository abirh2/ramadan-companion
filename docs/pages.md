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
- Favorite and view saved items (Supabase)

**V1:** Basic display and favorites  
**Later:** Search, filtering, topic tagging

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
