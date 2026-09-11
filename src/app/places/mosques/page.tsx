'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { NearbyExperience } from '@/components/places/NearbyExperience'
import { MosqueList } from '@/components/places/MosqueList'
import { MosqueDetailDialog } from '@/components/places/MosqueDetailDialog'
import { FeedbackButton } from '@/components/FeedbackButton'
import { useMosques } from '@/hooks/useMosques'
import { saveDistanceUnit } from '@/lib/places'
import type { MosqueData, DistanceUnit } from '@/types/places.types'
import type { LocationData } from '@/types/ramadan.types'

const MosqueMap = dynamic(
  () => import('@/components/places/MosqueMap').then((mod) => ({ default: mod.MosqueMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center" aria-label="Loading mosque map">
        <Loader2 className="size-6 animate-spin text-text-tertiary motion-reduce:animate-none" />
      </div>
    ),
  }
)

export default function MosquesPage() {
  const {
    mosques, loading, error, searchRadiusMiles, distanceUnit, location,
    updateRadius, setCustomLocation, toggleDistanceUnit, refetch,
  } = useMosques()
  const [selectedMosque, setSelectedMosque] = useState<MosqueData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleMosqueClick = (mosque: MosqueData) => {
    setSelectedMosque(mosque)
    setDetailOpen(true)
  }

  const handleLocationSelect = async (newLocation: LocationData) => {
    await setCustomLocation(newLocation)
  }

  const handleDistanceUnitChange = async (unit: DistanceUnit) => {
    toggleDistanceUnit(unit)
    await saveDistanceUnit(unit)
  }

  return (
    <>
      <NearbyExperience
        mode="mosques"
        loading={loading}
        error={error}
        itemCount={mosques.length}
        searchRadiusMiles={searchRadiusMiles}
        distanceUnit={distanceUnit}
        location={location}
        onLocationSelect={handleLocationSelect}
        onRadiusChange={updateRadius}
        onDistanceUnitChange={handleDistanceUnitChange}
        onRetry={refetch}
        map={location ? (
          <MosqueMap
            mosques={mosques}
            userLocation={{ lat: location.lat, lng: location.lng }}
            onMosqueClick={handleMosqueClick}
            searchRadiusMiles={searchRadiusMiles}
          />
        ) : null}
        results={
          <MosqueList mosques={mosques} distanceUnit={distanceUnit} onMosqueClick={handleMosqueClick} />
        }
        attribution={
          <p>
            Mosque data is provided by{' '}
            <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-primary">
              OpenStreetMap
            </a>
            . Community coverage varies and may not include every mosque.{' '}
            <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-primary">
              Help improve the map
            </a>
            .
          </p>
        }
      />

      <MosqueDetailDialog mosque={selectedMosque} distanceUnit={distanceUnit} open={detailOpen} onOpenChange={setDetailOpen} />
      <FeedbackButton pagePath="/places/mosques" />
    </>
  )
}
