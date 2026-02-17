// Device orientation utilities for dynamic Qibla compass
// Handles mobile detection, permission requests, and orientation tracking
// Platform-aware: Uses Capacitor Motion plugin on native, browser API on web

import { Capacitor } from '@capacitor/core'
import { Motion, type RotationRate } from '@capacitor/motion'

export type OrientationPermission = 'granted' | 'denied' | 'prompt' | 'not-required'

export interface DeviceHeading {
  alpha: number        // Compass heading 0-360 (0=North, clockwise)
  accuracy: number | null     // Accuracy estimate in degrees (lower is better)
  timestamp: number    // Reading timestamp
}

export type OrientationCallback = (heading: DeviceHeading) => void

// Active orientation listener reference for cleanup
let activeListener: ((event: DeviceOrientationEvent) => void) | null = null

/**
 * Detect if device is mobile (iOS or Android)
 * Native Capacitor app is always treated as mobile for compass features
 * @returns true if running on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  if (Capacitor.isNativePlatform()) return true
  const ua = navigator.userAgent
  return /Android|iPhone|iPad|iPod/.test(ua)
}

/**
 * Detect if device is iOS
 * @returns true if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua)
}

/**
 * Check if DeviceOrientation API is supported
 * @returns true if DeviceOrientationEvent is available
 */
export function hasOrientationSupport(): boolean {
  if (typeof window === 'undefined') return false
  return 'DeviceOrientationEvent' in window
}

/**
 * Check if iOS 13+ permission request is needed
 * iOS 13+ requires explicit permission for DeviceOrientationEvent in browser
 * Native Capacitor app uses Motion plugin which handles permissions natively
 * @returns true if permission request is required
 */
export function needsOrientationPermission(): boolean {
  if (Capacitor.isNativePlatform()) return false
  if (!isIOS()) return false

  // iOS 13+ browser has requestPermission method
  return typeof (DeviceOrientationEvent as any).requestPermission === 'function'
}

/**
 * Request device orientation permission (iOS 13+ only)
 * Must be called from a user interaction (button click, etc.)
 * @returns Promise<OrientationPermission>
 */
export async function requestOrientationPermission(): Promise<OrientationPermission> {
  // Not needed on Android or older iOS
  if (!needsOrientationPermission()) {
    return 'not-required'
  }

  try {
    const permission = await (DeviceOrientationEvent as any).requestPermission()
    
    if (permission === 'granted') {
      return 'granted'
    } else if (permission === 'denied') {
      return 'denied'
    } else {
      return 'prompt'
    }
  } catch (error) {
    console.error('[Orientation] Permission request failed:', error)
    return 'denied'
  }
}

/**
 * Get current orientation permission status
 * @returns current permission status
 */
export function getOrientationPermission(): OrientationPermission {
  if (!hasOrientationSupport()) {
    return 'denied'
  }
  
  if (!needsOrientationPermission()) {
    return 'not-required'
  }
  
  // On iOS 13+, we can't check permission without requesting it
  // Return 'prompt' to indicate permission needs to be requested
  return 'prompt'
}

/**
 * Normalize compass heading to 0-360 range
 * @param alpha - Raw alpha value from DeviceOrientationEvent
 * @returns normalized heading 0-360
 */
function normalizeHeading(alpha: number | null): number {
  if (alpha === null) return 0
  
  // Ensure value is in 0-360 range
  let normalized = alpha % 360
  if (normalized < 0) {
    normalized += 360
  }
  
  return normalized
}

/**
 * Estimate accuracy from device orientation event
 * Some devices provide webkitCompassAccuracy, others don't
 * @param event - DeviceOrientationEvent
 * @returns accuracy estimate in degrees, or null if unknown
 */
function estimateAccuracy(event: DeviceOrientationEvent): number | null {
  // Some devices (iOS) provide compass accuracy
  const webkitEvent = event as any
  if (webkitEvent.webkitCompassAccuracy !== undefined) {
    return Math.abs(webkitEvent.webkitCompassAccuracy)
  }
  
  // For devices without accuracy info, return null
  return null
}

/**
 * Check if heading is considered low accuracy
 * @param accuracy - Accuracy in degrees (null means unknown)
 * @returns true if accuracy is low (>15 degrees) or unknown
 */
export function isLowAccuracy(accuracy: number | null): boolean {
  if (accuracy === null) return false // Unknown accuracy, don't warn
  return accuracy > 15 // More than 15 degrees off is considered low accuracy
}

