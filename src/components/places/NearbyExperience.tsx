'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, ListFilter, MapPin, RotateCw, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LocationSearch } from '@/components/places/LocationSearch'
import { cn } from '@/lib/utils'
import type { DistanceUnit } from '@/types/places.types'
import type { LocationData } from '@/types/ramadan.types'

type NearbyMode = 'mosques' | 'food'

interface NearbyExperienceProps {
  mode: NearbyMode
  loading: boolean
  error: string | null
  itemCount: number
  searchRadiusMiles: number
  distanceUnit: DistanceUnit
  location: LocationData | null
  onLocationSelect: (location: LocationData) => Promise<void>
  onRadiusChange: (radiusMiles: number) => Promise<void>
  onDistanceUnitChange: (unit: DistanceUnit) => Promise<void>
  onRetry?: () => Promise<void>
  map: ReactNode
  results: ReactNode
  attribution: ReactNode
}

const categoryLinks = [
  { mode: 'mosques' as const, href: '/places/mosques', label: 'Mosques', icon: Building2 },
  { mode: 'food' as const, href: '/places/food', label: 'Halal Food', icon: UtensilsCrossed },
]

function getRadiusOptions(unit: DistanceUnit) {
  const radiiInMiles = [1, 2, 3, 5, 10]
  return radiiInMiles.map((radiusMiles) => ({
    value: radiusMiles,
    label: unit === 'mi' ? `${radiusMiles} mi` : `${formatKilometers(radiusMiles)} km`,
  }))
}

function formatKilometers(radiusMiles: number) {
  return Number((radiusMiles * 1.60934).toFixed(1))
}

function radiusLabel(radiusMiles: number, unit: DistanceUnit) {
  if (unit === 'km') return `${formatKilometers(radiusMiles)} kilometers`
  return `${radiusMiles} ${radiusMiles === 1 ? 'mile' : 'miles'}`
}

