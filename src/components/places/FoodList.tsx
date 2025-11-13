'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { HalalFoodData, DistanceUnit } from '@/types/places.types'
import { MapPin, Navigation, Phone, ExternalLink, UtensilsCrossed } from 'lucide-react'
import { formatDistance } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'

interface FoodListProps {
  foods: HalalFoodData[]
  distanceUnit: DistanceUnit
  onFoodClick: (food: HalalFoodData) => void
}

export function FoodList({ foods, distanceUnit, onFoodClick }: FoodListProps) {
  if (foods.length === 0) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No halal food places found in this area</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try increasing the search radius or changing your location
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {foods.map((food) => (
        <Card
          key={food.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFoodClick(food)}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{food.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistance(food.distanceKm, distanceUnit)} away
                </p>
                {food.cuisine && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Cuisine:</span> {food.cuisine}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openMapsApp(food.lat, food.lng, food.name)
                }}
              >
                <Navigation className="h-3.5 w-3.5 mr-1" />
                Directions
              </Button>
            </div>

            {/* Address */}
            {(food.address.street || food.address.city) && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  {food.address.street && <>{food.address.street}</>}
                  {food.address.street && food.address.city && <>, </>}
                  {food.address.city && <>{food.address.city}</>}
                  {food.address.state && <>, {food.address.state}</>}
                </span>
              </div>
            )}

            {/* Additional info if available */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {food.contact?.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{food.contact.phone}</span>
                </div>
              )}
              {food.contact?.website && (
                <a
                  href={food.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Website</span>
                </a>
              )}
            </div>

            {/* Facilities badges */}
            {food.facilities && (
              <div className="flex flex-wrap gap-2">
                {food.facilities.takeaway && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Takeaway</span>
                )}
                {food.facilities.delivery && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Delivery</span>
                )}
                {food.facilities.wheelchair && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Wheelchair Accessible</span>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