/**
 * Start tracking device orientation using browser DeviceOrientationEvent
 * 
 * IMPORTANT: We always use the browser API (DeviceOrientationEvent) for compass heading,
 * even on native Capacitor apps. The Capacitor Motion plugin provides raw gyroscope data
 * whose alpha value is relative to page-load orientation (not magnetic north). The browser
 * deviceorientation event is available inside WKWebView/WebView and correctly provides
 * webkitCompassHeading (iOS) or magnetic-north-calibrated alpha (Android).
 * 
 * @param callback - Function called with each orientation update
 * @returns cleanup function to stop tracking
 */
export function startOrientationTracking(callback: OrientationCallback): () => void {
  return startOrientationTrackingBrowser(callback)
}

/**
 * Native orientation tracking using Capacitor Motion plugin
 */
function startOrientationTrackingNative(callback: OrientationCallback): () => void {
  let isActive = true
  let listenerHandle: { remove: () => Promise<void> } | null = null

  const initializeTracking = async () => {
    try {
      // Start listening to device orientation with Motion plugin
      listenerHandle = await Motion.addListener('orientation', (event) => {
        if (!isActive) return

        // Motion plugin provides alpha (0-360, clockwise from north on Android)
        // Note: On iOS native, alpha may be relative to initial orientation
        // The browser fallback (used in WKWebView) handles iOS webkitCompassHeading
        const alpha = event.alpha !== null ? event.alpha : 0

        const heading: DeviceHeading = {
          alpha: normalizeHeading(alpha),
          accuracy: null, // Motion API doesn't provide accuracy
          timestamp: Date.now(),
        }

        callback(heading)
      })

      console.log('[Orientation] Native tracking started successfully')
    } catch (error) {
      console.error('[Orientation] Failed to start native tracking:', error)
      // Fall back to browser implementation
      console.log('[Orientation] Falling back to browser API')
      const browserCleanup = startOrientationTrackingBrowser(callback)
      listenerHandle = { remove: async () => browserCleanup() }
    }
  }

  // Initialize tracking
  initializeTracking()

  // Return cleanup function
  return () => {
    isActive = false
    if (listenerHandle) {
      listenerHandle.remove()
      listenerHandle = null
    }
  }
}

/**
 * Browser orientation tracking using DeviceOrientationEvent
 * Used for PWA/web browser contexts and as fallback for native
 */
function startOrientationTrackingBrowser(callback: OrientationCallback): () => void {
  if (!hasOrientationSupport()) {
    console.warn('[Orientation] DeviceOrientation API not supported')
    return () => {}
  }

  // Clean up any existing listener
  if (activeListener) {
    window.removeEventListener('deviceorientation', activeListener)
    activeListener = null
  }

  // Create new listener
  const listener = (event: DeviceOrientationEvent) => {
    // CRITICAL iOS FIX: event.alpha on iOS is relative to page load orientation, NOT magnetic north
    // webkitCompassHeading IS calibrated to true magnetic north
    // Must prioritize webkitCompassHeading when available (iOS Safari)
    const webkitEvent = event as any
    const alpha = webkitEvent.webkitCompassHeading !== undefined
      ? webkitEvent.webkitCompassHeading  // iOS Safari - true magnetic compass
      : event.alpha  // Android - use alpha (Android alpha IS magnetic north)
    
    if (alpha === null) {
      // No compass data available
      return
    }

    const heading: DeviceHeading = {
      alpha: normalizeHeading(alpha),
      accuracy: estimateAccuracy(event),
      timestamp: Date.now(),
    }

    callback(heading)
  }

  // Add event listener
  window.addEventListener('deviceorientation', listener, true)
  activeListener = listener

  // Return cleanup function
  return () => {
    if (activeListener) {
      window.removeEventListener('deviceorientation', activeListener)
      activeListener = null
    }
  }
}

/**
 * Stop tracking device orientation
 * Removes active event listener
 */
export function stopOrientationTracking(): void {
  if (activeListener) {
    window.removeEventListener('deviceorientation', activeListener)
    activeListener = null
  }
}

/**
 * Test if device orientation is working
 * Useful for debugging and feature detection
 * @param timeout - Timeout in ms to wait for orientation data
 * @returns Promise<boolean> - true if orientation data received
 */
export async function testOrientationAvailability(timeout: number = 2000): Promise<boolean> {
  if (!hasOrientationSupport()) {
    return false
  }

  return new Promise((resolve) => {
    let resolved = false
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        resolve(false)
      }
    }, timeout)

    const cleanup = startOrientationTracking((heading) => {
      if (!resolved && heading.alpha !== null) {
        resolved = true
        clearTimeout(timeoutId)
        cleanup()
        resolve(true)
      }
    })
  })
}

