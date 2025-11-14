# Project Roadmap

This document outlines the development milestones and future vision for the Ramadan Companion App.

---

## Version Goals

| Version | Status | Timeline | Focus |
|----------|---------|----------|-------|
| **V1.0** | ✅ **COMPLETE** (Nov 2024) | Launched | Foundational features, Auth, Core worship tools |
| **V1.1** | 🚧 **IN PROGRESS** | 2-3 weeks | Quick wins, UX polish, Enhanced features |
| **V1.2** | 📋 Planned | 1-2 months | Worship content expansion, Audio features |
| **V1.3** | 📋 Planned | 2-3 months | Community features, Reviews, Advanced tools |
| **V2.0** | 🔮 Vision | 3-6 months | Full platform, Social features, Real-time collaboration |

---

## V1.0 – Core Launch ✅ COMPLETE

**Completion Date:** November 2024  
**Status:** Live and deployed on Vercel  
**Objective:** Deliver a self-contained, privacy-respecting companion for Ramadan and daily worship.

### Features Delivered
| Feature | Description | Status |
|----------|-------------|--------|
| Authentication | Email/password + OAuth (Google) | ✅ Complete |
| User Profile | Profile settings, display name, preferences | ✅ Complete |
| Dashboard | 8 feature cards + hero Ramadan countdown | ✅ Complete |
| Prayer Times & Qibla | Daily schedule, countdown, Qibla compass, fallback calculation | ✅ Complete |
| Ramadan Countdown | Pre-Ramadan and during-Ramadan timers with Hijri calendar | ✅ Complete |
| Quran of the Day | Daily ayah with 4 translations, favorites, share | ✅ Complete |
| Hadith of the Day | Daily hadith (3 languages), favorites, grading, share | ✅ Complete |
| Charity Tracker | Full CRUD, monthly views, charts, zakat calculator | ✅ Complete |
| Zikr Counter | 5 phrases, 20 duas, Fajr auto-reset, audio/haptic feedback | ✅ Complete |
| Mosque Finder | OpenStreetMap integration, map + list views, directions | ✅ Complete |
| Halal Food Finder | Geoapify integration, triple search strategy, map + list | ✅ Complete |
| Favorites System | Save Quran verses and hadiths, dedicated page | ✅ Complete |
| User Feedback | Anonymous feedback on all 10 pages | ✅ Complete |
| Admin Dashboard | Feedback management, analytics, workflow tools | ✅ Complete |
| About Page | Creator info, acknowledgements, API attribution | ✅ Complete |

### Technical Stack (Final)
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **UI:** TailwindCSS + shadcn/ui + Lucide Icons
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Auth:** Email/password + Google OAuth
- **Maps:** MapLibre GL + OpenStreetMap tiles
- **Charts:** Recharts (line, bar, pie)
- **APIs:** AlAdhan, AlQuran Cloud, HadithAPI, OSM Overpass, Nominatim, Geoapify
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **Deployment:** Continuous deployment via GitHub

### Key Achievements
- ✅ Full authentication flow with RLS security
- ✅ 10 pages with comprehensive features
- ✅ Offline prayer time fallback (local calculation)
- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Privacy-first architecture
- ✅ Anonymous + authenticated user support
- ✅ Admin tools for app management
- ✅ PWA-ready infrastructure

---

## V1.1 – Quick Wins & Polish 🚧

**Timeline:** 2-3 weeks  
**Status:** IN PROGRESS - 1 of 10 features complete  
**Focus:** High-impact enhancements, bug fixes, UX improvements  
**Theme:** Enhance existing features and add most-requested capabilities

### Feature Priorities
| Priority | Feature | Description | Status |
|----------|---------|-------------|---------|
| 🔥 High | Full Quran Browser | Search by surah/ayah, juz navigation, browse all 114 surahs | ✅ **Complete** (Nov 2024) |
| 🔥 High | Prayer Time Notifications | Web Push API for prayer reminders | 📋 Planned |
| 🔥 High | Expanded Dua Library | 50 → 100+ duas with new categories | 📋 Planned |
| 🔥 High | Prayer Tracking | Mark prayers as completed, daily progress | 📋 Planned |
| 🟡 Medium | Recurring Donations | Track monthly/yearly recurring charity | 📋 Planned |
| 🟡 Medium | CSV Export | Download donation history for taxes | 📋 Planned |
| 🟡 Medium | Multi-currency | USD, EUR, GBP, CAD, conversion support | 📋 Planned |
| 🟡 Medium | Profile Picture Upload | User profile images | 📋 Planned |
| 🟡 Medium | Places Favorites | Save favorite mosques/restaurants | 📋 Planned |
| 🟢 Low | Donation Insights | Enhanced charts with trends | 📋 Planned |

