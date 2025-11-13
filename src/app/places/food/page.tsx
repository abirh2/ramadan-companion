'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { AuthButton } from '@/components/auth/AuthButton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHalalFood } from '@/hooks/useHalalFood'
import { FoodList } from '@/components/places/FoodList'
import { LocationSearch } from '@/components/places/LocationSearch'
import { FoodDetailDialog } from '@/components/places/FoodDetailDialog'
import { saveDistanceUnit } from '@/lib/places'
import type { HalalFoodData, DistanceUnit } from '@/types/places.types'
import type { LocationData } from '@/types/ramadan.types'

// Dynamically import FoodMap to avoid SSR issues with maplibre-gl
const FoodMap = dynamic(() => import('@/components/places/FoodMap').then(mod => ({ default: mod.FoodMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg border flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function HalalFoodPage() {
  const {
    foods,
    loading,
    error,
    searchRadiusMiles,
    distanceUnit,
    location,
    updateRadius,
    setCustomLocation,
    toggleDistanceUnit,
  } = useHalalFood()

  const [selectedFood, setSelectedFood] = useState<HalalFoodData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleFoodClick = (food: HalalFoodData) => {
    setSelectedFood(food)
    setDialogOpen(true)
  }

  const handleLocationSelect = (newLocation: LocationData) => {
    setCustomLocation(newLocation)
  }

  const handleDistanceUnitToggle = async (unit: DistanceUnit) => {
    toggleDistanceUnit(unit)
    await saveDistanceUnit(unit)
  }

  // Radius options based on distance unit
  const radiusOptions = distanceUnit === 'mi'
    ? [
        { value: '1', label: '1 mi' },
        { value: '2', label: '2 mi' },
        { value: '3', label: '3 mi' },
        { value: '5', label: '5 mi' },
        { value: '10', label: '10 mi' },
      ]
    : [
        { value: '1.6', label: '1.6 km' },
        { value: '3.2', label: '3.2 km' },
        { value: '4.8', label: '4.8 km' },
        { value: '8', label: '8 km' },
        { value: '16', label: '16 km' },
      ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Halal Food Near You</h1>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Location Search */}
        <div>
          <LocationSearch onLocationSelect={handleLocationSelect} currentLocation={location} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Radius */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search radius:</span>
            <Select
              value={searchRadiusMiles.toString()}
              onValueChange={(value) => updateRadius(parseFloat(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {radiusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Unit Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Units:</span>
            <div className="flex rounded-md border">
              <Button
                variant={distanceUnit === 'mi' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleDistanceUnitToggle('mi')}
                className="rounded-r-none"
              >
                Miles
              </Button>
              <Button
                variant={distanceUnit === 'km' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleDistanceUnitToggle('km')}
                className="rounded-l-none"
              >
                Kilometers
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && !error && (
          <p className="text-sm text-muted-foreground">
            Found {foods.length} halal {foods.length === 1 ? 'place' : 'places'} within{' '}
            {searchRadiusMiles} {distanceUnit === 'mi' ? (searchRadiusMiles === 1 ? 'mile' : 'miles') : 'km'}
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">Unable to load halal food places</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Tabs: List View / Map View */}
        {!loading && !error && location && (
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <FoodList
                foods={foods}
                distanceUnit={distanceUnit}
                onFoodClick={handleFoodClick}
              />
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              <FoodMap
                foods={foods}
                userLocation={{ lat: location.lat, lng: location.lng }}
                onFoodClick={handleFoodClick}
                searchRadiusMiles={searchRadiusMiles}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Data Source Notice */}
        {!loading && !error && (
          <div className="bg-muted/50 border rounded-lg px-4 py-3 mt-6">
            <p className="text-xs text-muted-foreground">
              Data provided by{' '}
              <a
                href="https://www.geoapify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Geoapify
              </a>{' '}
              and{' '}
              <a
                href="https://www.openstreetmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                OpenStreetMap
              </a>
              . Results include places with "halal" in their name, halal category, and cuisines traditionally halal (Pakistani, Turkish, Lebanese, Syrian, Arab, Kebab). Coverage may vary by area and halal certification should be verified with the establishment.
            </p>
          </div>
        )}

        {/* Food Detail Dialog */}
        <FoodDetailDialog
          food={selectedFood}
          distanceUnit={distanceUnit}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </main>
    </div>
  )
}

