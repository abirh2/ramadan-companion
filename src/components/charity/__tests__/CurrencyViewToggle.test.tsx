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

    expect(screen.getByRole('button', { name: 'Original' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In USD' })).toBeInTheDocument()
  })

  it('should highlight active button', () => {
    render(
      <CurrencyViewToggle
        value="original"
        onChange={jest.fn()}
        preferredCurrency="USD"
      />
    )

    const originalButton = screen.getByRole('button', { name: 'Original' })
    const convertedButton = screen.getByRole('button', { name: 'In USD' })

    expect(originalButton).toHaveAttribute('aria-pressed', 'true')
    expect(convertedButton).toHaveAttribute('aria-pressed', 'false')
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

    const convertedButton = screen.getByRole('button', { name: 'In USD' })
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

    expect(screen.getByRole('button', { name: 'In EUR' })).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'In USD' }))
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
    fireEvent.click(screen.getByRole('button', { name: 'Original' }))
    expect(onChange).toHaveBeenCalledWith('original')
  })
})
