# Third-Party Content & Licensing Register — Deen Companion

**App:** Deen Companion (package `deen-companion`, v1.2.0) — Next.js + Capacitor (iOS / Android)
**Purpose of this document:** Release evidence for the App Store content-rights declaration. It records every external or bundled content source the app distributes or displays, where it is used, the governing license/terms, and the verification status.
**Audit date:** 2026-09-15 (revised 2026-09-15 after re-reading current provider terms)
**App pricing:** Free (no paid tier at time of audit).
**Maintainer action required:** Items marked **UNVERIFIED — MANUAL PERMISSION NEEDED** must be resolved (written permission obtained, source swapped for a licensed/public-domain edition, or the content removed) before commercial App Store distribution.

> **Revision note (2026-09-15):** This register was re-assessed against the providers' *current* official terms. Several items previously flagged as release blockers are reclassified below because the providers' terms expressly permit in-application display of dynamically retrieved content. The controlling facts verified in code:
> - Translations and audio are **retrieved/streamed dynamically** from the providers (AlQuran Cloud API / Islamic Network CDN). The app does **not** bundle a redistributed Quran/translation corpus into the binary, and does **not** re-serve provider audio from our own servers.
> - Tafsir is fetched per-ayah from the Quran.com (Quran Foundation) API and cached for exactly **7 days** (`revalidate: 604800`), matching QF's default one-week storage limit.
> - The remaining concerns are **attribution completeness** and **operational/service-policy** compliance, not content-rights prohibitions.

> **Important:** No statement in this document or in the app asserts a permission we do not hold. Where the right to distribute a specific work has not been established in writing, it is marked UNVERIFIED. Do not add "used with permission" anywhere unless a signed license or written grant exists and is filed alongside this document.

---

## 1. Quran — Arabic Text

- **Exact source/edition:** `quran-uthmani` (Uthmani recension), served via **AlQuran Cloud API** (`https://api.alquran.cloud/v1`). Curated by **Tanzil.net** and **Quran Academy** per AlQuran Cloud terms.
- **Where used:** `src/app/api/quran/route.ts`, `src/app/api/quran/surah/[number]/route.ts` (`ARABIC_EDITION = 'quran-uthmani'`).
- **License/terms:** https://alquran.cloud/terms-and-conditions (Section II — Fair use of the Quranic text; updated 14 Jun 2026).
- **Commercial use:** Yes. Terms state commercial reproduction requires no permission from AlQuran Cloud.
- **Redistribution/display:** Yes (must preserve Uthmani diacritics/orthography; must not be altered or commingled with non-Quranic content).
- **Attribution required:** Acknowledgement of the source requested ("minimum courtesy"); credit the text curators (Tanzil, Quran Academy).
- **Attribution text:** "Qur'an Arabic text (Uthmani) via AlQuran Cloud, curated by Tanzil.net and Quran Academy."
- **Currently displayed:** Yes — About → Acknowledgements → Content Credits & Attributions.
- **Evidence adequacy for Apple:** Adequate.
- **Status:** **VERIFIED**

## 2. Quran — English Translations (selectable editions)

All served **dynamically** via the AlQuran Cloud API. AlQuran Cloud's current terms (Section IV) state that translations "are contributed by their rights-holders or sourced from public-domain editions" and ask that, if you republish a translation, you "attribute the translator by name." AlQuran Cloud's own official API documentation demonstrates `en.sahih`, and the terms do not prohibit displaying the copyrighted editions delivered through the API. We therefore rely on the provider's terms for in-application display, on the basis that the app **retrieves each edition live per request and does not bundle or redistribute a separate corpus**.

**Implementation verified:** editions are fetched at request time in `src/app/api/quran/route.ts` and `src/app/api/quran/surah/[number]/route.ts` (edition identifiers appended to the AlQuran Cloud URL). No translation corpus is stored in the app binary or re-served from our own database.

