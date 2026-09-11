import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LocationSearch } from '../LocationSearch'
import { geocodeCity } from '@/lib/location'

jest.mock('@/lib/location', () => ({
  geocodeCity: jest.fn(),
  requestGeolocation: jest.fn(),
}))

describe('LocationSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(geocodeCity as jest.Mock).mockResolvedValue([
      { lat: 40.7128, lng: -74.006, displayName: 'New York, New York' },
      { lat: 43.2994, lng: -74.2179, displayName: 'New York State' },
    ])
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('supports keyboard navigation and selection as an accessible combobox', async () => {
    const onLocationSelect = jest.fn().mockResolvedValue(undefined)
    render(<LocationSearch currentLocation={null} onLocationSelect={onLocationSelect} />)

    const input = screen.getByRole('combobox', { name: 'Search for a city or address' })
    fireEvent.change(input, { target: { value: 'New York' } })
    await act(async () => {
      await jest.advanceTimersByTimeAsync(500)
    })

    const listbox = await screen.findByRole('listbox', { name: 'Location suggestions' })
    expect(listbox).toBeVisible()
    expect(input).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getByRole('option', { name: 'New York, New York' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() =>
      expect(onLocationSelect).toHaveBeenCalledWith({
        lat: 40.7128,
        lng: -74.006,
        city: 'New York, New York',
        type: 'selected',
      })
    )
  })
})
