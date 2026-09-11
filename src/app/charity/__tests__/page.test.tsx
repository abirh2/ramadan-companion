import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import CharityPage from '../page'
import { useAuth } from '@/hooks/useAuth'
import { useDonations } from '@/hooks/useDonations'

jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/useDonations')
jest.mock('@/components/auth/LoginModal', () => ({ LoginModal: () => null }))
jest.mock('@/components/FeedbackButton', () => ({ FeedbackButton: () => null }))
jest.mock('@/components/charity/CurrencyViewToggle', () => ({ CurrencyViewToggle: () => <div>Currency view</div> }))
jest.mock('@/components/charity/CurrencyPreferenceSelector', () => ({ CurrencyPreferenceSelector: () => <div>Preferred currency</div> }))
jest.mock('@/components/charity/ZakatCalculator', () => ({ ZakatCalculator: () => <div>Zakat calculator</div> }))
jest.mock('@/components/charity/DonationForm', () => ({
  DonationForm: ({ open }: { open: boolean }) => open ? <div role="dialog" aria-label="Contribution form">Contribution form</div> : null,
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseDonations = useDonations as jest.MockedFunction<typeof useDonations>

const donation = {
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
  convertedAmount: 50,
  convertedCurrency: 'USD',
  conversionRate: 1,
}

function donationsResult(overrides: Partial<ReturnType<typeof useDonations>> = {}) {
  return {
    donations: [donation],
    displayDonations: [donation],
    loading: false,
    error: null,
    refetch: jest.fn(async () => {}),
    isEmpty: false,
    summary: { ramadanTotal: 100, yearlyTotal: 1240, allTimeTotal: 2500, totalCount: 12 },
    viewMode: 'original' as const,
    setViewMode: jest.fn(),
    preferredCurrency: 'USD',
    setPreferredCurrency: jest.fn(),
    converting: false,
    ...overrides,
  }
}

describe('CharityPage', () => {
  beforeEach(() => {
    mockUseDonations.mockReturnValue(donationsResult())
  })

  it('keeps the signed-out state concise and explains why an account is needed', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false } as ReturnType<typeof useAuth>)
    render(<CharityPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Charity' })).toBeInTheDocument()
    expect(screen.getByText('Giving, simplified.')).toBeInTheDocument()
    expect(screen.getByText('Keep a private record of your giving')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.queryByText('This year')).not.toBeInTheDocument()
  })

  it('shows one calm summary, grouped history, and opens the add flow', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false } as ReturnType<typeof useAuth>)
    render(<CharityPage />)

    expect(screen.getByText('$1,240.00')).toBeInTheDocument()
    expect(screen.getByText(/12 total contributions/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent Giving' })).toBeInTheDocument()
    expect(screen.getByText('Local Masjid')).toBeInTheDocument()
    expect(screen.queryByText('Monthly Donation Trends')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Add contribution' })[0])
    expect(screen.getByRole('dialog', { name: 'Contribution form' })).toBeInTheDocument()
  })
})
