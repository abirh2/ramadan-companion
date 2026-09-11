'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Compass,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  RotateCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CompassMode, QiblaData } from '@/types/ramadan.types'
import {
  hasOrientationSupport,
  isLowAccuracy,
  isMobileDevice,
  needsOrientationPermission,
  requestOrientationPermission,
  startOrientationTracking,
  type DeviceHeading,
  type OrientationPermission,
} from '@/lib/orientation'
import { triggerQiblaAlignmentHaptic } from '@/lib/qiblaHaptics'

interface QiblaCompassProps {
  qiblaDirection: QiblaData | null
  locationLabel?: string | null
  loading?: boolean
  error?: string | null
}

const ALIGNMENT_TOLERANCE = 5
const ALIGNMENT_EXIT_TOLERANCE = 10
const ALIGNMENT_HAPTIC_COOLDOWN_MS = 2500
const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function angularDistance(first: number, second: number): number {
  const diff = Math.abs(first - second)
  return Math.min(diff, 360 - diff)
}

function closestEquivalentAngle(target: number, previous: number): number {
  let next = target
  while (next - previous > 180) next -= 360
  while (next - previous < -180) next += 360
  return next
}

function getTurnGuidance(bearing: number, heading: number): string {
  const clockwiseDistance = ((bearing - heading + 540) % 360) - 180
  const degrees = Math.round(Math.abs(clockwiseDistance))
  if (degrees <= ALIGNMENT_TOLERANCE) return 'Facing Qibla'
  return `Turn ${degrees}° ${clockwiseDistance > 0 ? 'right' : 'left'}`
}

function CompassTexture() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full opacity-[0.035]"
      viewBox="0 0 360 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="qibla-eight-point" width="72" height="72" patternUnits="userSpaceOnUse">
          <path
            d="M36 3 45.7 26.3 69 36 45.7 45.7 36 69 26.3 45.7 3 36 26.3 26.3Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <rect
            x="20.5"
            y="20.5"
            width="31"
            height="31"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.55"
            transform="rotate(45 36 36)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#qibla-eight-point)" />
    </svg>
  )
}

function CompassDial({
  bearing,
  rotation,
  deviceHeading,
  dynamic,
  aligned,
}: {
  bearing: number
  rotation: number
  deviceHeading: number | null
  dynamic: boolean
  aligned: boolean
}) {
  const dialRotation = dynamic && deviceHeading !== null ? -deviceHeading : 0

  return (
    <div className="relative aspect-square w-full max-w-[19rem] sm:max-w-[21rem]">
      <div
        className={`absolute left-1/2 top-0 z-10 -translate-x-1/2 transition-colors ${
          aligned ? 'text-gold' : 'text-surface-feature-foreground'
        }`}
        aria-hidden="true"
      >
        <div className="h-0 w-0 border-x-[6px] border-b-[10px] border-x-transparent border-b-current" />
      </div>

      <svg
        viewBox="0 0 320 320"
        className="size-full overflow-visible"
        role="img"
        aria-labelledby="qibla-dial-title qibla-dial-description"
      >
        <title id="qibla-dial-title">Qibla compass</title>
        <desc id="qibla-dial-description">
          Qibla is {bearing.toFixed(1)} degrees from north
          {dynamic && deviceHeading !== null
            ? ` and the device is heading ${deviceHeading.toFixed(0)} degrees`
            : ''}
          .
        </desc>

        <circle cx="160" cy="160" r="151" fill="rgba(255,255,255,0.018)" />
        <circle cx="160" cy="160" r="151" fill="none" stroke="currentColor" strokeOpacity="0.26" />
        <circle cx="160" cy="160" r="137" fill="none" stroke="currentColor" strokeOpacity="0.12" />

        <g
          className="motion-reduce:transition-none"
          style={{
            transform: `rotate(${dialRotation}deg)`,
            transformBox: 'view-box',
            transformOrigin: 'center',
            transition: dynamic ? 'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {Array.from({ length: 72 }, (_, index) => {
            const isCardinal = index % 18 === 0
            const isMajor = index % 6 === 0
            const isMedium = index % 2 === 0
            const innerY = isCardinal ? 23 : isMajor ? 26 : isMedium ? 29 : 32
            return (
              <line
                key={index}
                x1="160"
                y1="13"
                x2="160"
                y2={innerY}
                transform={`rotate(${index * 5} 160 160)`}
                stroke="currentColor"
                strokeWidth={isCardinal ? 1.8 : isMajor ? 1.25 : 0.75}
                strokeOpacity={isCardinal ? 0.82 : isMajor ? 0.52 : 0.22}
              />
            )
          })}

          <text x="160" y="51" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="700">N</text>
          <text x="269" y="166" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="14" fontWeight="600">E</text>
          <text x="160" y="280" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="14" fontWeight="600">S</text>
          <text x="51" y="166" textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontSize="14" fontWeight="600">W</text>
        </g>

        <g
          className="motion-reduce:transition-none"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformBox: 'view-box',
            transformOrigin: 'center',
            transition: dynamic ? 'transform 140ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
          data-testid="qibla-indicator"
        >
          <path
            d="M160 160V70"
            fill="none"
            stroke="currentColor"
            strokeWidth={aligned ? 4 : 3}
            strokeLinecap="round"
            className="text-gold transition-[stroke-width]"
          />
          <path d="m160 49-12 24h24Z" fill="currentColor" className="text-gold" />
          <g transform="translate(148 25)">
            <rect width="24" height="24" rx="3" fill="currentColor" className="text-surface-feature-foreground" />
            <path d="M0 7h24v4H0z" fill="currentColor" className="text-gold" />
            <path d="M6 15h5v9H6z" fill="currentColor" className="text-surface-feature" />
          </g>
        </g>

        <circle
          cx="160"
          cy="160"
          r={aligned ? 14 : 11}
          fill="currentColor"
          className={aligned ? 'text-gold' : 'text-surface-feature-foreground'}
        />
        <circle cx="160" cy="160" r="4" fill="currentColor" className="text-surface-feature" />
        {aligned && (
          <circle cx="160" cy="160" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold" />
        )}
      </svg>
    </div>
  )
}

