import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ListViewAccordion } from '../ListViewAccordion'
import type { DonationWithConversion } from '@/types/donation.types'

const donations: DonationWithConversion[] = [
  {
    id: 'september-8',
    user_id: 'user-1',
    created_at: '2026-09-08T12:00:00Z',
    updated_at: '2026-09-08T12:00:00Z',
    amount: 50,
    currency: 'USD',
    type: 'sadaqah',
    date: '2026-09-08',
    category: 'Masjid',
    charity_name: 'Local Masjid',
    charity_url: null,
    notes: 'Friday collection',
    is_recurring: false,
    convertedAmount: 50,
    convertedCurrency: 'USD',
    conversionRate: 1,
  },
  {
    id: 'september-2',
    user_id: 'user-1',
    created_at: '2026-09-02T12:00:00Z',
    updated_at: '2026-09-02T12:00:00Z',
    amount: 25,
    currency: 'USD',
    type: 'zakat',
    date: '2026-09-02',
    category: null,
    charity_name: null,
    charity_url: null,
    notes: null,
    is_recurring: false,
    convertedAmount: 25,
    convertedCurrency: 'USD',
    conversionRate: 1,
  },
  {
    id: 'august-30',
    user_id: 'user-1',
    created_at: '2026-08-30T12:00:00Z',
    updated_at: '2026-08-30T12:00:00Z',
    amount: 10,
    currency: 'USD',
    type: 'other',
    date: '2026-08-30',
    category: 'Food',
    charity_name: null,
    charity_url: null,
    notes: null,
    is_recurring: false,
    convertedAmount: 10,
    convertedCurrency: 'USD',
    conversionRate: 1,
  },
]

describe('ListViewAccordion', () => {
  it('shows a chronological month-grouped list without requiring expansion', () => {
    render(
      <ListViewAccordion
        donations={donations}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        viewMode="original"
        preferredCurrency="USD"
      />
    )

    const groups = screen.getAllByRole('group')
    expect(within(groups[0]).getByRole('heading', { name: 'September 2026' })).toBeInTheDocument()
    expect(within(groups[0]).getByText('Local Masjid')).toBeInTheDocument()
    expect(within(groups[0]).getAllByText('Zakat')).toHaveLength(2)
    expect(within(groups[1]).getByRole('heading', { name: 'August 2026' })).toBeInTheDocument()
  })

  it('places edit and delete actions in a labelled contextual menu', async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    const onDelete = jest.fn()
    render(
      <ListViewAccordion
        donations={donations}
        onEdit={onEdit}
        onDelete={onDelete}
        viewMode="original"
        preferredCurrency="USD"
      />
    )

    await user.click(screen.getByRole('button', { name: /actions for local masjid/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit contribution' }))
    expect(onEdit).toHaveBeenCalledWith(donations[0])

    await user.click(screen.getByRole('button', { name: /actions for local masjid/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete contribution' }))
    expect(onDelete).toHaveBeenCalledWith(donations[0])
  })
})
