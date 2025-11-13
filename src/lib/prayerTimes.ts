import { PrayTime } from 'praytime'
import type { PrayerTime, CalculationMethodId, MadhabId } from '@/types/ramadan.types'

/**
 * Map AlAdhan API calculation method IDs to PrayTime method strings
 * 
 * AlAdhan → PrayTime:
 * '0' (Jafari) → 'Jafari'
 * '1' (Karachi) → 'Karachi'
 * '2' (ISNA) → 'ISNA'
 * '3' (Egyptian) → 'Egypt'
 * '4' (Umm al-Qura) → 'Makkah'
 * '5' (MWL) → 'MWL'
 * '7' (Tehran) → 'Tehran'
 */
const CALCULATION_METHOD_MAP: Record<CalculationMethodId, string> = {
  '0': 'Jafari',
  '1': 'Karachi',
  '2': 'ISNA',
  '3': 'Egypt',
  '4': 'Makkah',
  '5': 'MWL',
  '7': 'Tehran',
}

/**
 * Map AlAdhan madhab IDs to PrayTime asr calculation methods
 * '0' (Standard) → 'Standard' (Shafi, Maliki, Hanbali)
 * '1' (Hanafi) → 'Hanafi'
 */
const MADHAB_MAP: Record<MadhabId, 'Standard' | 'Hanafi'> = {
  '0': 'Standard',
  '1': 'Hanafi',
}

/**
 * Calculate prayer times locally using PrayTime library
 * This serves as a fallback when AlAdhan API is unavailable
 * 
 * @param latitude - Location latitude (-90 to 90)
 * @param longitude - Location longitude (-180 to 180)
 * @param calculationMethod - AlAdhan calculation method ID
 * @param madhab - AlAdhan madhab ID for Asr calculation
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @param date - Optional date (defaults to today)
 * @returns Prayer times in 24-hour format matching AlAdhan structure
 */
export function calculatePrayerTimesLocal(
  latitude: number,
  longitude: number,
  calculationMethod: CalculationMethodId = '4',
  madhab: MadhabId = '0',
  timezone?: string,
  date?: Date
): PrayerTime {
  // Initialize PrayTime with calculation method
  const prayTimeMethod = CALCULATION_METHOD_MAP[calculationMethod] || 'Makkah'
  const praytime = new PrayTime(prayTimeMethod)

  // Set location
  praytime.location([latitude, longitude])

  // Set timezone (use browser timezone if not provided)
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  praytime.timezone(tz)

  // Set asr calculation method (madhab)
  const asrMethod = MADHAB_MAP[madhab] || 'Standard'
  praytime.adjust({ asr: asrMethod })

  // Set time format to 24-hour
  praytime.format('24h')

  // Get prayer times for the specified date (or today)
  const times = praytime.getTimes(date || new Date())

  // Map PrayTime output to our PrayerTime structure
  // PrayTime returns: { fajr, sunrise, dhuhr, asr, sunset, maghrib, isha, midnight }
  // We need: { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha }
  return {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: times.asr,
    Maghrib: times.maghrib,
    Isha: times.isha,
  }
}

/**
 * Validate that prayer times are reasonable
 * Basic sanity check to ensure calculations are correct
 * 
 * @param times - Prayer times to validate
 * @returns true if times are valid, false otherwise
 */
export function validatePrayerTimes(times: PrayerTime): boolean {
  try {
    // Check all required times exist
    const requiredTimes: (keyof PrayerTime)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    for (const time of requiredTimes) {
      if (!times[time] || typeof times[time] !== 'string') {
        return false
      }
    }

    // Check times are in HH:MM format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    for (const time of requiredTimes) {
      if (!timeRegex.test(times[time])) {
        return false
      }
    }

    // Check times are in chronological order (basic sanity)
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const fajr = parseTime(times.Fajr)
    const sunrise = parseTime(times.Sunrise)
    const dhuhr = parseTime(times.Dhuhr)
    const asr = parseTime(times.Asr)
    const maghrib = parseTime(times.Maghrib)
    const isha = parseTime(times.Isha)

    // Validate chronological order
    if (fajr >= sunrise || sunrise >= dhuhr || dhuhr >= asr || asr >= maghrib || maghrib >= isha) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating prayer times:', error)
    return false
  }
}

/**
 * Get calculation method name for display
 */
export function getCalculationMethodName(methodId: CalculationMethodId): string {
  return CALCULATION_METHOD_MAP[methodId] || 'Makkah'
}

