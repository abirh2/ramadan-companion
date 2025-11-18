'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Compass, Loader2, Navigation, AlertTriangle } from 'lucide-react'
import type { QiblaData, CompassMode } from '@/types/ramadan.types'
import {
  isMobileDevice,
  hasOrientationSupport,
  needsOrientationPermission,
  requestOrientationPermission,
  startOrientationTracking,
  isLowAccuracy,
  type OrientationPermission,
  type DeviceHeading,
} from '@/lib/orientation'

interface QiblaCompassProps {
  qiblaDirection: QiblaData | null
  loading?: boolean
  error?: string | null
}

export function QiblaCompass({ qiblaDirection, loading, error }: QiblaCompassProps) {
  // Dynamic compass state
  const [mode, setMode] = useState<CompassMode>('static')
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [permission, setPermission] = useState<OrientationPermission>('prompt')
  const [isEnabling, setIsEnabling] = useState(false)
  const [isMobile] = useState(() => isMobileDevice())
  const [hasOrientation] = useState(() => hasOrientationSupport())

  // Check if dynamic compass is available
  const canUseDynamicCompass = isMobile && hasOrientation

  // Enable dynamic compass
  const handleEnableDynamic = useCallback(async () => {
    if (!canUseDynamicCompass) return

    setIsEnabling(true)

    try {
      // Check if permission is needed (iOS 13+)
      if (needsOrientationPermission()) {
        const permissionStatus = await requestOrientationPermission()
        setPermission(permissionStatus)

        if (permissionStatus !== 'granted') {
          setIsEnabling(false)
          return
        }
      } else {
        setPermission('not-required')
      }

      // Enable dynamic mode
      setMode('dynamic')
    } catch (error) {
      console.error('[QiblaCompass] Failed to enable dynamic compass:', error)
      setPermission('denied')
    } finally {
      setIsEnabling(false)
    }
  }, [canUseDynamicCompass])

  // Toggle between static and dynamic modes
  const handleToggleMode = useCallback(() => {
    if (mode === 'static') {
      handleEnableDynamic()
    } else {
      setMode('static')
      setDeviceHeading(null)
      setAccuracy(null)
    }
  }, [mode, handleEnableDynamic])

  // Start/stop orientation tracking based on mode
  useEffect(() => {
    if (mode === 'dynamic' && canUseDynamicCompass) {
      const cleanup = startOrientationTracking((heading: DeviceHeading) => {
        setDeviceHeading(heading.alpha)
        setAccuracy(heading.accuracy)
      })

      return cleanup
    }
  }, [mode, canUseDynamicCompass])

  // Calculate if compass is aligned with Qibla (±5 degrees)
  const isAligned = useCallback((): boolean => {
    if (mode !== 'dynamic' || deviceHeading === null || !qiblaDirection) {
      return false
    }

    const diff = Math.abs(qiblaDirection.direction - deviceHeading)
    const normalizedDiff = Math.min(diff, 360 - diff)
    return normalizedDiff <= 5
  }, [mode, deviceHeading, qiblaDirection])

  // Calculate rotation angle for compass
  const getRotation = useCallback((): number => {
    if (!qiblaDirection) return 0

    const qiblaBearing = qiblaDirection.direction

    if (mode === 'dynamic' && deviceHeading !== null) {
      // Dynamic mode: rotate based on device heading
      // Compass rotates counter to device rotation to keep Qibla arrow pointing at fixed bearing
      return qiblaBearing - deviceHeading
    }

    // Static mode: rotate to absolute bearing
    return qiblaBearing
  }, [mode, deviceHeading, qiblaDirection])

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

  const rotation = getRotation()
  const aligned = isAligned()
  const showLowAccuracy = accuracy !== null && isLowAccuracy(accuracy)

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qibla Direction
            </CardTitle>
          </div>
          {canUseDynamicCompass && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMode}
              disabled={isEnabling}
              className="h-7 text-xs"
            >
              {isEnabling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : mode === 'dynamic' ? (
                <>
                  <Compass className="h-3 w-3 mr-1" />
                  Static
                </>
              ) : (
                <>
                  <Navigation className="h-3 w-3 mr-1" />
                  Dynamic
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {/* Permission Denied Message */}
        {canUseDynamicCompass && permission === 'denied' && mode === 'static' && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
              Device orientation permission denied. Using static compass.
            </p>
          </div>
        )}

        {/* Low Accuracy Warning */}
        {mode === 'dynamic' && showLowAccuracy && (
          <div className="mb-4 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Low compass accuracy ({accuracy?.toFixed(0)}°). Calibrate by moving phone in figure-8 motion.
            </p>
          </div>
        )}

        {/* Mode Indicator */}
        {mode === 'dynamic' && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${aligned ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{aligned ? 'Aligned with Qibla' : 'Tracking device orientation'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <span className="text-base">📱</span>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                Hold phone flat for best results
              </span>
            </div>
          </div>
        )}

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
            <g 
              transform={`rotate(${rotation}, 100, 100)`}
              style={{ 
                transition: mode === 'dynamic' ? 'transform 0.3s ease-out' : 'none',
              }}
            >
              {/* Arrow shaft */}
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="35"
                stroke="currentColor"
                strokeWidth="3"
                className={aligned ? 'text-green-500' : 'text-primary'}
              />
              {/* Arrow head */}
              <polygon
                points="100,25 90,45 110,45"
                fill="currentColor"
                className={aligned ? 'text-green-500' : 'text-primary'}
              />
              {/* Arrow tail (small circle) */}
              <circle 
                cx="100" 
                cy="100" 
                r="5" 
                fill="currentColor" 
                className={aligned ? 'text-green-500' : 'text-primary'}
              />
            </g>
          </svg>

          {/* Direction labels - different for static vs dynamic mode */}
          {mode === 'static' ? (
            <>
              {/* Static mode: Show cardinal directions (N, E, S, W) */}
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
            </>
          ) : (
            <>
              {/* Dynamic mode: Show Qibla icon at top (target to align with) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">
                🕋
              </div>
            </>
          )}
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

