'use client'

import { useEffect, useState } from 'react'
import type { ServiceWorkerState } from '@/types/pwa.types'

/**
 * ServiceWorkerRegistration Component
 * 
 * Registers the service worker on mount and provides foundation for PWA functionality.
 * This component has no UI - it handles registration in the background.
 * 
 * Features:
 * - Registers service worker from /sw.js
 * - Handles registration updates
 * - Provides foundation for future notification system
 * - Logs registration status for debugging
 */
export function ServiceWorkerRegistration() {
  const [swState, setSwState] = useState<ServiceWorkerState>(() => {
    const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator
    return {
      isSupported,
      isRegistered: false,
      registration: null,
      error: null,
    }
  })

  useEffect(() => {
    // Check if service workers are supported
    if (!swState.isSupported) {
      console.log('[PWA] Service Workers not supported in this browser')
      return
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('[PWA] Service Worker registered successfully:', registration.scope)
        
        setSwState({
          isSupported: true,
          isRegistered: true,
          registration,
          error: null,
        })

        // Check for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('[PWA] Service Worker update found')

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New Service Worker installed, refresh to activate')
                // Future: Show user a notification to refresh the app
              }
            })
          }
        })

        // Listen for controller change (new service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] Service Worker controller changed')
        })

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error)
        setSwState({
          isSupported: true,
          isRegistered: false,
          registration: null,
          error: error as Error,
        })
      }
    }

    // Register on mount
    registerServiceWorker()

    // Cleanup function
    return () => {
      // No cleanup needed for service worker registration
      // Service worker persists across page loads
    }
  }, [])

  // Log state changes for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PWA] Service Worker State:', swState)
    }
  }, [swState])

  // This component has no UI
  return null
}

