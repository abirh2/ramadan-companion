'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react'
import type { Donation } from '@/types/donation.types'

interface MonthlyViewProps {
  donations: Donation[]
  onEdit: (donation: Donation) => void
  onDelete: (donation: Donation) => void
}

interface MonthData {
  year: number
  month: number // 1-12
  monthName: string
  total: number
  count: number
  donations: Donation[]
}

export function MonthlyView({ donations, onEdit, onDelete }: MonthlyViewProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  // Generate all 12 months for selected year
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Group donations by month
  const monthlyData: MonthData[] = monthNames.map((monthName, index) => {
    const month = index + 1
    const monthDonations = donations.filter((d) => {
      const date = new Date(d.date)
      return date.getFullYear() === selectedYear && date.getMonth() + 1 === month
    })

    const total = monthDonations.reduce((sum, d) => sum + Number(d.amount), 0)

    return {
      year: selectedYear,
      month,
      monthName,
      total,
      count: monthDonations.length,
      donations: monthDonations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'zakat':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'sadaqah':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey)
  }

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedYear(selectedYear - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">{selectedYear}</h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedYear(selectedYear + 1)}
          disabled={selectedYear >= new Date().getFullYear()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monthlyData.map((monthData) => {
          const monthKey = `${monthData.year}-${monthData.month}`
          const isExpanded = expandedMonth === monthKey
          const isEmpty = monthData.count === 0

          return (
            <Card
              key={monthKey}
              className={`cursor-pointer transition-all ${
                isExpanded ? 'ring-2 ring-primary col-span-1 md:col-span-2 lg:col-span-3' : ''
              }`}
              onClick={() => !isEmpty && toggleMonth(monthKey)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <span>{monthData.monthName}</span>
                  {!isEmpty && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {monthData.count}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEmpty ? (
                  <p className="text-sm text-muted-foreground">No donations</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold">{formatCurrency(monthData.total)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {monthData.count} {monthData.count === 1 ? 'donation' : 'donations'}
                    </p>

                    {/* Expanded Donations List */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        {monthData.donations.map((donation) => (
                          <div
                            key={donation.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">
                                  {formatCurrency(Number(donation.amount))}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${getTypeBadgeClass(
                                    donation.type
                                  )}`}
                                >
                                  {donation.type}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(donation.date)}
                                {donation.charity_name && ` • ${donation.charity_name}`}
                              </p>
                              {donation.notes && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {donation.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(donation)
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(donation)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

