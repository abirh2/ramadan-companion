# Ramadan Companion

A modern, minimal web app built for Muslims to assist with daily worship and reflection—especially during Ramadan.

Built with Next.js 15, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## Features (V1)

### Core Features
- **Prayer Times** - Accurate daily prayer times with customizable calculation methods and Qibla compass
- **Ramadan Countdown** - Track days until Ramadan with Hijri calendar
- **Daily Quran** - Inspirational verses with multiple translations, Arabic text, and favorites
- **Daily Hadith** - Authentic hadith from Sahih collections with grading and favorites
- **Quran & Hadith Browser** - Search and explore complete Quran and hadith collections
- **Charity Tracker** - Log and visualize zakat and sadaqah donations with charts and monthly views
- **Favorites System** - Save and manage your favorite Quran verses and hadiths
- **Zikr Counter** - Digital counter with common duas and vibration feedback
- **Mosque Finder** - Discover nearby mosques with prayer times and navigation
- **Halal Food Finder** - Locate halal restaurants and food establishments

### Technical Features
- **Authentication** - Secure sign-in with email/password and OAuth (Google)
- **Dark Mode** - Beautiful theme switching for day and night
- **Mobile-First** - Responsive design optimized for all devices
- **Privacy-First** - Your data stays secure with Supabase
- **Offline-Ready** - Core features work without authentication
- **PWA-Ready** - Installable as a progressive web app

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

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui + Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: MapLibre GL + OpenStreetMap
- **APIs**: AlAdhan (Prayer Times), AlQuran Cloud, Sunnah.com API, OpenStreetMap Overpass, Nominatim
- **Hosting**: Vercel

## Contributing

Contributions are welcome! Please read the documentation in `/docs` before contributing.

## License

This project is open source and available under the MIT License.