function NearbyFilters({
  mode,
  searchRadiusMiles,
  distanceUnit,
  onRadiusChange,
  onDistanceUnitChange,
}: Pick<
  NearbyExperienceProps,
  'mode' | 'searchRadiusMiles' | 'distanceUnit' | 'onRadiusChange' | 'onDistanceUnitChange'
>) {
  const options = getRadiusOptions(distanceUnit)
  const unitLabel = distanceUnit === 'mi' ? 'miles' : 'kilometers'
  const displayedRadius = distanceUnit === 'mi'
    ? searchRadiusMiles
    : formatKilometers(searchRadiusMiles)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-11 min-w-11 gap-2 px-3"
          aria-label={`Filters, ${radiusLabel(searchRadiusMiles, distanceUnit)}, ${unitLabel}`}
        >
          <ListFilter className="size-4" aria-hidden="true" />
          <span>Filters</span>
          <span className="type-caption text-text-tertiary">{displayedRadius} {distanceUnit}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 text-left">
          <SheetTitle className="type-section-title pr-12">Nearby filters</SheetTitle>
          <SheetDescription>
            Set the search distance for nearby {mode === 'mosques' ? 'mosques' : 'halal food'}.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto px-5 pb-6 pt-5">
          <fieldset>
            <legend className="type-label mb-3 text-text-primary">Search radius</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="radiogroup">
              {options.map((option) => {
                const selected = searchRadiusMiles === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => void onRadiusChange(option.value)}
                    className={cn(
                      'min-h-11 rounded-control border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                      selected
                        ? 'border-primary bg-teal-muted text-text-primary'
                        : 'border-border-subtle bg-surface-primary text-text-secondary hover:bg-surface-grouped'
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="type-label mb-3 text-text-primary">Distance units</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {(['mi', 'km'] as const).map((unit) => {
                const selected = distanceUnit === unit
                const label = unit === 'mi' ? 'Miles' : 'Kilometers'
                return (
                  <button
                    key={unit}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => void onDistanceUnitChange(unit)}
                    className={cn(
                      'min-h-11 rounded-control border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                      selected
                        ? 'border-primary bg-teal-muted text-text-primary'
                        : 'border-border-subtle bg-surface-primary text-text-secondary hover:bg-surface-grouped'
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function NearbyExperience({
  mode,
  loading,
  error,
  itemCount,
  searchRadiusMiles,
  distanceUnit,
  location,
  onLocationSelect,
  onRadiusChange,
  onDistanceUnitChange,
  onRetry,
  map,
  results,
  attribution,
}: NearbyExperienceProps) {
  const itemLabel = mode === 'mosques'
    ? itemCount === 1 ? 'mosque' : 'mosques'
    : itemCount === 1 ? 'halal place' : 'halal places'

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <header>
        <Link
          href="/more"
          className="type-nav mb-3 inline-flex min-h-11 items-center gap-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to More
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="type-page-title text-text-primary">Nearby</h1>
            <p className="type-body-secondary mt-1 max-w-2xl text-text-secondary">
              Find a mosque or halal food, see the distance, and get directions.
            </p>
          </div>
          {location && (
            <p className="type-caption flex items-center gap-1.5 text-text-secondary">
              <MapPin className="size-3.5" aria-hidden="true" />
              Searching near {location.city}
            </p>
          )}
        </div>
      </header>

      <nav
        aria-label="Nearby categories"
        className="mt-6 grid w-full grid-cols-2 rounded-grouped border border-border-subtle bg-surface-grouped p-[3px] sm:max-w-md"
      >
        {categoryLinks.map((category) => {
          const active = mode === category.mode
          const Icon = category.icon
          return (
            <Link
              key={category.mode}
              href={category.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'type-label flex min-h-11 items-center justify-center gap-2 rounded-control border border-transparent px-3 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35',
                active
                  ? 'border-border-subtle bg-surface-primary text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {category.label}
            </Link>
          )
        })}
      </nav>

      <section className="mt-5" aria-label="Choose search location">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <LocationSearch onLocationSelect={onLocationSelect} />
          </div>
          <NearbyFilters
            mode={mode}
            searchRadiusMiles={searchRadiusMiles}
            distanceUnit={distanceUnit}
            onRadiusChange={onRadiusChange}
            onDistanceUnitChange={onDistanceUnitChange}
          />
        </div>
      </section>

      {loading && (
        <div className="mt-5 space-y-5" aria-busy="true" aria-label="Loading nearby places">
          <div className="h-[22rem] animate-pulse rounded-surface bg-surface-grouped motion-reduce:animate-none sm:h-[26rem]" />
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-grouped bg-surface-grouped motion-reduce:animate-none" />
            ))}
          </div>
        </div>
      )}

      {!loading && !location && (
        <div className="mt-6 rounded-grouped border border-border-subtle bg-surface-grouped px-5 py-6" role="status">
          <p className="font-medium text-text-primary">Choose a location to see what is nearby</p>
          <p className="type-body-secondary mt-1 text-text-secondary">
            Search for a city or use your current location above.
          </p>
        </div>
      )}

      {!loading && location && error && (
        <div className="mt-6 flex flex-col gap-4 rounded-grouped border border-border-subtle bg-surface-grouped px-5 py-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div>
            <p className="font-medium text-text-primary">Nearby results are unavailable</p>
            <p className="type-body-secondary mt-1 text-text-secondary">{error}</p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={() => void onRetry()}>
              <RotateCw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          )}
        </div>
      )}

      {!loading && location && !error && (
        <div className="mt-5 space-y-6">
          <section aria-label={`${mode === 'mosques' ? 'Mosque' : 'Halal food'} map`}>
            <div className="h-[22rem] overflow-hidden rounded-surface border border-border-subtle bg-surface-grouped sm:h-[26rem]">
              {map}
            </div>
          </section>

          <section aria-labelledby="nearby-results-heading">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <h2 id="nearby-results-heading" className="type-section-title text-text-primary">Closest to you</h2>
                <p className="type-caption mt-1 text-text-secondary" aria-live="polite">
                  {itemCount} {itemLabel} nearby
                </p>
              </div>
              <span className="type-caption shrink-0 text-text-tertiary">Nearest first</span>
            </div>
            {results}
          </section>

          <details className="rounded-grouped border border-border-subtle bg-surface-grouped px-4 py-3">
            <summary className="type-caption cursor-pointer text-text-secondary">About these results</summary>
            <div className="type-caption mt-2 text-text-secondary">{attribution}</div>
          </details>
        </div>
      )}
    </div>
  )
}
