'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { HalalFoodData, DistanceUnit } from '@/types/places.types'
import {
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  Clock,
  UtensilsCrossed,
} from 'lucide-react'
import { formatDistance, formatOpeningHours } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'

interface FoodDetailDialogProps {
  food: HalalFoodData | null
  distanceUnit: DistanceUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FoodDetailDialog({
  food,
  distanceUnit,
  open,
  onOpenChange,
}: FoodDetailDialogProps) {
  if (!food) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{food.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Distance */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{formatDistance(food.distanceKm, distanceUnit)} away</span>
          </div>

          {/* Cuisine */}
          {food.cuisine && (
            <div className="flex items-center gap-2 text-sm">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">Cuisine:</span> {food.cuisine}
              </span>
            </div>
          )}

          {/* Diet Info */}
          {food.diet?.halal && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <p className="text-sm text-green-800 font-medium">✓ Halal Certified</p>
            </div>
          )}

          {/* Categories */}
          {food.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {food.categories.map((category, index) => (
                <span
                  key={index}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Address */}
          {(food.address.street || food.address.city) && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Address</h4>
              <p className="text-sm text-muted-foreground">
                {food.address.street && <>{food.address.street}<br /></>}
                {food.address.city && <>{food.address.city}</>}
                {food.address.state && <>, {food.address.state}</>}
                {food.address.postcode && <> {food.address.postcode}</>}
              </p>
            </div>
          )}

          {/* Opening Hours */}
          {food.openingHours && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Hours</h4>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {formatOpeningHours(food.openingHours)}
              </p>
            </div>
          )}

          {/* Contact Info */}
          {(food.contact?.phone || food.contact?.website) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contact</h4>
              <div className="space-y-2">
                {food.contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${food.contact.phone}`}
                      className="hover:text-primary"
                    >
                      {food.contact.phone}
                    </a>
                  </div>
                )}
                {food.contact.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={food.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facilities */}
          {food.facilities && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {food.facilities.takeaway && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    Takeaway Available
                  </span>
                )}
                {food.facilities.delivery && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    Delivery Available
                  </span>
                )}
                {food.facilities.wheelchair && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    Wheelchair Accessible
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1"
              onClick={() => openMapsApp(food.lat, food.lng, food.name)}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            {food.contact?.phone && (
              <Button
                variant="outline"
                onClick={() => window.open(`tel:${food.contact?.phone}`, '_self')}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

