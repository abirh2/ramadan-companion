import { find } from 'geo-tz'

/**
 * Get IANA timezone string from geographic coordinates
 * 
 * Converts latitude and longitude coordinates to the corresponding
 * IANA timezone identifier (e.g., "America/New_York", "Europe/London").
 * 
 * This is useful for server-side operations that need to know the user's
 * timezone based on their location, such as calculating prayer times
 * or scheduling notifications.
 * 
 * **Use Cases:**
 * - Converting coordinates to timezone for prayer time calculations
 * - Server-side notification scheduling with correct local times
 * - Automatic timezone detection when user travels between timezones
 * 
 * **Examples:**
 * ```typescript
 * // New York City
 * getTimezoneFromCoordinates(40.7128, -74.0060)
 * // Returns: "America/New_York"
 * 
 * // Los Angeles
 * getTimezoneFromCoordinates(34.0522, -118.2437)
 * // Returns: "America/Los_Angeles"
 * 
 * // London
 * getTimezoneFromCoordinates(51.5074, -0.1278)
 * // Returns: "Europe/London"
 * 
 * // Tokyo
 * getTimezoneFromCoordinates(35.6762, 139.6503)
 * // Returns: "Asia/Tokyo"
 * ```
 * 
 * @param latitude - Latitude coordinate (-90 to 90)
 * @param longitude - Longitude coordinate (-180 to 180)
 * @returns IANA timezone string (e.g., "America/New_York") or "UTC" as fallback
 * 
 * @see https://www.iana.org/time-zones IANA Time Zone Database
 * @see https://github.com/evansiroky/timezone-boundary-builder Timezone boundary data source
 */
export function getTimezoneFromCoordinates(
  latitude: number,
  longitude: number
): string {
  try {
    // Validate coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      console.warn(
        `[timezone] Invalid coordinates: lat=${latitude}, lng=${longitude}. Using UTC.`
      )
      return 'UTC'
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      console.warn(
        `[timezone] Latitude out of range: ${latitude}. Must be between -90 and 90. Using UTC.`
      )
      return 'UTC'
    }

    if (longitude < -180 || longitude > 180) {
      console.warn(
        `[timezone] Longitude out of range: ${longitude}. Must be between -180 and 180. Using UTC.`
      )
      return 'UTC'
    }

    // Use geo-tz to find timezone from coordinates
    // Returns array of timezone strings (usually just one)
    const timezones = find(latitude, longitude)

    if (timezones && timezones.length > 0) {
      const timezone = timezones[0]
      console.log(
        `[timezone] Coordinates (${latitude}, ${longitude}) → ${timezone}`
      )
      return timezone
    }

    // No timezone found (shouldn't happen for valid land coordinates)
    console.warn(
      `[timezone] No timezone found for coordinates: lat=${latitude}, lng=${longitude}. Using UTC.`
    )
    return 'UTC'
  } catch (error) {
    console.error(
      `[timezone] Error getting timezone for coordinates (${latitude}, ${longitude}):`,
      error
    )
    return 'UTC'
  }
}

