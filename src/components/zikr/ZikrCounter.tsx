'use client'

import { Infinity } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ZikrCounterProps {
  count: number
  target: number | null
  progress: number
  isGoalReached: boolean
  currentPhrase: {
    arabic: string
    transliteration: string
    meaning: string
  }
  onIncrement: () => void
}

export function ZikrCounter({
  count,
  target,
  progress,
  isGoalReached,
  currentPhrase,
  onIncrement,
}: ZikrCounterProps) {
  const hasTarget = target !== null && target > 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Space or Enter to increment
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onIncrement()
    }
  }

  return (
    <Card className="rounded-2xl border shadow-sm p-8">
      <div className="flex flex-col items-center space-y-6">
        {/* Arabic Phrase */}
        <div className="text-center">
          <p className="text-3xl font-semibold mb-2" dir="rtl" lang="ar" aria-label={`Arabic: ${currentPhrase.arabic}`}>
            {currentPhrase.arabic}
          </p>
          <p className="text-sm text-muted-foreground">{currentPhrase.transliteration}</p>
          <p className="text-xs text-muted-foreground mt-1">{currentPhrase.meaning}</p>
        </div>

        {/* Circular Counter */}
        <button
          onClick={onIncrement}
          onKeyDown={handleKeyDown}
          className="relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-transform active:scale-95"
          aria-label={`Increment zikr count. Current count: ${count}${hasTarget ? ` of ${target}` : ''}. Press spacebar or enter to increment.`}
          title="Press spacebar or click to count"
        >
          {/* SVG Progress Ring */}
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/20"
            />
            
            {/* Progress circle (only show if has target) */}
            {hasTarget && (
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-300 ${
                  isGoalReached ? 'text-green-500' : 'text-primary'
                }`}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Count Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-6xl font-bold transition-colors ${
              isGoalReached ? 'text-green-500' : 'text-foreground'
            }`}>
              {count}
            </div>
            
            {/* Target or Infinity Symbol */}
            {hasTarget ? (
              <div className="text-lg text-muted-foreground mt-2">
                of {target}
              </div>
            ) : (
              <div className="mt-2 text-muted-foreground">
                <Infinity className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Tap/Keyboard prompt */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
            <span className="hidden sm:inline">Click or press Space</span>
            <span className="sm:hidden">Tap to count</span>
          </div>
        </button>

        {/* Goal Reached Message */}
        {isGoalReached && (
          <div 
            className="text-center text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in duration-300"
            role="status"
            aria-live="polite"
          >
            Goal reached! Alhamdulillah
          </div>
        )}

        {/* Progress Percentage (only if has target) */}
        {hasTarget && !isGoalReached && (
          <div className="text-center text-xs text-muted-foreground" aria-live="polite" aria-atomic="false">
            {Math.round(progress)}% complete
          </div>
        )}
      </div>
    </Card>
  )
}

