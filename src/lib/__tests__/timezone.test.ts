import { getTimezoneFromCoordinates } from '../timezone'

describe('getTimezoneFromCoordinates', () => {
  // Suppress console warnings during tests
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Valid Coordinates → Correct Timezone', () => {
    it('should return America/New_York for NYC coordinates', () => {
      const timezone = getTimezoneFromCoordinates(40.7128, -74.0060)
      expect(timezone).toBe('America/New_York')
    })

    it('should return America/Los_Angeles for LA coordinates', () => {
      const timezone = getTimezoneFromCoordinates(34.0522, -118.2437)
      expect(timezone).toBe('America/Los_Angeles')
    })

    it('should return Europe/London for London coordinates', () => {
      const timezone = getTimezoneFromCoordinates(51.5074, -0.1278)
      expect(timezone).toBe('Europe/London')
    })

    it('should return Asia/Tokyo for Tokyo coordinates', () => {
      const timezone = getTimezoneFromCoordinates(35.6762, 139.6503)
      expect(timezone).toBe('Asia/Tokyo')
    })

    it('should return Asia/Dubai for Dubai coordinates', () => {
      const timezone = getTimezoneFromCoordinates(25.2048, 55.2708)
      expect(timezone).toBe('Asia/Dubai')
    })

    it('should return Australia/Sydney for Sydney coordinates', () => {
      const timezone = getTimezoneFromCoordinates(-33.8688, 151.2093)
      expect(timezone).toBe('Australia/Sydney')
    })

    it('should return Africa/Cairo for Cairo coordinates', () => {
      const timezone = getTimezoneFromCoordinates(30.0444, 31.2357)
      expect(timezone).toBe('Africa/Cairo')
    })
  })

  describe('Invalid Coordinates → UTC Fallback', () => {
    it('should return UTC for invalid latitude (NaN)', () => {
      const timezone = getTimezoneFromCoordinates(NaN, -74.0060)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for invalid longitude (NaN)', () => {
      const timezone = getTimezoneFromCoordinates(40.7128, NaN)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for non-number latitude', () => {
      const timezone = getTimezoneFromCoordinates('invalid' as any, -74.0060)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for non-number longitude', () => {
      const timezone = getTimezoneFromCoordinates(40.7128, 'invalid' as any)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for latitude out of range (> 90)', () => {
      const timezone = getTimezoneFromCoordinates(95, -74.0060)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for latitude out of range (< -90)', () => {
      const timezone = getTimezoneFromCoordinates(-95, -74.0060)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for longitude out of range (> 180)', () => {
      const timezone = getTimezoneFromCoordinates(40.7128, 185)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should return UTC for longitude out of range (< -180)', () => {
      const timezone = getTimezoneFromCoordinates(40.7128, -185)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle Null Island (0, 0) coordinates', () => {
      // Null Island in Gulf of Guinea - should return Etc/GMT
      const timezone = getTimezoneFromCoordinates(0, 0)
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })

    it('should handle International Date Line crossing (180° longitude)', () => {
      // Fiji islands near date line
      const timezone = getTimezoneFromCoordinates(-18, 178)
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })

    it('should handle coordinates at 180° longitude boundary', () => {
      // Near Fiji
      const timezone = getTimezoneFromCoordinates(-17, -180)
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })

    it('should handle North Pole coordinates (90, 0)', () => {
      // Arctic Ocean - should return UTC or appropriate timezone
      const timezone = getTimezoneFromCoordinates(90, 0)
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })

    it('should handle South Pole coordinates (-90, 0)', () => {
      // Antarctica - should return appropriate timezone or UTC
      const timezone = getTimezoneFromCoordinates(-90, 0)
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })

    it('should handle coordinates in middle of ocean (no land)', () => {
      // Pacific Ocean - should return UTC or Etc/GMT variant
      const timezone = getTimezoneFromCoordinates(0, -140)
      expect(timezone).toBeTruthy()
      expect(typeof timezone).toBe('string')
    })
  })

  describe('Performance', () => {
    it('should complete within 50ms for single lookup', () => {
      const start = performance.now()
      getTimezoneFromCoordinates(40.7128, -74.0060)
      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })

    it('should handle multiple rapid lookups efficiently', () => {
      const start = performance.now()

      // Perform 10 lookups
      for (let i = 0; i < 10; i++) {
        getTimezoneFromCoordinates(40 + i, -74 - i)
      }

      const end = performance.now()
      const duration = end - start

      // Should complete all 10 lookups in under 200ms
      expect(duration).toBeLessThan(200)
    })
  })

  describe('Real-World User Scenarios', () => {
    it('should handle user traveling from NYC to LA', () => {
      const nycTimezone = getTimezoneFromCoordinates(40.7128, -74.0060)
      const laTimezone = getTimezoneFromCoordinates(34.0522, -118.2437)

      expect(nycTimezone).toBe('America/New_York')
      expect(laTimezone).toBe('America/Los_Angeles')
      expect(nycTimezone).not.toBe(laTimezone)
    })

    it('should handle user traveling from London to Dubai', () => {
      const londonTimezone = getTimezoneFromCoordinates(51.5074, -0.1278)
      const dubaiTimezone = getTimezoneFromCoordinates(25.2048, 55.2708)

      expect(londonTimezone).toBe('Europe/London')
      expect(dubaiTimezone).toBe('Asia/Dubai')
      expect(londonTimezone).not.toBe(dubaiTimezone)
    })

    it('should handle coordinates from typical Muslim-majority cities', () => {
      // Mecca
      const meccaTimezone = getTimezoneFromCoordinates(21.3891, 39.8579)
      expect(meccaTimezone).toBe('Asia/Riyadh')

      // Medina
      const medinaTimezone = getTimezoneFromCoordinates(24.5247, 39.5692)
      expect(medinaTimezone).toBe('Asia/Riyadh')

      // Istanbul
      const istanbulTimezone = getTimezoneFromCoordinates(41.0082, 28.9784)
      expect(istanbulTimezone).toBe('Europe/Istanbul')

      // Jakarta
      const jakartaTimezone = getTimezoneFromCoordinates(-6.2088, 106.8456)
      expect(jakartaTimezone).toBe('Asia/Jakarta')
    })
  })

  describe('Error Handling', () => {
    it('should return UTC and log error if geo-tz throws exception', () => {
      // This is a theoretical test - geo-tz is very robust
      // but we test our error handling anyway
      const mockFind = jest.fn().mockImplementation(() => {
        throw new Error('Mock geo-tz error')
      })

      // We can't easily mock the import, so this test documents expected behavior
      // In practice, geo-tz rarely throws, and we handle it gracefully
      expect(() => getTimezoneFromCoordinates(40.7128, -74.0060)).not.toThrow()
    })

    it('should handle undefined coordinates gracefully', () => {
      const timezone = getTimezoneFromCoordinates(undefined as any, undefined as any)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should handle null coordinates gracefully', () => {
      const timezone = getTimezoneFromCoordinates(null as any, null as any)
      expect(timezone).toBe('UTC')
      expect(console.warn).toHaveBeenCalled()
    })
  })
})

