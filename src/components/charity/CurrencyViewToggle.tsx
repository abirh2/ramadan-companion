'use client'

import { useState, useEffect } from 'react'
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
    <div className="flex gap-2">
      <Button
        variant={value === 'original' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleToggle('original')}
        type="button"
      >
        Original Currencies
      </Button>
      <Button
        variant={value === 'converted' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleToggle('converted')}
        type="button"
      >
        Convert to {preferredCurrency}
      </Button>
    </div>
  )
}

