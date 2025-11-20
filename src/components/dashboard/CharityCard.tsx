'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Loader2 } from 'lucide-react'
import { ProtectedFeature } from '@/components/auth/ProtectedFeature'
import { useDonations } from '@/hooks/useDonations'

export function CharityCard() {
  const { loading, error, summary } = useDonations()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const cardAriaLabel = !loading && !error
    ? `Charity Tracker. This Ramadan: ${formatCurrency(summary.ramadanTotal)}. All time: ${formatCurrency(summary.allTimeTotal)}. ${summary.totalCount} ${summary.totalCount === 1 ? 'donation' : 'donations'} recorded. Click to view details.`
    : loading
    ? 'Loading charity tracker'
    : 'Charity Tracker card'

  return (
    <ProtectedFeature
      title="Charity Tracker"
      description="Sign in to track your sadaqah and zakat donations"
    >
      <Link href="/charity" className="block" aria-label={cardAriaLabel}>
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" role="article">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Charity Tracker
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-4" role="status">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading charity data...</span>
              </div>
            )}

            {error && !loading && (
              <div className="grid grid-cols-2 gap-3" role="alert" aria-live="polite">
                <div>
                  <p className="text-xs text-muted-foreground">This Ramadan</p>
                  <p className="text-xl font-semibold">$0.00</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">All Time</p>
                  <p className="text-xl font-semibold">$0.00</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground" id="ramadan-total-label">This Ramadan</p>
                    <p className="text-xl font-semibold" aria-labelledby="ramadan-total-label">{formatCurrency(summary.ramadanTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground" id="alltime-total-label">All Time</p>
                    <p className="text-xl font-semibold" aria-labelledby="alltime-total-label">{formatCurrency(summary.allTimeTotal)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalCount === 0
                    ? 'Track your sadaqah and zakat donations'
                    : `${summary.totalCount} ${summary.totalCount === 1 ? 'donation' : 'donations'} recorded`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </Link>
    </ProtectedFeature>
  )
}

