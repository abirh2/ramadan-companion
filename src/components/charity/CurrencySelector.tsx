'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Currency, CurrencyCode } from '@/types/currency.types'
import { getCurrencyFlag, formatCurrencyDisplay } from '@/types/currency.types'
import { fetchCurrencyList } from '@/lib/currency'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

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

  // Filter currencies based on search query
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencies

    const query = searchQuery.toLowerCase()
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query)
    )
  }, [currencies, searchQuery])

  // Get selected currency info
  const selectedCurrency = currencies.find((c) => c.code === value)

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
    <div className="relative">
      {/* Selected value display (acts as dropdown trigger) */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="flex items-center gap-2">
          {selectedCurrency ? (
            <>
              <span>{getCurrencyFlag(selectedCurrency.code)}</span>
              <span>{selectedCurrency.code}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-muted-foreground">{selectedCurrency.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select currency</span>
          )}
        </span>
        <svg
          className="h-4 w-4 opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-hidden rounded-md border border-input bg-popover shadow-lg">
            {/* Search input */}
            <div className="border-b border-input p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-8"
                  autoFocus
                />
              </div>
            </div>

            {/* Currency list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCurrencies.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No currencies found
                </div>
              ) : (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => {
                      onChange(currency.code)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                      currency.code === value ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="text-lg">{getCurrencyFlag(currency.code)}</span>
                    <span className="font-medium">{currency.code}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="flex-1 text-left text-muted-foreground">
                      {currency.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

