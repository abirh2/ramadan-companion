import {
  getDefaultCalculationMethodByCountry,
  extractCountryFromCity,
} from '../calculationMethod'

describe('calculationMethod utilities', () => {
  describe('extractCountryFromCity', () => {
    it('should extract country from "City, Country" format', () => {
      expect(extractCountryFromCity('New York, United States')).toBe('United States')
      expect(extractCountryFromCity('Toronto, Canada')).toBe('Canada')
      expect(extractCountryFromCity('Riyadh, Saudi Arabia')).toBe('Saudi Arabia')
      expect(extractCountryFromCity('Dubai, United Arab Emirates')).toBe('United Arab Emirates')
    })

    it('should extract country from "City, State, Country" format', () => {
      expect(extractCountryFromCity('New York, New York, United States')).toBe('United States')
      expect(extractCountryFromCity('Los Angeles, California, USA')).toBe('USA')
      expect(extractCountryFromCity('Houston, Texas, United States')).toBe('United States')
    })

    it('should handle abbreviated country names', () => {
      expect(extractCountryFromCity('Chicago, USA')).toBe('USA')
      expect(extractCountryFromCity('Vancouver, BC, Canada')).toBe('Canada')
      expect(extractCountryFromCity('Abu Dhabi, UAE')).toBe('UAE')
    })

    it('should return null for invalid inputs', () => {
      expect(extractCountryFromCity(null)).toBe(null)
      expect(extractCountryFromCity('')).toBe(null)
      expect(extractCountryFromCity('SingleWord')).toBe(null)
    })

    it('should handle edge cases', () => {
      // Single city name (no country)
      expect(extractCountryFromCity('Paris')).toBe(null)
      
      // Empty parts
      expect(extractCountryFromCity('City, ')).toBe('')
      expect(extractCountryFromCity(', Country')).toBe('Country')
    })
  })

  describe('getDefaultCalculationMethodByCountry', () => {
    describe('Middle Eastern countries → Umm al-Qura (4)', () => {
      it('should return Umm al-Qura for Saudi Arabia', () => {
        expect(getDefaultCalculationMethodByCountry('Saudi Arabia')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('saudi arabia')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('SAUDI ARABIA')).toBe('4')
      })

      it('should return Umm al-Qura for UAE', () => {
        expect(getDefaultCalculationMethodByCountry('United Arab Emirates')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('UAE')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('uae')).toBe('4')
      })

      it('should return Umm al-Qura for other Middle Eastern countries', () => {
        expect(getDefaultCalculationMethodByCountry('Kuwait')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('Bahrain')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('Qatar')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('Oman')).toBe('4')
      })

      it('should handle case-insensitive matching', () => {
        expect(getDefaultCalculationMethodByCountry('KUWAIT')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('bahrain')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('QATAR')).toBe('4')
      })

      it('should handle partial matches', () => {
        // Country names that contain the keyword
        expect(getDefaultCalculationMethodByCountry('The Kingdom of Saudi Arabia')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('State of Kuwait')).toBe('4')
      })
    })

    describe('All other countries → ISNA (2)', () => {
      it('should return ISNA for North American countries', () => {
        expect(getDefaultCalculationMethodByCountry('United States')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('USA')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Canada')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Mexico')).toBe('2')
      })

      it('should return ISNA for European countries', () => {
        expect(getDefaultCalculationMethodByCountry('United Kingdom')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('France')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Germany')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Italy')).toBe('2')
      })

      it('should return ISNA for Asian countries (non-Middle East)', () => {
        expect(getDefaultCalculationMethodByCountry('Pakistan')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('India')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Bangladesh')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Indonesia')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Malaysia')).toBe('2')
      })

      it('should return ISNA for African countries', () => {
        expect(getDefaultCalculationMethodByCountry('Egypt')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Morocco')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Nigeria')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('South Africa')).toBe('2')
      })

      it('should return ISNA for South American countries', () => {
        expect(getDefaultCalculationMethodByCountry('Brazil')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Argentina')).toBe('2')
      })

      it('should return ISNA for Oceania countries', () => {
        expect(getDefaultCalculationMethodByCountry('Australia')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('New Zealand')).toBe('2')
      })
    })

    describe('Edge cases and fallbacks', () => {
      it('should return ISNA for null country', () => {
        expect(getDefaultCalculationMethodByCountry(null)).toBe('2')
      })

      it('should return ISNA for empty string', () => {
        expect(getDefaultCalculationMethodByCountry('')).toBe('2')
      })

      it('should return ISNA for unknown countries', () => {
        expect(getDefaultCalculationMethodByCountry('Unknown Country')).toBe('2')
        expect(getDefaultCalculationMethodByCountry('Fictional Place')).toBe('2')
      })

      it('should handle whitespace', () => {
        expect(getDefaultCalculationMethodByCountry('  Saudi Arabia  ')).toBe('4')
        expect(getDefaultCalculationMethodByCountry('  United States  ')).toBe('2')
      })
    })

    describe('Integration: extractCountryFromCity + getDefaultCalculationMethodByCountry', () => {
      it('should correctly identify Middle Eastern locations', () => {
        const riyadh = extractCountryFromCity('Riyadh, Saudi Arabia')
        expect(getDefaultCalculationMethodByCountry(riyadh)).toBe('4')

        const dubai = extractCountryFromCity('Dubai, United Arab Emirates')
        expect(getDefaultCalculationMethodByCountry(dubai)).toBe('4')

        const doha = extractCountryFromCity('Doha, Qatar')
        expect(getDefaultCalculationMethodByCountry(doha)).toBe('4')
      })

      it('should correctly identify North American locations', () => {
        const nyc = extractCountryFromCity('New York, United States')
        expect(getDefaultCalculationMethodByCountry(nyc)).toBe('2')

        const toronto = extractCountryFromCity('Toronto, Canada')
        expect(getDefaultCalculationMethodByCountry(toronto)).toBe('2')

        const chicago = extractCountryFromCity('Chicago, USA')
        expect(getDefaultCalculationMethodByCountry(chicago)).toBe('2')
      })

      it('should correctly identify other international locations', () => {
        const london = extractCountryFromCity('London, United Kingdom')
        expect(getDefaultCalculationMethodByCountry(london)).toBe('2')

        const paris = extractCountryFromCity('Paris, France')
        expect(getDefaultCalculationMethodByCountry(paris)).toBe('2')

        const jakarta = extractCountryFromCity('Jakarta, Indonesia')
        expect(getDefaultCalculationMethodByCountry(jakarta)).toBe('2')
      })

      it('should handle null location gracefully', () => {
        const country = extractCountryFromCity(null)
        expect(getDefaultCalculationMethodByCountry(country)).toBe('2')
      })
    })
  })
})

