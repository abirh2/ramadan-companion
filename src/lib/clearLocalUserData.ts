const LOCAL_USER_DATA_KEYS = [
  'location_lat',
  'location_lng',
  'location_city',
  'location_type',
  'calculation_method',
  'madhab',
  'quran_translation',
  'ramadan-companion-quran-bookmarks',
  'ramadan-companion-theme',
  'preferred_currency',
  'currency_view_mode',
  'cached_exchange_rates',
  'calendar_view',
  'calendar_school_filters',
  'charity_view_mode',
  'distance_unit',
  'hijri_offset_days',
  'prayer_times_maghrib',
  'prayer_times_fajr',
  'installPromptDismissed',
  'installPromptDismissedAt',
  'pageViewCount',
  'notification_preferences',
  'notification_permission_requested',
  'notification_fcm_token',
  'zikr_state',
  'zikr_feedback_enabled',
] as const

/** Clear app-specific localStorage keys after account deletion. */
export function clearLocalUserData(): void {
  if (typeof window === 'undefined') return

  for (const key of LOCAL_USER_DATA_KEYS) {
    localStorage.removeItem(key)
  }

  // ponytail: O(n) scan for prayer_tracking_YYYY-MM-DD keys; fine for one-off delete
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('prayer_tracking_')) {
      keysToRemove.push(key)
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key)
  }
}
