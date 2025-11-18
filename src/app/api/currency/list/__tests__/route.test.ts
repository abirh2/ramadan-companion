/**
 * Tests for Currency List API Route (fawazahmed0)
 */

import { GET } from '../route'

// Mock fetch
global.fetch = jest.fn()

describe('/api/currency/list', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch currency list successfully from primary CDN', async () => {
    const mockResponse = {
      usd: 'United States Dollar',
      eur: 'Euro',
      gbp: 'British Pound Sterling',
      jpy: 'Japanese Yen',
      xau: 'Gold',
      xag: 'Silver',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(6)
    expect(data[0]).toHaveProperty('code')
    expect(data[0]).toHaveProperty('name')
  })

  it('should fallback to secondary CDN if primary fails', async () => {
    const mockResponse = {
      usd: 'United States Dollar',
      eur: 'Euro',
    }

    // Primary CDN fails
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Primary failed'))
    
    // Fallback succeeds
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('currency-api.pages.dev'),
      expect.any(Object)
    )
  })

  it('should filter out ILS (Israeli Shekel)', async () => {
    const mockResponse = {
      usd: 'United States Dollar',
      eur: 'Euro',
      ils: 'Israeli Shekel',
      gbp: 'British Pound Sterling',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.find((c: { code: string }) => c.code === 'ILS')).toBeUndefined()
    expect(data.find((c: { code: string }) => c.code === 'USD')).toBeDefined()
  })

  it('should filter out cryptocurrencies using name-based detection', async () => {
    const mockResponse = {
      usd: 'United States Dollar',
      eur: 'Euro',
      btc: 'Bitcoin',
      eth: 'Ethereum',
      usdt: 'Tether',
      pepe: 'Pepe',
      ada: 'Cardano',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await GET()
    const data = await response.json()

    // Cryptocurrencies should be filtered out
    expect(data.find((c: { code: string }) => c.code === 'BTC')).toBeUndefined()
    expect(data.find((c: { code: string }) => c.code === 'ETH')).toBeUndefined()
    expect(data.find((c: { code: string }) => c.code === 'USDT')).toBeUndefined()
    expect(data.find((c: { code: string }) => c.code === 'PEPE')).toBeUndefined()
    expect(data.find((c: { code: string }) => c.code === 'ADA')).toBeUndefined()
    
    // Fiat currencies should remain
    expect(data.find((c: { code: string }) => c.code === 'USD')).toBeDefined()
    expect(data.find((c: { code: string }) => c.code === 'EUR')).toBeDefined()
  })

  it('should include precious metals (XAU, XAG)', async () => {
    const mockResponse = {
      usd: 'United States Dollar',
      eur: 'Euro',
      xau: 'Gold',
      xag: 'Silver',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.find((c: { code: string }) => c.code === 'XAU')).toBeDefined()
    expect(data.find((c: { code: string }) => c.code === 'XAG')).toBeDefined()
  })

  it('should sort currencies alphabetically by name', async () => {
    const mockResponse = {
      usd: 'United States Dollar',
      eur: 'Euro',
      gbp: 'British Pound Sterling',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const response = await GET()
    const data = await response.json()

    // Check if sorted alphabetically
    expect(data[0].name).toBe('British Pound Sterling') // B comes first
    expect(data[1].name).toBe('Euro') // E second
    expect(data[2].name).toBe('United States Dollar') // U last
  })

  it('should handle API errors gracefully when both CDNs fail', async () => {
    // Both primary and fallback fail
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Primary failed'))
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})

