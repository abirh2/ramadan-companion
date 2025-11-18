'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProtectedFeature } from '@/components/auth/ProtectedFeature'
import { ArrowLeft, Heart, Plus, LayoutGrid, List, Loader2 } from 'lucide-react'
import { useDonations } from '@/hooks/useDonations'
import { DonationForm } from '@/components/charity/DonationForm'
import { MonthlyView } from '@/components/charity/MonthlyView'
import { ListViewAccordion } from '@/components/charity/ListViewAccordion'
import { ChartsSection } from '@/components/charity/ChartsSection'
import { ZakatCalculator } from '@/components/charity/ZakatCalculator'
import { RecommendedCharities } from '@/components/charity/RecommendedCharities'
import { CurrencyViewToggle } from '@/components/charity/CurrencyViewToggle'
import { CurrencyPreferenceSelector } from '@/components/charity/CurrencyPreferenceSelector'
import { deleteDonation } from '@/lib/donations'
import { useAuth } from '@/hooks/useAuth'
import { FeedbackButton } from '@/components/FeedbackButton'
import { formatCurrency } from '@/lib/currency'
import type { Donation } from '@/types/donation.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ViewMode = 'calendar' | 'list'

export default function CharityPage() {
  const { user } = useAuth()
  const {
    donations,
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
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [formOpen, setFormOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('charity_view_mode') as ViewMode | null
    if (savedView && (savedView === 'calendar' || savedView === 'list')) {
      setViewMode(savedView)
    }
  }, [])

  // Save view preference to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('charity_view_mode', mode)
  }

  const handleAddDonation = () => {
    setEditingDonation(undefined)
    setFormOpen(true)
  }

  const handleEditDonation = (donation: Donation) => {
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
    } catch (err) {
      console.error('Error deleting donation:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSuccess = async () => {
    await refetch()
  }

  const handleLogZakat = (amount: number, currency: string = preferredCurrency) => {
    setEditingDonation({
      id: '',
      user_id: '',
      created_at: '',
      updated_at: '',
      amount,
      currency,
      type: 'zakat',
      date: new Date().toISOString().split('T')[0],
      category: null,
      charity_name: null,
      charity_url: null,
      notes: 'Calculated zakat',
      is_recurring: false,
    })
    setFormOpen(true)
  }

  const formatAmount = (amount: number, currency: string) => {
    return formatCurrency(amount, currency)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Charity Tracker</h1>
        </div>
      </div>

      <ProtectedFeature
          title="Charity Tracker"
          description="Sign in to track your sadaqah, zakat, and other charitable contributions."
        >
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="rounded-xl">
              <CardContent className="p-6 text-center">
                <p className="text-destructive mb-2">Failed to load donations</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={refetch} variant="outline" size="sm">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          {!loading && !error && (
            <div className="space-y-6">
              {/* Currency Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-xl">
                <CurrencyViewToggle
                  value={currencyViewMode}
                  onChange={setCurrencyViewMode}
                  preferredCurrency={preferredCurrency}
                />
                <CurrencyPreferenceSelector
                  value={preferredCurrency}
                  onChange={setPreferredCurrency}
                />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">This Ramadan</p>
                    <p className="text-3xl font-bold">
                      {formatAmount(summary.ramadanTotal, preferredCurrency)}
                    </p>
                    {converting && (
                      <p className="text-xs text-muted-foreground mt-1">Converting...</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">This Year</p>
                    <p className="text-3xl font-bold">
                      {formatAmount(summary.yearlyTotal, preferredCurrency)}
                    </p>
                    {converting && (
                      <p className="text-xs text-muted-foreground mt-1">Converting...</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">All Time</p>
                    <p className="text-3xl font-bold">
                      {formatAmount(summary.allTimeTotal, preferredCurrency)}
                    </p>
                    {converting && (
                      <p className="text-xs text-muted-foreground mt-1">Converting...</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('calendar')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
                <Button onClick={handleAddDonation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Donation
                </Button>
              </div>

              {/* Empty State */}
              {isEmpty && (
                <Card className="rounded-xl">
                  <CardContent className="p-12 text-center space-y-4">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Start Tracking Your Charity</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Keep track of your sadaqah, zakat, and other charitable contributions.
                        Build a record of your generosity throughout the year.
                      </p>
                      <Button onClick={handleAddDonation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Donation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Monthly View */}
              {!isEmpty && viewMode === 'calendar' && (
                <MonthlyView
                  donations={displayDonations}
                  onEdit={handleEditDonation}
                  onDelete={handleDeleteDonation}
                  viewMode={currencyViewMode}
                  preferredCurrency={preferredCurrency}
                />
              )}

              {/* List View */}
              {!isEmpty && viewMode === 'list' && (
                <ListViewAccordion
                  donations={displayDonations}
                  onEdit={handleEditDonation}
                  onDelete={handleDeleteDonation}
                  viewMode={currencyViewMode}
                  preferredCurrency={preferredCurrency}
                />
              )}

              {/* Charts Section */}
              {!isEmpty && (
                <ChartsSection
                  donations={displayDonations}
                  preferredCurrency={preferredCurrency}
                />
              )}

              {/* Zakat Calculator */}
              <ZakatCalculator onLogAsDonation={handleLogZakat} />

              {/* Recommended Charities Placeholder */}
              <RecommendedCharities />
            </div>
          )}
        </ProtectedFeature>

      {/* Feedback Button */}
      <FeedbackButton pagePath="/charity" />

      {/* Donation Form Dialog */}
      <DonationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
        donation={editingDonation}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Donation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this donation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingDonation && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-semibold">
                  {formatAmount(Number(deletingDonation.amount), deletingDonation.currency)}
                </span>
                {' '}•{' '}
                <span className="capitalize">{deletingDonation.type}</span>
                {deletingDonation.charity_name && ` • ${deletingDonation.charity_name}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(deletingDonation.date).toLocaleDateString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

