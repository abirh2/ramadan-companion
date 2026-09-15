'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from 'next-themes'
import type { MosqueData } from '@/types/places.types'
import { LocateFixed } from 'lucide-react'
import {
  createTileLayer,
  getZoomLevel,
  createPlaceIcon,
  createUserIcon,
  fitToPoints,
} from './leafletMap'

interface MosqueMapProps {
  mosques: MosqueData[]
  userLocation: { lat: number; lng: number }
  onMosqueClick: (mosque: MosqueData) => void
  searchRadiusMiles: number
}

// Building2 (lucide) glyph, sized to match the previous marker icon.
const MOSQUE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`

export function MosqueMap({
  mosques,
  userLocation,
  onMosqueClick,
  searchRadiusMiles,
}: MosqueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  // Keep the latest click handler without re-binding markers.
  const onMosqueClickRef = useRef(onMosqueClick)
  onMosqueClickRef.current = onMosqueClick

  const { resolvedTheme } = useTheme()
  const theme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'

  // Initialize the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: getZoomLevel(searchRadiusMiles),
      zoomControl: true,
      attributionControl: true,
    })

    tileLayerRef.current = createTileLayer(theme).addTo(map)

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: createUserIcon(),
      interactive: false,
      keyboard: false,
    })
      .addTo(map)
      .bindTooltip('Your search location', { direction: 'top' })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
      markersRef.current = []
      userMarkerRef.current = null
    }
    // Initialize once; subsequent prop changes are handled in the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swap the base tile layer when the color theme changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (tileLayerRef.current) tileLayerRef.current.remove()
    tileLayerRef.current = createTileLayer(theme).addTo(map)
    // Keep the base layer behind markers.
    tileLayerRef.current.bringToBack()
  }, [theme])

  // Keep the user marker in sync with the search location.
  useEffect(() => {
    userMarkerRef.current?.setLatLng([userLocation.lat, userLocation.lng])
  }, [userLocation.lat, userLocation.lng])

  // Render mosque markers whenever the list changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const icon = createPlaceIcon(MOSQUE_ICON_SVG, false)
    for (const mosque of mosques) {
      const marker = L.marker([mosque.lat, mosque.lng], {
        icon,
        title: mosque.name,
        alt: `View details for ${mosque.name}`,
        keyboard: true,
      })
        .addTo(map)
        .bindTooltip(mosque.name, { direction: 'top' })
      marker.on('click', () => onMosqueClickRef.current(mosque))
      marker.on('keypress', () => onMosqueClickRef.current(mosque))
      markersRef.current.push(marker)
    }

    fitToPoints(map, userLocation, mosques)
    // userLocation intentionally included so bounds recompute on location change.
  }, [mosques, userLocation])

  const recenterMap = () => {
    mapRef.current?.flyTo(
      [userLocation.lat, userLocation.lng],
      getZoomLevel(searchRadiusMiles),
      { duration: 0.6 }
    )
  }

  return (
    <div className="leaflet-map-shell relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
      <button
        type="button"
        onClick={recenterMap}
        aria-label="Recenter map on search location"
        className="absolute bottom-8 right-3 z-[500] flex size-11 items-center justify-center rounded-control border border-border-subtle bg-surface-elevated text-text-primary shadow-low transition-colors hover:bg-surface-grouped focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
