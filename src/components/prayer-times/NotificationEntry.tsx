'use client'

import Link from 'next/link'
import { BellRing, ChevronRight } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { useAuth } from '@/hooks/useAuth'
import { NotificationSettings } from './NotificationSettings'

/**
 * Notification entry node used inside the PreferencesSection settings hierarchy.
 *
 * This is a placement-only wrapper: it decides *where and how compactly* the
 * existing notification presentation sits, without touching any notification
 * logic. `NotificationSettings` keeps ownership of its own state via
 * `useNotifications` (support detection, permission flow, toggling, saving,
 * persistence) — none of that is changed here.
 *
 * Logged out (web, non-native — the existing login requirement, R5.5): render a
 * single compact row that states, in visible text, that sign-in is required and
 * that links to the existing sign-in flow (`/profile`). The logged-out state is
 * conveyed by text and an icon, not color alone (R5.2, R5.3, R10.2).
 *
 * Logged in (or native, where the existing flow does not require sign-in):
 * render the existing `NotificationSettings` compactly within the settings
 * hierarchy rather than the old standalone `Card p-6` (R5.1, R5.4). Its
 * internal toggling/saving/persistence and the login requirement are unchanged
 * (R12.2, R14.2).
 */
export function NotificationEntry() {
  const { user } = useAuth()

  // Mirror the existing login requirement in NotificationSettings: web push
  // requires sign-in, native local notifications do not.
  const signInRequired = !user && !Capacitor.isNativePlatform()

  if (signInRequired) {
    return (
      <Link
        href="/profile"
        className="group flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-grouped focus-visible:relative focus-visible:z-10 active:bg-teal-muted"
      >
        <span
          className="flex shrink-0 items-center text-text-secondary transition-colors group-hover:text-teal"
          aria-hidden="true"
        >
          <BellRing className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="type-body block text-text-primary">
            Prayer Notifications
          </span>
          <span className="type-body-secondary block text-text-secondary">
            Sign in to enable
          </span>
        </span>

        <ChevronRight
          className="size-4 shrink-0 text-text-tertiary"
          aria-hidden="true"
        />
      </Link>
    )
  }

  // Logged in (or native): render the existing NotificationSettings compactly
  // within the settings hierarchy. Its internal logic is untouched.
  return (
    <div className="px-4 py-3">
      <NotificationSettings />
    </div>
  )
}