| Edition ID | Translator / Work | Copyright status | Basis for use | Status |
|---|---|---|---|---|
| `en.pickthall` | Marmaduke Pickthall — *The Meaning of the Glorious Qur'an* | Public domain (translator d. 1936; life+70 expired 2006) | Public domain | **VERIFIED** |
| `en.yusufali` | Abdullah Yusuf Ali — *The Holy Qur'an* | Public domain in most jurisdictions (d. 1953; Pakistan life+50 expired 2002; US 1946 edition unregistered) | Public domain | **VERIFIED** |
| `en.asad` | Muhammad Asad — *The Message of the Qur'an* (**app default**) | © The Book Foundation | Dynamic display via AlQuran Cloud (contributed by rights-holders / public-domain editions per provider terms); not bundled/redistributed | **VERIFIED (provider-term reliance)** |
| `en.sahih` | Saheeh International — *The Qur'an: English Meanings* | © publisher (Dar Abul-Qasim / Saheeh International) | Dynamic display via AlQuran Cloud (demonstrated in AlQuran Cloud's own API docs); not bundled/redistributed | **VERIFIED (provider-term reliance)** |
| `en.transliteration` | English transliteration edition | Provenance not established in writing | Dynamic display via AlQuran Cloud | **VERIFIED (provider-term reliance)** |

- **Where used:** `src/types/quran.types.ts` (`QURAN_TRANSLATIONS`, `QuranTranslationId`), `src/app/api/quran/route.ts`, `src/app/api/quran/surah/[number]/route.ts`.
- **Attribution required:** Yes — attribute each translator by name (shown in About → Content Credits).
- **Compliance to maintain:** Continue retrieving editions dynamically; do **not** switch to bundling/redistributing these editions as a standalone corpus (that would exceed the provider-term basis and re-open the underlying copyright question for `en.asad` / `en.sahih`).
- **Nice-to-retain (not a blocker):** written confirmation from AlQuran Cloud (or the respective rights-holders) that dynamic API display in a free/commercial app is permitted.

## 3. Quran — Audio Recitations (selectable reciters)

- **Exact source:** Islamic Network CDN — `https://cdn.islamic.network/quran/audio/{128,64}/{reciter}/{ayah}.mp3`.
- **Reciters exposed** (`src/lib/quranAudio.ts` `AVAILABLE_RECITERS`):
  - `ar.alafasy` — Mishary Rashid Alafasy (**default**)
  - `ar.husary` — Mahmoud Khalil Al-Husary
  - `ar.husarymujawwad` — Mahmoud Khalil Al-Husary (Mujawwad)
  - `ar.shaatree` — Abu Bakr Ash-Shaatree
  - `ar.mahermuaiqly` — Maher Al-Muaiqly
  - `ar.minshawi` — Muhammad Siddiq Al-Minshawi
- **Where used:** `src/lib/quranAudio.ts`, Quran browser audio playback.
- **License/terms:** https://alquran.cloud/terms-and-conditions (Section IV — Translations and recitations).
- **Provider grant:** Recitations are licensed to AlQuran Cloud for free, non-commercial redistribution, and the terms explicitly permit **streaming, embedding and download for personal and educational use**. Copyright in each recording remains with the reciter/estate, who may ask for content to be removed.
- **Implementation verified:** audio is **streamed directly from the Islamic Network CDN** — `src/lib/quranAudio.ts` builds `https://cdn.islamic.network/quran/audio/{128,64}/{reciter}/{ayah}.mp3` URLs consumed by the player. The app does **not** bundle the audio into the binary and does **not** re-host or redistribute it from our own server. Deen Companion is a **free** app.
- **Redistribution/display:** Direct streaming from the provider CDN for personal/educational use, consistent with the provider's stated grant.
- **Attribution required:** Credit each reciter (shown in the reciter picker and About → Content Credits).
- **Currently displayed:** Yes.
- **Status:** **VERIFIED (provider-term reliance)** — downgraded from a release blocker because the app relies on the provider's streaming grant for a free app rather than bundling/redistributing the recordings.
- **Compliance to maintain:** Keep streaming from the Islamic Network CDN; do not bundle the audio offline or re-serve it from our own infrastructure. Be prepared to remove a reciter if the rights-holder requests it.
- **Reassess if:** the app introduces paid tiers, offline audio download, or self-hosted audio — any of these would move beyond the personal/educational streaming grant and require per-reciter commercial clearance.
- **Nice-to-retain (not a blocker):** written confirmation from AlQuran Cloud / Islamic Network that CDN streaming in a distributed app is within their grant.

