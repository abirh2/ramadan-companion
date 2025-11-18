/**
 * Currency types for multi-currency support
 */

/**
 * Currency code (ISO 4217)
 * Using string type to support all Frankfurter currencies dynamically
 */
export type CurrencyCode = string

/**
 * Currency information with display name
 */
export interface Currency {
  code: CurrencyCode
  name: string
}

/**
 * Exchange rate response from Frankfurter API
 */
export interface ExchangeRateResponse {
  base: CurrencyCode
  date: string // ISO date string (YYYY-MM-DD)
  rates: Record<CurrencyCode, number>
}

/**
 * Conversion calculation result
 */
export interface CurrencyConversion {
  originalAmount: number
  originalCurrency: CurrencyCode
  convertedAmount: number
  convertedCurrency: CurrencyCode
  rate: number
  date: string
}

/**
 * User's currency preference
 */
export interface CurrencyPreference {
  currency: CurrencyCode
  lastUpdated: string // ISO timestamp
}

/**
 * Currency view mode
 */
export type CurrencyViewMode = 'original' | 'converted'

/**
 * Cached exchange rates with timestamp
 */
export interface CachedExchangeRates {
  base: CurrencyCode
  rates: Record<CurrencyCode, number>
  timestamp: number // Unix timestamp
  date: string // ISO date string
}

/**
 * Currency flag emoji mapping
 * Maps currency codes to their country flag emojis
 */
