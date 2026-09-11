'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { addDonation, updateDonation } from '@/lib/donations'
import { useAuth } from '@/hooks/useAuth'
import { getPreferredCurrency } from '@/lib/currency'
import { CurrencySelector } from '@/components/charity/CurrencySelector'
import type { Donation, DonationFormData } from '@/types/donation.types'

interface DonationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  donation?: Donation
  initialValues?: Partial<DonationFormData>
}

function initialFormData(donation?: Donation, initialValues?: Partial<DonationFormData>): DonationFormData {
  return {
    amount: donation?.amount || initialValues?.amount || 0,
    currency: donation?.currency || initialValues?.currency || getPreferredCurrency(),
    type: donation?.type || initialValues?.type || 'sadaqah',
    date: donation?.date || initialValues?.date || new Date().toISOString().split('T')[0],
    charity_name: donation?.charity_name || initialValues?.charity_name || '',
    category: donation?.category || initialValues?.category || '',
    charity_url: donation?.charity_url || initialValues?.charity_url || '',
    notes: donation?.notes || initialValues?.notes || '',
  }
}

export function DonationForm({ open, onOpenChange, onSuccess, donation, initialValues }: DonationFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [formData, setFormData] = useState<DonationFormData>(() => initialFormData(donation, initialValues))
  const isEditMode = !!donation

  useEffect(() => {
    if (open) {
      setFormData(initialFormData(donation, initialValues))
      setError(null)
      setAmountError(null)
    }
  }, [open, donation, initialValues])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    if (formData.amount <= 0) {
      setAmountError('Enter an amount greater than 0.')
      return
    }

    setLoading(true)
    setError(null)
    setAmountError(null)

    try {
      const result = isEditMode && donation
        ? await updateDonation(donation.id, user.id, formData)
        : await addDonation(user.id, formData)

      if (result.success) {
        await onSuccess()
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to save contribution')
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const title = isEditMode ? 'Edit contribution' : 'Add contribution'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 text-left sm:px-6">
          <SheetTitle className="type-section-title pr-12 text-text-primary">{title}</SheetTitle>
          <SheetDescription className="type-body-secondary text-text-secondary">
            {isEditMode ? 'Update this entry in your giving history.' : 'Add an entry to your giving history.'}
          </SheetDescription>
        </SheetHeader>

        <form noValidate onSubmit={handleSubmit} aria-label={`${title} form`} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-3">
              <div className="space-y-2">
                <label htmlFor="amount" className="type-label text-text-secondary">
                  Amount <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(event) => {
                    setFormData({ ...formData, amount: parseFloat(event.target.value) || 0 })
                    if (amountError) setAmountError(null)
                  }}
                  required
                  autoFocus
                  aria-required="true"
                  aria-invalid={!!amountError}
                  aria-describedby={amountError ? 'amount-error' : undefined}
                />
                {amountError && (
                  <p id="amount-error" className="type-caption text-destructive" role="alert">
                    {amountError}
                  </p>
                )}
              </div>

              <CurrencySelector
                value={formData.currency || 'USD'}
                onChange={(currency) => setFormData({ ...formData, currency })}
                disabled={loading}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="type" className="type-label text-text-secondary">
                  Type <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(event) => setFormData({ ...formData, type: event.target.value as DonationFormData['type'] })}
                  className="h-11 w-full rounded-control border border-border-strong bg-surface-primary px-3 text-base text-text-primary outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 md:text-sm"
                  required
                  aria-required="true"
                >
                  <option value="sadaqah">Sadaqah</option>
                  <option value="zakat">Zakat</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="type-label text-text-secondary">
                  Date <span aria-hidden="true" className="text-destructive">*</span>
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="charity_name" className="type-label text-text-secondary">
                Charity or recipient <span className="font-normal text-text-tertiary">Optional</span>
              </label>
              <Input id="charity_name" name="charity_name" type="text" placeholder="Local masjid, relief fund…" value={formData.charity_name || ''} onChange={(event) => setFormData({ ...formData, charity_name: event.target.value })} />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="type-label text-text-secondary">
                Category <span className="font-normal text-text-tertiary">Optional</span>
              </label>
              <Input id="category" name="category" type="text" placeholder="Food, education, medical…" value={formData.category || ''} onChange={(event) => setFormData({ ...formData, category: event.target.value })} />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="type-label text-text-secondary">
                Note <span className="font-normal text-text-tertiary">Optional</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Add a private note"
                value={formData.notes || ''}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                className="min-h-24 w-full resize-y rounded-control border border-border-strong bg-surface-primary px-3 py-2.5 text-base text-text-primary outline-none transition-[border-color,box-shadow] placeholder:text-text-tertiary focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 md:text-sm"
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-control bg-destructive-muted p-3 text-sm text-destructive" role="alert" aria-live="polite">
                {error}
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-border-subtle bg-surface-elevated px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} aria-label={loading ? 'Saving contribution' : title}>
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isEditMode ? 'Save changes' : 'Add contribution'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
