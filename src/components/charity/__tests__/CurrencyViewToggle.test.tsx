/**
 * Tests for CurrencyViewToggle Component
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { CurrencyViewToggle } from '../CurrencyViewToggle'
import * as currencyLib from '@/lib/currency'

// Mock currency library
jest.mock('@/lib/currency', () => ({
  getViewMode: jest.fn(() => 'original'),
  setViewMode: jest.fn(),
}))

describe('CurrencyViewToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render both buttons', () => {
    render(
      <CurrencyViewToggle
        value="original"
        onChange={jest.fn()}
        preferredCurrency="USD"
      />
    )

    expect(screen.getByText(/original currencies/i)).toBeInTheDocument()
    expect(screen.getByText(/convert to usd/i)).toBeInTheDocument()
  })

  it('should highlight active button', () => {
    render(
      <CurrencyViewToggle
        value="original"
        onChange={jest.fn()}
        preferredCurrency="USD"
      />
    )

    const originalButton = screen.getByText(/original currencies/i).closest('button')
    const convertedButton = screen.getByText(/convert to usd/i).closest('button')

    // Original button should have default variant
    expect(originalButton?.getAttribute('data-variant')).toBeFalsy()
    
    // Converted button should have outline variant
    expect(convertedButton?.getAttribute('data-variant')).toBeFalsy()
  })

  it('should call onChange when button is clicked', () => {
    const onChange = jest.fn()
    render(
      <CurrencyViewToggle
        value="original"
        onChange={onChange}
        preferredCurrency="USD"
      />
    )

    const convertedButton = screen.getByText(/convert to usd/i)
    fireEvent.click(convertedButton)

    expect(onChange).toHaveBeenCalledWith('converted')
    expect(currencyLib.setViewMode).toHaveBeenCalledWith('converted')
  })

  it('should display preferred currency in button text', () => {
    render(
      <CurrencyViewToggle
        value="original"
        onChange={jest.fn()}
        preferredCurrency="EUR"
      />
    )

    expect(screen.getByText(/convert to eur/i)).toBeInTheDocument()
  })

  it('should toggle between modes', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <CurrencyViewToggle
        value="original"
        onChange={onChange}
        preferredCurrency="USD"
      />
    )

    // Click to convert
    fireEvent.click(screen.getByText(/convert to usd/i))
    expect(onChange).toHaveBeenCalledWith('converted')

    // Rerender with new value
    rerender(
      <CurrencyViewToggle
        value="converted"
        onChange={onChange}
        preferredCurrency="USD"
      />
    )

    // Click to go back to original
    fireEvent.click(screen.getByText(/original currencies/i))
    expect(onChange).toHaveBeenCalledWith('original')
  })
})

