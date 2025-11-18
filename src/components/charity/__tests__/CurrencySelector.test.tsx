/**
 * Tests for CurrencySelector Component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CurrencySelector } from '../CurrencySelector'
import * as currencyLib from '@/lib/currency'

// Mock currency library
jest.mock('@/lib/currency', () => ({
  fetchCurrencyList: jest.fn(),
}))

const mockCurrencies = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'JPY', name: 'Japanese Yen' },
]

describe('CurrencySelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(currencyLib.fetchCurrencyList as jest.Mock).mockResolvedValue(mockCurrencies)
  })

  it('should render loading state initially', () => {
    render(<CurrencySelector value="USD" onChange={jest.fn()} />)
    expect(screen.getByText(/loading currencies/i)).toBeInTheDocument()
  })

  it('should display selected currency', async () => {
    render(<CurrencySelector value="USD" onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument()
      expect(screen.getByText(/united states dollar/i)).toBeInTheDocument()
    })
  })

  it('should open dropdown on click', async () => {
    render(<CurrencySelector value="USD" onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument()
    })

    // Click to open dropdown
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Should show search input
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search currencies/i)).toBeInTheDocument()
    })

    // Should show all currencies
    expect(screen.getByText(/euro/i)).toBeInTheDocument()
    expect(screen.getByText(/british pound/i)).toBeInTheDocument()
  })

  it('should filter currencies by search', async () => {
    render(<CurrencySelector value="USD" onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument()
    })

    // Open dropdown
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search currencies/i)).toBeInTheDocument()
    })

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search currencies/i)
    fireEvent.change(searchInput, { target: { value: 'euro' } })

    // Should show only EUR
    expect(screen.getByText(/euro/i)).toBeInTheDocument()
    expect(screen.queryByText(/british pound/i)).not.toBeInTheDocument()
  })

  it('should call onChange when currency is selected', async () => {
    const onChange = jest.fn()
    render(<CurrencySelector value="USD" onChange={onChange} />)

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument()
    })

    // Open dropdown
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText(/euro/i)).toBeInTheDocument()
    })

    // Click on EUR
    const eurOption = screen.getByText(/euro/i).closest('button')
    if (eurOption) {
      fireEvent.click(eurOption)
    }

    expect(onChange).toHaveBeenCalledWith('EUR')
  })

  it('should display error message on fetch failure', async () => {
    ;(currencyLib.fetchCurrencyList as jest.Mock).mockRejectedValue(
      new Error('API Error')
    )

    render(<CurrencySelector value="USD" onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load currencies/i)).toBeInTheDocument()
    })
  })

  it('should be disabled when disabled prop is true', async () => {
    render(<CurrencySelector value="USD" onChange={jest.fn()} disabled={true} />)

    await waitFor(() => {
      expect(screen.getByText('USD')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})