### Recently Completed
| Feature | Completion Date | Description |
|---------|----------------|-------------|
| **Full Quran Browser** | November 2024 | Complete browsing experience with 114 surahs, Juz navigation, bookmarks (dual-storage), favorites integration, translation switching, auto-resume, ayah sharing, search, list/grid views |

### Technical Enhancements
- **PWA Manifest:** Make app installable on mobile devices
- **Notification Permission Flow:** User-friendly permission request UI
- **Service Worker:** Offline caching strategy for core pages
- **Image Optimization:** WebP format, lazy loading, compression
- **Performance:** Code splitting, bundle size reduction
- **Currency API Integration:** Real-time conversion rates
- **Database Migrations:** New tables for prayers, favorites, recurring donations

### Bug Fixes & Polish
- Address user-reported feedback from feedback system
- Mobile UI refinements (spacing, touch targets)
- Loading state improvements (skeletons, spinners)
- Error handling enhancements (retry logic, better messages)
- Accessibility improvements (ARIA labels, keyboard nav)

### Dependencies
- **ExchangeRate-API.com:** Free tier (1500 requests/month)
- **Web Push API:** Native browser support (no external service)
- **Supabase Storage:** Image hosting (free tier sufficient)

---

## V1.2 – Worship Content Expansion 📋

**Timeline:** 1-2 months after V1.1  
**Focus:** Rich Islamic content, audio features, study tools  
**Theme:** Deep spiritual engagement through multimedia content

### Feature Priorities
| Priority | Feature | Description | Dependencies |
|----------|---------|-------------|--------------|
| 🔥 High | Quran Audio Recitation | Multiple reciters (Mishary, Abdul Basit, Sudais) | EveryAyah.com API (free) |
| 🔥 High | Hadith Browser | Browse 6 major collections, search by topic/narrator | HadithAPI extension |
| 🔥 High | Tafsir Integration | Ibn Kathir commentary for Quran verses | Quran.com API or static JSON |
| 🔥 High | Islamic Calendar | Full Hijri calendar with important dates (Eid, Laylat al-Qadr) | AlAdhan Calendar API |
| 🟡 Medium | Expanded Dhikr Tracking | Wird programs, Salawat, Istighfar counters | Supabase (wird_programs table) |
| 🟡 Medium | Dua Audio | Audio pronunciations for popular duas | Hosted audio files |
| 🟡 Medium | Notes on Favorites | Personal reflections on saved content | Supabase (notes field) |
| 🟡 Medium | Quran Progress Tracking | Track reading progress by juz/surah | Supabase (reading_progress table) |
| 🟡 Medium | Hadith Search | Keyword search, filter by authenticity | Client-side filtering |
| 🟢 Low | Social Sharing | WhatsApp/Twitter share integration | Native share API |

### Technical Components
- **Audio Player:** Custom component with play/pause/seek/speed controls
- **Audio Storage Strategy:** CDN hosting or Supabase Storage
- **Tafsir Data Structure:** JSON format with verse mapping
- **Calendar Component:** Hijri-Gregorian dual calendar
- **Social Share API:** Native Web Share API integration
- **Background Audio:** Service worker for continuous playback

### Dependencies
- **EveryAyah.com:** Free MP3 audio files by reciter and ayah
- **Quran.com API:** Tafsir data (Ibn Kathir)
- **AlAdhan Calendar API:** Hijri dates and Islamic events
- **Audio Hosting:** Supabase Storage or external CDN

---

## V1.3 – Community & Advanced Features 📋

**Timeline:** 2-3 months after V1.2  
**Focus:** User interaction, reviews, advanced personalization  
**Theme:** Build community and provide professional-grade tools

