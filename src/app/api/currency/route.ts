import { NextRequest, NextResponse } from 'next/server'

/**
 * fawazahmed0 Currency API - Exchange Rate Endpoint
 * GET /api/currency?base={currency}&symbols={comma-separated}
 * 
 * Fetches live exchange rates from fawazahmed0 Currency API
 * Primary: cdn.jsdelivr.net, Fallback: currency-api.pages.dev
 * Caches for 24 hours (rates update daily)
 * Supports 200+ currencies including gold (XAU) and silver (XAG)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const base = searchParams.get('base') || 'USD'
    const symbols = searchParams.get('symbols') // Optional: comma-separated list

    // Validate base currency format
    if (!base || base.length < 3) {
      return NextResponse.json(
        { error: 'Invalid currency code' },
        { status: 400 }
      )
    }

    const baseLower = base.toLowerCase()

    // Build primary and fallback URLs
    const primaryUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseLower}.min.json`
    const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${baseLower}.min.json`

    // Fetch exchange rates with fallback mechanism
    let data
    try {
      const response = await fetch(primaryUrl, {
        next: { revalidate: 86400 }, // 24 hour cache
      })

      if (!response.ok) {
        throw new Error(`Primary API error: ${response.status}`)
      }

      data = await response.json()
    } catch (primaryError) {
      console.warn('Primary CDN failed, trying fallback:', primaryError)
      
      // Try fallback CDN
      const fallbackResponse = await fetch(fallbackUrl, {
        next: { revalidate: 86400 },
      })

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API error: ${fallbackResponse.status}`)
      }

      data = await fallbackResponse.json()
    }

    // Transform response from fawazahmed0 format to our standard format
    // Input: { date: "2025-11-16", usd: { eur: 0.92, gbp: 0.79, ... } }
    // Output: { base: "USD", date: "2025-11-16", rates: { EUR: 0.92, GBP: 0.79, ... } }
    
    const rates: Record<string, number> = {}
    const baseCurrencyRates = data[baseLower]

    if (!baseCurrencyRates || typeof baseCurrencyRates !== 'object') {
      throw new Error('Invalid API response format')
    }

    // Convert rates object, filter ILS, and uppercase currency codes
    Object.entries(baseCurrencyRates).forEach(([currency, rate]) => {
      const currencyUpper = currency.toUpperCase()
      // Exclude ILS (Israeli Shekel)
      if (currencyUpper !== 'ILS' && typeof rate === 'number') {
        rates[currencyUpper] = rate
      }
    })

    // If symbols filter provided, filter rates
    if (symbols) {
      const symbolsArray = symbols.split(',').map(s => s.trim().toUpperCase())
      const filteredRates: Record<string, number> = {}
      symbolsArray.forEach(symbol => {
        if (rates[symbol]) {
          filteredRates[symbol] = rates[symbol]
        }
      })
      
      const transformedData = {
        base: base.toUpperCase(),
        date: data.date,
        rates: filteredRates,
      }

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      })
    }

    const transformedData = {
      base: base.toUpperCase(),
      date: data.date,
      rates,
    }

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    })
  } catch (error) {
    console.error('Currency API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

