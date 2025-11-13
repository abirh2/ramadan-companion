'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useZikr } from '@/hooks/useZikr'

export function ZikrCard() {
  const { state, currentPhrase, progress, hasTarget, isGoalReached, loading } = useZikr()

  if (loading) {
    return (
      <Link href="/zikr">
        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Zikr Counter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-semibold">Loading...</p>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href="/zikr">
      <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
            <p className={`text-2xl font-semibold ${isGoalReached ? 'text-green-600' : ''}`}>
              {state.count}
              {hasTarget && <span className="text-lg text-muted-foreground"> / {state.target}</span>}
              {!hasTarget && <span className="text-lg text-muted-foreground"> ∞</span>}
            </p>
          </div>

          {/* Progress Bar (only if has target) */}
          {hasTarget && (
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isGoalReached ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isGoalReached ? 'Goal reached!' : `${Math.round(progress)}% complete`}
              </p>
            </div>
          )}

          {/* Arabic Display */}
          <div className="pt-2 border-t">
            <p className="text-lg font-serif" dir="rtl" lang="ar">
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