### Feature Priorities
| Priority | Feature | Description | Dependencies |
|----------|---------|-------------|--------------|
| 🔥 High | Mosque/Food Reviews | User ratings, written reviews, helpful votes | Supabase (reviews, ratings tables) |
| 🔥 High | Photo Uploads | Community photos for mosques/restaurants | Supabase Storage + moderation |
| 🔥 High | Advanced Prayer Settings | High latitude methods, manual time tuning | PrayTime library extensions |
| 🟡 Medium | Phone Compass | DeviceOrientationEvent for live Qibla arrow | Device Orientation API |
| 🟡 Medium | Streak Tracking | Daily prayer/zikr streaks with achievements | Supabase (streaks table) |
| 🟡 Medium | Email Notifications | Digest emails, donation receipts | SendGrid/Resend API (free tier) |
| 🟡 Medium | Password Reset | Forgot password flow | Supabase Auth |
| 🟡 Medium | Multi-language | Arabic and Urdu interface | next-intl or i18next |
| 🟡 Medium | Custom Themes | 3 theme options (default, Ramadan night, neutral) | CSS variables + theme system |
| 🟢 Low | Data Export | GDPR-compliant user data download | JSON/CSV generation |

### Technical Components
- **Review System:** Moderation queue, spam detection, helpful voting
- **Image Upload:** Compression, format conversion, thumbnail generation
- **Device Orientation:** Real-time compass rotation with calibration
- **Email Service:** Transactional email templates
- **i18n Framework:** Translation management, RTL support
- **Theme Architecture:** Dynamic CSS variables, theme switcher

### Dependencies
- **Supabase Storage:** Image hosting with RLS policies
- **SendGrid/Resend:** Email delivery (free tier: 100-300/day)
- **Device APIs:** Native browser orientation sensors
- **Translation Files:** Community-contributed translations

---

## V2.0 – Full Platform 🔮

**Timeline:** 3-6 months after V1.3  
**Focus:** Community platform, social features, real-time collaboration  
**Theme:** Transform into comprehensive Islamic community hub

### Major Feature Categories

**1. Social & Community (High Priority)**
- Community feed (global shared content, opt-in)
- User profiles (public/private, bio, location, interests)
- Follow system (follow users, see their shared content)
- Group zikr challenges (compete with friends/family)
- Community events calendar (local events, lectures, study circles)
- Local announcements (Eid prayers, community news)

**2. Collaborative Features (Medium Priority)**
- Charity fundraising campaigns (create, track, contribute)
- Quran memorization groups (track progress together)
- Study buddy matching (find partners for Quran/Hadith study)
- Volunteer opportunities (mosques, charities, community service)
- Emergency contacts (imam, counseling, Islamic resources)

**3. Advanced Content (Medium Priority)**
- Quran word-by-word translation display
- Hadith narrator chains (isnad) visualization
- Tafsir search by topic/theme
- Islamic course platform (structured learning paths)
- Children's section (age-appropriate content)

**4. Personalization & AI (Low Priority)**
- Customizable dashboard (widget system)
- Goal tracking (spiritual goals, habit formation)
- AI-driven content recommendations
- Voice-assisted navigation
- Smart reminders (context-aware notifications)

### Technical Infrastructure

**Database Extensions:**
- Social graph tables (followers, following, likes)
- Community content tables (posts, comments, reactions)
- Events and announcements tables
- Groups and memberships tables
- Campaigns and contributions tables

**Real-time Features:**
- Supabase Realtime subscriptions (live updates)
- WebSocket connections for group activities
- Live prayer time synchronization
- Real-time notifications (in-app)

**Moderation & Safety:**
- Content moderation tools (admin review queue)
- Report/block functionality
- Automated spam detection
- User reputation system
- Privacy controls (granular visibility)

**Scalability:**
- Database optimization (indexes, query performance)
- CDN integration (static assets)
- Caching strategy (Redis/Supabase cache)
- Rate limiting (API protection)
- Load balancing (horizontal scaling)

### Dependencies
- **Supabase Realtime:** Live subscriptions (free tier sufficient initially)
- **Moderation API:** Content filtering (OpenAI Moderation API or similar)
- **CDN:** Cloudflare or Vercel Edge (free tier available)
- **Email Service:** Bulk email for notifications (SendGrid/Mailchimp)

---

## Dependencies Summary

