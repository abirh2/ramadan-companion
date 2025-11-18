/**
 * Tests for Currency Utilities
 */

import {
  getDefaultCurrency,
  getPreferredCurrency,
  setPreferredCurrency,
  getViewMode,
  setViewMode,
  formatCurrency,
  fetchExchangeRates,
  convertAmount,
  fetchCurrencyList,
  clearCurrencyCaches,
} from '../currency'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Currency Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    clearCurrencyCaches()
  })

  describe('getDefaultCurrency', () => {
    it('should return USD as default', () => {
      expect(getDefaultCurrency()).toBe('USD')
    })
  })

  describe('Preferred Currency', () => {
    it('should get preferred currency from localStorage', () => {
      localStorageMock.setItem('preferred_currency', 'EUR')
      expect(getPreferredCurrency()).toBe('EUR')
    })

    it('should fall back to default if not set', () => {
      expect(getPreferredCurrency()).toBe('USD')
    })

    it('should save preferred currency to localStorage', () => {
      setPreferredCurrency('GBP')
      expect(localStorageMock.getItem('preferred_currency')).toBe('GBP')
    })
  })

  describe('View Mode', () => {
    it('should get view mode from localStorage', () => {
      localStorageMock.setItem('currency_view_mode', 'converted')
      expect(getViewMode()).toBe('converted')
    })

    it('should fall back to original if not set', () => {
      expect(getViewMode()).toBe('original')
    })

    it('should save view mode to localStorage', () => {
      setViewMode('converted')
      expect(localStorageMock.getItem('currency_view_mode')).toBe('converted')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      const result = formatCurrency(1234.56, 'USD')
      expect(result).toBe('$1,234.56')
    })

    it('should format EUR correctly', () => {
      const result = formatCurrency(1234.56, 'EUR')
      expect(result).toContain('1,234.56')
    })

    it('should handle zero', () => {
      const result = formatCurrency(0, 'USD')
      expect(result).toBe('$0.00')
    })

    it('should handle invalid currency code gracefully', () => {
      const result = formatCurrency(100, 'INVALID')
      expect(result).toContain('100.00')
      expect(result).toContain('INVALID')
    })
  })

  describe('fetchExchangeRates', () => {
    it('should fetch exchange rates from API', async () => {
      const mockResponse = {
        base: 'USD',
        date: '2025-11-16',
        rates: {
          EUR: 0.92,
          GBP: 0.79,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const rates = await fetchExchangeRates('USD')

      expect(rates).toEqual(mockResponse.rates)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/currency?base=USD')
      )
    })

    it('should cache rates in memory', async () => {
      const mockResponse = {
        base: 'USD',
        date: '2025-11-16',
        rates: {
          EUR: 0.92,
          GBP: 0.79,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      // First call
      await fetchExchangeRates('USD')

      // Second call should use cache
      await fetchExchangeRates('USD')

      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle API errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(fetchExchangeRates('USD')).rejects.toThrow()
    })
  })

  describe('convertAmount', () => {
    it('should convert between currencies', async () => {
      const mockResponse = {
        base: 'USD',
        date: '2025-11-16',
        rates: {
          EUR: 0.92,
          GBP: 0.79,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await convertAmount(100, 'USD', 'EUR')

      expect(result.originalAmount).toBe(100)
      expect(result.originalCurrency).toBe('USD')
      expect(result.convertedAmount).toBe(92) // 100 * 0.92
      expect(result.convertedCurrency).toBe('EUR')
      expect(result.rate).toBe(0.92)
    })

    it('should return same amount for same currency', async () => {
      const result = await convertAmount(100, 'USD', 'USD')

      expect(result.convertedAmount).toBe(100)
      expect(result.rate).toBe(1)
    })

    it('should throw error for missing rate', async () => {
      const mockResponse = {
        base: 'USD',
        date: '2025-11-16',
        rates: {
          EUR: 0.92,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await expect(convertAmount(100, 'USD', 'JPY')).rejects.toThrow()
    })
  })

  describe('fetchCurrencyList', () => {
    it('should fetch currency list from API', async () => {
      const mockResponse = [
        { code: 'USD', name: 'United States Dollar' },
        { code: 'EUR', name: 'Euro' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const currencies = await fetchCurrencyList()

      expect(currencies).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/currency/list')
      )
    })

    it('should return fallback list on error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const currencies = await fetchCurrencyList()

      // Should return fallback minimal list
      expect(currencies.length).toBeGreaterThan(0)
      expect(currencies.some((c) => c.code === 'USD')).toBe(true)
    })
  })
})

