'use client'

import { useEffect } from 'react'
import type { CurrencyCode } from '@/types/currency.types'
import { CurrencySelector } from './CurrencySelector'
import { getPreferredCurrency, setPreferredCurrency } from '@/lib/currency'

interface CurrencyPreferenceSelectorProps {
  value: CurrencyCode
  onChange: (currency: CurrencyCode) => void
}

export function CurrencyPreferenceSelector({
  value,
  onChange,
}: CurrencyPreferenceSelectorProps) {
  // Load initial value from localStorage on mount
  useEffect(() => {
    const savedCurrency = getPreferredCurrency()
    if (savedCurrency !== value) {
      onChange(savedCurrency)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (currency: CurrencyCode) => {
    onChange(currency)
    setPreferredCurrency(currency)
  }

  return (
    <div className="w-full sm:w-48">
      <CurrencySelector value={value} onChange={handleChange} />
    </div>
  )
}
