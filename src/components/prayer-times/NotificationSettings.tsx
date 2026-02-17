'use client'

import { Bell, BellOff, Check, AlertCircle, Smartphone, LogIn } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { Capacitor } from '@capacitor/core'
import { isIOS, getIOSBrowser } from '@/lib/notifications'
import type { PrayerName } from '@/types/notification.types'

const PRAYER_INFO: Record<
  PrayerName,
  { label: string; description: string }
> = {
  Fajr: { label: 'Fajr', description: 'Dawn prayer' },
  Dhuhr: { label: 'Dhuhr', description: 'Midday prayer' },
  Asr: { label: 'Asr', description: 'Afternoon prayer' },
  Maghrib: { label: 'Maghrib', description: 'Sunset prayer' },
  Isha: { label: 'Isha', description: 'Night prayer' },
}

/**
 * NotificationSettings Component
 * 
 * Allows users to enable/disable prayer time notifications and select
 * which prayers they want to be notified for.
 * 
 * Features:
 * - Browser support detection
 * - Permission request flow
 * - Master toggle for all notifications
 * - Individual prayer toggles
 * - Status indicators
 * - Error handling
 */
export function NotificationSettings() {
  const { user } = useAuth()
  const {
    isSupported,
    permission,
    preferences,
    loading,
    error,
    requestPermission,
    togglePrayer,
    enableAll,
    disableAll,
  } = useNotifications()

  // Browser not supported
  if (!isSupported) {
    const deviceIsIOS = isIOS()
    const iosBrowser = getIOSBrowser()
    
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Prayer Notifications</h3>
            
            {deviceIsIOS && iosBrowser !== 'safari' ? (
              // iOS non-Safari browser
              <div className="text-sm text-muted-foreground mt-1 space-y-2">
                <p>
                  You're using {iosBrowser === 'chrome' ? 'Chrome' : iosBrowser === 'firefox' ? 'Firefox' : iosBrowser === 'edge' ? 'Edge' : 'a browser'} on iOS.
                  Due to Apple's restrictions, notifications only work in <strong>Safari</strong> on iOS devices.
                </p>
                <p>
                  <strong>To enable notifications:</strong>
                </p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Open this site in Safari</li>
                  <li>Install the app to your home screen</li>
                  <li>Open the installed app and enable notifications</li>
                </ol>
              </div>
            ) : (
              // Non-iOS or other unsupported browser
              <p className="text-sm text-muted-foreground mt-1">
                Notifications are not supported in your browser. Try using Chrome,
                Edge, or Safari for the best experience.
              </p>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Not logged in - require authentication for Web Push
  if (!user) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <LogIn className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Prayer Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to enable prayer time notifications. You'll receive notifications at exact prayer times, even when the app is closed.
            </p>
            <Link href="/profile">
              <Button className="mt-4" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Enable
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Notifications Blocked</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have blocked notifications for this site. To enable them:
            </p>
            <ol className="text-sm text-muted-foreground mt-2 ml-4 list-decimal space-y-1">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" and change to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </Card>
    )
  }

  // Permission not yet granted - show CTA
  if (permission !== 'granted') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Prayer Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get notified at exact prayer times with motivational reminders from
              authentic hadith.
            </p>
            <Button
              onClick={requestPermission}
              disabled={loading}
              className="mt-4"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Permission granted - show full settings
  const enabledCount = Object.values(preferences.prayers).filter(Boolean).length

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header with master toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {preferences.enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-semibold text-sm">Prayer Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {preferences.enabled
                  ? `${enabledCount} prayer${enabledCount !== 1 ? 's' : ''} enabled`
                  : 'Disabled'}
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={(checked) => {
              if (checked) {
                enableAll()
              } else {
                disableAll()
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Info text */}
        {preferences.enabled && (
          <p className="text-xs text-muted-foreground">
            Get notified at exact prayer times with reminders from authentic
            hadith
          </p>
        )}

        {/* Individual prayer toggles */}
        {preferences.enabled && (
          <div className="space-y-3 pt-2 border-t">
            {(Object.keys(PRAYER_INFO) as PrayerName[]).map((prayerName) => {
              const info = PRAYER_INFO[prayerName]
              const isEnabled = preferences.prayers[prayerName]

              return (
                <div
                  key={prayerName}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isEnabled && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                    {!isEnabled && (
                      <div className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{info.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {info.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => togglePrayer(prayerName)}
                    disabled={loading}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* iOS PWA reminder - only for browser, not native app */}
        {isIOS() && !Capacitor.isNativePlatform() && preferences.enabled && (
          <div className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">iOS Tip</p>
              <p className="text-blue-600 dark:text-blue-300">
                For best results on iOS, <strong>install this app to your home screen</strong> using Safari's "Add to Home Screen" feature. Notifications will work even when the app is closed.
              </p>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

