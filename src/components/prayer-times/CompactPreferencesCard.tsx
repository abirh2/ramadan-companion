'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, MapPin, BookOpen, Bell, BellOff } from 'lucide-react'
import { CALCULATION_METHODS, MADHABS, type CalculationMethodId, type MadhabId, type LocationData } from '@/types/ramadan.types'
import { useNotifications } from '@/hooks/useNotifications'

interface CompactPreferencesCardProps {
  calculationMethod: CalculationMethodId
  madhab: MadhabId
  location: LocationData | null
  onEditClick: () => void
}

export function CompactPreferencesCard({
  calculationMethod,
  madhab,
  location,
  onEditClick,
}: CompactPreferencesCardProps) {
  const { preferences, isSupported, permission } = useNotifications()

  // Get method name (shortened)
  const methodName = CALCULATION_METHODS.find((m) => m.id === calculationMethod)?.name || 'Unknown'
  const methodShort = methodName.length > 15 ? methodName.substring(0, 15) + '...' : methodName
  
  // Get madhab name (shortened)
  const madhabName = MADHABS.find((m) => m.id === madhab)?.name || 'Unknown'
  const madhabDesc = MADHABS.find((m) => m.id === madhab)?.description || ''
  const madhabShort = `${madhabName} (${madhabDesc.split(',')[0]})`

  // Get location name (shortened)
  const locationName = location?.city || 'Not set'
  const locationShort = locationName.length > 20 ? locationName.substring(0, 20) + '...' : locationName

  // Check if notifications are enabled (any prayer is enabled and permission is granted)
  const notificationsEnabled = isSupported && permission === 'granted' && preferences && 
    Object.values(preferences.prayers).some(enabled => enabled)

  return (
    <Card className="rounded-3xl shadow-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Preferences</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditClick}
            className="text-xs font-bold text-primary hover:text-primary/80 h-auto p-1"
          >
            EDIT ALL
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Method and Madhab Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Calculation Method */}
          <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
              Method
            </p>
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm font-bold text-foreground leading-tight flex-1">
                {methodShort}
              </p>
              <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          {/* Madhab */}
          <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
              Madhab
            </p>
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm font-bold text-foreground leading-tight flex-1">
                {madhabShort}
              </p>
              <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Location Row */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                Location
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {locationShort}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Row */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border border-border/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              notificationsEnabled ? 'bg-green-500/10' : 'bg-muted'
            }`}>
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                Notifications
              </p>
              <p className={`text-sm font-bold ${
                notificationsEnabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              }`}>
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
