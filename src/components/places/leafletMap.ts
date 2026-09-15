'use client'

import L from 'leaflet'

/**
 * Shared Leaflet helpers for the Places maps (mosques + halal food).
 *
 * We use vanilla Leaflet through refs rather than a React wrapper: it is the
 * most robust option inside the Capacitor iOS/Android WebView and avoids the
 * version-coupling problems we hit with react-map-gl + maplibre-gl v6.
 */

export type LatLng = { lat: number; lng: number }

/**
 * Tile layers.
 *
 * Preferred: CARTO Positron (light) / Dark Matter (dark) — clean, low-contrast
 * basemaps designed to sit behind data, and purpose-built for light vs dark UI.
 * CARTO now requires a free API key; when `NEXT_PUBLIC_CARTO_API_KEY` is set we
 * use CARTO, otherwise we fall back to the standard OpenStreetMap raster tiles
 * so the map always works with no watermark and no new account.
 *
 * Attribution is required for both providers and is always shown.
 */
const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY

const OSM_ATTRIBUTION = '© OpenStreetMap contributors'
const CARTO_ATTRIBUTION =
  '© OpenStreetMap contributors © CARTO'

type TileConfig = { url: string; attribution: string; maxZoom: number }

const OSM_TILES: TileConfig = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: OSM_ATTRIBUTION,
  maxZoom: 19,
}

function cartoTiles(variant: 'light_all' | 'dark_all'): TileConfig {
  const key = CARTO_API_KEY ? `?api_key=${CARTO_API_KEY}` : ''
  return {
    // Retina (@2x) tiles for crisp rendering on mobile/high-DPI screens.
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/${variant}/{z}/{x}/{y}{r}.png${key}`,
    attribution: CARTO_ATTRIBUTION,
    maxZoom: 20,
  }
}

/** Resolve the tile config for the current theme. */
export function getTileConfig(theme: 'light' | 'dark'): TileConfig {
  if (!CARTO_API_KEY) return OSM_TILES
  return theme === 'dark' ? cartoTiles('dark_all') : cartoTiles('light_all')
}

/** Add (or replace) the base tile layer for the given theme. */
export function createTileLayer(theme: 'light' | 'dark'): L.TileLayer {
  const cfg = getTileConfig(theme)
  return L.tileLayer(cfg.url, {
    attribution: cfg.attribution,
    maxZoom: cfg.maxZoom,
    detectRetina: true,
    // CARTO uses subdomains a–d; OSM ignores {s} (no {s} in its URL).
    subdomains: 'abcd',
  })
}

/** Zoom level based on the current search radius (mirrors the previous map). */
export function getZoomLevel(radiusMiles: number): number {
  if (radiusMiles <= 1) return 14
  if (radiusMiles <= 2) return 13
  if (radiusMiles <= 3) return 12
  if (radiusMiles <= 5) return 11
  return 10
}

/**
 * Build a DivIcon for a place marker (mosque or food).
 * `iconSvg` is the inner Lucide-equivalent SVG markup; styling mirrors the
 * previous markers (primary circular pin, hover scale, white ring).
 */
export function createPlaceIcon(iconSvg: string, withRing: boolean): L.DivIcon {
  const ring = withRing ? 'border border-white/70' : ''
  return L.divIcon({
    className: 'place-marker',
    html: `
      <div class="group relative flex size-9 items-center justify-center rounded-control ${ring} bg-primary text-primary-foreground shadow-low transition-transform hover:scale-105 motion-reduce:transition-none">
        ${iconSvg}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

/** DivIcon for the user's search location (small primary dot with white ring). */
export function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'user-marker',
    html: `<div class="size-4 rounded-full border-[3px] border-white bg-primary shadow-low"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

/** Fit the map to show the user location plus all provided points. */
export function fitToPoints(
  map: L.Map,
  userLocation: LatLng,
  points: LatLng[]
): void {
  if (points.length === 0) return
  const latlngs: L.LatLngExpression[] = [
    [userLocation.lat, userLocation.lng],
    ...points.map((p) => [p.lat, p.lng] as L.LatLngExpression),
  ]
  const bounds = L.latLngBounds(latlngs)
  map.fitBounds(bounds, { padding: [50, 50] })
}
