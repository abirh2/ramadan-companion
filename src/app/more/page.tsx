'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import {
  BellRing,
  BookHeart,
  BookOpenText,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Compass,
  Heart,
  Info,
  LogIn,
  Palette,
  ScrollText,
  Settings2,
  ShieldCheck,
  UserRound,
  Utensils,
} from 'lucide-react'
import { FeedbackButton } from '@/components/FeedbackButton'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/hooks/useAuth'

const moreSections = [
  {
    title: 'Content',
    items: [
      { label: 'Hadith', description: 'Browse collections, books, and chapters', href: '/hadith', icon: BookOpenText },
      { label: 'Daily Quran & Hadith', description: 'Today’s selected ayah and hadith', href: '/quran-hadith', icon: BookHeart },
      { label: 'Favorites', description: 'Saved Quran verses and hadith', href: '/favorites', icon: Heart },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Qibla', description: 'Find the prayer direction', href: '/times#qibla', icon: Compass },
      { label: 'Islamic Calendar', description: 'Hijri dates and Islamic events', href: '/calendar', icon: CalendarDays },
      { label: 'Nearby Mosques', description: 'Find mosques near you', href: '/places/mosques', icon: Building2 },
      { label: 'Halal Food', description: 'Find halal food near you', href: '/places/food', icon: Utensils },
      { label: 'Charity Tracker', description: 'Track giving and calculate zakat', href: '/charity', icon: CircleDollarSign },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Prayer Preferences', description: 'Location, calculation method, and madhab', href: '/times#preferences', icon: Settings2 },
      { label: 'Prayer Notifications', description: 'Manage prayer-time reminders', href: '/times#notifications', icon: BellRing },
    ],
  },
] as const

const aboutItems = [
  { label: 'About Deen Companion', description: 'The project, creator, and install guide', href: '/about', icon: Info },
  { label: 'Quran & Hadith Sources', description: 'Acknowledgements and data sources', href: '/about?tab=acknowledgements', icon: ScrollText },
  { label: 'Privacy', description: 'How your information is handled', href: '/privacy', icon: ShieldCheck },
] as const

type MoreItem = (typeof moreSections)[number]['items'][number] | (typeof aboutItems)[number]

function RowContent({ icon: Icon, label, description, value, chevron = true }: {
  icon: typeof Info
  label: string
  description?: string
  value?: string
  chevron?: boolean
}) {
  return (
    <>
      <Icon className="size-5 shrink-0 text-text-secondary" strokeWidth={1.8} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="type-body block text-text-primary">{label}</span>
        {description && <span className="type-caption mt-0.5 block text-text-secondary">{description}</span>}
      </span>
      {value && <span className="type-caption shrink-0 text-text-secondary" suppressHydrationWarning>{value}</span>}
      {chevron && <ChevronRight className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />}
    </>
  )
}

function MoreLink({ item }: { item: MoreItem }) {
  return <Link href={item.href} className="more-row group"><RowContent {...item} /></Link>
}

export default function MorePage() {
  const { user, profile, loading } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const [loginOpen, setLoginOpen] = useState(false)
  const isDark = mounted && resolvedTheme === 'dark'
  const accountValue = loading ? 'Loading…' : profile?.display_name || user?.email || undefined

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <h1 className="type-page-title text-text-primary">More</h1>
        <p className="type-body-secondary mt-2 max-w-[42ch] text-text-secondary">The rest of your companion, organized in one place.</p>
      </header>

      <div className="space-y-7">
        {moreSections.map((section) => (
          <section key={section.title} aria-labelledby={`more-${section.title.toLowerCase()}`}>
            <h2 id={`more-${section.title.toLowerCase()}`} className="more-section-title">{section.title}</h2>
            <div className="more-group">
              {section.items.map((item) => <MoreLink key={item.href} item={item} />)}
              {section.title === 'Settings' && (
                <button type="button" className="more-row group w-full text-left" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle appearance">
                  <RowContent icon={Palette} label="Appearance" description="Choose a comfortable reading theme" value={mounted ? (isDark ? 'Dark' : 'Light') : undefined} chevron={false} />
                </button>
              )}
            </div>
          </section>
        ))}

        <section aria-labelledby="more-account">
          <h2 id="more-account" className="more-section-title">Account</h2>
          <div className="more-group">
            {user ? (
              <Link href="/profile" className="more-row group"><RowContent icon={UserRound} label="Profile" description={accountValue || 'Manage your account'} /></Link>
            ) : (
              <button type="button" className="more-row group w-full text-left" onClick={() => setLoginOpen(true)}><RowContent icon={LogIn} label="Sign In" description="Optional — sync protected features across devices" chevron={false} /></button>
            )}
          </div>
        </section>

        <section aria-labelledby="more-about">
          <h2 id="more-about" className="more-section-title">About</h2>
          <div className="more-group">
            {aboutItems.map((item) => <MoreLink key={item.href} item={item} />)}
            <FeedbackButton pagePath="/more" presentation="row" />
          </div>
        </section>
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}
