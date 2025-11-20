# Ramadan Companion

> **Version 1.1** | Built with Next.js 16, React 19, TypeScript, and Supabase

A modern, minimal web app built for Muslims to assist with daily worship and reflection—especially during Ramadan. Comprehensive features for prayer times, Quran study, hadith reading, charity tracking, zikr counter, and finding nearby mosques and halal food.

## Features (V1.1 Complete)

### Core Features
- ✅ **Prayer Times & Qibla** - Accurate daily prayer times with 7 calculation methods, live countdown, Qibla compass, and offline fallback
- ✅ **Prayer Notifications** - Browser notifications at exact prayer times with motivational hadith quotes and per-prayer control
- ✅ **Ramadan Countdown** - Track days until Ramadan with Hijri calendar integration and iftar/suhoor timers
- ✅ **Quran Browser** - Browse all 114 surahs with translations, Juz navigation, manual bookmarks with explicit controls, search, and favorites
- ✅ **Quran Audio** - Per-ayah audio recitation with 6 verified reciters (Alafasy, Husary, Shaatree, etc.) with session-persistent selection
- ✅ **Tafsir Integration** - Access 20+ scholarly commentaries in multiple languages (English, Arabic, Bengali, etc.) with session-persistent selection
- ✅ **Daily Quran** - Weighted random ayah selection with 4 translations (Asad, Sahih International, Pickthall, Yusuf Ali)
- ✅ **Daily Hadith** - Authentic hadith from Sahih Bukhari and Muslim with English/Urdu/Arabic text and grading
- ✅ **Charity Tracker** - Full donation CRUD with monthly calendar/list views, line/bar/pie charts, and zakat calculator
- ✅ **Zikr & Duas** - Counter with 5 phrases, goal tracking, Fajr auto-reset, audio/haptic feedback, and 20 categorized duas
- ✅ **Favorites System** - Save and manage favorite Quran verses and hadiths with full text and copy buttons
- ✅ **Mosque Finder** - Discover nearby mosques using OpenStreetMap with interactive map and list views
- ✅ **Halal Food Finder** - Locate halal restaurants using Geoapify with cuisine filters and facility info
- ✅ **User Feedback** - Anonymous feedback system on all pages for continuous improvement
- ✅ **Admin Dashboard** - Feedback management, analytics, and workflow tools for administrators

### Technical Features
- ✅ **Authentication** - Secure sign-in with email/password and Google OAuth
- ✅ **Dark Mode** - Beautiful theme switching for day and night
- ✅ **Mobile-First** - Responsive design optimized for all devices
- ✅ **Privacy-First** - Your data stays secure with Supabase RLS policies
- ✅ **Offline Support** - Works offline with intelligent caching and local prayer time calculation
- ✅ **Installable PWA** - Install on iOS, Android, and Desktop for native app experience with offline access
- ✅ **Accessibility** - WCAG 2.1 AA compliant with full keyboard navigation, screen reader support, and semantic HTML
- ✅ **Prayer Tracking** - Mark prayers as completed and track daily progress with historical analytics and charts

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once (CI/CD)
npm run test:ci

# Run tests with coverage report
npm run test:coverage
```

See [docs/testing.md](docs/testing.md) for detailed testing guide.

## Deployment

Ready to deploy? See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide to Vercel (recommended and free).

**Quick Deploy to Vercel:**
1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables (Supabase credentials)
4. Deploy!
5. **Set up external cron service** for prayer notifications (see [external-cron-setup.md](docs/external-cron-setup.md))

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Documentation Index](docs/README.md)** - Overview and complete documentation links
- **[Features Guide](docs/features.md)** - Detailed feature specifications
- **[API Structure](docs/api-structure.md)** - API endpoints and external integrations
- **[Authentication Setup](docs/auth-setup.md)** - Supabase auth configuration guide
- **[Quran Implementation](docs/quran-implementation.md)** - Quran feature implementation details
- **[Testing Guide](docs/testing.md)** - Complete testing documentation

See [docs/README.md](docs/README.md) for the complete documentation index.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: TailwindCSS + shadcn/ui + Lucide Icons
- **Database**: Supabase (PostgreSQL + Auth + RLS + Storage)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **Maps**: MapLibre GL + OpenStreetMap tiles
- **Charts**: Recharts (line, bar, pie)
- **APIs**: AlAdhan, AlQuran Cloud, Quran.com, HadithAPI, OpenStreetMap Overpass, Nominatim, Geoapify Places
- **Hosting**: Vercel (frontend) + Supabase (backend)

## What's Next (V1.2)

We're planning the next version with exciting enhancements focused on rich Islamic content and performance optimization:

### Recently Completed (V1.2)
- ✅ **Quran Audio Recitation** - Per-ayah playback with 6 verified reciters (Alafasy, Husary, Shaatree, Maher Al Muaiqly, Minshawi, Husary Mujawwad)
- ✅ **Tafsir Integration** - 20+ scholarly commentaries including Ibn Kathir, Ma'arif al-Qur'an, Tafsir Muyassar, and more in English, Arabic, Bengali, Kurdish, Russian, and Urdu

### Planned for V1.2+
- 📚 **Hadith Browser** - Browse 6 major hadith collections with search by topic and narrator
- 📅 **Islamic Calendar** - Full Hijri calendar with important dates (Eid, Laylat al-Qadr)
- 🤲 **Expanded Dua Library** - 100+ duas with new categories (illness, travel, marriage, children)
- ⚡ **Performance Optimization** - Image optimization, code splitting, and faster loading times
- 🎨 **UI Refinements** - Enhanced mobile experience and improved loading states

See our [complete roadmap](docs/roadmap.md) for V1.3 and V2.0 plans including community features, multi-language support, and more!

## Contributing

Contributions are welcome! Please read the documentation in `/docs` before contributing.

### Ways to Contribute
- **Report Bugs**: Use the feedback button on any page
- **Suggest Features**: Submit ideas via the admin feedback system
- **Code Contributions**: Submit PRs for bug fixes or enhancements
- **Translations**: Help translate the interface to Arabic, Urdu, and other languages
- **Documentation**: Improve guides and add examples

## License

This project is open source and available under the MIT License.
