'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MosqueData, DistanceUnit } from '@/types/places.types'
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react'
import { formatDistance } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'

interface MosqueListProps {
  mosques: MosqueData[]
  distanceUnit: DistanceUnit
  onMosqueClick: (mosque: MosqueData) => void
}

export function MosqueList({ mosques, distanceUnit, onMosqueClick }: MosqueListProps) {
  if (mosques.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No mosques found in this area</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try increasing the search radius or changing your location
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {mosques.map((mosque) => (
        <Card
          key={mosque.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onMosqueClick(mosque)}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-sm">{mosque.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistance(mosque.distanceKm, distanceUnit)} away
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  openMapsApp(mosque.lat, mosque.lng, mosque.name)
                }}
              >
                <Navigation className="h-3.5 w-3.5 mr-1" />
                Directions
              </Button>
            </div>

            {/* Address */}
            {(mosque.address.street || mosque.address.city) && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  {mosque.address.street && <>{mosque.address.street}</>}
                  {mosque.address.street && mosque.address.city && <>, </>}
                  {mosque.address.city && <>{mosque.address.city}</>}
                  {mosque.address.state && <>, {mosque.address.state}</>}
                </span>
              </div>
            )}

            {/* Additional info if available */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {mosque.tags.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{mosque.tags.phone}</span>
                </div>
              )}
              {mosque.tags.website && (
                <a
                  href={mosque.tags.website}
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
          </div>
        </Card>
      ))}
    </div>
  )
}

