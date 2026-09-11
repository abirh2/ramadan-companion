'use client'

import { useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'
import type { HalalFoodData } from '@/types/places.types'
import { LocateFixed, UtensilsCrossed } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'

interface FoodMapProps {
  foods: HalalFoodData[]
  userLocation: { lat: number; lng: number }
  onFoodClick: (food: HalalFoodData) => void
  searchRadiusMiles: number
}

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
}

export function FoodMap({
  foods,
  userLocation,
  onFoodClick,
  searchRadiusMiles,
}: FoodMapProps) {
  const mapRef = useRef<MapRef>(null)

  // Calculate zoom level based on search radius
  const getZoomLevel = (radiusMiles: number): number => {
    if (radiusMiles <= 1) return 14
    if (radiusMiles <= 2) return 13
    if (radiusMiles <= 3) return 12
    if (radiusMiles <= 5) return 11
    return 10
  }

  // Fit map to show all food places when they change
  useEffect(() => {
    if (mapRef.current && foods.length > 0) {
      const bounds = foods.reduce(
        (acc, food) => {
          return {
            minLat: Math.min(acc.minLat, food.lat),
            maxLat: Math.max(acc.maxLat, food.lat),
            minLng: Math.min(acc.minLng, food.lng),
            maxLng: Math.max(acc.maxLng, food.lng),
          }
        },
        {
          minLat: userLocation.lat,
          maxLat: userLocation.lat,
          minLng: userLocation.lng,
          maxLng: userLocation.lng,
        }
      )

      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        {
          padding: 50,
          duration: 1000,
        }
      )
    }
  }, [foods, userLocation.lat, userLocation.lng])

  const recenterMap = () => {
    mapRef.current?.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: getZoomLevel(searchRadiusMiles),
      duration: 600,
    })
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: getZoomLevel(searchRadiusMiles),
        }}
        mapStyle={OSM_STYLE}
        mapLib={import('maplibre-gl')}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* User location marker */}
        <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
          <div className="relative">
            <div className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-primary shadow-low" aria-label="Your search location">
            </div>
          </div>
        </Marker>

        {/* Food place markers */}
        {foods.map((food) => (
          <Marker key={food.id} longitude={food.lng} latitude={food.lat} anchor="bottom">
            <button
              type="button"
              onClick={() => onFoodClick(food)}
              className="group relative flex size-11 items-end justify-center rounded-control focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={`View details for ${food.name}`}
            >
              <div className="relative">
                <div className="flex size-9 items-center justify-center rounded-control border border-white/70 bg-primary text-primary-foreground shadow-low transition-transform group-hover:scale-105 motion-reduce:transition-none">
                  <UtensilsCrossed className="size-4" aria-hidden="true" />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {food.name}
                </div>
              </div>
            </button>
          </Marker>
        ))}
      </Map>
      <button
        type="button"
        onClick={recenterMap}
        aria-label="Recenter map on search location"
        className="absolute bottom-8 right-3 z-10 flex size-11 items-center justify-center rounded-control border border-border-subtle bg-surface-elevated text-text-primary shadow-low transition-colors hover:bg-surface-grouped focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
