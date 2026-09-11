'use client'

import { useState, useCallback, useEffect, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Locate, Loader2 } from 'lucide-react'
import type { LocationData } from '@/types/ramadan.types'
import { geocodeCity, requestGeolocation } from '@/lib/location'

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => Promise<void>
  currentLocation: LocationData | null
}

export function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const suggestionsId = useId()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<
    Array<{ lat: number; lng: number; displayName: string }>
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      setActiveSuggestion(-1)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await geocodeCity(searchQuery)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
        setActiveSuggestion(-1)
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
      setActiveSuggestion(-1)
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

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveSuggestion((current) => (current + 1) % suggestions.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveSuggestion((current) =>
          current <= 0 ? suggestions.length - 1 : current - 1
        )
      } else if (event.key === 'Enter' && activeSuggestion >= 0) {
        event.preventDefault()
        void handleSuggestionClick(suggestions[activeSuggestion])
      } else if (event.key === 'Escape') {
        event.preventDefault()
        setShowSuggestions(false)
        setActiveSuggestion(-1)
      }
    },
    [activeSuggestion, handleSuggestionClick, showSuggestions, suggestions]
  )

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
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setActiveSuggestion(-1)
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={handleBlur}
              onKeyDown={handleSearchKeyDown}
              role="combobox"
              aria-label="Search for a city or address"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls={suggestionsId}
              aria-activedescendant={
                activeSuggestion >= 0 ? `${suggestionsId}-${activeSuggestion}` : undefined
              }
              placeholder="Search for a city or address..."
              className="h-11 w-full rounded-control border border-border-strong bg-surface-primary py-2 pl-10 pr-4 text-text-primary placeholder:text-text-tertiary focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/35"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              id={suggestionsId}
              role="listbox"
              aria-label="Location suggestions"
              className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-grouped border border-border-subtle bg-surface-elevated text-text-primary shadow-medium"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  id={`${suggestionsId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={activeSuggestion === index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setActiveSuggestion(index)}
                  className="min-h-11 w-full border-b border-border-subtle px-4 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-teal-muted focus-visible:bg-teal-muted aria-selected:bg-teal-muted motion-reduce:transition-none"
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
          aria-label={detectingLocation ? 'Detecting current location' : 'Use current location'}
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
