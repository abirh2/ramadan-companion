'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getViewMode, setViewMode } from '@/lib/currency'
import type { CurrencyViewMode } from '@/types/donation.types'

interface CurrencyViewToggleProps {
  value: CurrencyViewMode
  onChange: (mode: CurrencyViewMode) => void
  preferredCurrency?: string
}

export function CurrencyViewToggle({
  value,
  onChange,
  preferredCurrency = 'USD',
}: CurrencyViewToggleProps) {
  // Load initial value from localStorage on mount
  useEffect(() => {
    const savedMode = getViewMode()
    if (savedMode !== value) {
      onChange(savedMode)
    }
  }, [])// eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (mode: CurrencyViewMode) => {
    onChange(mode)
    setViewMode(mode)
  }

  return (
    <div className="inline-flex rounded-control border border-border-subtle bg-surface-primary p-1" role="group" aria-label="Amount display currency">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleToggle('original')}
        type="button"
        aria-pressed={value === 'original'}
        className={value === 'original' ? 'bg-teal-muted text-teal hover:bg-teal-muted' : 'text-text-secondary'}
      >
        Original
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleToggle('converted')}
        type="button"
        aria-pressed={value === 'converted'}
        className={value === 'converted' ? 'bg-teal-muted text-teal hover:bg-teal-muted' : 'text-text-secondary'}
      >
        In {preferredCurrency}
      </Button>
    </div>
  )
}
