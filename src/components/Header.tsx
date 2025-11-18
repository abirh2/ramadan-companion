import Link from 'next/link'
import { AuthButton } from '@/components/auth/AuthButton'
import { NavMenu } from '@/components/NavMenu'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
          Ramadan Companion
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavMenu />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

