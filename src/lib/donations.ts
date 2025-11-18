import { createClient } from '@/lib/supabase/client'
import type { Donation, DonationFormData, DonationFilters, MonthlyTotal } from '@/types/donation.types'

/**
 * Get all donations for a user with optional filters
 */
export async function getDonations(
  userId: string,
  filters?: DonationFilters
): Promise<{ donations: Donation[]; error?: string }> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    // Apply filters if provided
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching donations:', error)
      return { donations: [], error: error.message }
    }

    return { donations: data || [] }
  } catch (error) {
    console.error('Error fetching donations:', error)
    return {
      donations: [],
      error: error instanceof Error ? error.message : 'Failed to fetch donations',
    }
  }
}

/**
 * Add a new donation
 */
export async function addDonation(
  userId: string,
  data: DonationFormData
): Promise<{ success: boolean; donation?: Donation; error?: string }> {
  try {
    const supabase = createClient()

    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        user_id: userId,
        amount: data.amount,
        currency: data.currency || 'USD',
        type: data.type,
        date: data.date,
        charity_name: data.charity_name || null,
        category: data.category || null,
        charity_url: data.charity_url || null,
        notes: data.notes || null,
        is_recurring: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding donation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, donation }
  } catch (error) {
    console.error('Error adding donation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add donation',
    }
  }
}

/**
 * Update an existing donation
 */
export async function updateDonation(
  donationId: string,
  userId: string,
  data: DonationFormData
): Promise<{ success: boolean; donation?: Donation; error?: string }> {
  try {
    const supabase = createClient()

    const { data: donation, error } = await supabase
      .from('donations')
      .update({
        amount: data.amount,
        currency: data.currency || 'USD',
        type: data.type,
        date: data.date,
        charity_name: data.charity_name || null,
        category: data.category || null,
        charity_url: data.charity_url || null,
        notes: data.notes || null,
      })
      .eq('id', donationId)
      .eq('user_id', userId) // RLS check
      .select()
      .single()

    if (error) {
      console.error('Error updating donation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, donation }
  } catch (error) {
    console.error('Error updating donation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update donation',
    }
  }
}

/**
 * Delete a donation
 */
export async function deleteDonation(
  donationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', donationId)
      .eq('user_id', userId) // RLS check

    if (error) {
      console.error('Error deleting donation:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting donation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete donation',
    }
  }
}

/**
 * Get monthly totals for a date range
 */
export async function getMonthlyTotals(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ monthlyTotals: MonthlyTotal[]; error?: string }> {
  try {
    const { donations, error } = await getDonations(userId, { startDate, endDate })

    if (error) {
      return { monthlyTotals: [], error }
    }

    // Group donations by month
    const monthlyMap = new Map<string, MonthlyTotal>()

    donations.forEach((donation) => {
      const date = new Date(donation.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 1-12
      const monthKey = `${year}-${String(month).padStart(2, '0')}`

      const existing = monthlyMap.get(monthKey)
      if (existing) {
        existing.total += Number(donation.amount)
        existing.count += 1
        existing.donations.push(donation)
      } else {
        monthlyMap.set(monthKey, {
          year,
          month,
          monthKey,
          total: Number(donation.amount),
          count: 1,
          donations: [donation],
        })
      }
    })

    // Convert to array and sort by date (most recent first)
    const monthlyTotals = Array.from(monthlyMap.values()).sort((a, b) => {
      return b.monthKey.localeCompare(a.monthKey)
    })

    return { monthlyTotals }
  } catch (error) {
    console.error('Error calculating monthly totals:', error)
    return {
      monthlyTotals: [],
      error: error instanceof Error ? error.message : 'Failed to calculate monthly totals',
    }
  }
}

/**
 * Get Ramadan total for current Ramadan period
 */
export async function getRamadanTotal(
  userId: string,
  ramadanStartDate?: string,
  ramadanEndDate?: string
): Promise<{ total: number; error?: string }> {
  try {
    // If dates not provided, we'll fetch all donations and let the hook calculate
    // based on Hijri calendar data
    const filters: DonationFilters = {}
    if (ramadanStartDate) {
      filters.startDate = ramadanStartDate
    }
    if (ramadanEndDate) {
      filters.endDate = ramadanEndDate
    }

    const { donations, error } = await getDonations(userId, filters)

    if (error) {
      return { total: 0, error }
    }

    const total = donations.reduce((sum, donation) => sum + Number(donation.amount), 0)

    return { total }
  } catch (error) {
    console.error('Error calculating Ramadan total:', error)
    return {
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to calculate Ramadan total',
    }
  }
}

