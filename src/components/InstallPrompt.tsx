'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { 
  BeforeInstallPromptEvent, 
  InstallPromptState,
  PWA_STORAGE_KEYS,
  INSTALL_PROMPT_DISMISSAL_DURATION,
  MIN_PAGE_VIEWS_FOR_PROMPT,
} from '@/types/pwa.types'

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

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true

    if (isInstalled) {
      console.log('[PWA] App is already installed')
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

    console.log('[PWA] Engagement check:', { 
      pageViews, 
      locationEnabled, 
      isDismissed, 
      isEngaged 
    })

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      const promptEvent = e as BeforeInstallPromptEvent
      console.log('[PWA] beforeinstallprompt event fired')
      
      setDeferredPrompt(promptEvent)

      // Show prompt if conditions are met
      if (isEngaged && !isDismissed) {
        console.log('[PWA] Showing install prompt')
        setShowPrompt(true)
      } else {
        console.log('[PWA] Not showing prompt:', { isEngaged, isDismissed })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

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
      console.log('[PWA] No deferred prompt available')
      return
    }

    setIsInstalling(true)

    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user's choice
      const choiceResult = await deferredPrompt.userChoice

      console.log('[PWA] User choice:', choiceResult.outcome)

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
      } else {
        console.log('[PWA] User dismissed the install prompt')
      }

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
    console.log('[PWA] User dismissed install prompt')
    
    // Store dismissal in localStorage
    localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED, 'true')
    localStorage.setItem(STORAGE_KEYS.INSTALL_PROMPT_DISMISSED_AT, Date.now().toString())
    
    setShowPrompt(false)
  }

  // Don't render if prompt shouldn't be shown
  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label="Install app prompt"
    >
      <div className="bg-card border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <img 
                src="/icon-192.png" 
                alt="Ramadan Companion" 
                className="w-12 h-12 rounded-lg"
              />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base">
                Install Ramadan Companion
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add to home screen for offline access and faster loading
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-xs sm:text-sm"
                aria-label="Dismiss install prompt"
              >
                Not Now
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling}
                className="text-xs sm:text-sm"
                aria-label="Install app"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
            </div>

            {/* Close Button (mobile) */}
            <button
              onClick={handleDismiss}
              className="sm:hidden flex-shrink-0 p-1 rounded-full hover:bg-muted"
              aria-label="Close install prompt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
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

