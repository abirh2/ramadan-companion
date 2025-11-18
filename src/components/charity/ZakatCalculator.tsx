'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calculator, Plus } from 'lucide-react'
import { CurrencySelector } from './CurrencySelector'
import { formatCurrency, getPreferredCurrency } from '@/lib/currency'
import type { ZakatCalculationInputs, ZakatCalculation } from '@/types/donation.types'
import type { CurrencyCode } from '@/types/currency.types'

interface ZakatCalculatorProps {
  onLogAsDonation: (amount: number, currency: string) => void
}

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

    return {
      totalAssets,
      totalDebts,
      netAssets,
      zakatAmount,
    }
  }

  const calculation = calculateZakat()

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, selectedCurrency)
  }

  const handleInputChange = (field: keyof ZakatCalculationInputs, value: string) => {
    const numValue = parseFloat(value) || 0
    setInputs({ ...inputs, [field]: numValue })
  }

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left flex items-center justify-between hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Zakat Calculator
            </CardTitle>
            <CardDescription className="mt-1">
              Calculate your zakat (2.5% of eligible wealth)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Currency Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <CurrencySelector
              value={selectedCurrency}
              onChange={setSelectedCurrency}
            />
            <p className="text-xs text-muted-foreground">
              Enter all amounts in {selectedCurrency}
            </p>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="cash" className="text-sm font-medium">
                Cash on Hand
              </label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputs.cash || ''}
                onChange={(e) => handleInputChange('cash', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="savings" className="text-sm font-medium">
                Savings & Investments
              </label>
              <Input
                id="savings"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputs.savings || ''}
                onChange={(e) => handleInputChange('savings', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gold" className="text-sm font-medium">
                Gold (Current Value)
              </label>
              <Input
                id="gold"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputs.gold || ''}
                onChange={(e) => handleInputChange('gold', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="silver" className="text-sm font-medium">
                Silver (Current Value)
              </label>
              <Input
                id="silver"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputs.silver || ''}
                onChange={(e) => handleInputChange('silver', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="businessAssets" className="text-sm font-medium">
                Business Assets
              </label>
              <Input
                id="businessAssets"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputs.businessAssets || ''}
                onChange={(e) => handleInputChange('businessAssets', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="debts" className="text-sm font-medium">
                Outstanding Debts
              </label>
              <Input
                id="debts"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputs.debts || ''}
                onChange={(e) => handleInputChange('debts', e.target.value)}
              />
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Assets:</span>
              <span className="font-medium">{formatAmount(calculation.totalAssets)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minus Debts:</span>
              <span className="font-medium">- {formatAmount(calculation.totalDebts)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground">Net Zakatable Wealth:</span>
              <span className="font-semibold">{formatAmount(calculation.netAssets)}</span>
            </div>
            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">Zakat Due (2.5%):</p>
                <p className="text-2xl font-bold text-primary">
                  {formatAmount(calculation.zakatAmount)}
                </p>
              </div>
              <Button
                onClick={() => onLogAsDonation(calculation.zakatAmount, selectedCurrency)}
                disabled={calculation.zakatAmount <= 0}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log as Donation
              </Button>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Note:</p>
            <p>
              Zakat is calculated at 2.5% of your net eligible wealth. This calculator provides an estimate. 
              Please consult with a qualified Islamic scholar for specific guidance on your zakat obligations.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