### Current (V1.0) ✅
| Dependency | Usage | Status | Notes |
|-------------|--------|--------|-------|
| **Supabase** | Database, Auth, Storage, RLS | ✅ Active | Free tier sufficient (up to 500MB DB) |
| **AlAdhan API** | Prayer times, Hijri calendar, Qibla | ✅ Active | No auth key needed, public access |
| **AlQuran Cloud API** | Quran text, translations | ✅ Active | Public access, 4 translations integrated |
| **HadithAPI** | Hadith collections | ✅ Active | Free API key, Sahih Bukhari + Muslim |
| **OpenStreetMap Overpass** | Mosque locations | ✅ Active | Free, community-driven, fair use policy |
| **Nominatim** | Geocoding, address search | ✅ Active | Free OSM service, rate-limited |
| **Geoapify Places API** | Halal food locations | ✅ Active | Requires API key, free tier available |
| **Vercel** | Frontend hosting, edge functions | ✅ Active | Free plan (hobby tier) |
| **MapLibre GL** | Interactive maps | ✅ Active | Open-source, OSM tiles |

### Planned (V1.1+) 📋
| Dependency | Usage | Timeline | Cost |
|-------------|--------|----------|------|
| **ExchangeRate-API** | Currency conversion | V1.1 | Free: 1500 req/month |
| **Web Push API** | Prayer notifications | V1.1 | Native browser, free |
| **EveryAyah.com** | Quran audio MP3 files | V1.2 | Free downloads |
| **SendGrid/Resend** | Email notifications | V1.3 | Free: 100-300/day |
| **Supabase Realtime** | Live updates | V2.0 | Free tier sufficient |

---

## Long-Term Vision

**Mission:** Build the most comprehensive, privacy-respecting Islamic companion platform.

### Year 1 Goals (V1.0 → V1.3)
- ✅ Launch core worship features (Prayer, Quran, Hadith, Charity, Zikr)
- ✅ Establish user base with feedback system
- 📋 Enhance with multimedia content (audio, tafsir, calendar)
- 📋 Build community features (reviews, photos, events)
- 📋 Support 3+ languages (English, Arabic, Urdu)

### Year 2 Goals (V2.0+)
- 🔮 Transform into social platform for Muslim community
- 🔮 Enable collaborative learning (groups, study circles)
- 🔮 Integrate AI for personalized recommendations
- 🔮 Expand to 10+ languages
- 🔮 Mobile native apps (iOS, Android)

### Core Principles (Never Compromise)
1. **Privacy-First:** User data is sacred, RLS enforced, no tracking
2. **Free & Open:** Core features always free, funded by donations
3. **Authentic Content:** Verified Islamic sources, scholarly review
4. **Accessibility:** Works for all Muslims regardless of location/language
5. **Community-Driven:** User feedback shapes roadmap
6. **Open-Source Friendly:** Leverage and contribute to Islamic tech community

### Success Metrics
- **V1 (Achieved):** 10 features, 10 pages, full auth, admin tools
- **V1.1:** 100+ daily active users, <5 critical bugs, 80% feature satisfaction
- **V1.2:** 500+ users, audio playback <1% error rate, tafsir on 50% of ayahs
- **V1.3:** 1000+ users, 500+ reviews contributed, 3 languages live
- **V2.0:** 5000+ users, 100+ daily posts, active community moderation

### What Makes Us Different
- **Comprehensive:** Prayer + Quran + Hadith + Charity + Community in one app
- **Offline-Ready:** Core features work without internet
- **No Ads:** Privacy-respecting, no tracking, no monetization of user data
- **Modern Tech:** Next.js 16, React 19, cutting-edge web platform
- **Open Development:** Public roadmap, user-driven features, transparent priorities

---

## Get Involved

**For Users:**
- Report bugs via feedback button on any page
- Suggest features in the admin feedback system
- Share the app with your community
- Contribute to open-source dependencies

**For Developers:**
- Review code on GitHub
- Contribute translations (i18n files)
- Build integrations with Islamic APIs
- Submit PRs for bug fixes

**For Scholars:**
- Review religious content for accuracy
- Suggest authentic Islamic sources
- Provide guidance on feature appropriateness
- Help with Arabic/Islamic terminology

---

*Last Updated: November 2024*  
*Version: 1.0*  
*Next Review: V1.1 Launch*
