/**
 * Open platform-appropriate maps app for navigation
 * @param lat - destination latitude
 * @param lng - destination longitude
 * @param name - destination name (for display)
 */
export function openMapsApp(lat: number, lng: number, name?: string): void {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  
  let url: string
  
  if (isIOS && isSafari) {
    // iOS Safari - use Apple Maps URL scheme
    const destination = `${lat},${lng}`
    const label = name ? `&q=${encodeURIComponent(name)}` : ''
    url = `maps://?daddr=${destination}${label}`
  } else {
    // Android, Desktop, or other browsers - use Google Maps
    url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  
  // Open in new tab/window or trigger app launch
  window.open(url, '_blank')
}

