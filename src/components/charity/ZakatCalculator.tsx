'use client'

import { useState } from 'react'
import { Calculator, ChevronDown, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CurrencySelector } from './CurrencySelector'
import { formatCurrency, getPreferredCurrency } from '@/lib/currency'
import type { ZakatCalculationInputs, ZakatCalculation } from '@/types/donation.types'
import type { CurrencyCode } from '@/types/currency.types'

interface ZakatCalculatorProps {
  onLogAsDonation: (amount: number, currency: string) => void
}

const inputFields: Array<{ key: keyof ZakatCalculationInputs; label: string }> = [
  { key: 'cash', label: 'Cash on hand' },
  { key: 'savings', label: 'Savings & investments' },
  { key: 'gold', label: 'Gold (current value)' },
  { key: 'silver', label: 'Silver (current value)' },
  { key: 'businessAssets', label: 'Business assets' },
  { key: 'debts', label: 'Outstanding debts' },
]

export function ZakatCalculator({ onLogAsDonation }: ZakatCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(getPreferredCurrency())
  const [inputs, setInputs] = useState<ZakatCalculationInputs>({
    cash: 0,
    savings: 0,
    gold: 0,
    silver: 0,
    businessAssets: 0,
    debts: 0,
  })

  const calculateZakat = (): ZakatCalculation => {
    const totalAssets = inputs.cash + inputs.savings + inputs.gold + inputs.silver + inputs.businessAssets
    const totalDebts = inputs.debts
    const netAssets = totalAssets - totalDebts
    const zakatAmount = netAssets > 0 ? netAssets * 0.025 : 0

    return { totalAssets, totalDebts, netAssets, zakatAmount }
  }

  const calculation = calculateZakat()

  const handleInputChange = (field: keyof ZakatCalculationInputs, value: string) => {
    const numValue = parseFloat(value) || 0
    setInputs({ ...inputs, [field]: numValue })
  }

  return (
    <section className="overflow-hidden rounded-surface border border-border-subtle bg-surface-primary" aria-labelledby="zakat-calculator-title">
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        aria-controls="zakat-calculator-content"
        className="flex min-h-20 w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-grouped focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-gold-muted text-gold">
          <Calculator className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span id="zakat-calculator-title" className="block font-semibold text-text-primary">Zakat calculator</span>
          <span className="type-caption mt-1 block text-text-secondary">Estimate 2.5% of the eligible wealth you enter.</span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isExpanded && (
        <div id="zakat-calculator-content" className="border-t border-border-subtle px-5 py-6 sm:px-6">
          <div className="mb-6 max-w-48">
            <CurrencySelector value={selectedCurrency} onChange={setSelectedCurrency} />
            <p className="type-caption mt-2 text-text-secondary">Enter every amount in {selectedCurrency}.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {inputFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label htmlFor={`zakat-${field.key}`} className="type-label text-text-secondary">{field.label}</label>
                <Input
                  id={`zakat-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={inputs[field.key] || ''}
                  onChange={(event) => handleInputChange(field.key, event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border-subtle pt-5">
            <dl className="space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-text-secondary">Total assets</dt>
                <dd className="font-medium tabular-nums text-text-primary">{formatCurrency(calculation.totalAssets, selectedCurrency)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-text-secondary">Minus debts</dt>
                <dd className="font-medium tabular-nums text-text-primary">− {formatCurrency(calculation.totalDebts, selectedCurrency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border-subtle pt-3 text-sm">
                <dt className="text-text-secondary">Net zakatable wealth</dt>
                <dd className="font-semibold tabular-nums text-text-primary">{formatCurrency(calculation.netAssets, selectedCurrency)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-4 rounded-grouped border border-gold/25 bg-gold-muted p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="type-caption text-text-secondary">Estimated Zakat due (2.5%)</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-gold">{formatCurrency(calculation.zakatAmount, selectedCurrency)}</p>
              </div>
              <Button onClick={() => onLogAsDonation(calculation.zakatAmount, selectedCurrency)} disabled={calculation.zakatAmount <= 0}>
                <Plus className="size-4" aria-hidden="true" />
                Add to giving history
              </Button>
            </div>
          </div>

          <p className="type-caption mt-5 text-text-secondary">
            This is an estimate based on the existing 2.5% calculation. Consult a qualified Islamic scholar for guidance specific to your circumstances.
          </p>
        </div>
      )}
    </section>
  )
}
