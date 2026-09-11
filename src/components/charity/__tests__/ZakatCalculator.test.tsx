import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ZakatCalculator } from '../ZakatCalculator'
import { fetchCurrencyList } from '@/lib/currency'

jest.mock('@/lib/currency', () => ({
  ...jest.requireActual('@/lib/currency'),
  fetchCurrencyList: jest.fn(),
  getPreferredCurrency: jest.fn(() => 'USD'),
}))

const mockFetchCurrencyList = fetchCurrencyList as jest.MockedFunction<typeof fetchCurrencyList>

describe('ZakatCalculator', () => {
  it('preserves the existing 2.5% net-wealth calculation and can pass it to the giving form', async () => {
    const user = userEvent.setup()
    const onLogAsDonation = jest.fn()
    mockFetchCurrencyList.mockResolvedValue([{ code: 'USD', name: 'US Dollar' }])

    render(<ZakatCalculator onLogAsDonation={onLogAsDonation} />)

    await user.click(screen.getByRole('button', { name: /zakat calculator/i }))
    await user.type(screen.getByRole('spinbutton', { name: 'Cash on hand' }), '1000')
    await user.type(screen.getByRole('spinbutton', { name: 'Outstanding debts' }), '200')

    expect(screen.getByText('$20.00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add to giving history' }))
    expect(onLogAsDonation).toHaveBeenCalledWith(20, 'USD')
  })
})
