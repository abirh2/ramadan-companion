/**
 * Tests for Currency API Route (fawazahmed0)
 */

import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock fetch
global.fetch = jest.fn()

describe('/api/currency', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch exchange rates successfully from primary CDN', async () => {
    const mockApiResponse = {
      date: '2025-11-16',
      usd: {
        eur: 0.92,
        gbp: 0.79,
        jpy: 149.50,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    })

    const request = new NextRequest('http://localhost:3000/api/currency?base=USD')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.base).toBe('USD')
    expect(data.date).toBe('2025-11-16')
    expect(data.rates.EUR).toBe(0.92)
    expect(data.rates.GBP).toBe(0.79)
    expect(data.rates.JPY).toBe(149.50)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('cdn.jsdelivr.net/npm/@fawazahmed0/currency-api'),
      expect.any(Object)
    )
  })

  it('should fallback to secondary CDN if primary fails', async () => {
    const mockApiResponse = {
      date: '2025-11-16',
      usd: {
        eur: 0.92,
        gbp: 0.79,
      },
    }

    // Primary CDN fails
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Primary failed'))
    
    // Fallback succeeds
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    })

    const request = new NextRequest('http://localhost:3000/api/currency?base=USD')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.base).toBe('USD')
    expect(data.rates.EUR).toBe(0.92)
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('currency-api.pages.dev'),
      expect.any(Object)
    )
  })

  it('should filter out ILS (Israeli Shekel)', async () => {
    const mockApiResponse = {
      date: '2025-11-16',
      usd: {
        eur: 0.92,
        ils: 3.70,
        gbp: 0.79,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    })

    const request = new NextRequest('http://localhost:3000/api/currency?base=USD')
    const response = await GET(request)
    const data = await response.json()

    expect(data.rates.ILS).toBeUndefined()
    expect(data.rates.EUR).toBe(0.92)
    expect(data.rates.GBP).toBe(0.79)
  })

  it('should handle invalid currency code', async () => {
    const request = new NextRequest('http://localhost:3000/api/currency?base=INVALID')
    const response = await GET(request)
    const data = await response.json()

    // Frankfurter will return error, we should handle it
    expect(response.status).toBeGreaterThanOrEqual(400)
  })

  it('should handle API errors gracefully when both CDNs fail', async () => {
    // Both primary and fallback fail
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Primary failed'))
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const request = new NextRequest('http://localhost:3000/api/currency?base=USD')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should support symbols parameter', async () => {
    const mockApiResponse = {
      date: '2025-11-16',
      usd: {
        eur: 0.92,
        gbp: 0.79,
        jpy: 149.50,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    })

    const request = new NextRequest('http://localhost:3000/api/currency?base=USD&symbols=EUR,GBP')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rates.EUR).toBe(0.92)
    expect(data.rates.GBP).toBe(0.79)
    expect(data.rates.JPY).toBeUndefined() // Filtered out by symbols parameter
  })

  it('should include precious metals (XAU, XAG)', async () => {
    const mockApiResponse = {
      date: '2025-11-16',
      usd: {
        eur: 0.92,
        xau: 0.00048, // Gold
        xag: 0.038,   // Silver
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    })

    const request = new NextRequest('http://localhost:3000/api/currency?base=USD')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rates.XAU).toBeDefined()
    expect(data.rates.XAG).toBeDefined()
  })
})

