'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { MosqueData, DistanceUnit } from '@/types/places.types'
import { MapPin, Navigation, Phone, ExternalLink, Clock, Copy, CheckCircle } from 'lucide-react'
import { formatDistance } from '@/lib/places'
import { openMapsApp } from '@/lib/mapDirections'
import { useState } from 'react'

interface MosqueDetailDialogProps {
  mosque: MosqueData | null
  distanceUnit: DistanceUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MosqueDetailDialog({
  mosque,
  distanceUnit,
  open,
  onOpenChange,
}: MosqueDetailDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!mosque) return null

  const fullAddress = [
    mosque.address.street,
    mosque.address.city,
    mosque.address.state,
    mosque.address.postcode,
    mosque.address.country,
  ]
    .filter(Boolean)
    .join(', ')

  const handleCopyAddress = () => {
    if (fullAddress) {
      navigator.clipboard.writeText(fullAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{mosque.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Distance */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{formatDistance(mosque.distanceKm, distanceUnit)} away</span>
          </div>

          {/* Address */}
          {fullAddress && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Address</p>
              <div className="flex items-start gap-2">
                <p className="text-sm text-muted-foreground flex-1">{fullAddress}</p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7"
                  onClick={handleCopyAddress}
                  title="Copy address"
                >
                  {copied ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(mosque.tags.phone ||
            mosque.tags.website ||
            mosque.tags.opening_hours ||
            mosque.tags.wheelchair ||
            mosque.tags.denomination) && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium">Additional Information</p>

              {mosque.tags.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${mosque.tags.phone}`} className="hover:text-primary">
                    {mosque.tags.phone}
                  </a>
                </div>
              )}

              {mosque.tags.website && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={mosque.tags.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary truncate"
                  >
                    {mosque.tags.website}
                  </a>
                </div>
              )}

              {mosque.tags.opening_hours && (
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{mosque.tags.opening_hours}</span>
                </div>
              )}

              {mosque.tags.wheelchair && (
                <div className="text-sm text-muted-foreground">
                  Wheelchair access: {mosque.tags.wheelchair}
                </div>
              )}

              {mosque.tags.denomination && (
                <div className="text-sm text-muted-foreground">
                  Denomination: {mosque.tags.denomination}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => openMapsApp(mosque.lat, mosque.lng, mosque.name)}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

