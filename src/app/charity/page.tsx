'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProtectedFeature } from '@/components/auth/ProtectedFeature'
import { useDonations } from '@/hooks/useDonations'
import { DonationForm } from '@/components/charity/DonationForm'
import { ListViewAccordion } from '@/components/charity/ListViewAccordion'
import { ZakatCalculator } from '@/components/charity/ZakatCalculator'
import { CurrencyViewToggle } from '@/components/charity/CurrencyViewToggle'
import { CurrencyPreferenceSelector } from '@/components/charity/CurrencyPreferenceSelector'
import { deleteDonation } from '@/lib/donations'
import { useAuth } from '@/hooks/useAuth'
import { FeedbackButton } from '@/components/FeedbackButton'
import { formatCurrency } from '@/lib/currency'
import type { Donation, DonationFormData } from '@/types/donation.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function CharityPage() {
  const { user } = useAuth()
  const {
    displayDonations,
    loading,
    error,
    refetch,
    isEmpty,
    summary,
    viewMode: currencyViewMode,
    setViewMode: setCurrencyViewMode,
    preferredCurrency,
    setPreferredCurrency,
    converting,
  } = useDonations()
  const [formOpen, setFormOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | undefined>()
  const [formInitialValues, setFormInitialValues] = useState<Partial<DonationFormData> | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddDonation = () => {
    setEditingDonation(undefined)
    setFormInitialValues(undefined)
    setFormOpen(true)
  }

  const handleEditDonation = (donation: Donation) => {
    setFormInitialValues(undefined)
    setEditingDonation(donation)
    setFormOpen(true)
  }

  const handleDeleteDonation = (donation: Donation) => {
    setDeletingDonation(donation)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingDonation || !user) return

    setIsDeleting(true)
    try {
      const result = await deleteDonation(deletingDonation.id, user.id)
      if (result.success) {
        await refetch()
        setDeleteDialogOpen(false)
        setDeletingDonation(null)
      } else {
        console.error('Failed to delete donation:', result.error)
      }
    } catch (caughtError) {
      console.error('Error deleting donation:', caughtError)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogZakat = (amount: number, currency: string = preferredCurrency) => {
    setEditingDonation(undefined)
    setFormInitialValues({
      amount,
      currency,
      type: 'zakat',
      date: new Date().toISOString().split('T')[0],
      notes: 'Calculated zakat',
    })
    setFormOpen(true)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <Link
          href="/more"
          className="type-nav mb-3 inline-flex min-h-11 items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Navigate back to More"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to More
        </Link>
        <h1 className="type-page-title text-text-primary">Charity</h1>
        <p className="type-body-secondary mt-2 text-text-secondary">Giving, simplified.</p>
      </header>

      <ProtectedFeature
        title="Keep a private record of your giving"
        description="Sign in to save contributions securely and review them across devices."
      >
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16" role="status" aria-live="polite">
            <Loader2 className="size-5 animate-spin text-teal" aria-hidden="true" />
            <span className="type-body-secondary text-text-secondary">Loading your giving history…</span>
          </div>
        )}

        {error && !loading && (
          <Card role="alert" aria-live="assertive" variant="grouped">
            <CardContent className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className="font-semibold text-text-primary">Your giving history could not be loaded.</p>
                <p className="type-body-secondary mt-1 text-text-secondary">{error}</p>
              </div>
              <Button onClick={refetch} variant="outline" className="mt-4 sm:mt-0">Try again</Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            <section className="surface-feature overflow-hidden p-5 sm:p-6" aria-labelledby="giving-summary-title">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p id="giving-summary-title" className="type-nav text-surface-feature-muted">This year</p>
                  <p className="type-feature-number mt-3 text-surface-feature-foreground" aria-live="polite">
                    {formatCurrency(summary.yearlyTotal, preferredCurrency)}
                  </p>
                  <p className="type-body-secondary mt-2 text-surface-feature-muted">
                    given · {summary.totalCount} total {summary.totalCount === 1 ? 'contribution' : 'contributions'}
                  </p>
                  {converting && <p className="type-caption mt-2 text-surface-feature-muted">Updating converted amounts…</p>}
                </div>
                <Button
                  onClick={handleAddDonation}
                  className="min-h-11 bg-white/10 text-surface-feature-foreground hover:bg-white/15 focus-visible:ring-gold sm:mt-1"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add contribution
                </Button>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
                <div>
                  <dt className="type-caption text-surface-feature-muted">This Ramadan</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-surface-feature-foreground">
                    {formatCurrency(summary.ramadanTotal, preferredCurrency)}
                  </dd>
                </div>
                <div>
                  <dt className="type-caption text-surface-feature-muted">All time</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-surface-feature-foreground">
                    {formatCurrency(summary.allTimeTotal, preferredCurrency)}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="currency-options-title">
              <div className="surface-grouped flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="currency-options-title" className="type-label text-text-primary">Amount display</h2>
                  <p className="type-caption mt-1 text-text-secondary">Keep original currencies or compare everything in one currency.</p>
                </div>
                <div className="flex flex-col gap-3 sm:items-end">
                  <CurrencyViewToggle value={currencyViewMode} onChange={setCurrencyViewMode} preferredCurrency={preferredCurrency} />
                  {currencyViewMode === 'converted' && (
                    <CurrencyPreferenceSelector value={preferredCurrency} onChange={setPreferredCurrency} />
                  )}
                </div>
              </div>
            </section>

            <section aria-labelledby="recent-giving-title">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 id="recent-giving-title" className="type-section-title text-text-primary">Recent Giving</h2>
                  {!isEmpty && <p className="type-body-secondary mt-1 text-text-secondary">Your contributions, grouped by month.</p>}
                </div>
                {!isEmpty && (
                  <Button onClick={handleAddDonation} variant="outline" className="shrink-0">
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Add contribution</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                )}
              </div>

              {isEmpty ? (
                <div className="rounded-surface border border-border-subtle bg-surface-primary px-5 py-10 text-center">
                  <h3 className="font-semibold text-text-primary">Your giving history will appear here.</h3>
                  <p className="type-body-secondary mx-auto mt-2 max-w-md text-text-secondary">
                    Add a contribution when you are ready. You can edit or remove it later.
                  </p>
                  <Button onClick={handleAddDonation} className="mt-5">
                    <Plus className="size-4" aria-hidden="true" />
                    Add contribution
                  </Button>
                </div>
              ) : (
                <ListViewAccordion
                  donations={displayDonations}
                  onEdit={handleEditDonation}
                  onDelete={handleDeleteDonation}
                  viewMode={currencyViewMode}
                  preferredCurrency={preferredCurrency}
                />
              )}
            </section>

            <ZakatCalculator onLogAsDonation={handleLogZakat} />
          </div>
        )}
      </ProtectedFeature>

      <FeedbackButton pagePath="/charity" />

      <DonationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={refetch}
        donation={editingDonation}
        initialValues={formInitialValues}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete contribution?</DialogTitle>
            <DialogDescription>
              This entry will be permanently removed from your giving history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingDonation && (
            <div className="rounded-grouped border border-border-subtle bg-surface-grouped p-4">
              <p className="font-semibold tabular-nums text-text-primary">
                {formatCurrency(Number(deletingDonation.amount), deletingDonation.currency)}
              </p>
              <p className="type-caption mt-1 capitalize text-text-secondary">
                {deletingDonation.type}
                {deletingDonation.charity_name && ` · ${deletingDonation.charity_name}`}
                {` · ${new Date(`${deletingDonation.date}T12:00:00`).toLocaleDateString()}`}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Delete contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
