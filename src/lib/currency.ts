/**
 * Currency utilities for multi-currency support
 * Handles exchange rates, conversions, formatting, and preferences
 */

import type {
  CurrencyCode,
  Currency,
  ExchangeRateResponse,
  CurrencyConversion,
  CachedExchangeRates,
} from '@/types/currency.types'

// In-memory cache for exchange rates
let ratesCache: CachedExchangeRates | null = null

// LocalStorage keys
const STORAGE_KEYS = {
  PREFERRED_CURRENCY: 'preferred_currency',
  VIEW_MODE: 'currency_view_mode',
  CACHED_RATES: 'cached_exchange_rates',
} as const

/**
 * Get default currency (USD)
 */
export function getDefaultCurrency(): CurrencyCode {
  return 'USD'
}

/**
 * Get user's preferred currency from localStorage
 * Falls back to USD if not set
 */
export function getPreferredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') {
    return getDefaultCurrency()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERRED_CURRENCY)
    return stored || getDefaultCurrency()
  } catch (error) {
    console.error('Error reading preferred currency:', error)
    return getDefaultCurrency()
  }
}

/**
 * Set user's preferred currency in localStorage
 */
export function setPreferredCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEYS.PREFERRED_CURRENCY, currency)
  } catch (error) {
    console.error('Error saving preferred currency:', error)
  }
}

/**
 * Get currency view mode from localStorage
 * Returns 'original' or 'converted'
 */
export function getViewMode(): 'original' | 'converted' {
  if (typeof window === 'undefined') {
    return 'original'
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE)
    return (stored as 'original' | 'converted') || 'original'
  } catch (error) {
    console.error('Error reading view mode:', error)
    return 'original'
  }
}

/**
 * Set currency view mode in localStorage
 */
export function setViewMode(mode: 'original' | 'converted'): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode)
  } catch (error) {
    console.error('Error saving view mode:', error)
  }
}

/**
 * Check if cached rates are still valid (< 24 hours old)
 */
function isCacheValid(cache: CachedExchangeRates | null): boolean {
  if (!cache) return false
  
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  return now - cache.timestamp < twentyFourHours
}

/**
 * Load cached rates from localStorage
 */
function loadCachedRates(): CachedExchangeRates | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CACHED_RATES)
    if (!stored) return null
    
    const parsed = JSON.parse(stored) as CachedExchangeRates
    return isCacheValid(parsed) ? parsed : null
  } catch (error) {
    console.error('Error loading cached rates:', error)
    return null
  }
}

/**
 * Save rates to localStorage cache
 */
function saveCachedRates(cache: CachedExchangeRates): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_RATES, JSON.stringify(cache))
  } catch (error) {
    console.error('Error saving cached rates:', error)
  }
}

/**
 * Fetch exchange rates from API
 * Uses in-memory and localStorage caching (24 hour TTL)
 */
export async function fetchExchangeRates(
  baseCurrency: CurrencyCode = 'USD'
): Promise<Record<CurrencyCode, number>> {
  // Check in-memory cache first
  if (ratesCache && isCacheValid(ratesCache) && ratesCache.base === baseCurrency) {
    return ratesCache.rates
  }

  // Check localStorage cache
  const cachedRates = loadCachedRates()
  if (cachedRates && cachedRates.base === baseCurrency) {
    ratesCache = cachedRates
    return cachedRates.rates
  }

  // Fetch fresh rates from API
  try {
    const response = await fetch(`/api/currency?base=${baseCurrency}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()

    // Create cache object
    const cache: CachedExchangeRates = {
      base: data.base,
      rates: data.rates,
      timestamp: Date.now(),
      date: data.date,
    }

    // Update caches
    ratesCache = cache
    saveCachedRates(cache)

    return data.rates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Try to use stale cache as fallback
    if (ratesCache && ratesCache.base === baseCurrency) {
      console.warn('Using stale exchange rates cache')
      return ratesCache.rates
    }

    throw error
  }
}

/**
 * Convert amount from one currency to another
 * Uses live exchange rates
 */
export async function convertAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<CurrencyConversion> {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: amount,
      convertedCurrency: toCurrency,
      rate: 1,
      date: new Date().toISOString().split('T')[0],
    }
  }

  // Fetch exchange rates with base as fromCurrency
  const rates = await fetchExchangeRates(fromCurrency)

  // Get conversion rate
  const rate = rates[toCurrency]
  if (!rate) {
    throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`)
  }

  // Calculate converted amount
  const convertedAmount = amount * rate

  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount,
    convertedCurrency: toCurrency,
    rate,
    date: ratesCache?.date || new Date().toISOString().split('T')[0],
  }
}

/**
 * Format currency amount with proper symbol and decimals
 * Uses Intl.NumberFormat for locale-aware formatting
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    // Fallback if currency code is invalid
    console.error(`Error formatting currency ${currency}:`, error)
    return `${amount.toFixed(2)} ${currency}`
  }
}

/**
 * Fetch list of all available currencies
 */
export async function fetchCurrencyList(): Promise<Currency[]> {
  try {
    const response = await fetch('/api/currency/list')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch currency list: ${response.status}`)
    }

    const currencies: Currency[] = await response.json()
    return currencies
  } catch (error) {
    console.error('Error fetching currency list:', error)
    
    // Return minimal fallback list
    return [
      { code: 'USD', name: 'United States Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound Sterling' },
    ]
  }
}

/**
 * Clear all currency caches (useful for testing or manual refresh)
 */
export function clearCurrencyCaches(): void {
  ratesCache = null
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEYS.CACHED_RATES)
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }
}

