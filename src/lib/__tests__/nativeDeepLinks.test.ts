import { getNativeRouteFromUrl } from '@/lib/nativeDeepLinks'

describe('getNativeRouteFromUrl', () => {
  it.each([
    ['com.deencompanion.app:///times', '/times'],
    ['com.deencompanion.lite:///quran', '/quran'],
    ['com.deencompanion.app:///places/mosques', '/places/mosques'],
    ['com.deencompanion.lite:///quran/2?ayah=255', '/quran/2?ayah=255'],
  ])('maps the app link %s to %s', (url, expected) => {
    expect(getNativeRouteFromUrl(url)).toBe(expected)
  })

  it('maps the former qibla route to prayer times', () => {
    expect(getNativeRouteFromUrl('com.deencompanion.app:///qibla')).toBe('/times')
  })

  it.each([
    'https://example.com/times',
    'javascript:alert(1)',
    'com.deencompanion.app:///admin',
    'com.deencompanion.app://evil.example/times',
    'not a url',
  ])('rejects an untrusted route: %s', (url) => {
    expect(getNativeRouteFromUrl(url)).toBeNull()
  })
})
