'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings, MapPin, Loader2, Search } from 'lucide-react'
import { CALCULATION_METHODS, MADHABS, type CalculationMethodId, type MadhabId } from '@/types/ramadan.types'
import type { LocationData } from '@/types/ramadan.types'
import { geocodeCity, requestGeolocation } from '@/lib/location'

interface PrayerTimesSettingsProps {
  calculationMethod: CalculationMethodId
  madhab: MadhabId
  location: LocationData | null
  onCalculationMethodChange: (method: CalculationMethodId) => Promise<void>
  onMadhabChange: (madhab: MadhabId) => Promise<void>
  onLocationChange: (lat: number, lng: number, city: string, type: LocationData['type']) => Promise<void>
}

export function PrayerTimesSettings({
  calculationMethod,
  madhab,
  location,
  onCalculationMethodChange,
  onMadhabChange,
  onLocationChange,
}: PrayerTimesSettingsProps) {
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [cityResults, setCityResults] = useState<Array<{ lat: number; lng: number; displayName: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Handle requesting current location from browser
  const handleRequestLocation = async () => {
    setIsRequestingLocation(true)
    try {
      const geoLocation = await requestGeolocation()
      if (geoLocation) {
        await onLocationChange(geoLocation.lat, geoLocation.lng, geoLocation.city, 'detected')
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
  const handleSelectCity = async (result: { lat: number; lng: number; displayName: string }) => {
    await onLocationChange(result.lat, result.lng, result.displayName, 'selected')
    setCitySearch('')
    setCityResults([])
    setSearchError(null)
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Settings
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calculation Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Calculation Method</label>
          <Select
            value={calculationMethod}
            onValueChange={(value) => onCalculationMethodChange(value as CalculationMethodId)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {CALCULATION_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                  {method.description && (
                    <span className="text-xs text-muted-foreground"> - {method.description}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Madhab/School */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Madhab (Asr Calculation)</label>
          <Select
            value={madhab}
            onValueChange={(value) => onMadhabChange(value as MadhabId)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select madhab" />
            </SelectTrigger>
            <SelectContent>
              {MADHABS.map((madhabOption) => (
                <SelectItem key={madhabOption.id} value={madhabOption.id}>
                  {madhabOption.name}
                  <span className="text-xs text-muted-foreground"> - {madhabOption.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Affects Asr prayer time only. Hanafi madhab uses a later Asr time.
          </p>
        </div>

        {/* Current Location Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Location</label>
          {location && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{location.city}</span>
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
            <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md">
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

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Prayer times will update automatically when you change location or calculation method.
        </p>
      </CardContent>
    </Card>
  )
}

