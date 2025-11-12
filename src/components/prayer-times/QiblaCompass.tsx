'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Compass, Loader2 } from 'lucide-react'
import type { QiblaData } from '@/types/ramadan.types'

interface QiblaCompassProps {
  qiblaDirection: QiblaData | null
  loading?: boolean
  error?: string | null
}

export function QiblaCompass({ qiblaDirection, loading, error }: QiblaCompassProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qibla Direction
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error || !qiblaDirection) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qibla Direction
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <Compass className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              {error || 'Unable to determine direction'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const bearing = qiblaDirection.direction
  const compassDirection =
    (qiblaDirection as any).compassDirection ||
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(bearing / 45) % 8]

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Qibla Direction
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {/* Compass Container */}
        <div className="relative w-48 h-48 md:w-56 md:h-56">
          {/* Compass Circle */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
          >
            {/* Outer circle */}
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />

            {/* Inner circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border opacity-30"
            />

            {/* Cardinal directions markers */}
            {/* N */}
            <line
              x1="100"
              y1="10"
              x2="100"
              y2="25"
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />
            {/* E */}
            <line
              x1="190"
              y1="100"
              x2="175"
              y2="100"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            />
            {/* S */}
            <line
              x1="100"
              y1="190"
              x2="100"
              y2="175"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            />
            {/* W */}
            <line
              x1="10"
              y1="100"
              x2="25"
              y2="100"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            />

            {/* Qibla Arrow - rotated to bearing angle */}
            <g transform={`rotate(${bearing}, 100, 100)`}>
              {/* Arrow shaft */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="35"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
              />
              {/* Arrow head */}
              <polygon
                points="100,25 90,45 110,45"
                fill="currentColor"
                className="text-primary"
              />
              {/* Arrow tail (small circle) */}
              <circle cx="100" cy="100" r="5" fill="currentColor" className="text-primary" />
            </g>
          </svg>

          {/* Cardinal direction labels */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground">
            N
          </div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            E
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
            S
          </div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            W
          </div>
        </div>

        {/* Bearing Information */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-2xl font-bold text-foreground">
            {bearing.toFixed(1)}° {compassDirection}
          </p>
          <p className="text-xs text-muted-foreground">Direction to Mecca</p>
        </div>
      </CardContent>
    </Card>
  )
}

