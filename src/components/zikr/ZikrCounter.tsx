'use client'

import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

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
  const [announcement, setAnnouncement] = useState('')
  const previousCountRef = useRef(count)
  const liveAnnouncement = isGoalReached && hasTarget
    ? `Target complete. Count ${count} of ${target}. Alhamdulillah.`
    : announcement

  useEffect(() => {
    if (count === previousCountRef.current) return
    previousCountRef.current = count

    if (isGoalReached && hasTarget) return

    const timer = window.setTimeout(() => {
      setAnnouncement(hasTarget ? `Count ${count} of ${target}` : `Count ${count}`)
    }, 650)

    return () => window.clearTimeout(timer)
  }, [count, hasTarget, isGoalReached, target])

  return (
    <div className="surface-feature relative isolate overflow-hidden">
      <button
        type="button"
        onClick={onIncrement}
        className="group flex min-h-[29rem] w-full touch-manipulation select-none flex-col items-center justify-between px-6 py-8 text-center [-webkit-tap-highlight-color:transparent] transition-colors hover:bg-white/[0.025] active:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-surface-feature-foreground sm:min-h-[32rem] sm:px-10 sm:py-10"
        aria-label={`Increment ${currentPhrase.transliteration} zikr count`}
      >
        <span className="space-y-2">
          <span className="block text-lg font-semibold tracking-[-0.015em] text-surface-feature-foreground sm:text-xl">
            {currentPhrase.transliteration}
          </span>
          <span className="block font-arabic text-[2rem] font-medium leading-[1.9] text-surface-feature-foreground sm:text-[2.35rem]" dir="rtl" lang="ar">
            {currentPhrase.arabic}
          </span>
          <span className="block text-sm leading-relaxed text-surface-feature-muted sm:text-base">
            {currentPhrase.meaning}
          </span>
        </span>

        <span className="flex flex-col items-center" aria-hidden="true">
          <span className={`text-[4.75rem] font-semibold leading-none tracking-[-0.04em] tabular-nums transition-[transform,color] duration-100 group-active:scale-[0.97] motion-reduce:group-active:scale-100 sm:text-[5.5rem] ${isGoalReached ? 'scale-[1.02] text-gold motion-reduce:scale-100' : 'text-surface-feature-foreground'}`}>
            {count}
          </span>
          <span className="my-3 h-px w-16 bg-surface-feature-muted/45" />
          <span className="text-lg font-medium tabular-nums text-surface-feature-muted">
            {hasTarget ? target : '∞'}
          </span>
        </span>

        <span className="flex min-h-12 items-center justify-center">
          {isGoalReached ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
              <Check className="h-4 w-4" aria-hidden="true" />
              Complete · Alhamdulillah
            </span>
          ) : (
            <span className="text-sm font-medium text-surface-feature-muted transition-colors group-hover:text-surface-feature-foreground">
              Tap to count
            </span>
          )}
        </span>
      </button>

      {hasTarget && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/15">
          <div
            className={`h-full transition-[width,background-color] duration-300 ease-out ${isGoalReached ? 'bg-gold' : 'bg-surface-feature-muted'}`}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-label="Zikr target progress"
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={Math.min(count, target)}
            aria-valuetext={`${Math.min(count, target)} of ${target}`}
          />
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </p>
    </div>
  )
}
