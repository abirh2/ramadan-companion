'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Clock3, Ellipsis, Home, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const primaryTabs = [
  { label: 'Home', href: '/', icon: Home, matches: ['/'] },
  { label: 'Quran', href: '/quran', icon: BookOpen, matches: ['/quran'] },
  { label: 'Prayer', href: '/times', icon: Clock3, matches: ['/times'] },
  { label: 'Zikr', href: '/zikr', icon: MessageCircle, matches: ['/zikr'] },
  {
    label: 'More',
    href: '/more',
    icon: Ellipsis,
    matches: [
      '/more',
      '/hadith',
      '/quran-hadith',
      '/charity',
      '/favorites',
      '/calendar',
      '/places',
      '/profile',
      '/about',
      '/privacy',
    ],
  },
] as const

const routesWithoutPrimaryNavigation = ['/admin', '/privacy/delete-account']

function matchesRoute(pathname: string, route: string) {
  if (route === '/') return pathname === route
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function BottomNavigation() {
  const pathname = usePathname()

  if (routesWithoutPrimaryNavigation.some((route) => matchesRoute(pathname, route))) {
    return null
  }

  return (
    <nav className="mobile-tab-bar md:hidden" aria-label="Primary navigation">
      <div className="mobile-tab-list">
        {primaryTabs.map(({ label, href, icon: Icon, matches }) => {
          const isActive = matches.some((route) => matchesRoute(pathname, route))

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn('mobile-tab-link type-caption', isActive && 'is-active')}
            >
              <Icon
                className="mobile-tab-icon"
                strokeWidth={isActive ? 2.5 : 1.8}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
