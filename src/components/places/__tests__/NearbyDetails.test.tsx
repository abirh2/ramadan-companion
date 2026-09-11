import { render, screen } from '@testing-library/react'
import { MosqueDetailDialog } from '../MosqueDetailDialog'
import { FoodDetailDialog } from '../FoodDetailDialog'

const mosque = {
  id: 1,
  name: 'Masjid Al-Noor',
  lat: 40.72,
  lng: -74,
  distanceKm: 1.2,
  address: { street: '10 Main Street', city: 'New York' },
  tags: { wheelchair: 'yes' },
}

const food = {
  id: 'food-1',
  name: 'Cedar Grill',
  lat: 40.71,
  lng: -73.99,
  distanceKm: 0.8,
  address: { street: '20 Oak Avenue', city: 'New York' },
  categories: ['catering.restaurant'],
  cuisine: 'Lebanese',
  diet: { halal: true },
}

describe('Nearby detail sheets', () => {
  it('prioritizes mosque category, distance, address, and directions', () => {
    render(<MosqueDetailDialog mosque={mosque} distanceUnit="mi" open onOpenChange={jest.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Masjid Al-Noor' })).toBeVisible()
    expect(screen.getByText('Mosque · 0.7 mi away')).toBeVisible()
    expect(screen.getByText('10 Main Street, New York')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Get directions' })).toBeVisible()
  })

  it('describes source halal metadata without inventing certification', () => {
    render(<FoodDetailDialog food={food} distanceUnit="mi" open onOpenChange={jest.fn()} />)

    expect(screen.getByText('Listed as halal')).toBeVisible()
    expect(screen.queryByText(/certified/i)).not.toBeInTheDocument()
  })
})
