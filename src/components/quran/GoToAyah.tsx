'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GoToAyahProps {
  surahNumber: number
  totalAyahs: number
}

export function GoToAyah({ surahNumber, totalAyahs }: GoToAyahProps) {
  const router = useRouter()
  const [ayahInput, setAyahInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const errorId = useId()

  const rangeMessage = `Enter a number from 1 to ${totalAyahs}.`

  const handleGo = () => {
    const trimmed = ayahInput.trim()

    // Reject non-numeric / non-integer input without navigating.
    const isInteger = /^\d+$/.test(trimmed)
    const ayahNum = Number(trimmed)

    if (!isInteger || ayahNum < 1 || ayahNum > totalAyahs) {
      // Retain the current position; do not navigate on invalid input.
      setError(rangeMessage)
      return
    }

    setError(null)
    router.push(`/quran/${surahNumber}?ayah=${ayahNum}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleGo()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAyahInput(e.target.value)
    // Clear a stale message as the reader corrects the input.
    if (error) setError(null)
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'inline-flex min-h-touch items-center gap-1 rounded-control border bg-surface-primary pl-3 pr-0.5 transition-colors',
          error
            ? 'border-destructive'
            : 'border-border-subtle focus-within:border-border-strong'
        )}
      >
        <label
          htmlFor={`${errorId}-input`}
          className="type-caption text-text-tertiary select-none"
        >
          Ayah
        </label>
        <input
          id={`${errorId}-input`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder={`1–${totalAyahs}`}
          value={ayahInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label={`Go to ayah, from 1 to ${totalAyahs}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-h-touch w-16 border-0 bg-transparent p-0 type-body text-text-primary placeholder:text-text-tertiary/70 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleGo}
          aria-label="Go to ayah"
          className="inline-flex size-touch items-center justify-center rounded-control-sm bg-primary text-primary-foreground transition-colors hover:bg-teal-hover active:bg-teal-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p id={errorId} role="alert" aria-live="polite" className="type-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
