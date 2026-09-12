'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { X, Download, Info, Copy } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getIOSBrowser, getIOSBrowserPrefixed } from '@/lib/platform'
import type { BeforeInstallPromptEvent } from '@/types/pwa.types'

// Import constants with proper typing
const STORAGE_KEYS = {
  INSTALL_PROMPT_DISMISSED: 'installPromptDismissed',
  INSTALL_PROMPT_DISMISSED_AT: 'installPromptDismissedAt',
  PAGE_VIEW_COUNT: 'pageViewCount',
  LOCATION_ENABLED: 'locationEnabled',
} as const

const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
const MIN_PAGE_VIEWS = 2

/**
 * InstallPrompt Component
 * 
 * Smart contextual banner that prompts users to install the PWA.
 * 
 * Features:
 * - Detects when app is installable
 * - Tracks user engagement (page views, location usage)
 * - Shows banner only when user is engaged
 * - Allows dismissal with 7-day cooldown
 * - Triggers native install prompt
 * - Respects installed state
 * - Platform-specific messaging:
 *   - Desktop/Android Chrome: Standard install button
 *   - iOS Safari: Manual installation instructions
 *   - iOS Chrome/Firefox/Edge: "Open in Safari" with copy link
 * 
 * Trigger conditions:
 * - App is installable (PWA criteria met)
 * - User has visited 2+ times OR enabled location
 * - Not dismissed in last 7 days
 * - Not already installed
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Never show install prompt in native Capacitor app (iOS/Android)
    if (Capacitor.isNativePlatform()) {
      return
    }

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isInstalled) {
      return
    }

    // Increment page view count
    const pageViews = incrementPageViews()

    // Check if location has been enabled
    const locationEnabled = checkLocationEnabled()

    // Check if prompt was recently dismissed
    const isDismissed = isPromptDismissed()

    // Check engagement criteria
    const isEngaged = pageViews >= MIN_PAGE_VIEWS || locationEnabled

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Show prompt if conditions are met
      if (isEngaged && !isDismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

    // For iOS Safari, we show a custom banner as it doesn't fire beforeinstallprompt
    if (getIOSBrowser() === 'safari' && isEngaged && !isDismissed) {
      setShowPrompt(true)
    } else {
      // For other iOS browsers (Chrome, Firefox, Edge), show a different banner
      const iosBrowserType = getIOSBrowserPrefixed()
      if (iosBrowserType !== 'not-ios' && iosBrowserType !== 'ios-safari' && isEngaged && !isDismissed) {
        setShowPrompt(true)
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    }
  }, [])

  /**
   * Handle install button click
   */
  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    setIsInstalling(true)

    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user's choice
      await deferredPrompt.userChoice

      // Clear the deferred prompt
      setDeferredPrompt(null)
      setShowPrompt(false)

    } catch (error) {
      console.error('[PWA] Install prompt error:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  /**
   * Handle dismiss button click
   */
  const handleDismiss = () => {
    // Store dismissal in localStorage
    localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, 'true')
    localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED_AT, Date.now().toString())
    
    setShowPrompt(false)
  }

  /**
   * Handle copy link button click
   */
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Don't render if prompt shouldn't be shown
  if (!showPrompt) {
    return null
  }

  const iosBrowserType = getIOSBrowserPrefixed()

  // Render iOS Safari banner - manual installation instructions
  if (iosBrowserType === 'ios-safari') {
    return (
      <div className="app-install-prompt fixed left-0 right-0 z-50 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface-elevated px-4 py-3 shadow-low">
        <div className="flex min-w-0 items-center gap-2">
          <Info className="size-5 shrink-0 text-teal" aria-hidden="true" />
          <p className="type-body-secondary text-text-primary">Install Deen Companion: Tap Share (⬆︎) → &quot;Add to Home Screen&quot;</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Not Now
          </Button>
          <Button asChild size="sm">
            <Link href="/about?tab=install">Show Me How</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Render iOS Chrome/Firefox/Edge banner - "Open in Safari" message
  if (iosBrowserType === 'ios-chrome' || iosBrowserType === 'ios-firefox' || iosBrowserType === 'ios-edge' || iosBrowserType === 'ios-other') {
    return (
      <div className="app-install-prompt fixed left-0 right-0 z-50 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface-elevated px-4 py-3 shadow-low">
        <div className="flex items-center gap-2">
          <Info className="size-5 text-teal" aria-hidden="true" />
          <p className="type-body-secondary text-text-primary">To install, please open this site in Safari</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Not Now
          </Button>
          <Button size="sm" onClick={handleCopyLink}>
            {copied ? (
              <>Copied!</>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Render Desktop/Android Chrome banner - standard install button
  if (deferredPrompt) {
    return (
      <div 
        className="app-install-prompt fixed left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-label="Install app prompt"
      >
        <div className="border-t border-border-subtle bg-surface-elevated shadow-low">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="flex items-center gap-4">
              {/* App Icon */}
              <div className="shrink-0">
                <Image
                  src="/icon-192.png" 
                  alt="Deen Companion" 
                  width={48}
                  height={48}
                  className="size-12 rounded-control"
                />
              </div>

              {/* Message */}
              <div className="min-w-0 flex-1">
                <h3 className="type-body font-semibold text-text-primary">
                  Install Deen Companion
                </h3>
                <p className="type-caption text-text-secondary">
                  Add to home screen for offline access and faster loading
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  aria-label="Dismiss install prompt"
                >
                  Not Now
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  aria-label="Install app"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Install
                </Button>
              </div>

              {/* Close Button (mobile) */}
              <button
                onClick={handleDismiss}
                className="flex size-touch shrink-0 items-center justify-center rounded-control-sm text-text-secondary hover:bg-surface-grouped sm:hidden"
                aria-label="Close install prompt"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Increment page view count in localStorage
 */
function incrementPageViews(): number {
  if (typeof window === 'undefined') return 0

  const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.PAGE_VIEW_COUNT) || '0', 10)
  const newCount = currentCount + 1
  
  localStorage.setItem(STORAGE_KEYS.PAGE_VIEW_COUNT, newCount.toString())
  
  return newCount
}

/**
 * Check if user has enabled location (engagement indicator)
 */
function checkLocationEnabled(): boolean {
  if (typeof window === 'undefined') return false

  // Check if location data exists in localStorage
  const hasLocation = !!(
    localStorage.getItem('location_lat') || 
    localStorage.getItem('location_lng')
  )

  // Store location enabled flag
  if (hasLocation) {
    localStorage.setItem(STORAGE_KEYS.LOCATION_ENABLED, 'true')
  }

  return hasLocation
}

/**
 * Check if install prompt was dismissed recently
 */
function isPromptDismissed(): boolean {
  if (typeof window === 'undefined') return false

  const dismissed = localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED) === 'true'
  
  if (!dismissed) return false

  const dismissedAt = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED_AT) || '0', 10)
  const now = Date.now()
  const timeSinceDismissal = now - dismissedAt

  // If more than 7 days have passed, clear dismissal
  if (timeSinceDismissal > DISMISSAL_DURATION) {
    localStorage.removeItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED)
    localStorage.removeItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED_AT)
    return false
  }

  return true
}
