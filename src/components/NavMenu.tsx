'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const desktopTabs = [
  { label: 'Home', href: '/', matches: ['/'] },
  { label: 'Quran', href: '/quran', matches: ['/quran'] },
  { label: 'Prayer', href: '/times', matches: ['/times'] },
  { label: 'Zikr', href: '/zikr', matches: ['/zikr'] },
  {
    label: 'More',
    href: '/more',
    matches: ['/more', '/hadith', '/quran-hadith', '/charity', '/favorites', '/calendar', '/places', '/profile', '/about', '/privacy'],
  },
] as const

function matchesRoute(pathname: string, route: string) {
  if (route === '/') return pathname === route
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function NavMenu() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
      {desktopTabs.map(({ label, href, matches }) => {
        const active = matches.some((route) => matchesRoute(pathname, route))

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'type-nav rounded-control px-3 py-2 text-text-secondary transition-colors hover:bg-surface-grouped hover:text-text-primary',
              active && 'bg-teal-muted text-teal',
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
