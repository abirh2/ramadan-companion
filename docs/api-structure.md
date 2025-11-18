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

**Cross-Reference Detection & Fallback:**
- Some hadiths in the collections are cross-references (referencing other narrations instead of containing full text)
- The API automatically detects cross-references using pattern matching on the English text
- When a cross-reference is detected, the API searches adjacent hadith numbers (±1, ±2, ±3...) up to 10 attempts
- Search sequence: original → +1 → -1 → +2 → -2 → +3 → -3, etc. (deterministic)
- Users always receive complete hadiths with full text in all languages
- The fallback sequence is deterministic based on date seed, ensuring all users see the same hadith each day

**Cross-Reference Detection Patterns:**
- "similar hadith"
- "like this has been narrated"
- "transmitted through another chain"
- "narrated through another chain"
- "has been transmitted on the authority"
- "hadith like this"
- "narrated by" (in reference context)
- "similar tradition"
- Empty or whitespace-only English text

**Error Handling:**
- 500: HadithAPI error, missing API key, network failure, or no complete hadith found after 10 attempts

**External API:**
- Base URL: `https://hadithapi.com/api`
- Endpoint: `/hadiths/?apiKey={HADITH_API_KEY}&hadithNumber={number}&book={book}&paginate=1`
- Books: `sahih-bukhari`, `sahih-muslim`

**Environment Variable:**
- `HADITH_API_KEY`: Required API key for HadithAPI (stored in .env.local, server-side only)

---

## /api/mosques
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to OpenStreetMap Overpass API for finding nearby mosques with retry logic and distance calculation

**Method:** GET

**Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `radius` (optional): Search radius in meters (default: 4828 = 3 miles, max: 50000)

**Search Query:**
```
[out:json];
node["amenity"="place_of_worship"]["religion"="muslim"](around:{radius},{lat},{lng});
out;
```

**Response Format:**
```json
{
  "mosques": [
    {
      "id": 2809904792,
      "name": "North Bronx Islamic Center",
      "lat": 40.8750571,
      "lng": -73.8801588,
      "distanceKm": 1.234,
      "address": {
        "street": "216 East 206th Street",
        "city": "Bronx",
        "state": "NY",
        "postcode": "10467",
        "country": "United States"
      },
      "tags": {
        "phone": "+1-xxx-xxx-xxxx",
        "website": "https://example.com",
        "opening_hours": "Mo-Su 05:00-22:00",
        "wheelchair": "yes",
        "denomination": "sunni"
      }
    }
  ],
  "count": 15,
  "searchLocation": { "lat": 40.8730, "lng": -73.8837 },
  "radiusMeters": 4828
}
```

**Features:**
- Fallback mosque names: Generated from address if name missing ("Mosque near East 189th Street")
- Distance calculation: Haversine formula for accurate Earth-surface distances
- Sorted by distance: Nearest mosques first
- Retry logic: 2-3 attempts with exponential backoff (1s, 2s delays)
- Timeout protection: 15-second timeout per request

**Caching:** 1 hour (revalidate: 3600)

**Error Handling:**
- 400: Missing or invalid parameters (lat/lng/radius)
- 500: Overpass API error or network failure
- 504/503: API overloaded message with suggestion to reduce radius

**External API:**
- URL: `https://overpass-api.de/api/interpreter`
- Method: POST with URL-encoded Overpass QL query
- Rate limiting: Subject to Overpass API fair use policy

---

## /api/food
**Status:** ✅ Implemented (V1)

**Purpose:** Proxy to Geoapify Places API with triple search strategy for comprehensive halal food coverage

**Method:** GET

**Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `radius` (optional): Search radius in meters (default: 4828 = 3 miles, max: 50000)

**Sequential Search Strategy:**
Makes API calls sequentially to conserve quota - only continues if insufficient results:
1. **Strict Name Search (primary):** `name=halal` + `categories=catering.restaurant,catering.fast_food`
2. **Halal Category (fallback):** `categories=halal` - only if < 5 results from strict
3. **Cuisine-Based (fallback):** Traditional halal cuisines - only if < 5 results total

This approach minimizes API calls while ensuring good coverage.

**Response Format:**
```json
{
  "foods": [
    {
      "id": "51828aaa5f697752c059f0a2dff1376c4440f00103f901b413348a02000000",
      "name": "Azal Restaurant & Halal",
      "lat": 40.8454573,
      "lng": -73.8658065,
      "distanceKm": 3.413,
      "address": {
        "street": "Morris Park Avenue",
        "city": "New York",
        "state": "NY",
        "postcode": "10461",
        "country": "United States",
        "formatted": "Azal Restaurant & Halal, Morris Park Avenue, New York, NY 10461, United States"
      },
      "categories": ["catering", "catering.restaurant", "halal"],
      "cuisine": "middle_eastern",
      "diet": {
        "halal": true
      },
      "contact": {
        "phone": "+1-347-621-2884",
        "website": "https://khalilsfood.com"
      },
      "openingHours": "Mo-Su 12:00-23:00",
      "facilities": {
        "takeaway": true,
        "delivery": true,
        "wheelchair": false
      }
    }
  ],
  "count": 42,
  "searchLocation": { "lat": 40.8730, "lng": -73.8837 },
  "radiusMeters": 4828,
  "searchStrategies": {
    "strict": 15,
    "category": 8,
    "cuisine": 25,
    "merged": 42
  }
}
```

