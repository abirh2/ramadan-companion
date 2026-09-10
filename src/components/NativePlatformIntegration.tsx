'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import { getNativeRouteFromPayload, getNativeRouteFromUrl } from '@/lib/nativeDeepLinks'

export function NativePlatformIntegration() {
  const router = useRouter()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let disposed = false
    const handles: PluginListenerHandle[] = []
    let themeObserver: MutationObserver | undefined

    const navigate = (route: string | null) => {
      if (route && !disposed) router.push(route)
    }

    void (async () => {
      const { purgeDeprecatedPrivateWidgetData } = await import('@/lib/widgetBridge')
      await purgeDeprecatedPrivateWidgetData()

      const [{ App }, { LocalNotifications }, { PushNotifications }, { StatusBar, Style }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/local-notifications'),
        import('@capacitor/push-notifications'),
        import('@capacitor/status-bar'),
      ])

      if (disposed) return

      const applySystemBarTheme = () => {
        const dark = document.documentElement.classList.contains('dark')
        void StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light })
        void StatusBar.setOverlaysWebView({ overlay: true })
      }

      applySystemBarTheme()
      themeObserver = new MutationObserver(applySystemBarTheme)
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

      const launch = await App.getLaunchUrl()
      navigate(launch?.url ? getNativeRouteFromUrl(launch.url) : null)

      const registeredHandles = await Promise.all([
        App.addListener('appUrlOpen', ({ url }) => navigate(getNativeRouteFromUrl(url))),
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) window.dispatchEvent(new Event('deen:native-foreground'))
        }),
        LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
          navigate(getNativeRouteFromPayload(notification.extra?.url))
        }),
        PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
          navigate(getNativeRouteFromPayload(notification.data?.url))
        })
      ])

      if (disposed) {
        registeredHandles.forEach((handle) => void handle.remove())
        return
      }
      handles.push(...registeredHandles)
    })().catch((error) => {
      console.warn('[nativePlatform] Integration setup failed:', error)
    })

    return () => {
      disposed = true
      themeObserver?.disconnect()
      handles.forEach((handle) => void handle.remove())
    }
  }, [router])

  return null
}
