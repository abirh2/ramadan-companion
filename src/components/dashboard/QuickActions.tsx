'use client'

import Link from 'next/link'
import { Compass, Heart, LockKeyhole, MapPin, WalletCards } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface QuickAction {
  label: string
  href: string
  icon: typeof Compass
  protected?: boolean
}

const actions: QuickAction[] = [
  { label: 'Qibla', href: '/times#qibla', icon: Compass },
  { label: 'Charity', href: '/charity', icon: WalletCards, protected: true },
  { label: 'Nearby', href: '/places/mosques', icon: MapPin },
  { label: 'Favorites', href: '/favorites', icon: Heart, protected: true },
]

export function QuickActions() {
  const { user, loading } = useAuth()

  return (
    <section aria-labelledby="tools-heading">
      <div className="mb-3">
        <h2 id="tools-heading" className="type-section-title">Tools</h2>
        <p className="type-caption mt-0.5 text-text-secondary">Useful paths, close at hand</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map(({ label, href, icon: Icon, protected: requiresSignIn }) => {
          const isLocked = requiresSignIn && !loading && !user

          return (
            <Link
              key={href}
              href={href}
              className="group relative flex min-h-20 min-w-0 touch-manipulation flex-col items-center justify-center gap-2 rounded-grouped bg-surface-grouped px-1.5 py-3 text-center transition-[background-color,transform] duration-150 hover:bg-teal-muted active:scale-[0.98] active:bg-teal-muted motion-reduce:active:scale-100"
              aria-label={`${label}${isLocked ? ', sign in required' : ''}`}
            >
              <Icon className="size-5 text-text-secondary transition-colors group-hover:text-teal" aria-hidden="true" />
              <span className="type-nav max-w-full text-balance leading-tight text-text-primary">{label}</span>
              {isLocked && (
                <span className="absolute right-1.5 top-1.5 text-text-tertiary" title="Sign in required">
                  <LockKeyhole className="size-3.5" aria-hidden="true" />
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
