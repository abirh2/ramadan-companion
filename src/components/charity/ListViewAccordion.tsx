'use client'

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/currency'
import type { DonationWithConversion, CurrencyViewMode } from '@/types/donation.types'
import type { CurrencyCode } from '@/types/currency.types'

interface ListViewAccordionProps {
  donations: DonationWithConversion[]
  onEdit: (donation: DonationWithConversion) => void
  onDelete: (donation: DonationWithConversion) => void
  viewMode: CurrencyViewMode
  preferredCurrency: CurrencyCode
}

interface MonthGroup {
  monthKey: string
  monthLabel: string
  donations: DonationWithConversion[]
}

function parseDonationDate(date: string) {
  return new Date(`${date}T12:00:00`)
}

function getContributionName(donation: DonationWithConversion) {
  if (donation.charity_name) return donation.charity_name
  if (donation.category) return donation.category
  if (donation.type === 'zakat') return 'Zakat'
  if (donation.type === 'sadaqah') return 'Sadaqah'
  return 'Other charity'
}

function getTypeLabel(type: DonationWithConversion['type']) {
  if (type === 'zakat') return 'Zakat'
  if (type === 'sadaqah') return 'Sadaqah'
  return 'Other'
}

export function ListViewAccordion({ donations, onEdit, onDelete }: ListViewAccordionProps) {
  const monthMap = new Map<string, MonthGroup>()

  donations.forEach((donation) => {
    const date = parseDonationDate(donation.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date)

    const group = monthMap.get(monthKey) ?? { monthKey, monthLabel, donations: [] }
    group.donations.push(donation)
    monthMap.set(monthKey, group)
  })

  const monthGroups = Array.from(monthMap.values())
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    .map((group) => ({
      ...group,
      donations: [...group.donations].sort(
        (a, b) => parseDonationDate(b.date).getTime() - parseDonationDate(a.date).getTime()
      ),
    }))

  return (
    <div className="space-y-8">
      {monthGroups.map((group) => (
        <section key={group.monthKey} role="group" aria-labelledby={`month-${group.monthKey}`}>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h3 id={`month-${group.monthKey}`} className="type-label text-text-primary">
              {group.monthLabel}
            </h3>
            <p className="type-caption text-text-tertiary">
              {group.donations.length} {group.donations.length === 1 ? 'contribution' : 'contributions'}
            </p>
          </div>

          <div className="overflow-hidden rounded-grouped border border-border-subtle bg-surface-primary">
            {group.donations.map((donation) => {
              const contributionName = getContributionName(donation)
              const dateLabel = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
              }).format(parseDonationDate(donation.date))
              const amountLabel = formatCurrency(Number(donation.convertedAmount), donation.convertedCurrency)

              return (
                <article
                  key={donation.id}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border-subtle px-3 py-3.5 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] sm:px-4"
                >
                  <time dateTime={donation.date} className="type-caption tabular-nums text-text-secondary">
                    {dateLabel}
                  </time>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">{contributionName}</p>
                    <p className="type-caption mt-0.5 truncate text-text-secondary">
                      <span className={donation.type === 'zakat' ? 'font-semibold text-gold' : ''}>
                        {getTypeLabel(donation.type)}
                      </span>
                      {donation.charity_name && donation.category ? ` · ${donation.category}` : ''}
                      {donation.notes ? ` · ${donation.notes}` : ''}
                    </p>
                  </div>

                  <p className="whitespace-nowrap text-right font-semibold tabular-nums text-text-primary">
                    {amountLabel}
                  </p>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 text-text-tertiary"
                        aria-label={`Actions for ${contributionName}, ${amountLabel}, ${dateLabel}`}
                      >
                        <MoreHorizontal className="size-5" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem onSelect={() => onEdit(donation)}>
                        <Pencil aria-hidden="true" />
                        Edit contribution
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => onDelete(donation)}>
                        <Trash2 aria-hidden="true" />
                        Delete contribution
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
