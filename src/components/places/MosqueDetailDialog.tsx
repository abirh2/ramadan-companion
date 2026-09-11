'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Clock, Copy, ExternalLink, Navigation, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { formatDistance } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'
import type { MosqueData, DistanceUnit } from '@/types/places.types'

interface MosqueDetailDialogProps {
  mosque: MosqueData | null
  distanceUnit: DistanceUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MosqueDetailDialog({ mosque, distanceUnit, open, onOpenChange }: MosqueDetailDialogProps) {
  const [copied, setCopied] = useState(false)
  if (!mosque) return null

  const address = [
    mosque.address.street, mosque.address.city, mosque.address.state,
    mosque.address.postcode, mosque.address.country,
  ].filter(Boolean).join(', ')

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 text-left sm:px-6">
          <SheetTitle className="type-section-title pr-12 text-text-primary">{mosque.name}</SheetTitle>
          <SheetDescription>Mosque · {formatDistance(mosque.distanceKm, distanceUnit)} away</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {address && (
            <section aria-labelledby="mosque-address-heading">
              <h3 id="mosque-address-heading" className="type-label text-text-primary">Address</h3>
              <div className="mt-2 flex items-start gap-3 rounded-grouped bg-surface-grouped px-4 py-3">
                <p className="type-body-secondary min-w-0 flex-1 text-text-secondary">{address}</p>
                <Button type="button" variant="ghost" size="icon-lg" className="size-11" onClick={() => void copyAddress()} aria-label={copied ? 'Address copied' : 'Copy address'}>
                  {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </section>
          )}

          {(mosque.tags.phone || mosque.tags.website || mosque.tags.opening_hours || mosque.tags.wheelchair || mosque.tags.denomination) && (
            <section aria-labelledby="mosque-details-heading">
              <h3 id="mosque-details-heading" className="type-label text-text-primary">Details</h3>
              <dl className="mt-2 divide-y divide-border-subtle rounded-grouped border border-border-subtle bg-surface-primary">
                {mosque.tags.opening_hours && <DetailRow icon={<Clock />} label="Hours" value={mosque.tags.opening_hours} />}
                {mosque.tags.denomination && <DetailRow label="Denomination" value={mosque.tags.denomination} />}
                {mosque.tags.wheelchair && <DetailRow label="Wheelchair access" value={mosque.tags.wheelchair} />}
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {mosque.tags.phone && <Button asChild variant="outline"><a href={`tel:${mosque.tags.phone}`}><Phone />Call</a></Button>}
                {mosque.tags.website && <Button asChild variant="outline"><a href={mosque.tags.website} target="_blank" rel="noopener noreferrer"><ExternalLink />Website</a></Button>}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-border-subtle bg-surface-elevated px-5 py-4 sm:px-6">
          <Button className="h-11 w-full" aria-label="Get directions" onClick={() => openMapsApp(mosque.lat, mosque.lng, mosque.name)}>
            <Navigation className="size-4" />
            Get directions
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-3 px-4 py-3 text-sm">
      <dt className="flex items-center gap-2 font-medium text-text-primary">{icon && <span className="[&_svg]:size-4 [&_svg]:text-text-tertiary">{icon}</span>}{label}</dt>
      <dd className="text-right text-text-secondary">{value}</dd>
    </div>
  )
}
