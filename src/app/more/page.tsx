import Link from 'next/link'
import {
  BookHeart,
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  DollarSign,
  Heart,
  Info,
  ScrollText,
  ShieldCheck,
  Utensils,
} from 'lucide-react'

const moreSections = [
  {
    title: 'Explore',
    items: [
      {
        label: 'Hadith Browser',
        description: 'Browse collections, books, and chapters',
        href: '/hadith',
        icon: BookOpenText,
      },
      {
        label: 'Daily Quran & Hadith',
        description: 'Read today’s selected ayah and hadith',
        href: '/quran-hadith',
        icon: BookHeart,
      },
      {
        label: 'Qibla Finder',
        description: 'Find the prayer direction from your location',
        href: '/times#qibla',
        icon: Compass,
      },
      {
        label: 'Islamic Calendar',
        description: 'View Hijri dates and Islamic events',
        href: '/calendar',
        icon: CalendarDays,
      },
    ],
  },
  {
    title: 'Your companion',
    items: [
      {
        label: 'Favorites',
        description: 'Return to saved Quran and hadith',
        href: '/favorites',
        icon: Heart,
      },
      {
        label: 'Charity Tracker',
        description: 'Track giving and calculate zakat',
        href: '/charity',
        icon: DollarSign,
      },
    ],
  },
  {
    title: 'Nearby',
    items: [
      {
        label: 'Mosques',
        description: 'Find mosques near you',
        href: '/places/mosques',
        icon: Building2,
      },
      {
        label: 'Halal Food',
        description: 'Find halal food near you',
        href: '/places/food',
        icon: Utensils,
      },
    ],
  },
  {
    title: 'About',
    items: [
      {
        label: 'About Deen Companion',
        description: 'Learn about the project and acknowledgements',
        href: '/about',
        icon: Info,
      },
      {
        label: 'Privacy',
        description: 'Review how your information is handled',
        href: '/privacy',
        icon: ShieldCheck,
      },
      {
        label: 'Quran and hadith sources',
        description: 'Review the sources used across the app',
        href: '/about?tab=acknowledgements',
        icon: ScrollText,
      },
    ],
  },
] as const

export default function MorePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <h1 className="type-page-title">More</h1>
        <p className="type-body-secondary mt-2 max-w-[42ch] text-text-secondary">
          Explore the rest of Deen Companion.
        </p>
      </header>

      <div className="space-y-6">
        {moreSections.map((section) => {
          const sectionId = `more-${section.title.toLowerCase().replace(/\s+/g, '-')}`

          return (
            <section key={section.title} aria-labelledby={sectionId}>
              <h2 id={sectionId} className="type-nav mb-2 px-1 text-text-secondary">
                {section.title}
              </h2>
              <div className="overflow-hidden rounded-grouped border border-border-subtle bg-surface-primary">
                {section.items.map(({ label, description, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex min-h-16 items-center gap-3 border-b border-border-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-grouped focus-visible:relative focus-visible:z-10 active:bg-teal-muted"
                  >
                    <Icon className="size-5 shrink-0 text-text-secondary transition-colors group-hover:text-teal" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="type-nav block text-text-primary">{label}</span>
                      <span className="type-caption mt-0.5 block text-text-secondary">{description}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
