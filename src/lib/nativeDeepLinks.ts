const NATIVE_PROTOCOLS = new Set([
  'com.deencompanion.app:',
  'com.deencompanion.lite:',
])

const EXACT_ROUTES = new Set([
  '/',
  '/times',
  '/quran',
  '/hadith',
  '/zikr',
  '/calendar',
  '/charity',
  '/places/mosques',
])

export function getNativeRouteFromUrl(rawUrl: string): string | null {
  if (!rawUrl || rawUrl.length > 2_048) return null

  try {
    const url = new URL(rawUrl)
    if (!NATIVE_PROTOCOLS.has(url.protocol) || url.hostname || url.username || url.password) {
      return null
    }

    const path = url.pathname.replace(/\/{2,}/g, '/')
    if (path === '/qibla') return '/times'
    if (!EXACT_ROUTES.has(path) && !/^\/quran\/\d+$/.test(path)) return null

    return `${path}${url.search}`
  } catch {
    return null
  }
}

export function getNativeRouteFromPayload(payload: unknown): string | null {
  if (typeof payload !== 'string') return null
  if (payload.startsWith('/')) {
    return getNativeRouteFromUrl(`com.deencompanion.app://${payload}`)
  }
  return getNativeRouteFromUrl(payload)
}
