'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { NearbyExperience } from '@/components/places/NearbyExperience'
import { FoodList } from '@/components/places/FoodList'
import { FoodDetailDialog } from '@/components/places/FoodDetailDialog'
import { FeedbackButton } from '@/components/FeedbackButton'
import { useHalalFood } from '@/hooks/useHalalFood'
import { saveDistanceUnit } from '@/lib/places'
import type { HalalFoodData, DistanceUnit } from '@/types/places.types'
import type { LocationData } from '@/types/ramadan.types'

const FoodMap = dynamic(
  () => import('@/components/places/FoodMap').then((mod) => ({ default: mod.FoodMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center" aria-label="Loading halal food map">
        <Loader2 className="size-6 animate-spin text-text-tertiary motion-reduce:animate-none" />
      </div>
    ),
  }
)

export default function HalalFoodPage() {
  const {
    foods, loading, error, searchRadiusMiles, distanceUnit, location,
    updateRadius, setCustomLocation, toggleDistanceUnit, refetch,
  } = useHalalFood()
  const [selectedFood, setSelectedFood] = useState<HalalFoodData | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleFoodClick = (food: HalalFoodData) => {
    setSelectedFood(food)
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
        mode="food"
        loading={loading}
        error={error}
        itemCount={foods.length}
        searchRadiusMiles={searchRadiusMiles}
        distanceUnit={distanceUnit}
        location={location}
        onLocationSelect={handleLocationSelect}
        onRadiusChange={updateRadius}
        onDistanceUnitChange={handleDistanceUnitChange}
        onRetry={refetch}
        map={location ? (
          <FoodMap
            foods={foods}
            userLocation={{ lat: location.lat, lng: location.lng }}
            onFoodClick={handleFoodClick}
            searchRadiusMiles={searchRadiusMiles}
          />
        ) : null}
        results={<FoodList foods={foods} distanceUnit={distanceUnit} onFoodClick={handleFoodClick} />}
        attribution={
          <p>
            Results are provided by{' '}
            <a href="https://www.geoapify.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-primary">
              Geoapify
            </a>{' '}
            and{' '}
            <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-text-primary">
              OpenStreetMap
            </a>
            . Places are included from halal labels, names, and cuisine categories. Coverage varies; confirm dietary requirements with the business.
          </p>
        }
      />

      <FoodDetailDialog food={selectedFood} distanceUnit={distanceUnit} open={detailOpen} onOpenChange={setDetailOpen} />
      <FeedbackButton pagePath="/places/food" />
    </>
  )
}
