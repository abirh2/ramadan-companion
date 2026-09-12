'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectionSheet } from '@/components/ui/selection-sheet'
import { Settings, MapPin, Loader2, Search } from 'lucide-react'
import { CALCULATION_METHODS, MADHABS, type CalculationMethodId, type MadhabId } from '@/types/ramadan.types'
import type { LocationData } from '@/types/ramadan.types'
import { geocodeCity, requestGeolocation } from '@/lib/location'

interface PreferencesDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calculationMethod: CalculationMethodId
  madhab: MadhabId
  location: LocationData | null
  onCalculationMethodChange: (method: CalculationMethodId) => Promise<void>
  onMadhabChange: (madhab: MadhabId) => Promise<void>
  onLocationChange: (lat: number, lng: number, city: string, type: LocationData['type']) => Promise<void>
}

export function PreferencesDetailModal({
  open,
  onOpenChange,
  calculationMethod,
  madhab,
  location,
  onCalculationMethodChange,
  onMadhabChange,
  onLocationChange,
}: PreferencesDetailModalProps) {
  const [tempMethod, setTempMethod] = useState<CalculationMethodId>(calculationMethod)
  const [tempMadhab, setTempMadhab] = useState<MadhabId>(madhab)
  const [tempLocation, setTempLocation] = useState<LocationData | null>(location)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [cityResults, setCityResults] = useState<Array<{ lat: number; lng: number; displayName: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Handle requesting current location from browser
  const handleRequestLocation = async () => {
    setIsRequestingLocation(true)
    try {
      const geoLocation = await requestGeolocation()
      if (geoLocation) {
        setTempLocation({
          lat: geoLocation.lat,
          lng: geoLocation.lng,
          city: geoLocation.city,
          type: 'detected'
        })
      } else {
        alert('Unable to get your location. Please check your browser permissions.')
      }
    } catch (error) {
      console.error('Error requesting location:', error)
      alert('Failed to get location. Please try again.')
    } finally {
      setIsRequestingLocation(false)
    }
  }

  // Handle city search
  const handleCitySearch = async () => {
    if (!citySearch.trim()) {
      setSearchError('Please enter a city name')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setCityResults([])

    try {
      const results = await geocodeCity(citySearch.trim())
      if (results.length === 0) {
        setSearchError('No cities found. Try a different search.')
      } else {
        setCityResults(results)
      }
    } catch (error) {
      console.error('Error searching for city:', error)
      setSearchError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle selecting a city from results
  const handleSelectCity = (result: { lat: number; lng: number; displayName: string }) => {
    setTempLocation({
      lat: result.lat,
      lng: result.lng,
      city: result.displayName,
      type: 'selected'
    })
    setCitySearch('')
    setCityResults([])
    setSearchError(null)
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Only update if changed
      if (tempLocation && (
        tempLocation.lat !== location?.lat || 
        tempLocation.lng !== location?.lng ||
        tempLocation.city !== location?.city
      )) {
        await onLocationChange(tempLocation.lat, tempLocation.lng, tempLocation.city, tempLocation.type)
      }
      if (tempMethod !== calculationMethod) {
        await onCalculationMethodChange(tempMethod)
      }
      if (tempMadhab !== madhab) {
        await onMadhabChange(tempMadhab)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset temp values when modal opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempMethod(calculationMethod)
      setTempMadhab(madhab)
      setTempLocation(location)
      setCitySearch('')
      setCityResults([])
      setSearchError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 text-left">
          <SheetTitle className="flex items-center gap-2 pr-12">
            <Settings className="h-5 w-5" />
            Prayer Settings
          </SheetTitle>
          <SheetDescription>
            Configure your prayer time calculation preferences
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          {/* Calculation Method */}
          <div className="space-y-2">
            <SelectionSheet
              label="Calculation Method"
              value={tempMethod}
              onValueChange={setTempMethod}
              searchable
              description="Choose the convention used to calculate daily prayer times."
              options={CALCULATION_METHODS.map((method) => ({
                value: method.id,
                title: method.name,
                subtitle: method.description,
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Different regions use different calculation methods
            </p>
          </div>

          {/* Madhab/School */}
          <div className="space-y-2">
            <SelectionSheet
              label="Madhab (Asr Calculation)"
              value={tempMadhab}
              onValueChange={setTempMadhab}
              description="Choose the juristic method used for Asr prayer time."
              options={MADHABS.map((madhabOption) => ({
                value: madhabOption.id,
                title: madhabOption.name,
                subtitle: madhabOption.description,
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Affects Asr prayer time only. Hanafi madhab uses a later Asr time.
            </p>
          </div>

          {/* Current Location Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Location</label>
            {tempLocation && (
              <div className="type-body-secondary flex items-center gap-2 rounded-grouped bg-surface-grouped p-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{tempLocation.city}</span>
              </div>
            )}
          </div>

          {/* Use Current Location Button */}
          <Button
            onClick={handleRequestLocation}
            disabled={isRequestingLocation}
            variant="outline"
            className="w-full"
          >
            {isRequestingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Use Current Location
              </>
            )}
          </Button>

          {/* City Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or Search for a City</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., New York, London"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              />
              <Button
                onClick={handleCitySearch}
                disabled={isSearching || !citySearch.trim()}
                variant="outline"
                size="icon"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Error */}
            {searchError && (
              <p className="text-xs text-destructive">{searchError}</p>
            )}

            {/* City Results */}
            {cityResults.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-grouped border border-border-subtle">
                {cityResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectCity(result)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {result.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border-subtle px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
