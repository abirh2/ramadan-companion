'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import type { DailyPrayerCompletion, PrayerName } from '@/types/prayer-tracking.types'

interface PrayerCheckboxesProps {
  prayerName: PrayerName
  completed: boolean
  onToggle: (prayer: PrayerName) => void
  disabled?: boolean
}

export function PrayerCheckbox({
  prayerName,
  completed,
  onToggle,
  disabled = false,
}: PrayerCheckboxesProps) {
  return (
    <button
      onClick={() => onToggle(prayerName)}
      disabled={disabled}
      className="flex items-center gap-2 p-1 rounded hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Mark ${prayerName} as ${completed ? 'incomplete' : 'completed'}`}
    >
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  )
}

interface PrayerCompletionSummaryProps {
  todayCompletion: DailyPrayerCompletion | null
}

export function PrayerCompletionSummary({ todayCompletion }: PrayerCompletionSummaryProps) {
  if (!todayCompletion) return null

  const { totalCompleted, completionRate } = todayCompletion

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-foreground">{totalCompleted}/5</span>
        <span className="text-muted-foreground">prayers completed</span>
      </div>
      {totalCompleted > 0 && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{completionRate.toFixed(0)}%</span>
        </>
      )}
    </div>
  )
}

