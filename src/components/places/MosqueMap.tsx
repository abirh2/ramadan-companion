'use client'

import { useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import type { MapRef } from 'react-map-gl/maplibre'
import type { MosqueData } from '@/types/places.types'
import { MapPin, User } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MosqueMapProps {
  mosques: MosqueData[]
  userLocation: { lat: number; lng: number }
  onMosqueClick: (mosque: MosqueData) => void
  searchRadiusMiles: number
}

export function MosqueMap({
  mosques,
  userLocation,
  onMosqueClick,
  searchRadiusMiles,
}: MosqueMapProps) {
  const mapRef = useRef<MapRef>(null)

  // Calculate zoom level based on search radius
  const getZoomLevel = (radiusMiles: number): number => {
    if (radiusMiles <= 1) return 14
    if (radiusMiles <= 2) return 13
    if (radiusMiles <= 3) return 12
    if (radiusMiles <= 5) return 11
    return 10
  }

  // Fit map to show all mosques when they change
  useEffect(() => {
    if (mapRef.current && mosques.length > 0) {
      const bounds = mosques.reduce(
        (acc, mosque) => {
          return {
            minLat: Math.min(acc.minLat, mosque.lat),
            maxLat: Math.max(acc.maxLat, mosque.lat),
            minLng: Math.min(acc.minLng, mosque.lng),
            maxLng: Math.max(acc.maxLng, mosque.lng),
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
  }, [mosques, userLocation])

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: getZoomLevel(searchRadiusMiles),
        }}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
            },
          ],
        }}
        mapLib={import('maplibre-gl')}
      >
        <NavigationControl position="top-right" />

        {/* User location marker */}
        <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
          <div className="relative">
            <div className="absolute -translate-x-1/2 -translate-y-1/2">
              <div className="bg-blue-500 rounded-full p-2 shadow-lg">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </Marker>

        {/* Mosque markers */}
        {mosques.map((mosque) => (
          <Marker key={mosque.id} longitude={mosque.lng} latitude={mosque.lat}>
            <button
              onClick={() => onMosqueClick(mosque)}
              className="relative group"
              aria-label={`View details for ${mosque.name}`}
            >
              <div className="absolute -translate-x-1/2 -translate-y-full">
                <div className="bg-green-600 rounded-full p-2 shadow-lg transition-transform group-hover:scale-110">
                  <MapPin className="h-5 w-5 text-white fill-white" />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {mosque.name}
                </div>
              </div>
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  )
}

