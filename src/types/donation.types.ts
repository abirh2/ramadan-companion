/**
 * Donation types for Charity & Zakat Tracker
 */

/**
 * Database donation record (matches Supabase schema)
 */
export interface Donation {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  amount: number
  currency: string
  type: 'zakat' | 'sadaqah' | 'other'
  category: string | null
  charity_name: string | null
  charity_url: string | null
  date: string // ISO date string (YYYY-MM-DD)
  notes: string | null
  is_recurring: boolean
}

/**
 * Form data for adding/editing donations
 */
export interface DonationFormData {
  amount: number
  type: 'zakat' | 'sadaqah' | 'other'
  date: string // ISO date string (YYYY-MM-DD)
  charity_name?: string
  category?: string
  charity_url?: string
  notes?: string
}

/**
 * Monthly aggregated totals
 */
export interface MonthlyTotal {
  year: number
  month: number // 1-12
  monthKey: string // "YYYY-MM" format
  total: number
  count: number
  donations: Donation[]
}

/**
 * Zakat calculation inputs
 */
export interface ZakatCalculationInputs {
  cash: number
  savings: number
  gold: number
  silver: number
  businessAssets: number
  debts: number
}

/**
 * Zakat calculation result
 */
export interface ZakatCalculation {
  totalAssets: number
  totalDebts: number
  netAssets: number
  zakatAmount: number
}

/**
 * Summary totals for dashboard
 */
export interface DonationSummary {
  ramadanTotal: number
  yearlyTotal: number
  allTimeTotal: number
  totalCount: number
}

/**
 * Filters for donation queries
 */
export interface DonationFilters {
  startDate?: string
  endDate?: string
  type?: 'zakat' | 'sadaqah' | 'other'
  category?: string
}

