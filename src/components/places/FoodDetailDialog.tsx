'use client'

import { Clock, ExternalLink, Navigation, Phone, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { formatDistance, formatOpeningHours } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'
import type { HalalFoodData, DistanceUnit } from '@/types/places.types'

interface FoodDetailDialogProps {
  food: HalalFoodData | null
  distanceUnit: DistanceUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function FoodDetailDialog({ food, distanceUnit, open, onOpenChange }: FoodDetailDialogProps) {
  if (!food) return null
  const address = food.address.formatted || [
    food.address.street, food.address.city, food.address.state, food.address.postcode,
  ].filter(Boolean).join(', ')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 text-left sm:px-6">
          <SheetTitle className="type-section-title pr-12 text-text-primary">{food.name}</SheetTitle>
          <SheetDescription>{food.cuisine || 'Halal food'} · {formatDistance(food.distanceKm, distanceUnit)} away</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {food.diet?.halal && (
            <div className="flex items-center gap-2 rounded-grouped bg-teal-muted px-4 py-3 text-sm text-text-primary">
              <UtensilsCrossed className="size-4 text-primary" aria-hidden="true" />
              <span className="font-medium">Listed as halal</span>
              <span className="text-text-secondary">in source data</span>
            </div>
          )}

          {address && (
            <section aria-labelledby="food-address-heading">
              <h3 id="food-address-heading" className="type-label text-text-primary">Address</h3>
              <p className="type-body-secondary mt-2 rounded-grouped bg-surface-grouped px-4 py-3 text-text-secondary">{address}</p>
            </section>
          )}

          {food.openingHours && (
            <section aria-labelledby="food-hours-heading">
              <h3 id="food-hours-heading" className="type-label flex items-center gap-2 text-text-primary"><Clock className="size-4 text-text-tertiary" />Hours</h3>
              <p className="type-body-secondary mt-2 whitespace-pre-line text-text-secondary">{formatOpeningHours(food.openingHours)}</p>
            </section>
          )}

          {(food.contact?.phone || food.contact?.website) && (
            <div className="flex flex-wrap gap-2">
              {food.contact.phone && <Button asChild variant="outline"><a href={`tel:${food.contact.phone}`}><Phone />Call</a></Button>}
              {food.contact.website && <Button asChild variant="outline"><a href={food.contact.website} target="_blank" rel="noopener noreferrer"><ExternalLink />Website</a></Button>}
            </div>
          )}

          {food.facilities && (food.facilities.takeaway || food.facilities.delivery || food.facilities.wheelchair) && (
            <section aria-labelledby="food-facilities-heading">
              <h3 id="food-facilities-heading" className="type-label text-text-primary">Available</h3>
              <ul className="mt-2 flex flex-wrap gap-2 type-caption text-text-secondary">
                {food.facilities.takeaway && <li className="rounded-control bg-surface-grouped px-3 py-1.5">Takeaway</li>}
                {food.facilities.delivery && <li className="rounded-control bg-surface-grouped px-3 py-1.5">Delivery</li>}
                {food.facilities.wheelchair && <li className="rounded-control bg-surface-grouped px-3 py-1.5">Wheelchair accessible</li>}
              </ul>
            </section>
          )}
        </div>

        <div className="border-t border-border-subtle bg-surface-elevated px-5 py-4 sm:px-6">
          <Button className="h-11 w-full" aria-label="Get directions" onClick={() => openMapsApp(food.lat, food.lng, food.name)}>
            <Navigation className="size-4" />
            Get directions
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
