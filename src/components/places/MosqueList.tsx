'use client'

import { Building2, ChevronRight, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistance } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'
import type { MosqueData, DistanceUnit } from '@/types/places.types'

interface MosqueListProps {
  mosques: MosqueData[]
  distanceUnit: DistanceUnit
  onMosqueClick: (mosque: MosqueData) => void
}

function mosqueAddress(mosque: MosqueData) {
  return [mosque.address.street, mosque.address.city, mosque.address.state].filter(Boolean).join(', ')
}

export function MosqueList({ mosques, distanceUnit, onMosqueClick }: MosqueListProps) {
  if (mosques.length === 0) {
    return (
      <div className="rounded-grouped border border-border-subtle bg-surface-grouped px-5 py-8 text-center" role="status">
        <Building2 className="mx-auto size-6 text-text-tertiary" aria-hidden="true" />
        <p className="mt-3 font-medium text-text-primary">No mosques found nearby</p>
        <p className="type-body-secondary mt-1 text-text-secondary">Try a larger search radius or another location.</p>
      </div>
    )
  }

  return (
    <ul className="overflow-hidden rounded-grouped border border-border-subtle bg-surface-primary" aria-label="Nearby mosques">
      {mosques.map((mosque) => {
        const address = mosqueAddress(mosque)
        return (
          <li key={mosque.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-stretch border-b border-border-subtle last:border-b-0">
            <button
              type="button"
              onClick={() => onMosqueClick(mosque)}
              aria-label={`View details for ${mosque.name}`}
              className="group flex min-h-20 min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-grouped focus-visible:z-10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-teal-muted text-primary">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">{mosque.name}</span>
                <span className="type-caption mt-0.5 block text-text-secondary">
                  Mosque · {formatDistance(mosque.distanceKm, distanceUnit)}
                </span>
                {address && <span className="type-caption mt-0.5 block truncate text-text-tertiary">{address}</span>}
              </span>
              <ChevronRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </button>
            <div className="flex items-center border-l border-border-subtle px-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="size-11"
                aria-label={`Directions to ${mosque.name}`}
                onClick={() => openMapsApp(mosque.lat, mosque.lng, mosque.name)}
              >
                <Navigation className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