**Data Parsing:**
- Cuisine: Extracted from `catering.cuisine` or `datasource.raw.cuisine`
- Diet info: From `catering.diet.halal` or `datasource.raw['diet:halal']`
- Contact: From `contact` object or `datasource.raw` (phone, website)
- Facilities: From `facilities` or `datasource.raw` (wheelchair, takeaway, delivery)
- Opening hours: From `opening_hours` or `datasource.raw.opening_hours`

**Features:**
- Sequential search: Only makes additional API calls if needed (< 5 results)
- Results deduplication: Merged by `place_id` when multiple strategies used
- Fallback names: Generated from cuisine or location if name missing
- Distance calculation: From Geoapify `distance` field (meters) or Haversine formula
- Sorted by distance: Nearest food places first
- Retry logic: 2-3 attempts per strategy with exponential backoff (1s, 2s delays)
- Dynamic timeout: 15-45 seconds based on search radius
- Dynamic limits: 20-50 results based on radius to prevent timeouts and conserve quota
- Partial results: Continues with successful strategies if some fail
- Quota conservation: Minimizes API calls through sequential strategy

**Caching:** 1 hour (revalidate: 3600)

**Error Handling:**
- 400: Missing or invalid parameters (lat/lng/radius)
- 500: Geoapify API key missing or all strategies failed
- 429: Rate limit exceeded message with suggestion to try again
- Graceful degradation: Returns results from successful strategies even if some fail

**External API:**
- URL: `https://api.geoapify.com/v2/places`
- Method: GET with query parameters
- Rate limiting: Subject to Geoapify API plan limits

**Environment Variable:**
- `GEOAPIFY_API_KEY`: Required API key for Geoapify (stored in .env.local, server-side only)

---

## /api/currency
**Status:** ✅ Implemented (V1.1)

**Purpose:** Fetch real-time exchange rates from fawazahmed0 Currency API

**Method:** GET

**Parameters:**
- `base` (required): Base currency code (ISO 4217, e.g., 'USD', 'EUR', 'GBP', 'XAU', 'XAG')
- `symbols` (optional): Comma-separated list of target currencies (e.g., 'EUR,GBP,JPY')

**Response Format:**
```json
{
  "base": "USD",
  "date": "2025-11-16",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.50,
    "XAU": 0.00048,
    "XAG": 0.038
  }
}
```

**Caching:** 24 hours (revalidate: 86400)

**Filtering:**
- Automatically excludes ILS (Israeli Shekel) from all responses
- Automatically excludes all cryptocurrencies (BTC, ETH, USDT, etc.)
- Includes precious metals: XAU (Gold), XAG (Silver) for zakat nisab calculations

**Fallback Mechanism:**
- Primary CDN: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.min.json`
- Fallback CDN: `https://latest.currency-api.pages.dev/v1/currencies/{base}.min.json`
- Automatically switches to fallback if primary fails

**Error Handling:**
- 400: Invalid currency code (< 3 characters)
- 500: Both primary and fallback CDNs unavailable or error

**External API:**
- Provider: fawazahmed0 Currency API
- 200+ currencies including precious metals
- No API key required
- Free, open-source, CDN-hosted
- Rates updated daily
- Response transformed from `{ date, {base}: { {target}: rate } }` to standard format

---

## /api/currency/list
**Status:** ✅ Implemented (V1.1)

**Purpose:** Fetch list of all supported currencies from fawazahmed0 Currency API

**Method:** GET

**Parameters:** None

**Response Format:**
```json
[
  { "code": "USD", "name": "United States Dollar" },
  { "code": "EUR", "name": "Euro" },
  { "code": "GBP", "name": "British Pound Sterling" },
  { "code": "XAU", "name": "Gold" },
  { "code": "XAG", "name": "Silver" }
]
```

**Caching:** 7 days (revalidate: 604800)

**Sorting:** Alphabetically by currency name

**Filtering:**
- Automatically excludes ILS (Israeli Shekel) from results
- Automatically excludes all cryptocurrencies (BTC, ETH, USDT, XRP, BNB, ADA, DOGE, SOL, etc.)
- Includes all fiat currencies and precious metals (XAU, XAG)

**Fallback Mechanism:**
- Primary CDN: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json`
- Fallback CDN: `https://latest.currency-api.pages.dev/v1/currencies.min.json`
- Automatically switches to fallback if primary fails

**Error Handling:**
- 500: Both primary and fallback CDNs unavailable or error

**External API:**
- Provider: fawazahmed0 Currency API
- 200+ currencies including precious metals
- No API key required
- Free, open-source, CDN-hosted
- No API key required
- Static data (rarely changes)

**Notes:**
- Used to populate currency selectors in donation form and zakat calculator
- Supports ~30+ currencies (all Frankfurter currencies except ILS)
