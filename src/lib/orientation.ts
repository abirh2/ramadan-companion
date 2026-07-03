// Device orientation utilities for dynamic Qibla compass.
// Uses browser DeviceOrientationEvent (including inside Capacitor WebView).

import { Capacitor } from '@capacitor/core'
import { isIOS } from '@/lib/platform'

export type OrientationPermission = 'granted' | 'denied' | 'prompt' | 'not-required'

export interface DeviceHeading {
  alpha: number
  accuracy: number | null
  timestamp: number
}

export type OrientationCallback = (heading: DeviceHeading) => void

let activeListener: ((event: DeviceOrientationEvent) => void) | null = null

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  if (Capacitor.isNativePlatform()) return true
  return /Android|iPhone|iPad|iPod/.test(navigator.userAgent)
}

export function hasOrientationSupport(): boolean {
  if (typeof window === 'undefined') return false
  return 'DeviceOrientationEvent' in window
}

/**
 * iOS 13+ requires explicit permission for DeviceOrientationEvent via requestPermission().
 * Applies to Safari (PWA) and WKWebView (native Capacitor iOS app).
 */
export function needsOrientationPermission(): boolean {
  if (!isIOS()) return false
  return typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
}

export async function requestOrientationPermission(): Promise<OrientationPermission> {
  if (!needsOrientationPermission()) {
    return 'not-required'
  }

  try {
    const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()

    if (permission === 'granted') return 'granted'
    if (permission === 'denied') return 'denied'
    return 'prompt'
  } catch (error) {
    console.error('[Orientation] Permission request failed:', error)
    return 'denied'
  }
}

export function getOrientationPermission(): OrientationPermission {
  if (!hasOrientationSupport()) return 'denied'
  if (!needsOrientationPermission()) return 'not-required'
  return 'prompt'
}

function normalizeHeading(alpha: number | null): number {
  if (alpha === null) return 0
  let normalized = alpha % 360
  if (normalized < 0) normalized += 360
  return normalized
}

function estimateAccuracy(event: DeviceOrientationEvent): number | null {
  const webkitEvent = event as DeviceOrientationEvent & { webkitCompassAccuracy?: number }
  if (webkitEvent.webkitCompassAccuracy !== undefined) {
    return Math.abs(webkitEvent.webkitCompassAccuracy)
  }
  return null
}

export function isLowAccuracy(accuracy: number | null): boolean {
  if (accuracy === null) return false
  return accuracy > 15
}

/**
 * Browser DeviceOrientationEvent for compass heading — even on native Capacitor apps.
 * webkitCompassHeading (iOS) and magnetic-north alpha (Android) are correct here;
 * Capacitor Motion gyroscope alpha is relative to page-load orientation.
 */
export function startOrientationTracking(callback: OrientationCallback): () => void {
  if (!hasOrientationSupport()) {
    console.warn('[Orientation] DeviceOrientation API not supported')
    return () => {}
  }

  if (activeListener) {
    window.removeEventListener('deviceorientation', activeListener)
    activeListener = null
  }

  const listener = (event: DeviceOrientationEvent) => {
    const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number }
    const alpha = webkitEvent.webkitCompassHeading !== undefined
      ? webkitEvent.webkitCompassHeading
      : event.alpha

    if (alpha === null) return

    callback({
      alpha: normalizeHeading(alpha),
      accuracy: estimateAccuracy(event),
      timestamp: Date.now(),
    })
  }

  window.addEventListener('deviceorientation', listener, true)
  activeListener = listener

  return () => {
    if (activeListener) {
      window.removeEventListener('deviceorientation', activeListener)
      activeListener = null
    }
  }
}
