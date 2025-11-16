// Curated collection of authentic hadith quotes for prayer time notifications
// All quotes sourced from Sahih collections (Bukhari, Muslim, or verified Sahih hadiths)

import type { PrayerQuote, PrayerName } from '@/types/notification.types'

// Collection of prayer-related hadith quotes with proper attribution
export const PRAYER_QUOTES: PrayerQuote[] = [
  // Fajr-specific quotes
  {
    id: 'fajr-protection',
    text: 'Whoever prays Fajr is under Allah\'s protection',
    source: 'Sahih Muslim 657',
    prayer: 'Fajr',
  },
  {
    id: 'fajr-reward',
    text: 'The two rak\'ahs of Fajr are better than the world and what it contains',
    source: 'Sahih Muslim 725',
    prayer: 'Fajr',
  },
  // Asr-specific (Middle prayer)
  {
    id: 'asr-paradise',
    text: 'Whoever prays the two cool prayers (Asr and Fajr) will enter Paradise',
    source: 'Sahih Bukhari 574',
    prayer: 'Asr',
  },
  // Maghrib/Isha quotes
  {
    id: 'isha-half-night',
    text: 'Whoever prays Isha in congregation, it is as if he prayed half the night',
    source: 'Sahih Muslim 656',
    prayer: 'Isha',
  },
  // Dhuhr quote
  {
    id: 'dhuhr-gates',
    text: 'This is an hour at which the gates of heaven are opened',
    source: 'Sunan at-Tirmidhi 478 (Sahih)',
    prayer: 'Dhuhr',
  },
  // General prayer importance quotes
  {
    id: 'prayer-judgment',
    text: 'The first matter that the slave will be brought to account for on the Day of Judgment is the prayer',
    source: 'Sunan an-Nasa\'i 465 (Sahih)',
  },
  {
    id: 'congregational-prayer',
    text: 'The prayer in congregation is twenty-seven times superior to the prayer offered alone',
    source: 'Sahih Bukhari 645',
  },
  {
    id: 'prayer-pillar',
    text: 'Prayer is the pillar of religion',
    source: 'Sahih (Bayhaqi)',
  },
  // Maghrib-specific
  {
    id: 'maghrib-obligation',
    text: 'Do not be negligent in observing the prayer before the rising of the sun and before its setting',
    source: 'Sahih Muslim 829',
    prayer: 'Maghrib',
  },
  // Additional general quote
  {
    id: 'prayer-light',
    text: 'Prayer is light',
    source: 'Sahih Muslim 223',
  },
]

/**
 * Get a random prayer quote, optionally filtered by specific prayer
 * @param prayerName - Optional prayer name to filter quotes
 * @returns A random prayer quote
 */
export function getRandomPrayerQuote(prayerName?: PrayerName): PrayerQuote {
  // Filter quotes by prayer if specified
  const relevantQuotes = prayerName
    ? PRAYER_QUOTES.filter(
        (quote) => quote.prayer === prayerName || !quote.prayer
      )
    : PRAYER_QUOTES

  // Return random quote from relevant pool
  const randomIndex = Math.floor(Math.random() * relevantQuotes.length)
  return relevantQuotes[randomIndex]
}

/**
 * Get all quotes for a specific prayer
 * @param prayerName - Prayer name to filter by
 * @returns Array of quotes related to the prayer
 */
export function getQuotesForPrayer(prayerName: PrayerName): PrayerQuote[] {
  return PRAYER_QUOTES.filter(
    (quote) => quote.prayer === prayerName || !quote.prayer
  )
}

/**
 * Get a specific quote by ID
 * @param quoteId - Quote ID to retrieve
 * @returns The quote or undefined if not found
 */
export function getQuoteById(quoteId: string): PrayerQuote | undefined {
  return PRAYER_QUOTES.find((quote) => quote.id === quoteId)
}

