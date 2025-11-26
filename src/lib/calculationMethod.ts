import type { CalculationMethodId } from '@/types/ramadan.types'

/**
 * Map user's country to appropriate prayer calculation method
 * 
 * Strategy:
 * - Middle Eastern countries (Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, Oman) → Umm al-Qura ('4')
 * - All other countries → ISNA ('2')
 * 
 * ISNA is widely applicable across North America and provides reasonable prayer times globally.
 * Middle Eastern countries have specific regional preferences that should be respected.
 * 
 * @param country - Country name from location (e.g., "United States", "Saudi Arabia", "USA")
 * @returns Calculation method ID ('2' for ISNA, '4' for Umm al-Qura)
 */
export function getDefaultCalculationMethodByCountry(country: string | null): CalculationMethodId {
  if (!country) return '2' // ISNA fallback
  
  const normalizedCountry = country.toLowerCase()
  
  // Middle Eastern countries → Umm al-Qura
  const middleEastCountries = [
    'saudi arabia',
    'united arab emirates',
    'uae',
    'kuwait',
    'bahrain',
    'qatar',
    'oman',
  ]
  
  if (middleEastCountries.some(c => normalizedCountry.includes(c))) {
    return '4' // Umm al-Qura
  }
  
  // All other countries → ISNA
  return '2'
}

/**
 * Extract country from location city string
 * 
 * Location strings from Nominatim reverse geocoding typically follow these formats:
 * - "New York, United States" → "United States"
 * - "New York, New York, United States" → "United States"
 * - "Riyadh, Saudi Arabia" → "Saudi Arabia"
 * - "Dubai, United Arab Emirates" → "United Arab Emirates"
 * 
 * @param city - Location city string (e.g., "New York, USA", "Riyadh, Saudi Arabia")
 * @returns Country name or null
 */
export function extractCountryFromCity(city: string | null): string | null {
  if (!city) return null
  
  // Format is typically "City, Country" or "City, State, Country"
  const parts = city.split(',')
  if (parts.length >= 2) {
    return parts[parts.length - 1].trim()
  }
  
  return null
}

