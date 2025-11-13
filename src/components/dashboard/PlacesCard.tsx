'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import { useMosques } from '@/hooks/useMosques'
import { useHalalFood } from '@/hooks/useHalalFood'
import { formatDistance } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'

export function PlacesCard() {
  const { nearestMosque, loading: mosquesLoading, error: mosquesError, distanceUnit } = useMosques()
  const { nearestFood, loading: foodLoading, error: foodError, distanceUnit: foodDistanceUnit } = useHalalFood()

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nearby Places
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mosques" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mosques">Mosques</TabsTrigger>
            <TabsTrigger value="halal-food">Halal Food</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mosques" className="mt-4 space-y-3">
            {mosquesLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : mosquesError ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unable to find nearby mosques
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {mosquesError}
                </p>
              </div>
            ) : nearestMosque ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{nearestMosque.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(nearestMosque.distanceKm, distanceUnit)} away
                  </p>
                  {nearestMosque.address.street && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {nearestMosque.address.street}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      openMapsApp(nearestMosque.lat, nearestMosque.lng, nearestMosque.name)
                    }}
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1.5" />
                    Directions
                  </Button>
                  <Link href="/places/mosques" className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No mosques found nearby
                </p>
                <Link href="/places/mosques">
                  <Button variant="outline" size="sm" className="mt-3">
                    Search in Different Area
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="halal-food" className="mt-4 space-y-3">
            {foodLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : foodError ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Unable to find halal food places
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {foodError}
                </p>
              </div>
            ) : nearestFood ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{nearestFood.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(nearestFood.distanceKm, foodDistanceUnit)} away
                  </p>
                  {nearestFood.cuisine && (
                    <p className="text-xs text-muted-foreground">
                      {nearestFood.cuisine}
                    </p>
                  )}
                  {nearestFood.address.street && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {nearestFood.address.street}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      openMapsApp(nearestFood.lat, nearestFood.lng, nearestFood.name)
                    }}
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1.5" />
                    Directions
                  </Button>
                  <Link href="/places/food" className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No halal food places found nearby
                </p>
                <Link href="/places/food">
                  <Button variant="outline" size="sm" className="mt-3">
                    Search in Different Area
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