export const CURRENCY_FLAGS: Record<string, string> = {
  // Major currencies
  'USD': '🇺🇸', // United States Dollar
  'EUR': '🇪🇺', // Euro
  'GBP': '🇬🇧', // British Pound
  'JPY': '🇯🇵', // Japanese Yen
  'CHF': '🇨🇭', // Swiss Franc
  'CAD': '🇨🇦', // Canadian Dollar
  'AUD': '🇦🇺', // Australian Dollar
  'NZD': '🇳🇿', // New Zealand Dollar
  
  // Oceania
  'FJD': '🇫🇯', // Fijian Dollar
  'PGK': '🇵🇬', // Papua New Guinean Kina
  'WST': '🇼🇸', // Samoan Tala
  'TOP': '🇹🇴', // Tongan Paʻanga
  'VUV': '🇻🇺', // Vanuatu Vatu
  'SBD': '🇸🇧', // Solomon Islands Dollar
  
  // Middle East & North Africa
  'AED': '🇦🇪', // UAE Dirham
  'SAR': '🇸🇦', // Saudi Riyal
  'QAR': '🇶🇦', // Qatari Riyal
  'KWD': '🇰🇼', // Kuwaiti Dinar
  'BHD': '🇧🇭', // Bahraini Dinar
  'OMR': '🇴🇲', // Omani Rial
  'JOD': '🇯🇴', // Jordanian Dinar
  'LBP': '🇱🇧', // Lebanese Pound
  'EGP': '🇪🇬', // Egyptian Pound
  'MAD': '🇲🇦', // Moroccan Dirham
  'TND': '🇹🇳', // Tunisian Dinar
  'DZD': '🇩🇿', // Algerian Dinar
  'LYD': '🇱🇾', // Libyan Dinar
  'YER': '🇾🇪', // Yemeni Rial
  'MRU': '🇲🇷', // Mauritanian Ouguiya
  'SYP': '🇸🇾', // Syrian Pound
  
  // South Asia
  'PKR': '🇵🇰', // Pakistani Rupee
  'INR': '🇮🇳', // Indian Rupee
  'BDT': '🇧🇩', // Bangladeshi Taka
  'LKR': '🇱🇰', // Sri Lankan Rupee
  'NPR': '🇳🇵', // Nepalese Rupee
  'AFN': '🇦🇫', // Afghan Afghani
  'BTN': '🇧🇹', // Bhutanese Ngultrum
  'MVR': '🇲🇻', // Maldivian Rufiyaa
  
  // Southeast Asia
  'MYR': '🇲🇾', // Malaysian Ringgit
  'IDR': '🇮🇩', // Indonesian Rupiah
  'SGD': '🇸🇬', // Singapore Dollar
  'THB': '🇹🇭', // Thai Baht
  'PHP': '🇵🇭', // Philippine Peso
  'VND': '🇻🇳', // Vietnamese Dong
  'BND': '🇧🇳', // Brunei Dollar
  'MMK': '🇲🇲', // Myanmar Kyat
  'KHR': '🇰🇭', // Cambodian Riel
  'LAK': '🇱🇦', // Lao Kip
  
  // East Asia
  'CNY': '🇨🇳', // Chinese Yuan
  'CNH': '🇨🇳', // Chinese Yuan (Offshore)
  'HKD': '🇭🇰', // Hong Kong Dollar
  'KRW': '🇰🇷', // South Korean Won
  'KPW': '🇰🇵', // North Korean Won
  'TWD': '🇹🇼', // Taiwan Dollar
  'MOP': '🇲🇴', // Macanese Pataca
  'MNT': '🇲🇳', // Mongolian Tugrik
  
  // Turkey & Central Asia
  'TRY': '🇹🇷', // Turkish Lira
  'KZT': '🇰🇿', // Kazakhstani Tenge
  'UZS': '🇺🇿', // Uzbekistani Som
  'AZN': '🇦🇿', // Azerbaijani Manat
  'TJS': '🇹🇯', // Tajikistani Somoni
  'KGS': '🇰🇬', // Kyrgyzstani Som
  'TMT': '🇹🇲', // Turkmen Manat
  
  // Europe
  'SEK': '🇸🇪', // Swedish Krona
  'NOK': '🇳🇴', // Norwegian Krone
  'DKK': '🇩🇰', // Danish Krone
  'PLN': '🇵🇱', // Polish Zloty
  'CZK': '🇨🇿', // Czech Koruna
  'HUF': '🇭🇺', // Hungarian Forint
  'RON': '🇷🇴', // Romanian Leu
  'BGN': '🇧🇬', // Bulgarian Lev
  'HRK': '🇭🇷', // Croatian Kuna
  'RSD': '🇷🇸', // Serbian Dinar
  'ISK': '🇮🇸', // Icelandic Króna
  'ALL': '🇦🇱', // Albanian Lek
  'BAM': '🇧🇦', // Bosnia-Herzegovina Convertible Mark
  'MKD': '🇲🇰', // Macedonian Denar
  'MDL': '🇲🇩', // Moldovan Leu
  'GEL': '🇬🇪', // Georgian Lari
  'AMD': '🇦🇲', // Armenian Dram
  'BYN': '🇧🇾', // Belarusian Ruble
  'GGP': '🇬🇬', // Guernsey Pound
  'GIP': '🇬🇮', // Gibraltar Pound
  'IMP': '🇮🇲', // Isle of Man Pound
  'JEP': '🇯🇪', // Jersey Pound
  
  // Africa
  'ZAR': '🇿🇦', // South African Rand
  'NGN': '🇳🇬', // Nigerian Naira
  'KES': '🇰🇪', // Kenyan Shilling
  'GHS': '🇬🇭', // Ghanaian Cedi
  'UGX': '🇺🇬', // Ugandan Shilling
  'TZS': '🇹🇿', // Tanzanian Shilling
  'ETB': '🇪🇹', // Ethiopian Birr
  'XOF': '🇸🇳', // West African CFA Franc (Senegal, Mali, Burkina Faso, etc.)
  'XAF': '🇨🇲', // Central African CFA Franc (Cameroon, Chad, Congo, etc.)
  'MUR': '🇲🇺', // Mauritian Rupee
  'MGA': '🇲🇬', // Malagasy Ariary
  'ZMW': '🇿🇲', // Zambian Kwacha
  'BWP': '🇧🇼', // Botswanan Pula
  'MWK': '🇲🇼', // Malawian Kwacha
  'RWF': '🇷🇼', // Rwandan Franc
  'SCR': '🇸🇨', // Seychellois Rupee
  'SOS': '🇸🇴', // Somali Shilling
  'SDG': '🇸🇩', // Sudanese Pound
  'SSP': '🇸🇸', // South Sudanese Pound
  'AOA': '🇦🇴', // Angolan Kwanza
  'MZN': '🇲🇿', // Mozambican Metical
  'NAD': '🇳🇦', // Namibian Dollar
  'SZL': '🇸🇿', // Swazi Lilangeni
  'LSL': '🇱🇸', // Lesotho Loti
  'BIF': '🇧🇮', // Burundian Franc
  'CDF': '🇨🇩', // Congolese Franc
  'DJF': '🇩🇯', // Djiboutian Franc
  'ERN': '🇪🇷', // Eritrean Nakfa
  'GMD': '🇬🇲', // Gambian Dalasi
  'GNF': '🇬🇳', // Guinean Franc
  'KMF': '🇰🇲', // Comorian Franc
  'LRD': '🇱🇷', // Liberian Dollar
  'SLL': '🇸🇱', // Sierra Leonean Leone
  'STN': '🇸🇹', // Sao Tome and Principe Dobra
  'STD': '🇸🇹', // Sao Tome and Principe Dobra (old)
  
  // Americas
  'MXN': '🇲🇽', // Mexican Peso
  'BRL': '🇧🇷', // Brazilian Real
  'ARS': '🇦🇷', // Argentine Peso
  'CLP': '🇨🇱', // Chilean Peso
  'COP': '🇨🇴', // Colombian Peso
  'PEN': '🇵🇪', // Peruvian Sol
  'UYU': '🇺🇾', // Uruguayan Peso
  'PYG': '🇵🇾', // Paraguayan Guarani
  'BOB': '🇧🇴', // Bolivian Boliviano
  'VES': '🇻🇪', // Venezuelan Bolívar
  'CRC': '🇨🇷', // Costa Rican Colón
  'GTQ': '🇬🇹', // Guatemalan Quetzal
  'HNL': '🇭🇳', // Honduran Lempira
  'NIO': '🇳🇮', // Nicaraguan Córdoba
  'PAB': '🇵🇦', // Panamanian Balboa
  'DOP': '🇩🇴', // Dominican Peso
  'HTG': '🇭🇹', // Haitian Gourde
  'JMD': '🇯🇲', // Jamaican Dollar
  'TTD': '🇹🇹', // Trinidad and Tobago Dollar
  'BBD': '🇧🇧', // Barbadian Dollar
  'BSD': '🇧🇸', // Bahamian Dollar
  'BZD': '🇧🇿', // Belize Dollar
  'XCD': '🇦🇬', // East Caribbean Dollar (Antigua, Dominica, Grenada, etc.)
  'AWG': '🇦🇼', // Aruban Guilder
  'ANG': '🇳🇱', // Netherlands Antillean Guilder
  'BMD': '🇧🇲', // Bermudian Dollar
  'KYD': '🇰🇾', // Cayman Islands Dollar
  'CUC': '🇨🇺', // Cuban Convertible Peso
  'CUP': '🇨🇺', // Cuban Peso
  'FKP': '🇫🇰', // Falkland Islands Pound
  'GYD': '🇬🇾', // Guyanese Dollar
  'SRD': '🇸🇷', // Surinamese Dollar
  'XPF': '🇵🇫', // CFP Franc (French Pacific)
  
  // Other
  'RUB': '🇷🇺', // Russian Ruble
  'UAH': '🇺🇦', // Ukrainian Hryvnia
  'IRR': '🇮🇷', // Iranian Rial
  'IQD': '🇮🇶', // Iraqi Dinar
  'CVE': '🇨🇻', // Cape Verdean Escudo
  
  // Precious Metals (for zakat nisab calculations)
  'XAU': '🥇', // Gold
  'XAG': '🥈', // Silver
}

/**
 * Get flag emoji for currency code
 * Returns empty string if no flag mapping exists
 */
export function getCurrencyFlag(currencyCode: CurrencyCode): string {
  return CURRENCY_FLAGS[currencyCode.toUpperCase()] || '💱'
}

/**
 * Format currency display with flag
 * Example: "🇺🇸 United States Dollar - USD"
 */
export function formatCurrencyDisplay(currency: Currency): string {
  const flag = getCurrencyFlag(currency.code)
  return `${flag} ${currency.name} - ${currency.code}`
}

