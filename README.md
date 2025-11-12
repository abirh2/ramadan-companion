# Ramadan Companion

A modern, minimal web app built for Muslims to assist with daily worship and reflection—especially during Ramadan.

Built with Next.js 15, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## Features (V1)

- **Prayer Times** - Accurate daily prayer times with Qibla direction
- **Ramadan Countdown** - Track days until Ramadan
- **Daily Quran** - Inspirational verses with multiple translations and favorites
- **Charity Tracker** - Log and track sadaqah and zakat donations (auth required)
- **Authentication** - Secure sign-in with email/password and OAuth (Google)
- **Favorites** - Save and manage your favorite Quran verses
- **Dark Mode** - Beautiful theme switching for day and night
- **Mobile-First** - Responsive design optimized for all devices
- **Privacy-First** - Your data stays secure with Supabase

### Coming Soon
- Hadith of the Day
- Mosque & Halal Food Finder
- Zikr Counter

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

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Documentation Index](docs/README.md)** - Overview and complete documentation links
- **[Features Guide](docs/features.md)** - Detailed feature specifications
- **[API Structure](docs/api-structure.md)** - API endpoints and external integrations
- **[Authentication Setup](docs/auth-setup.md)** - Supabase auth configuration guide
- **[Quran Implementation](docs/quran-implementation.md)** - Quran feature implementation details

See [docs/README.md](docs/README.md) for the complete documentation index.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
