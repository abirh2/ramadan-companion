'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Donation } from '@/types/donation.types'

interface ListViewAccordionProps {
  donations: Donation[]
  onEdit: (donation: Donation) => void
  onDelete: (donation: Donation) => void
}

interface MonthGroup {
  monthKey: string
  monthLabel: string
  total: number
  count: number
  donations: Donation[]
}

export function ListViewAccordion({ donations, onEdit, onDelete }: ListViewAccordionProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  // Group donations by month
  const monthGroups: MonthGroup[] = []
  const monthMap = new Map<string, MonthGroup>()

  donations.forEach((donation) => {
    const date = new Date(donation.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

    const monthLabel = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date)

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        monthKey,
        monthLabel,
        total: 0,
        count: 0,
        donations: [],
      })
    }

    const group = monthMap.get(monthKey)!
    group.total += Number(donation.amount)
    group.count += 1
    group.donations.push(donation)
  })

  // Sort by month (most recent first)
  monthGroups.push(...Array.from(monthMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey)))

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

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
      year: 'numeric',
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

  if (monthGroups.length === 0) {
    return (
      <Card className="rounded-xl">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No donations to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {monthGroups.map((group) => {
        const isExpanded = expandedMonths.has(group.monthKey)

        return (
          <Card key={group.monthKey} className="rounded-xl overflow-hidden">
            {/* Accordion Header */}
            <button
              onClick={() => toggleMonth(group.monthKey)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
                <div className="text-left">
                  <h3 className="font-semibold">{group.monthLabel}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.count} {group.count === 1 ? 'donation' : 'donations'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(group.total)}</p>
              </div>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <CardContent className="px-6 pb-4 pt-0 border-t">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          Charity
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.donations
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((donation) => (
                          <tr key={donation.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-3 px-2 text-sm">{formatDate(donation.date)}</td>
                            <td className="py-3 px-2 text-sm text-right font-semibold">
                              {formatCurrency(Number(donation.amount))}
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeBadgeClass(
                                  donation.type
                                )}`}
                              >
                                {donation.type}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-sm">
                              <div>
                                {donation.charity_name || <span className="text-muted-foreground">—</span>}
                              </div>
                              {donation.category && (
                                <div className="text-xs text-muted-foreground">{donation.category}</div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex justify-end gap-1">
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
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

