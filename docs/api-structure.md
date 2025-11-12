# API Structure (Next.js API Routes)

## /api/prayertimes
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to AlAdhan Prayer Times API with caching

**Method:** GET

**Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `method` (optional): Calculation method ID (default: '4' - Umm al-Qura)
  - '1': Karachi
  - '2': ISNA
  - '3': Egyptian
  - '4': Umm al-Qura (Saudi Arabia)
  - '5': MWL (Muslim World League)
  - '7': Tehran
  - '0': Jafari
- `date` (optional): Date in DD-MM-YYYY format (default: today)
- `timezone` (optional): IANA timezone string (default: 'UTC')

**Response Format:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "timings": {
      "Fajr": "05:03",
      "Sunrise": "06:40",
      "Dhuhr": "11:40",
      "Asr": "14:19",
      "Maghrib": "16:40",
      "Isha": "18:10"
    },
    "date": {
      "readable": "12 Nov 2024",
      "gregorian": { ... },
      "hijri": { ... }
    },
    "meta": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "timezone": "America/New_York",
      "method": { "id": 4, "name": "Umm Al-Qura University, Makkah" }
    }
  }
}
```

**Caching:** 1 hour (revalidate: 3600)

**Error Handling:**
- 400: Missing or invalid parameters
- 500: AlAdhan API error or network failure

**External API:** `https://api.aladhan.com/v1/timings/{DD-MM-YYYY}`

---

## /api/qibla
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to AlAdhan Qibla API with caching and compass direction enhancement

**Method:** GET

**Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)

**Response Format:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "direction": 58.481712034206865,
    "compassDirection": "NE"
  }
}
```

**Caching:** 24 hours (revalidate: 86400) - Qibla direction doesn't change for a location

**Error Handling:**
- 400: Missing or invalid parameters
- 500: AlAdhan API error or network failure

**External API:** `https://api.aladhan.com/v1/qibla/{lat}/{lng}`

**Enhancement:** Adds `compassDirection` field (N, NE, E, SE, S, SW, W, NW) calculated from bearing angle

---

## /api/hijri
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to AlAdhan Islamic Calendar API

**Method:** GET

**Parameters:**
- `offset` (optional): Hijri date offset adjustment in days (default: 0)

**Response Format:**
```json
{
  "currentHijri": {
    "day": 10,
    "month": 5,
    "year": 1446,
    "monthName": "Jumādá al-ūlá"
  },
  "ramadanStart": "2025-03-01",
  "ramadanEnd": "2025-03-30",
  "daysUntilRamadan": 109,
  "isRamadan": false,
  "ramadanHijriYear": 1446
}
```

**Caching:** 
- Hijri date: 1 hour (revalidate: 3600)
- Ramadan calendar: 24 hours (revalidate: 86400)

**External API:** 
- Current Hijri: `https://api.aladhan.com/v1/gToH/{DD-MM-YYYY}`
- Ramadan Calendar: `https://api.aladhan.com/v1/hToGCalendar/9/{hijriYear}`

## /api/quran
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to AlQuran Cloud API with deterministic daily ayah selection

**Method:** GET

**Parameters:**
- `translation` (optional): Translation edition ID (default: 'en.asad')
  - 'en.asad': Muhammad Asad
  - 'en.sahih': Sahih International
  - 'en.pickthall': Marmaduke Pickthall
  - 'en.yusufali': Abdullah Yusuf Ali

**Daily Selection Algorithm:**
- Deterministic: `((year * 10000 + month * 100 + day) % 6236) + 1`
- Same ayah globally for all users on the same day
- Cycles through all 6236 ayahs of the Quran

**Response Format:**
```json
{
  "arabic": {
    "number": 262,
    "text": "ٱللَّهُ لَاۤ إِلَـٰهَ إِلَّا هُوَ...",
    "edition": {
      "identifier": "quran-uthmani",
      "language": "ar",
      "englishName": "Quran Uthmani"
    },
    "surah": {
      "number": 2,
      "name": "سُورَةُ البَقَرَةِ",
      "englishName": "Al-Baqara",
      "englishNameTranslation": "The Cow",
      "numberOfAyahs": 286,
      "revelationType": "Medinan"
    },
    "numberInSurah": 255
  },
  "translation": {
    "number": 262,
    "text": "GOD - there is no deity save Him...",
    "edition": {
      "identifier": "en.asad",
      "language": "en",
      "englishName": "Muhammad Asad"
    },
    "surah": { ... },
    "numberInSurah": 255
  },
  "surah": { ... },
  "ayahNumber": 262,
  "numberInSurah": 255
}
```

**Caching:** 24 hours (revalidate: 86400) - Same ayah all day

**Error Handling:**
- 500: AlQuran Cloud API error or network failure

**External API:** 
- Multi-edition endpoint: `https://api.alquran.cloud/v1/ayah/{number}/editions/quran-uthmani,{translation}`
- Arabic edition: `quran-uthmani` (Uthmani script with diacritics)
- Default translation: `en.asad` (Muhammad Asad)

---

## /api/hadith
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to HadithAPI with deterministic daily hadith selection from Sahih Bukhari and Sahih Muslim

**Method:** GET

**Parameters:**
- `language` (optional): Language for hadith text (default: 'english')
  - 'english': English translation
  - 'urdu': Urdu translation
  - 'arabic': Arabic text

**Daily Selection Algorithm:**
- Deterministic: Same hadith globally for all users on the same day
- Pool: ~15,000 hadiths (Sahih Bukhari ~7563 + Sahih Muslim ~7563)
- Distributes selection across both collections
- Formula: `((year * 10000 + month * 100 + day) % TOTAL_HADITHS)`

**Response Format:**
```json
{
  "hadithEnglish": "The reward of deeds depends upon the intentions...",
  "hadithUrdu": "تمام اعمال کا دارومدار نیت پر ہے",
  "hadithArabic": "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
  "narrator": "Narrated 'Umar bin Al-Khattab",
  "book": "Sahih Bukhari",
  "bookSlug": "sahih-bukhari",
  "bookWriter": "Imam Bukhari",
  "chapter": "Belief",
  "chapterArabic": "كتاب بدء الوحى",
  "hadithNumber": "1",
  "status": "Sahih",
  "volume": "1"
}
```

**Response Fields:**
- `hadithEnglish/Urdu/Arabic`: Hadith text in three languages
- `narrator`: Name of the narrator (typically in English)
- `book`: Full book name (e.g., "Sahih Bukhari")
- `bookSlug`: URL-safe book identifier for API requests
- `bookWriter`: Scholar's name (e.g., "Imam Bukhari", "Imam Muslim")
- `chapter`: Chapter name in English
- `chapterArabic`: Chapter name in Arabic script
- `hadithNumber`: Hadith number within the collection
- `status`: Authentication level (Sahih/Hasan/Da'eef)
- `volume`: Volume number (optional)

**Hadith Status Values:**
- `Sahih`: Authentic
- `Hasan`: Good
- `Da'eef`: Weak

**Caching:** 24 hours (revalidate: 86400) - Same hadith all day

**Error Handling:**
- 500: HadithAPI error, missing API key, or network failure

**External API:**
- Base URL: `https://hadithapi.com/api`
- Endpoint: `/hadiths/?apiKey={HADITH_API_KEY}&hadithNumber={number}&book={book}&paginate=1`
- Books: `sahih-bukhari`, `sahih-muslim`

**Environment Variable:**
- `HADITH_API_KEY`: Required API key for HadithAPI (stored in .env.local, server-side only)

## /api/places
- Proxy: Google Places API  
- For halal/mosques queries  
**Later**
