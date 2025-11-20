'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Locate, Loader2 } from 'lucide-react'
import type { LocationData } from '@/types/ramadan.types'
import { geocodeCity, requestGeolocation } from '@/lib/location'

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => Promise<void>
  currentLocation: LocationData | null
}

export function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<
    Array<{ lat: number; lng: number; displayName: string }>
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await geocodeCity(searchQuery)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSuggestionClick = useCallback(
    async (suggestion: { lat: number; lng: number; displayName: string }) => {
      await onLocationSelect({
        lat: suggestion.lat,
        lng: suggestion.lng,
        city: suggestion.displayName,
        type: 'selected',
      })
      setSearchQuery('')
      setShowSuggestions(false)
      setSuggestions([])
    },
    [onLocationSelect]
  )

  const handleUseCurrentLocation = useCallback(async () => {
    setDetectingLocation(true)
    try {
      const location = await requestGeolocation()
      if (location) {
        await onLocationSelect(location)
      } else {
        alert('Unable to detect your location. Please check browser permissions.')
      }
    } catch (error) {
      console.error('Location detection error:', error)
      alert('Unable to detect your location. Please try manual search.')
    } finally {
      setDetectingLocation(false)
    }
  }, [onLocationSelect])

  const handleBlur = useCallback(() => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={handleBlur}
              placeholder="Search for a city or address..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-b last:border-b-0"
                >
                  {suggestion.displayName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Use current location button */}
        <Button
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={detectingLocation}
        >
          {detectingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Current location display */}
      {currentLocation && (
        <p className="text-xs text-muted-foreground">
          Current search location: {currentLocation.city}
        </p>
      )}
    </div>
  )
}