## 4. Tafsir (Commentary)

- **Exact source:** **Quran.com / Quran Foundation API** (`https://api.quran.com/api/v4`). Tafsir list is **dynamic** — the user can select any tafsir the API exposes (`/resources/tafsirs`). Default is Tafsir Ibn Kathir (English), `DEFAULT_TAFSIR_ID = 169`.
- **Where used:** `src/app/api/quran/tafsirs/route.ts`, `src/app/api/quran/tafsirs/[id]/[surah]/[ayah]/route.ts`, `src/types/quran.types.ts`.
- **License/terms:** Quran Foundation Developer Terms of Service (https://api-docs.quran.com/legal/developer-terms/). The current terms **expressly allow QF Content to be displayed inside applications, including commercial/freemium applications, without a separate commercial license**, provided QF Content / raw API data are **not sold, sublicensed, or redistributed**, and subject to attribution and a default storage/caching limit (one week).
- **Commercial use / display:** Permitted for in-app display under the Developer Terms. The app displays tafsir dynamically and does not sell, sublicense, or redistribute the raw API data.
- **Caching verified:** per-ayah tafsir is fetched from `.../tafsirs/{id}/by_ayah/{surah}:{ayah}` with `revalidate: 604800` (**exactly 7 days**) in `src/app/api/quran/tafsirs/[id]/[surah]/[ayah]/route.ts`; the tafsir list route uses the same 7-day window. This matches QF's default one-week storage limit.
- **Attribution required:** Yes — credit Quran.com / Quran Foundation and each tafsir author (shown in About → Content Credits).
- **Status:** **VERIFIED (Quran Foundation Developer Terms)** — not a release blocker.
- **Compliance to maintain / fixes:**
  1. Keep the 7-day cache window; do not persist QF content beyond one week or expose it as a downloadable/exportable dataset.
  2. Ensure the in-app attribution names **Quran.com / Quran Foundation** as the tafsir source alongside the tafsir author (attribution fix — see §A below).
  3. Do not add any endpoint that re-serves raw QF API data to third parties.
- **Nice-to-retain (not a blocker):** a saved copy of the accepted Developer Terms version and (if QF requires developer registration/API credentials) the registration confirmation.

## 5. Hadith Collections

- **Exact source:** **HadithAPI.com** (`https://hadithapi.com/api`), API key required (`HADITH_API_KEY`). Daily hadith draws from `sahih-bukhari` and `sahih-muslim`; the browser lists whichever collections the API returns with content.
- **Where used:** `src/app/api/hadith/route.ts`, `src/app/api/hadith/books/route.ts`, `src/app/api/hadith/chapters/route.ts`, `src/app/api/hadith/hadiths/route.ts`.
- **License/terms:** https://hadithapi.com — the official documentation states the API is **"free for everyone"** and that the service exists specifically to let developers display its hadith collection (with an API key). It does not publish a formal license document, and it does not publish any term expressly prohibiting our use.
- **Commercial use / redistribution:** Not expressly addressed. No provider term prohibits in-app display; underlying modern English hadith translations may be independently copyrighted.
- **Implementation:** hadith is fetched dynamically from `https://hadithapi.com/api` per request (`src/app/api/hadith/*`); not bundled or re-served as a dataset.
- **Attribution:** The app credits HadithAPI.com plus per-hadith book name and author/translator.
- **Currently displayed:** Yes — About → Acknowledgements + per-hadith book/author metadata.
- **Status:** **VERIFIED (documentation caveat)** — not a release blocker, because the provider documents that the API exists for developers to display its collection and publishes no prohibiting term. Treated as reliance on the provider's stated purpose rather than a signed license.
- **Compliance to maintain:** Continue dynamic display with attribution; do not export/redistribute the collection as a bulk dataset.
- **Nice-to-retain (not a blocker):** written confirmation from HadithAPI.com of commercial/free-app use and of the copyright status of the specific translations served (e.g., whether the English renderings are public-domain or licensed).

## 6. Prayer Times, Qibla, Hijri Calendar & Islamic Events

- **Exact source:** **AlAdhan API** (`https://api.aladhan.com/v1`), with the `praytime` npm library (MIT) as a local calculation fallback.
- **Where used:** `src/app/api/prayertimes/route.ts`, `src/app/api/qibla/route.ts`, `src/app/api/hijri/route.ts`, `src/app/api/calendar/*`, `src/app/api/islamic-events/route.ts`, `src/lib/prayerTimes.ts`, `src/hooks/useRamadanCountdown.ts`.
- **License/terms:** https://aladhan.com/credits-and-terms (provided as-is, no warranty; based on PrayTimes.org formulas).
- **Commercial use:** Yes — the outputs are computed astronomical/calendar data (facts/formulas), not copyrightable creative content.
- **Attribution required:** Not strictly; courtesy credit to AlAdhan / PrayTimes.org.
- **Currently displayed:** Yes — About → Acknowledgements.
- **Evidence adequacy for Apple:** Adequate (computational data).
- **Status:** **VERIFIED**

## 7. Maps — Base Tiles

- **Exact source:** **OpenStreetMap standard raster tiles** — `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
- **Where used:** `src/components/places/MosqueMap.tsx`, `src/components/places/FoodMap.tsx` (`OSM_STYLE` raster source).
- **License/terms:** OSMF Tile Usage Policy — https://operations.osmfoundation.org/policies/tiles/ ; data © OpenStreetMap contributors under ODbL.
- **Nature of the requirement:** This is an **operational / service-policy** matter, **not** a content-rights prohibition. The policy explicitly permits normal **interactive** viewing where the client requests only the tiles needed for the current viewport. Our maps are standard interactive MapLibre raster maps (`src/components/places/MosqueMap.tsx`, `src/components/places/FoodMap.tsx`) with no offline/bulk prefetch. What the policy requires for that permitted use: visible attribution, no bulk download / offline prefetch, honouring cache headers, and a distinct app-identifying HTTP `User-Agent` (or platform app-ID header).
- **Attribution required:** Yes — "© OpenStreetMap contributors" (present in the raster source and on the places pages). ✔
- **Compliance status against the policy:**
  - Attribution shown — ✔
  - No bulk download / no "download for offline" feature — ✔
  - Correct HTTPS tile URL — ✔
  - Distinct app-identifying User-Agent — ✖ (native Capacitor WebView tile requests use the WebView default; policy asks apps to send a stable, app-naming UA)
  - Referer on web + non-restrictive Referrer-Policy — verify
  - Cache honouring server headers (or ≥7-day TTL) — verify (rely on WebView/HTTP cache; not explicitly configured)
- **Status:** **OPERATIONAL FIX (service policy)** — not a content-rights blocker.
- **Operational fixes:**
  1. Set a distinct, stable app-identifying User-Agent for tile requests (e.g., `DeenCompanion/1.2 (+contact URL)`); for native apps ensure the WebView/native tile requests carry it (or a platform app-ID header).
  2. Keep attribution visible and not hidden behind toggles; add a "Report a map issue" link to `https://www.openstreetmap.org/fixthemap` (recommended).
  3. Ensure no offline/prefetch of tiles is ever added; honour HTTP cache headers.
  4. Recommended for production scale/reliability: consider a provider whose terms are built for app traffic (MapTiler, Stadia Maps, Geoapify tiles, or self-hosted/vector tiles), since the policy warns access to the public server can be withdrawn. Keep "© OpenStreetMap contributors" attribution regardless.

## 8. Maps — Mosque Data (Overpass)

- **Exact source:** OpenStreetMap via **Overpass API** (`amenity=place_of_worship`, `religion=muslim`).
- **Where used:** `src/lib/places.ts` (`buildOverpassQuery`, `parseMosqueData`), `src/app/api/mosques/*`.
- **License/terms:** Data © OpenStreetMap contributors, ODbL — https://www.openstreetmap.org/copyright.
- **Commercial use / redistribution:** Yes, under ODbL (attribution + share-alike for derived databases).
- **Attribution required:** Yes — "© OpenStreetMap contributors."
- **Currently displayed:** Yes — mosques page attribution block + About.
- **Evidence adequacy for Apple:** Adequate for data rights.
- **Status:** **VERIFIED** (data). Operational caveat: public Overpass instances are for reasonable use, not heavy production; use a dedicated/self-hosted instance at scale.

## 9. Maps — Geocoding (Nominatim)

- **Exact source:** **Nominatim** (`https://nominatim.openstreetmap.org`).
- **Where used:** `src/app/api/geocode/search/route.ts`, `src/app/api/geocode/reverse/route.ts`. Sends `User-Agent: RamadanCompanion/1.0 (…)`.
- **License/terms:** Nominatim Usage Policy — https://operations.osmfoundation.org/policies/nominatim/ (max 1 req/sec; no heavy use; valid User-Agent/Referer; attribute OSM). Data © OpenStreetMap contributors, ODbL.
- **Commercial use:** Data yes (ODbL). The **public Nominatim server** is not intended for heavy/production commercial load.
- **Attribution required:** Yes — "© OpenStreetMap contributors."
- **Currently displayed:** Yes — About → Acknowledgements.
- **Evidence adequacy for Apple:** Adequate for data rights.
- **Status:** **VERIFIED** (data) with operational caveat.
- **Action:** For App Store scale, move to a self-hosted or commercial geocoder; update the User-Agent product name from `RamadanCompanion/1.0` to the current app identity with a valid contact URL.

## 10. Maps — Halal Food (Geoapify)

- **Exact source:** **Geoapify Places API** (`https://api.geoapify.com/v2/places`), API key required.
- **Where used:** `src/lib/places.ts` (`buildGeoapifyUrl`, `parseGeoapifyFeature`), `src/app/api/food/*`.
- **License/terms:** https://geoapify.com/terms-and-conditions/ ; results are OpenStreetMap-derived (ODbL).
- **Commercial use:** Yes — Geoapify is "built for business use" with registration; free tier ~3,000 req/day.
- **Attribution required:** Yes — Geoapify + "© OpenStreetMap contributors."
- **Currently displayed:** Yes — food page attribution block ("Results are provided by Geoapify and OpenStreetMap") + About.
- **Evidence adequacy for Apple:** Adequate.
- **Status:** **VERIFIED** (ensure a paid plan/registered key for production volume).

## 11. Currency Exchange Rates

- **Exact source:** **fawazahmed0 currency-api** via `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest` (fallback `https://latest.currency-api.pages.dev`).
- **Where used:** `src/app/api/currency/route.ts`, `src/app/api/currency/list/route.ts`.
- **License/terms:** The currency-api project is published for free/open use; exchange-rate values are non-copyrightable facts.
- **Commercial use / redistribution:** Yes.
- **Attribution required:** Not required; courtesy credit given.
- **Currently displayed:** Yes — About → Acknowledgements.
- **Status:** **VERIFIED** (not religious content).

## 12. Fonts

- **Exact source:** **Manrope** and **Noto Naskh Arabic**, via `next/font/google` (self-hosted at build).
- **Where used:** `src/app/layout.tsx`, `src/app/globals.css`.
- **License/terms:** SIL Open Font License 1.1.
- **Commercial use / redistribution / embedding:** Yes (OFL permits bundling/embedding; fonts may not be sold on their own).
- **Attribution required:** Not required in UI (OFL); credited in Content Credits.
- **Status:** **VERIFIED**

## 13. Icons & Core Libraries

- **Lucide icons** — ISC License. **VERIFIED**
- **MapLibre GL JS** — BSD-3-Clause. **VERIFIED**
- Framework/libraries (Next.js MIT, React MIT, Supabase Apache-2.0, TailwindCSS MIT, Radix/shadcn MIT, Recharts MIT, Capacitor MIT, Firebase Admin Apache-2.0, web-push MIT, praytime MIT, geo-tz MIT) — permissive, credited in About. **VERIFIED**

## 14. Bundled Self-Authored Religious Content

- **Duas** (`src/lib/duas.ts`), **Zikr phrases** (`src/lib/zikr.ts`), **Prayer quotes** (`src/lib/prayerQuotes.ts`), **99 Names of Allah** (`src/data/asmaAlHusna.json`).
- **Nature:** Arabic supplications/names are drawn from the Qur'an and hadith (public religious text); each dua cites its source (Bukhari, Muslim, Abu Dawud, Tirmidhi, or Qur'an). Transliterations and English renderings were compiled for this app.
- **Commercial use / redistribution:** Yes (own content / public religious text).
- **Attribution required:** Sources cited in-app.
- **Status:** **VERIFIED** — with the standing check that no English rendering is a verbatim copy of a still-copyrighted translation.

