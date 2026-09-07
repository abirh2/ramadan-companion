# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Deen Companion primarily serves practicing Muslims who want to maintain daily worship and reflection amid busy, modern routines. People can use the core experience anonymously; signing in adds protected features and cross-device persistence.

## Product Purpose

Deen Companion brings the recurring tools of Islamic worship and reflection into one year-round companion. It helps users keep track of prayer, engage with the Quran and hadith, practice zikr and dua, manage charitable giving, follow the Islamic calendar, and find nearby mosques and halal food.

Success means making these practices easier to access, organize, and sustain without turning the user's faith, attention, or personal data into an advertising product.

## Positioning

Deen Companion's defining promise combines two ideas:

- an integrated worship toolkit that replaces a collection of disconnected single-purpose utilities;
- privacy-first, ad-free operation that does not monetize user data.

## Operating Context

The primary interface is a responsive web application and installable PWA. The same web product is delivered through Capacitor wrappers on iOS and Android, with native integrations such as notifications, haptics, authentication, and home-screen widgets where supported.

The product supports quick daily check-ins as well as deeper sessions: checking the next prayer, marking prayers complete, reading or listening to Quran, browsing hadith and tafsir, counting zikr, recording donations, reviewing progress, consulting the Hijri calendar, and finding nearby places.

Location, time zone, notification permissions, network availability, and device capabilities affect parts of the experience. Core prayer-time calculation includes an offline fallback.

## Capabilities and Constraints

- Prayer times, countdowns, configurable calculation methods, Qibla direction, prayer completion tracking, historical statistics, and per-prayer notifications.
- Quran browsing across all 114 surahs, Juz navigation, translations, bookmarks, favorites, tafsir, search, sharing, and per-ayah recitation.
- Hadith browsing across major collections with book and chapter navigation, Arabic and translated text, grading explanations, search, sharing, and favorites.
- Daily Quran and hadith content, a dual Gregorian/Hijri calendar, Islamic events, zikr counters, duas, and the 99 Names of Allah.
- Donation tracking, multi-currency views, charts, and a locally processed zakat calculator.
- Nearby mosque and halal-food discovery using location search, maps, and external place data.
- Anonymous access for core content; Supabase authentication and storage for protected or synchronized data.
- Responsive web/PWA delivery plus Capacitor iOS and Android wrappers. Native widgets and device integrations are enhancements to the web product, not separate product identities.
- External Islamic-content, prayer-time, mapping, geocoding, and currency services require resilient loading, clear errors, and appropriate fallbacks.
- Product terminology should use “Deen Companion”; “Ramadan Companion” is the former name and may remain only in legacy technical locations until migrated.

## Brand Commitments

- Product name: **Deen Companion**.
- Core features remain free.
- No advertising, third-party behavioral tracking, or monetization of personal data.
- Islamic content must come from authentic, attributable sources; the product must not invent religious claims or imply unverified scholarly authority.
- Accessibility and broad usability are non-negotiable.
- The project remains open-source friendly and receptive to community feedback.

## Evidence on Hand

- The implemented application and tests under `src/` are the primary evidence for current capabilities.
- `README.md` and `docs/features.md` describe the current feature set and integrations.
- `docs/privacy.md` records data handling, retention, account deletion, and local-versus-cloud storage behavior.
- `docs/roadmap.md` records planned work; roadmap items are not current-product claims until implemented.
- `public/manifest.json`, `capacitor.config.json`, `ios/`, and `android/` document PWA and mobile-wrapper delivery.
- App icons and the creator profile are stored under `public/`; current interface captures are stored under `screenshots/` and `public/social-previews/`.
- No testimonials, press quotes, customer logos, scholarly endorsements, or independent usage evidence have been confirmed. Future work must not fabricate them.

## Product Principles

1. **Keep worship connected.** Treat prayer, scripture, remembrance, charity, and local community needs as parts of one coherent daily practice.
2. **Respect the user.** Preserve privacy, avoid ads and behavioral tracking, and make local-versus-cloud data behavior understandable.
3. **Earn religious trust.** Prefer attributable sources, clear grading or provenance, and honest limitations over unsupported certainty.
4. **Work in real life.** Support fast check-ins, mobile use, unreliable networks, location differences, and device constraints.
5. **Stay open and inclusive.** Keep core value free, maintain accessible interaction, and let community feedback improve the product.

## Accessibility & Inclusion

Accessibility is a required product commitment. The existing target is WCAG 2.1 AA, including keyboard navigation, semantic structure, screen-reader support, sufficient contrast, and usable touch targets.

The product should remain useful across locations, common Islamic calculation conventions, anonymous and signed-in states, light and dark themes, and devices with differing sensor or notification support. Planned language support must not be presented as available until implemented.
