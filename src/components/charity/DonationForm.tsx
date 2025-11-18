'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { addDonation, updateDonation } from '@/lib/donations'
import { useAuth } from '@/hooks/useAuth'
import { getPreferredCurrency } from '@/lib/currency'
import { CurrencySelector } from '@/components/charity/CurrencySelector'
import type { Donation, DonationFormData } from '@/types/donation.types'

interface DonationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  donation?: Donation // If provided, form is in edit mode
}

export function DonationForm({ open, onOpenChange, onSuccess, donation }: DonationFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = !!donation

  // Form state
  const [formData, setFormData] = useState<DonationFormData>({
    amount: donation?.amount || 0,
    currency: donation?.currency || getPreferredCurrency(),
    type: donation?.type || 'sadaqah',
    date: donation?.date || new Date().toISOString().split('T')[0],
    charity_name: donation?.charity_name || '',
    category: donation?.category || '',
    charity_url: donation?.charity_url || '',
    notes: donation?.notes || '',
  })

  // Reset form when dialog opens/closes or donation changes
  useEffect(() => {
    if (open) {
      setFormData({
        amount: donation?.amount || 0,
        currency: donation?.currency || getPreferredCurrency(),
        type: donation?.type || 'sadaqah',
        date: donation?.date || new Date().toISOString().split('T')[0],
        charity_name: donation?.charity_name || '',
        category: donation?.category || '',
        charity_url: donation?.charity_url || '',
        notes: donation?.notes || '',
      })
      setError(null)
    }
  }, [open, donation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      if (isEditMode && donation) {
        result = await updateDonation(donation.id, user.id, formData)
      } else {
        result = await addDonation(user.id, formData)
      }

      if (result.success) {
        onSuccess()
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to save donation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Donation' : 'Add Donation'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of your donation.'
              : 'Track your sadaqah, zakat, or other charitable contributions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                Currency <span className="text-destructive">*</span>
              </label>
              <CurrencySelector
                value={formData.currency || 'USD'}
                onChange={(currency) => setFormData({ ...formData, currency })}
                disabled={loading}
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type <span className="text-destructive">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'zakat' | 'sadaqah' | 'other' })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="sadaqah">Sadaqah</option>
              <option value="zakat">Zakat</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date <span className="text-destructive">*</span>
            </label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Charity Name */}
          <div className="space-y-2">
            <label htmlFor="charity_name" className="text-sm font-medium">
              Charity Name
            </label>
            <Input
              id="charity_name"
              type="text"
              placeholder="e.g., Islamic Relief, Local Masjid"
              value={formData.charity_name || ''}
              onChange={(e) => setFormData({ ...formData, charity_name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., Education, Food, Medical"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              placeholder="Optional notes about this donation"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update' : 'Add'} Donation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

