import { fireEvent, render, screen } from '@testing-library/react'
import { MosqueList } from '../MosqueList'
import { FoodList } from '../FoodList'
import { openMapsApp } from '@/lib/mapDirections'

jest.mock('@/lib/mapDirections', () => ({ openMapsApp: jest.fn() }))

const mosque = {
  id: 1,
  name: 'Masjid Al-Noor',
  lat: 40.72,
  lng: -74,
  distanceKm: 1.2,
  address: { street: '10 Main Street', city: 'New York', state: 'NY' },
  tags: {},
}

const food = {
  id: 'food-1',
  name: 'Cedar Grill',
  lat: 40.71,
  lng: -73.99,
  distanceKm: 0.8,
  address: { street: '20 Oak Avenue', city: 'New York' },
  categories: ['catering.restaurant'],
  cuisine: 'middle_eastern;breakfast',
}

describe('Nearby result lists', () => {
  beforeEach(() => jest.clearAllMocks())

  it('presents mosque details and directions as separate accessible actions', () => {
    const onMosqueClick = jest.fn()
    render(<MosqueList mosques={[mosque]} distanceUnit="mi" onMosqueClick={onMosqueClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'View details for Masjid Al-Noor' }))
    expect(onMosqueClick).toHaveBeenCalledWith(mosque)

    fireEvent.click(screen.getByRole('button', { name: 'Directions to Masjid Al-Noor' }))
    expect(openMapsApp).toHaveBeenCalledWith(mosque.lat, mosque.lng, mosque.name)
    expect(screen.getByText('Mosque · 0.7 mi')).toBeVisible()
  })

  it('uses reliable food metadata without claiming certification', () => {
    render(<FoodList foods={[food]} distanceUnit="mi" onFoodClick={jest.fn()} />)

    expect(screen.getByText('Middle eastern, breakfast · 0.5 mi')).toBeVisible()
    expect(screen.queryByText(/certified/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Directions to Cedar Grill' })).toBeVisible()
  })
})
