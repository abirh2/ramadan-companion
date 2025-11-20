'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useZikr } from '@/hooks/useZikr'

export function ZikrCard() {
  const { state, currentPhrase, progress, hasTarget, isGoalReached, loading } = useZikr()

  if (loading) {
    return (
      <Link href="/zikr" aria-label="Loading Zikr Counter">
        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer" role="article" aria-busy="true">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Zikr Counter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold" role="status">
              <span className="sr-only">Loading zikr counter...</span>
              Loading...
            </p>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const cardAriaLabel = `Zikr Counter. ${currentPhrase.transliteration}. Count: ${state.count}${hasTarget ? ` of ${state.target}` : ''}. ${isGoalReached ? 'Goal reached!' : hasTarget ? `${Math.round(progress)} percent complete` : ''}. Click to increment counter.`

  return (
    <Link href="/zikr" aria-label={cardAriaLabel}>
      <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer" role="article">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Zikr Counter
          </CardTitle>
          <CardDescription className="text-xs">
            {currentPhrase.transliteration}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Count Display */}
          <div>
            <p className={`text-2xl font-semibold ${isGoalReached ? 'text-green-600' : ''}`} aria-live="polite" aria-atomic="true">
              <span className="sr-only">Count: </span>
              {state.count}
              {hasTarget && <span className="text-lg text-muted-foreground" aria-label={`of ${state.target}`}> / {state.target}</span>}
              {!hasTarget && <span className="text-lg text-muted-foreground" aria-label="No target set"> ∞</span>}
            </p>
          </div>

          {/* Progress Bar (only if has target) */}
          {hasTarget && (
            <div className="space-y-1">
              <div 
                className="w-full bg-muted rounded-full h-2 overflow-hidden" 
                role="progressbar" 
                aria-valuenow={Math.round(progress)} 
                aria-valuemin={0} 
                aria-valuemax={100}
                aria-label="Zikr progress"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    isGoalReached ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {isGoalReached ? 'Goal reached!' : `${Math.round(progress)}% complete`}
              </p>
            </div>
          )}

          {/* Arabic Display */}
          <div className="pt-2 border-t">
            <p className="text-lg font-serif" dir="rtl" lang="ar" aria-label={`Arabic: ${currentPhrase.arabic}`}>
              {currentPhrase.arabic}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPhrase.meaning}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

