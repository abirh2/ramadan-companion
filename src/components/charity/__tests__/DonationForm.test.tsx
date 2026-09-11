import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { DonationForm } from '../DonationForm'
import { useAuth } from '@/hooks/useAuth'
import { addDonation, updateDonation } from '@/lib/donations'
import { fetchCurrencyList } from '@/lib/currency'

jest.mock('@/hooks/useAuth')
jest.mock('@/lib/donations', () => ({
  addDonation: jest.fn(),
  updateDonation: jest.fn(),
}))
jest.mock('@/lib/currency', () => ({
  fetchCurrencyList: jest.fn(),
  getPreferredCurrency: jest.fn(() => 'USD'),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockAddDonation = addDonation as jest.MockedFunction<typeof addDonation>
const mockUpdateDonation = updateDonation as jest.MockedFunction<typeof updateDonation>
const mockFetchCurrencyList = fetchCurrencyList as jest.MockedFunction<typeof fetchCurrencyList>

describe('DonationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } } as ReturnType<typeof useAuth>)
    mockFetchCurrencyList.mockResolvedValue([
      { code: 'USD', name: 'US Dollar' },
    ])
  })

  it('uses a mobile-friendly amount input in a labelled contribution sheet', async () => {
    render(
      <DonationForm open onOpenChange={jest.fn()} onSuccess={jest.fn()} />
    )

    expect(screen.getByRole('dialog', { name: 'Add contribution' })).toBeInTheDocument()
    const amount = screen.getByRole('spinbutton', { name: /amount/i })
    expect(amount).toHaveAttribute('inputmode', 'decimal')
    expect(screen.getByRole('button', { name: 'Add contribution' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Currency: USD' })).toBeInTheDocument()
  })

  it('shows inline validation and does not persist a zero amount', async () => {
    const user = userEvent.setup()
    render(
      <DonationForm open onOpenChange={jest.fn()} onSuccess={jest.fn()} />
    )

    await screen.findByRole('button', { name: 'Currency: USD' })
    await user.click(screen.getByRole('button', { name: 'Add contribution' }))

    expect(await screen.findByText('Enter an amount greater than 0.')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /amount/i })).toHaveAttribute('aria-invalid', 'true')
    expect(mockAddDonation).not.toHaveBeenCalled()
  })

  it('persists the existing contribution fields and closes after a successful add', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    const onSuccess = jest.fn()
    mockAddDonation.mockResolvedValue({ success: true })
    render(<DonationForm open onOpenChange={onOpenChange} onSuccess={onSuccess} />)

    await screen.findByRole('button', { name: 'Currency: USD' })
    await user.type(screen.getByRole('spinbutton', { name: /amount/i }), '42.50')
    await user.selectOptions(screen.getByRole('combobox', { name: /type/i }), 'other')
    await user.type(screen.getByRole('textbox', { name: /charity or recipient/i }), 'Community pantry')
    await user.type(screen.getByRole('textbox', { name: /category/i }), 'Food')
    await user.type(screen.getByRole('textbox', { name: /note/i }), 'September groceries')
    await user.click(screen.getByRole('button', { name: 'Add contribution' }))

    expect(mockAddDonation).toHaveBeenCalledWith('user-1', expect.objectContaining({
      amount: 42.5,
      currency: 'USD',
      type: 'other',
      charity_name: 'Community pantry',
      category: 'Food',
      notes: 'September groceries',
    }))
    expect(onSuccess).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('uses the existing update path when editing a contribution', async () => {
    const user = userEvent.setup()
    mockUpdateDonation.mockResolvedValue({ success: true })
    const existing = {
      id: 'donation-1',
      user_id: 'user-1',
      created_at: '2026-09-08T12:00:00Z',
      updated_at: '2026-09-08T12:00:00Z',
      amount: 50,
      currency: 'USD',
      type: 'sadaqah' as const,
      date: '2026-09-08',
      category: 'Masjid',
      charity_name: 'Local Masjid',
      charity_url: null,
      notes: null,
      is_recurring: false,
    }

    render(<DonationForm open onOpenChange={jest.fn()} onSuccess={jest.fn()} donation={existing} />)
    await screen.findByRole('button', { name: 'Currency: USD' })
    await user.click(screen.getByRole('button', { name: 'Edit contribution' }))

    expect(mockUpdateDonation).toHaveBeenCalledWith('donation-1', 'user-1', expect.objectContaining({
      amount: 50,
      date: '2026-09-08',
      category: 'Masjid',
    }))
  })

  it('adds rather than updates when opened with calculated Zakat values', async () => {
    const user = userEvent.setup()
    mockAddDonation.mockResolvedValue({ success: true })
    render(
      <DonationForm
        open
        onOpenChange={jest.fn()}
        onSuccess={jest.fn()}
        initialValues={{ amount: 20, currency: 'USD', type: 'zakat', date: '2026-09-10', notes: 'Calculated zakat' }}
      />
    )

    await screen.findByRole('button', { name: 'Currency: USD' })
    expect(screen.getByRole('spinbutton', { name: /amount/i })).toHaveValue(20)
    expect(screen.getByRole('combobox', { name: /type/i })).toHaveValue('zakat')
    await user.click(screen.getByRole('button', { name: 'Add contribution' }))

    expect(mockAddDonation).toHaveBeenCalledWith('user-1', expect.objectContaining({ amount: 20, type: 'zakat' }))
    expect(mockUpdateDonation).not.toHaveBeenCalled()
  })
})
