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

  // Handle keyboard events for mode toggle
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggleMode()
    }
  }, [handleToggleMode])

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
      <Card className="rounded-3xl shadow-lg bg-slate-900 text-white border-slate-800">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-white">
              Qibla Direction
            </CardTitle>
            <p className="text-xs text-white/60 mt-0.5">
              Loading...
            </p>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error || !qiblaDirection) {
    return (
      <Card className="rounded-3xl shadow-lg bg-slate-900 text-white border-slate-800">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-white">
              Qibla Direction
            </CardTitle>
            <p className="text-xs text-white/60 mt-0.5">
              Unable to load
            </p>
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <Compass className="h-12 w-12 text-white/40" />
            <p className="text-sm text-white/60 text-center">
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
    <Card className="rounded-3xl shadow-lg bg-slate-900 text-white border-slate-800 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-white">
              Qibla Direction
            </CardTitle>
            <p className="text-xs text-white/60 mt-0.5">
              Facing Kaaba: {bearing.toFixed(1)}° {compassDirection}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Compass className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6 relative z-10">
        {/* Permission Denied Message */}
        {canUseDynamicCompass && permission === 'denied' && mode === 'static' && (
          <div className="mb-4 p-3 bg-white/10 border border-white/20 rounded-lg">
            <p className="text-xs text-white/80 text-center">
              Device orientation permission denied. Using static compass.
            </p>
          </div>
        )}

        {/* Low Accuracy Warning */}
        {mode === 'dynamic' && showLowAccuracy && (
          <div className="mb-4 flex items-center gap-2 p-2 bg-white/10 border border-white/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <p className="text-xs text-white/80">
              Low compass accuracy ({accuracy?.toFixed(0)}°). Calibrate by moving phone in figure-8 motion.
            </p>
          </div>
        )}

        {/* Mode Indicator */}
        {mode === 'dynamic' && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/60" role="status" aria-live="polite">
              <div className={`w-2 h-2 rounded-full ${aligned ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} aria-hidden="true" />
              <span>{aligned ? 'Aligned with Qibla' : 'Tracking device orientation'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg" role="note">
              <span className="text-base" aria-hidden="true">📱</span>
              <span className="text-xs font-medium text-white/80">
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
              strokeWidth="12"
              className="text-white/10"
            />

            {/* Inner circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/20"
            />

            {/* Crosshair lines */}
            <line
              x1="100"
              y1="15"
              x2="100"
              y2="185"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/10"
            />
            <line
              x1="15"
              y1="100"
              x2="185"
              y2="100"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/10"
            />

            {/* Qibla Arrow - rotated to bearing angle */}
            <g 
              transform={`rotate(${rotation}, 100, 100)`}
              style={{ 
                transition: mode === 'dynamic' ? 'transform 0.3s ease-out' : 'none',
              }}
            >
              {/* Arrow shaft - gradient */}
              <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={aligned ? '#10b981' : '#3b82f6'} />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="35"
                stroke="url(#arrowGradient)"
                strokeWidth="4"
              />
              {/* Arrow head with Kaaba emoji */}
              <circle 
                cx="100" 
                cy="30" 
                r="12" 
                fill={aligned ? '#10b981' : '#3b82f6'}
              />
              {/* Arrow tail (small circle) */}
              <circle 
                cx="100" 
                cy="100" 
                r="5" 
                fill="white"
              />
            </g>
          </svg>

          {/* Kaaba emoji at arrow tip - positioned absolutely */}
          <div 
            className="absolute text-xl transition-transform duration-300"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-70px)`,
            }}
          >
            🕋
          </div>

          {/* Direction labels - different for static vs dynamic mode */}
          {mode === 'static' ? (
            <></>
          ) : (
            <>
              {/* Dynamic mode: Show Qibla icon at top (target to align with) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">
                🕋
              </div>
            </>
          )}
        </div>

        {/* Toggle Mode Button */}
        {canUseDynamicCompass && (
          <Button
            onClick={handleToggleMode}
            onKeyDown={handleKeyDown}
            disabled={isEnabling}
            variant="ghost"
            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold transition-all backdrop-blur-sm"
            aria-label={mode === 'dynamic' ? 'Switch to static compass mode' : 'Switch to dynamic compass mode'}
          >
            {isEnabling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ENABLING...
              </>
            ) : mode === 'dynamic' ? (
              'CALIBRATE COMPASS'
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                ENABLE DYNAMIC COMPASS
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