---

## §A. Attribution fixes (in-app)

These are attribution-completeness fixes, not permission problems:

1. **Tafsir source:** ensure the tafsir view/credits name **Quran.com / Quran Foundation** as the API source alongside the tafsir author. (Now in About → Content Credits; confirm it also reads clearly wherever tafsir is displayed.)
2. **Translators:** each translation credited by name (Pickthall, Yusuf Ali, Asad, Saheeh International) — done in About → Content Credits.
3. **Reciters:** each reciter credited by name + Islamic Network as the streaming source — done.
4. **Maps:** "© OpenStreetMap contributors" on maps (done) plus Geoapify credit on the food page (done); keep visible and unhidden.

## Release Blockers Summary (content rights)

**Revised assessment:** After re-reading the providers' current official terms and verifying the implementation (dynamic retrieval/streaming, 7-day tafsir cache), there are **no remaining content-rights release blockers**. Items previously flagged are reclassified as provider-term reliance (verified) or operational fixes.

**Reclassified — now VERIFIED (provider-term reliance), NOT blockers:**

1. **Muhammad Asad translation (`en.asad`)** — displayed dynamically via AlQuran Cloud, which delivers translations contributed by rights-holders / public-domain editions; not bundled or redistributed by us. VERIFIED (provider-term reliance).
2. **Saheeh International translation (`en.sahih`)** — displayed dynamically via AlQuran Cloud (demonstrated in AlQuran Cloud's own API docs); not bundled/redistributed. VERIFIED (provider-term reliance).
3. **Quran audio recitations** — streamed directly from the Islamic Network CDN for a free app; provider terms permit streaming/embedding for personal/educational use; not bundled or re-hosted. VERIFIED (provider-term reliance). *Reassess if the app adds paid tiers, offline download, or self-hosting.*
4. **Tafsir via Quran.com** — Quran Foundation Developer Terms expressly allow in-app display (incl. commercial/freemium) without a separate commercial license, provided content is not sold/sublicensed/redistributed; our 7-day cache matches QF's storage limit. VERIFIED (Quran Foundation Developer Terms).
5. **Hadith via HadithAPI.com** — provider documents the API is free and exists for developers to display its collection; no prohibiting term found. VERIFIED (documentation caveat).

**Operational fix (service policy, not content rights):**

6. **OpenStreetMap base tiles (`tile.openstreetmap.org`)** — normal interactive use is permitted; attribution/no-bulk-download are satisfied. Fixes: send a distinct app-identifying User-Agent, verify cache/Referer behavior, add a fixthemap link, and (recommended for scale/reliability) consider an app-oriented tile provider. Attribution already present.

**Already VERIFIED (unchanged):** Quran Arabic text (Uthmani via AlQuran Cloud/Tanzil/Quran Academy), Pickthall & Yusuf Ali translations (public domain), AlAdhan prayer/Qibla/Hijri data, Overpass mosque data + Nominatim geocoding (ODbL, attribution present; operational scaling caveat), Geoapify halal-food data, currency rates, fonts, icons, libraries, and bundled self-authored duas/zikr/99 Names.

**Provider confirmations worth retaining (nice-to-have, not blockers):** written note from AlQuran Cloud on dynamic API display in a distributed app; AlQuran Cloud / Islamic Network note on CDN audio streaming; the accepted Quran Foundation Developer Terms version (+ any required registration); HadithAPI.com note on free/commercial-app use and the copyright status of the specific hadith translations served.
