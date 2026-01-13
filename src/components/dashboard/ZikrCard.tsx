'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useZikr } from '@/hooks/useZikr'

export function ZikrCard() {
  const { state, currentPhrase, progress, hasTarget, isGoalReached, loading } = useZikr()

  if (loading) {
    return (
      <Link href="/zikr" aria-label="Loading Zikr Counter">
        <Card className="rounded-3xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer" role="article" aria-busy="true">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
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
      <Card className="rounded-3xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer" role="article">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Zikr Counter
          </CardTitle>
          <CardDescription className="text-xs">
            {currentPhrase.transliteration}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Count Display and Arabic */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">{currentPhrase.transliteration}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${isGoalReached ? 'text-green-600' : ''}`} aria-live="polite" aria-atomic="true">
                  {state.count}
                </span>
                {hasTarget && <span className="text-xl text-muted-foreground" aria-label={`of ${state.target}`}> / {state.target}</span>}
                {!hasTarget && <span className="text-xl text-muted-foreground" aria-label="No target set"> ∞</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-serif text-primary" dir="rtl" lang="ar" aria-label={`Arabic: ${currentPhrase.arabic}`}>
                {currentPhrase.arabic}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                {currentPhrase.meaning}
              </p>
            </div>
          </div>

          {/* Progress Bar (only if has target) */}
          {hasTarget && (
            <div className="space-y-2">
              <div 
                className="w-full bg-muted rounded-full h-2 overflow-hidden" 
                role="progressbar" 
                aria-valuenow={Math.round(progress)} 
                aria-valuemin={0} 
                aria-valuemax={100}
                aria-label="Zikr progress"
              >
                <div
                  className={`h-full transition-all duration-500 ${
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
        </CardContent>
      </Card>
    </Link>
  )
}

