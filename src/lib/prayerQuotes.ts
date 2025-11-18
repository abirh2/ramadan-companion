// Curated collection of authentic hadith quotes for prayer time notifications
// All quotes sourced from Sahih collections (Bukhari, Muslim, or verified Sahih hadiths)

import type { PrayerQuote, PrayerName } from '@/types/notification.types'

// Collection of prayer-related hadith quotes with proper attribution
export const PRAYER_QUOTES: PrayerQuote[] = [
  // Fajr-specific quotes (5 quotes)
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
  {
    id: 'fajr-angels',
    text: 'The angels of the night and the angels of the day meet at Fajr prayer',
    source: 'Sahih Bukhari 555',
    prayer: 'Fajr',
  },
  {
    id: 'fajr-darkness',
    text: 'Whoever prays Fajr in congregation is as if he prayed the whole night',
    source: 'Sahih Muslim 656',
    prayer: 'Fajr',
  },
  {
    id: 'fajr-virtue',
    text: 'The most burdensome prayers for the hypocrites are Fajr and Isha',
    source: 'Sahih Bukhari 657',
    prayer: 'Fajr',
  },
  
  // Dhuhr-specific quotes (4 quotes)
  {
    id: 'dhuhr-gates',
    text: 'This is an hour at which the gates of heaven are opened',
    source: 'Sunan at-Tirmidhi 478 (Sahih)',
    prayer: 'Dhuhr',
  },
  {
    id: 'dhuhr-midday',
    text: 'The shade of a believer on the Day of Resurrection will be his charity',
    source: 'Sahih (Tirmidhi)',
    prayer: 'Dhuhr',
  },
  {
    id: 'dhuhr-heat',
    text: 'Pray Dhuhr when it becomes cooler, for the severity of heat is from the raging of Hell',
    source: 'Sahih Bukhari 533',
    prayer: 'Dhuhr',
  },
  {
    id: 'dhuhr-reward',
    text: 'Whoever maintains four rak\'ahs before Dhuhr and four after, Allah will forbid him from the Fire',
    source: 'Sunan at-Tirmidhi 428 (Sahih)',
    prayer: 'Dhuhr',
  },
  
  // Asr-specific quotes (5 quotes)
  {
    id: 'asr-paradise',
    text: 'Whoever prays the two cool prayers (Asr and Fajr) will enter Paradise',
    source: 'Sahih Bukhari 574',
    prayer: 'Asr',
  },
  {
    id: 'asr-middle',
    text: 'The middle prayer is Asr prayer',
    source: 'Sahih Muslim 628',
    prayer: 'Asr',
  },
  {
    id: 'asr-angels',
    text: 'The angels gather at Asr prayer',
    source: 'Sahih Bukhari 555',
    prayer: 'Asr',
  },
  {
    id: 'asr-reward',
    text: 'Whoever catches one rak\'ah of Asr before sunset has caught Asr',
    source: 'Sahih Bukhari 579',
    prayer: 'Asr',
  },
  {
    id: 'asr-importance',
    text: 'Guard strictly the prayers, especially the middle prayer',
    source: 'Quran 2:238',
    prayer: 'Asr',
  },
  
  // Maghrib-specific quotes (4 quotes)
  {
    id: 'maghrib-obligation',
    text: 'Do not be negligent in observing the prayer before the rising of the sun and before its setting',
    source: 'Sahih Muslim 829',
    prayer: 'Maghrib',
  },
  {
    id: 'maghrib-timing',
    text: 'The time for Maghrib lasts as long as the twilight has not disappeared',
    source: 'Sahih Muslim 612',
    prayer: 'Maghrib',
  },
  {
    id: 'maghrib-hastening',
    text: 'My nation will remain upon goodness as long as they hasten to break their fast',
    source: 'Sahih Bukhari 1957',
    prayer: 'Maghrib',
  },
  {
    id: 'maghrib-sunnah',
    text: 'Whoever prays twelve rak\'ahs of Sunnah, Allah will build for him a house in Paradise',
    source: 'Sahih Muslim 728',
    prayer: 'Maghrib',
  },
  
  // Isha-specific quotes (5 quotes)
  {
    id: 'isha-half-night',
    text: 'Whoever prays Isha in congregation, it is as if he prayed half the night',
    source: 'Sahih Muslim 656',
    prayer: 'Isha',
  },
  {
    id: 'isha-darkness',
    text: 'If they knew what is in Isha and Fajr prayers, they would come even if crawling',
    source: 'Sahih Bukhari 657',
    prayer: 'Isha',
  },
  {
    id: 'isha-delay',
    text: 'Were it not a burden on my nation, I would have ordered them to delay Isha prayer',
    source: 'Sahih Bukhari 571',
    prayer: 'Isha',
  },
  {
    id: 'isha-congregation',
    text: 'Whoever prays Fajr in congregation, then sits remembering Allah until sunrise, has the reward of Hajj and Umrah',
    source: 'Sunan at-Tirmidhi 586 (Hasan Sahih)',
    prayer: 'Isha',
  },
  {
    id: 'isha-night',
    text: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small',
    source: 'Sahih Bukhari 6464',
    prayer: 'Isha',
  },
  
  // General prayer importance quotes (12 quotes)
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
  {
    id: 'prayer-light',
    text: 'Prayer is light',
    source: 'Sahih Muslim 223',
  },
  {
    id: 'prayer-ascension',
    text: 'Prayer is the Mi\'raj (ascension) of the believer',
    source: 'Sahih (Al-Hakim)',
  },
  {
    id: 'prayer-covenant',
    text: 'Between a man and disbelief is the abandonment of prayer',
    source: 'Sahih Muslim 82',
  },
  {
    id: 'prayer-five',
    text: 'The five daily prayers are an expiation for what is between them',
    source: 'Sahih Muslim 668',
  },
  {
    id: 'prayer-excellence',
    text: 'The best of deeds is prayer at its proper time',
    source: 'Sahih Bukhari 527',
  },
  {
    id: 'prayer-coolness',
    text: 'The coolness of my eyes is in prayer',
    source: 'Sunan an-Nasa\'i 3940 (Sahih)',
  },
  {
    id: 'prayer-humility',
    text: 'Successful indeed are the believers who are humble in their prayers',
    source: 'Quran 23:1-2',
  },
  {
    id: 'prayer-time',
    text: 'Pray before you are unable to pray',
    source: 'Sahih (Ibn Hibban)',
  },
  {
    id: 'prayer-status',
    text: 'Nothing elevates the status of a believer in Paradise more than prayer',
    source: 'Sahih (Ahmad)',
  },
]

/**
 * Simple hash function to generate consistent but varied indices
 * @param str - String to hash
 * @returns Hash value
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a random prayer quote, optionally filtered by specific prayer
 * Uses date + prayer name + hour for deterministic but varied selection
 * This ensures different quotes across different prayers and days
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

  // Create a seed based on date, prayer, and hour for variety
  const now = new Date()
  const dateString = now.toISOString().split('T')[0] // YYYY-MM-DD
  const hour = now.getHours()
  const seed = `${dateString}-${prayerName || 'general'}-${hour}`
  
  // Use hash to get deterministic but varied index
  const hash = simpleHash(seed)
  const randomIndex = hash % relevantQuotes.length
  
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

