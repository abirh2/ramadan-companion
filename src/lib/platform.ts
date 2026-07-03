/** Shared client-side platform detection (browser / Capacitor WebView). */

export type IOSBrowser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'other' | 'not-ios'

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function getIOSBrowser(): IOSBrowser {
  if (!isIOS()) return 'not-ios'

  const ua = navigator.userAgent
  if (/CriOS/.test(ua)) return 'chrome'
  if (/FxiOS/.test(ua)) return 'firefox'
  if (/EdgiOS/.test(ua)) return 'edge'
  if (/Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) return 'safari'

  return 'other'
}

/** InstallPrompt uses ios-prefixed labels (e.g. ios-safari). */
export function getIOSBrowserPrefixed(): `ios-${Exclude<IOSBrowser, 'not-ios'>}` | 'not-ios' {
  const browser = getIOSBrowser()
  if (browser === 'not-ios') return 'not-ios'
  return `ios-${browser}`
}