export function QiblaCompass({
  qiblaDirection,
  locationLabel,
  loading,
  error,
}: QiblaCompassProps) {
  const [mode, setMode] = useState<CompassMode>('static')
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [permission, setPermission] = useState<OrientationPermission>('prompt')
  const [isEnabling, setIsEnabling] = useState(false)
  const [isMobile] = useState(() => isMobileDevice())
  const [hasOrientation] = useState(() => hasOrientationSupport())
  const [displayRotation, setDisplayRotation] = useState(qiblaDirection?.direction ?? 0)
  const [trackingSession, setTrackingSession] = useState(0)
  const alignmentHapticLatchedRef = useRef(false)
  const lastHapticAtRef = useRef(0)

  const canUseDynamicCompass = isMobile && hasOrientation
  const bearing = qiblaDirection?.direction ?? 0

  const handleEnableDynamic = useCallback(async () => {
    if (!canUseDynamicCompass) return

    setIsEnabling(true)
    try {
      if (needsOrientationPermission()) {
        const permissionStatus = await requestOrientationPermission()
        setPermission(permissionStatus)
        if (permissionStatus !== 'granted') return
      } else {
        setPermission('not-required')
      }
      setMode('dynamic')
    } catch (enableError) {
      console.error('[QiblaCompass] Failed to enable dynamic compass:', enableError)
      setPermission('denied')
    } finally {
      setIsEnabling(false)
    }
  }, [canUseDynamicCompass])

  const handleToggleMode = useCallback(() => {
    if (mode === 'static') {
      void handleEnableDynamic()
    } else {
      setMode('static')
      setDeviceHeading(null)
      setAccuracy(null)
      setDisplayRotation(bearing)
    }
  }, [bearing, handleEnableDynamic, mode])

  useEffect(() => {
    if (mode !== 'dynamic' || !canUseDynamicCompass) return

    return startOrientationTracking((heading: DeviceHeading) => {
      setDeviceHeading(heading.alpha)
      setAccuracy(heading.accuracy)
      setDisplayRotation((previous) => closestEquivalentAngle(bearing - heading.alpha, previous))
    })
  }, [bearing, canUseDynamicCompass, mode, trackingSession])

  useEffect(() => {
    if (mode !== 'dynamic' || !canUseDynamicCompass) return

    const restartTracking = () => setTrackingSession((session) => session + 1)
    const restartWhenVisible = () => {
      if (document.visibilityState === 'visible') restartTracking()
    }

    window.addEventListener('deen:native-foreground', restartTracking)
    document.addEventListener('visibilitychange', restartWhenVisible)
    return () => {
      window.removeEventListener('deen:native-foreground', restartTracking)
      document.removeEventListener('visibilitychange', restartWhenVisible)
    }
  }, [canUseDynamicCompass, mode])

  const alignmentDistance =
    mode === 'dynamic' &&
    deviceHeading !== null &&
    qiblaDirection !== null
      ? angularDistance(qiblaDirection.direction, deviceHeading)
      : null
  const aligned = alignmentDistance !== null && alignmentDistance <= ALIGNMENT_TOLERANCE

  useEffect(() => {
    if (alignmentDistance === null) {
      alignmentHapticLatchedRef.current = false
      return
    }

    if (alignmentDistance >= ALIGNMENT_EXIT_TOLERANCE) {
      alignmentHapticLatchedRef.current = false
      return
    }

    if (alignmentDistance <= ALIGNMENT_TOLERANCE && !alignmentHapticLatchedRef.current) {
      alignmentHapticLatchedRef.current = true
      const now = Date.now()
      if (now - lastHapticAtRef.current >= ALIGNMENT_HAPTIC_COOLDOWN_MS) {
        lastHapticAtRef.current = now
        void triggerQiblaAlignmentHaptic()
      }
    }
  }, [alignmentDistance])

  if (loading) {
    return (
      <section className="surface-feature relative isolate min-h-[31rem] overflow-hidden p-5 sm:p-6" aria-labelledby="qibla-heading" aria-busy="true">
        <CompassTexture />
        <div className="relative flex items-center justify-between">
          <h2 id="qibla-heading" className="type-section-title text-surface-feature-foreground">Qibla</h2>
          <Compass className="size-5 text-surface-feature-muted" aria-hidden="true" />
        </div>
        <div className="relative flex min-h-[24rem] flex-col items-center justify-center gap-4" role="status">
          <Loader2 className="size-7 animate-spin text-surface-feature-muted" aria-hidden="true" />
          <p className="type-body-secondary text-surface-feature-muted">Calculating direction…</p>
        </div>
      </section>
    )
  }

  if (error || !qiblaDirection) {
    return (
      <section className="surface-feature relative isolate min-h-[25rem] overflow-hidden p-5 sm:p-6" aria-labelledby="qibla-heading" aria-live="polite">
        <CompassTexture />
        <div className="relative flex items-center justify-between">
          <h2 id="qibla-heading" className="type-section-title text-surface-feature-foreground">Qibla</h2>
          <Compass className="size-5 text-surface-feature-muted" aria-hidden="true" />
        </div>
        <div className="relative flex min-h-[18rem] flex-col items-center justify-center text-center">
          <div className="flex size-12 items-center justify-center rounded-grouped bg-white/[0.07]">
            <LocateFixed className="size-5 text-surface-feature-muted" aria-hidden="true" />
          </div>
          <h3 className="type-section-title mt-5 text-surface-feature-foreground">Direction unavailable</h3>
          <p className="type-body-secondary mt-2 max-w-[30ch] text-surface-feature-muted">
            {error || 'We couldn’t calculate the Qibla direction. Check your location settings and try again.'}
          </p>
        </div>
      </section>
    )
  }

  const compassDirection =
    (qiblaDirection as QiblaData & { compassDirection?: string }).compassDirection ||
    COMPASS_DIRECTIONS[Math.round(bearing / 45) % 8]
  const showLowAccuracy = accuracy !== null && isLowAccuracy(accuracy)
  const rotation = mode === 'dynamic' ? displayRotation : bearing
  const currentHeadingLabel = deviceHeading === null ? null : `${deviceHeading.toFixed(0)}°`
  const turnGuidance = deviceHeading === null ? null : getTurnGuidance(bearing, deviceHeading)

  return (
    <section
      className={`surface-feature relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.055),transparent_46%)] p-5 sm:p-6 ${aligned ? 'ring-1 ring-inset ring-gold/45' : ''}`}
      aria-labelledby="qibla-heading"
    >
      <CompassTexture />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 id="qibla-heading" className="type-section-title text-surface-feature-foreground">Qibla</h2>
          <p className="type-caption mt-1 text-surface-feature-muted">Direction to Makkah</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold leading-none tracking-[-0.025em] tabular-nums text-surface-feature-foreground sm:text-[1.75rem]">
            {bearing.toFixed(1)}° <span className="text-gold">{compassDirection}</span>
          </p>
          {currentHeadingLabel && <p className="type-caption mt-1 text-surface-feature-muted">Heading {currentHeadingLabel}</p>}
        </div>
      </div>

      <div className="relative mt-6 flex justify-center sm:mt-8">
        <CompassDial bearing={bearing} rotation={rotation} deviceHeading={deviceHeading} dynamic={mode === 'dynamic'} aligned={aligned} />
      </div>

      <div className="relative mt-5 min-h-12 text-center">
        {aligned ? (
          <div className="inline-flex items-center gap-2 text-surface-feature-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-gold text-surface-feature">
              <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-semibold">Facing Qibla</span>
          </div>
        ) : mode === 'dynamic' ? (
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 font-medium text-surface-feature-foreground">
              <Navigation className="size-4 text-gold" aria-hidden="true" />
              {turnGuidance ?? 'Turn until the Qibla marker reaches the top'}
            </p>
            <p className="type-caption text-surface-feature-muted">Hold your phone flat and away from magnets</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-5 type-caption text-surface-feature-muted">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rotate-45 bg-gold" aria-hidden="true" />Qibla direction</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0 w-0 border-x-4 border-b-[7px] border-x-transparent border-b-current" aria-hidden="true" />Device direction</span>
          </div>
        )}
      </div>

      {(permission === 'denied' || showLowAccuracy) && (
        <div className="relative mt-4 flex items-start gap-3 border-t border-white/10 pt-4" role="status" aria-live="polite">
          {showLowAccuracy ? <RotateCw className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />}
          <p className="type-caption text-surface-feature-muted">
            {showLowAccuracy
              ? `Compass accuracy is low${accuracy === null ? '' : ` (${accuracy.toFixed(0)}°)`}. Move your phone in a figure-eight to calibrate.`
              : 'Motion access was denied. The bearing remains available as a manual compass.'}
          </p>
        </div>
      )}

      {!canUseDynamicCompass && (
        <div className="relative mt-4 flex items-start gap-3 border-t border-white/10 pt-4" role="note">
          <Compass className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
          <p className="type-caption text-surface-feature-muted">Live compass isn’t available on this device. Use the bearing with your device’s north direction.</p>
        </div>
      )}

      <div className="relative mt-5 flex flex-col gap-3 border-t border-white/10 pt-5">
        {locationLabel && (
          <div className="flex min-w-0 items-center justify-center gap-2 type-caption text-surface-feature-muted">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span>Calculated from <span className="font-semibold text-surface-feature-foreground">{locationLabel}</span></span>
          </div>
        )}

        {canUseDynamicCompass && (
          <Button
            onClick={handleToggleMode}
            disabled={isEnabling}
            variant="ghost"
            className="min-h-touch w-full rounded-control bg-white/[0.08] px-4 text-sm font-semibold text-surface-feature-foreground hover:bg-white/[0.14] hover:text-surface-feature-foreground focus-visible:ring-2 focus-visible:ring-gold disabled:text-surface-feature-muted"
            aria-label={mode === 'dynamic' ? 'Switch to manual Qibla bearing' : 'Use live device compass'}
          >
            {isEnabling ? (
              <><Loader2 className="size-4 animate-spin" aria-hidden="true" />Enabling compass…</>
            ) : mode === 'dynamic' ? (
              'Use manual bearing'
            ) : (
              <><Navigation className="size-4" aria-hidden="true" />Use live compass</>
            )}
          </Button>
        )}
      </div>
    </section>
  )
}
