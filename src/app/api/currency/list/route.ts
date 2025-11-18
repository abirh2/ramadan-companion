import { NextResponse } from 'next/server'

/**
 * fawazahmed0 Currency API - Currency List Endpoint
 * GET /api/currency/list
 * 
 * Fetches list of all supported currencies from fawazahmed0
 * Primary: cdn.jsdelivr.net, Fallback: currency-api.pages.dev
 * Excludes: ILS (Israeli Shekel), Cryptocurrencies
 * Includes: All fiat currencies, XAU (Gold), XAG (Silver)
 * Static cache (currency list rarely changes)
 */
export async function GET() {
  try {
    // Build primary and fallback URLs
    const primaryUrl = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.min.json'
    const fallbackUrl = 'https://latest.currency-api.pages.dev/v1/currencies.min.json'

    // Fetch currency list with fallback mechanism
    let data
    try {
      const response = await fetch(primaryUrl, {
        next: { revalidate: 604800 }, // 7 day cache (static data)
      })

      if (!response.ok) {
        throw new Error(`Primary API error: ${response.status}`)
      }

      data = await response.json()
    } catch (primaryError) {
      console.warn('Primary CDN failed, trying fallback:', primaryError)
      
      // Try fallback CDN
      const fallbackResponse = await fetch(fallbackUrl, {
        next: { revalidate: 604800 },
      })

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API error: ${fallbackResponse.status}`)
      }

      data = await fallbackResponse.json()
    }

    // Use name-based filtering to identify fiat currencies vs cryptocurrencies
    // Fiat currencies contain traditional currency terms or country/region names
    const fiatIndicators = [
      // Traditional currency terms
      /dollar/i, /peso/i, /rupee/i, /dinar/i, /dirham/i, /franc/i, /pound/i,
      /euro/i, /yen/i, /won/i, /yuan/i, /krona/i, /krone/i, /lira/i, /mark/i,
      /guilder/i, /shilling/i, /riyal/i, /rial/i, /ringgit/i, /baht/i, /dong/i,
      /rupiah/i, /taka/i, /kyat/i, /kip/i, /tugrik/i, /som/i, /tenge/i, /manat/i,
      /leu/i, /lev/i, /zloty/i, /koruna/i, /forint/i, /kuna/i, /denar/i, /lek/i,
      /rand/i, /naira/i, /cedi/i, /birr/i, /ariary/i, /kwacha/i, /pula/i,
      /ouguiya/i, /nakfa/i, /lilangeni/i, /loti/i, /escudo/i, /dalasi/i, /leone/i,
      /quetzal/i, /lempira/i, /cordoba/i, /colon/i, /balboa/i, /gourde/i,
      /bolivar/i, /boliviano/i, /guarani/i, /sol/i, /afghani/i, /ruble/i,
      /hryvnia/i, /somoni/i, /pataca/i, /rufiyaa/i, /ngultrum/i, /pa'anga/i,
      /vatu/i, /tala/i,
      
      // Country/region/nationality adjectives
      /\b(united states|u\.?s\.?|american|canadian|australian|british|european|swiss|japanese|chinese|indian|pakistani|bangladeshi|indonesian|malaysian|singapore|thai|vietnamese|philippines|south korean|hong kong|taiwan|mexican|brazilian|argentine|chilean|colombian|peruvian|egyptian|saudi|emirati|qatari|kuwaiti|bahraini|omani|jordanian|lebanese|turkish|iranian|iraqi|syrian|yemeni|moroccan|algerian|tunisian|libyan|sudanese|ethiopian|kenyan|nigerian|south african|ghanaian|ugandan|tanzanian|russian|ukrainian|swedish|norwegian|danish|polish|czech|hungarian|romanian|bulgarian|croatian|serbian|albanian|macedonian|moldovan|georgian|armenian|azerbaijani|belarusian|kazakhstani|uzbekistani|turkmen|kyrgyzstani|tajikistani|afghan|nepalese|sri lankan|maldivian|bhutanese|burmese|cambodian|lao|mongolian|macau|icelandic|maltese|cypriot|estonian|latvian|lithuanian|slovenian|slovakian|austrian|belgian|finnish|french|german|greek|irish|italian|luxembourg|dutch|portuguese|spanish|israeli|mauritanian|somali|rwandan|zambian|botswanan|malawian|mozambican|namibian|swazi|lesotho|seychellois|mauritian|malagasy|angolan|cape verdean|gambian|guinean|sierra leonean|liberian|burundian|congolese|djiboutian|eritrean|comorian|fijian|papua|samoan|tongan|vanuatu|solomon|guatemalan|honduran|nicaraguan|costa rican|panamanian|dominican|haitian|jamaican|bahamian|barbadian|trinidad|belizean|guyanese|surinamese|uruguayan|paraguayan|bolivian|venezuelan|aruban|dutch|bosnian|new zealand|north korean|caymanian|bermudian|falkland|guernsey|jersey|isle of man|gibraltar)\b/i
    ]

    // Filter and transform currencies
    const currencies = Object.entries(data)
      .filter(([code, name]) => {
        const codeUpper = code.toUpperCase()
        const nameStr = String(name)
        
        // Exclude ILS (Israeli Shekel)
        if (codeUpper === 'ILS') return false
        
        // Keep precious metals (for zakat calculations)
        if (codeUpper === 'XAU' || codeUpper === 'XAG') return true
        
        // Exclude if name is empty or just the code repeated
        if (!nameStr || nameStr.trim() === '' || nameStr.toLowerCase() === code.toLowerCase()) return false
        
        // Check if name contains fiat currency indicators
        const isFiat = fiatIndicators.some(pattern => pattern.test(nameStr))
        
        return isFiat
      })
      .map(([code, name]) => ({
        code: code.toUpperCase(),
        name: name as string,
      }))

    // Sort alphabetically by name
    currencies.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(currencies, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Currency list API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch currency list',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

