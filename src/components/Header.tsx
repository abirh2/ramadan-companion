import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { NavMenu } from '@/components/NavMenu'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="app-header sticky top-0 z-40">
      <div className="app-header-inner mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 px-4">
        <Link 
          href="/" 
          className="min-w-0 truncate text-[1.0625rem] font-semibold tracking-[-0.015em] transition-opacity hover:opacity-80 sm:text-xl"
          aria-label="Deen Companion - Go to homepage"
        >
          Deen Companion
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavMenu />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
