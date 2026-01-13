'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings, MapPin, Loader2, Search, Bell, AlertCircle, LogIn } from 'lucide-react'
import Link from 'next/link'
import { CALCULATION_METHODS, MADHABS, type CalculationMethodId, type MadhabId } from '@/types/ramadan.types'
import type { LocationData } from '@/types/ramadan.types'
import type { PrayerName } from '@/types/notification.types'
import { geocodeCity, requestGeolocation } from '@/lib/location'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'

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

const PRAYER_INFO: Record<PrayerName, { label: string; description: string }> = {
  Fajr: { label: 'Fajr', description: 'Dawn prayer' },
  Dhuhr: { label: 'Dhuhr', description: 'Midday prayer' },
  Asr: { label: 'Asr', description: 'Afternoon prayer' },
  Maghrib: { label: 'Maghrib', description: 'Sunset prayer' },
  Isha: { label: 'Isha', description: 'Night prayer' },
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
  const { user } = useAuth()
  const {
    isSupported,
    permission,
    preferences,
    loading: notifLoading,
    error: notifError,
    requestPermission,
    togglePrayer,
    enableAll,
    disableAll,
  } = useNotifications()

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Prayer Settings
          </DialogTitle>
          <DialogDescription>
            Configure your prayer time calculation preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calculation Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Calculation Method</label>
            <Select value={tempMethod} onValueChange={(value) => setTempMethod(value as CalculationMethodId)}>
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
            <p className="text-xs text-muted-foreground">
              Different regions use different calculation methods
            </p>
          </div>

          {/* Madhab/School */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Madhab (Asr Calculation)</label>
            <Select value={tempMadhab} onValueChange={(value) => setTempMadhab(value as MadhabId)}>
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
            {tempLocation && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
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
              <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg">
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

          {/* Notification Settings */}
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Prayer Notifications</label>
              {isSupported && permission === 'granted' && preferences && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const anyEnabled = Object.values(preferences.prayers).some(enabled => enabled)
                    if (anyEnabled) {
                      disableAll()
                    } else {
                      enableAll()
                    }
                  }}
                  className="text-xs"
                >
                  {Object.values(preferences.prayers).some(enabled => enabled) ? 'Disable All' : 'Enable All'}
                </Button>
              )}
            </div>

            {!user ? (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Sign in required
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Prayer notifications require an account to sync your preferences across devices.
                  </p>
                  <Link href="/profile">
                    <Button size="sm" variant="outline" className="mt-2">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : !isSupported ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Notifications not supported
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.
                  </p>
                </div>
              </div>
            ) : permission === 'default' ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Enable notifications to receive prayer time reminders.
                </p>
                <Button onClick={requestPermission} className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Enable Notifications
                </Button>
              </div>
            ) : permission === 'denied' ? (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Notifications blocked
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You've blocked notifications. Please enable them in your browser settings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : preferences ? (
                  <div className="space-y-2">
                    {(Object.keys(PRAYER_INFO) as PrayerName[]).map((prayer) => (
                      <div
                        key={prayer}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{PRAYER_INFO[prayer].label}</p>
                          <p className="text-xs text-muted-foreground">{PRAYER_INFO[prayer].description}</p>
                        </div>
                        <Switch
                          checked={preferences.prayers[prayer]}
                          onCheckedChange={() => togglePrayer(prayer)}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                {notifError && (
                  <p className="text-xs text-destructive mt-2">{notifError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
