'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from 'next-themes'
import type { HalalFoodData } from '@/types/places.types'
import { LocateFixed } from 'lucide-react'
import {
  createTileLayer,
  getZoomLevel,
  createPlaceIcon,
  createUserIcon,
  fitToPoints,
} from './leafletMap'

interface FoodMapProps {
  foods: HalalFoodData[]
  userLocation: { lat: number; lng: number }
  onFoodClick: (food: HalalFoodData) => void
  searchRadiusMiles: number
}

// UtensilsCrossed (lucide) glyph, sized to match the previous marker icon.
const FOOD_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>`

export function FoodMap({
  foods,
  userLocation,
  onFoodClick,
  searchRadiusMiles,
}: FoodMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const userMarkerRef = useRef<L.Marker | null>(null)
  const onFoodClickRef = useRef(onFoodClick)
  onFoodClickRef.current = onFoodClick

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Swap the base tile layer when the color theme changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (tileLayerRef.current) tileLayerRef.current.remove()
    tileLayerRef.current = createTileLayer(theme).addTo(map)
    tileLayerRef.current.bringToBack()
  }, [theme])

  // Keep the user marker in sync with the search location.
  useEffect(() => {
    userMarkerRef.current?.setLatLng([userLocation.lat, userLocation.lng])
  }, [userLocation.lat, userLocation.lng])

  // Render food markers whenever the list changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const icon = createPlaceIcon(FOOD_ICON_SVG, true)
    for (const food of foods) {
      const marker = L.marker([food.lat, food.lng], {
        icon,
        title: food.name,
        alt: `View details for ${food.name}`,
        keyboard: true,
      })
        .addTo(map)
        .bindTooltip(food.name, { direction: 'top' })
      marker.on('click', () => onFoodClickRef.current(food))
      marker.on('keypress', () => onFoodClickRef.current(food))
      markersRef.current.push(marker)
    }

    fitToPoints(map, userLocation, foods)
  }, [foods, userLocation])

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
