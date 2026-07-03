import { getIOSBrowser } from '@/lib/platform'

/**
 * Open platform-appropriate maps app for navigation
 */
export function openMapsApp(lat: number, lng: number, name?: string): void {
  let url: string

  if (getIOSBrowser() === 'safari') {
    const destination = `${lat},${lng}`
    const label = name ? `&q=${encodeURIComponent(name)}` : ''
    url = `maps://?daddr=${destination}${label}`
  } else {
    url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }

  window.open(url, '_blank')
}
