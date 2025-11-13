// Ramadan and Hijri Calendar Types

export interface HijriDate {
  day: number
  month: number
  year: number
  monthName?: string
}

export interface HijriApiResponse {
  currentHijri: HijriDate
  ramadanStart: string // ISO date string
  ramadanEnd: string // ISO date string
  daysUntilRamadan: number | null
  isRamadan: boolean
  currentRamadanDay?: number
  ramadanHijriYear?: number // The Hijri year of the Ramadan being shown
}

export interface RamadanCountdown {
  isRamadan: boolean
  daysUntilRamadan: number | null
  currentRamadanDay: number | null
  nextEvent: 'iftar' | 'suhoor' | null
  timeUntilEvent: string | null // "HH:MM:SS"
  ramadanYear: number
  ramadanStartDate: string | null
  loading: boolean
  error: string | null
}

export interface PrayerTime {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

// Location Data Types
export interface LocationData {
  lat: number
  lng: number
  city: string
  type: 'detected' | 'selected' | 'default'
}

export interface GeocodingResult {
  lat: number
  lng: number
  displayName: string
}

// Prayer Times Types
export interface PrayerTimesData {
  timings: PrayerTime
  date: {
    readable: string
    timestamp: string
    gregorian: {
      date: string
      day: string
      month: { number: number; en: string }
      year: string
    }
    hijri: {
      date: string
      day: string
      month: { number: number; en: string; ar: string }
      year: string
    }
  }
  meta: {
    latitude: number
    longitude: number
    timezone: string
    method: {
      id: number
      name: string
    }
    school: string
  }
}

export interface NextPrayerInfo {
  name: string
  time: string
  countdown: string
  timeUntil: number // milliseconds
  isTomorrow?: boolean // indicates if prayer is tomorrow (post-Isha)
}

export interface PrayerTimesApiResponse {
  code: number
  status: string
  data: PrayerTimesData
}

// Qibla Types
export interface QiblaData {
  direction: number // bearing angle in degrees
  latitude: number
  longitude: number
}

export interface QiblaApiResponse {
  code: number
  status: string
  data: QiblaData
}

// Calculation Methods
export type CalculationMethodId = '1' | '2' | '3' | '4' | '5' | '7' | '0'

export interface CalculationMethod {
  id: CalculationMethodId
  name: string
  description?: string
}

// Madhab/School for Asr calculation
export type MadhabId = '0' | '1'

export interface Madhab {
  id: MadhabId
  name: string
  description: string
}

export const MADHABS: Madhab[] = [
  { id: '0', name: 'Standard', description: 'Shafi, Maliki, Hanbali' },
  { id: '1', name: 'Hanafi', description: 'Hanafi (later Asr)' },
]

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: '4', name: 'Umm al-Qura', description: 'Saudi Arabia' },
  { id: '2', name: 'ISNA', description: 'Islamic Society of North America' },
  { id: '5', name: 'MWL', description: 'Muslim World League' },
  { id: '3', name: 'Egyptian', description: 'Egyptian General Authority' },
  { id: '1', name: 'Karachi', description: 'University of Islamic Sciences, Karachi' },
  { id: '7', name: 'Tehran', description: 'Institute of Geophysics, Tehran' },
  { id: '0', name: 'Jafari', description: 'Shia Ithna-Ashari' },
]

// Prayer Times Calculation Source
export type PrayerTimesSource = 'api' | 'local' | null

// Prayer Times Hook State
export interface UsePrayerTimesResult {
  prayerTimes: PrayerTime | null
  nextPrayer: NextPrayerInfo | null
  qiblaDirection: QiblaData | null
  location: LocationData | null
  calculationMethod: CalculationMethodId
  madhab: MadhabId
  calculationSource: PrayerTimesSource // Indicates if times are from API or local calculation
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateLocation: (lat: number, lng: number, city: string, type: LocationData['type']) => Promise<void>
  updateCalculationMethod: (method: CalculationMethodId) => Promise<void>
  updateMadhab: (madhab: MadhabId) => Promise<void>
}

