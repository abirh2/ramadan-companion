import { find } from 'geo-tz'

/** Resolve IANA timezone from coordinates; returns UTC on invalid input or lookup failure. */
export function getTimezoneFromCoordinates(
  latitude: number,
  longitude: number
): string {
  try {
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

    const timezones = find(latitude, longitude)

    if (timezones && timezones.length > 0) {
      const timezone = timezones[0]
      console.log(
        `[timezone] Coordinates (${latitude}, ${longitude}) → ${timezone}`
      )
      return timezone
    }

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
