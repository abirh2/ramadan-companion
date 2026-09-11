'use client'

import { useState, useEffect } from 'react'
import type { Currency, CurrencyCode } from '@/types/currency.types'
import { getCurrencyFlag } from '@/types/currency.types'
import { fetchCurrencyList } from '@/lib/currency'
import { Loader2 } from 'lucide-react'
import { SelectionSheet } from '@/components/ui/selection-sheet'

interface CurrencySelectorProps {
  value: CurrencyCode
  onChange: (currency: CurrencyCode) => void
  className?: string
  disabled?: boolean
}

export function CurrencySelector({
  value,
  onChange,
  className = '',
  disabled = false,
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch currency list on mount
  useEffect(() => {
    async function loadCurrencies() {
      try {
        setLoading(true)
        const data = await fetchCurrencyList()
        setCurrencies(data)
        setError(null)
      } catch (err) {
        console.error('Error loading currencies:', err)
        setError('Failed to load currencies')
      } finally {
        setLoading(false)
      }
    }

    loadCurrencies()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading currencies...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <SelectionSheet
      label="Currency"
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      searchable
      triggerRole="button"
      triggerClassName={className}
      searchPlaceholder="Search currencies…"
      emptyText="No currencies found"
      description="Choose the currency used for donation and zakat amounts."
      options={currencies.map((currency) => ({
        value: currency.code,
        title: currency.code,
        subtitle: currency.name,
        searchText: currency.name,
        trailing: (
          <span className="text-lg" aria-hidden="true">
            {getCurrencyFlag(currency.code)}
          </span>
        ),
      }))}
    />
  )
}
