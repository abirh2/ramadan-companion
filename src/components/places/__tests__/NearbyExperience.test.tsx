import { fireEvent, render, screen } from '@testing-library/react'
import { NearbyExperience } from '../NearbyExperience'

const baseProps = {
  mode: 'mosques' as const,
  loading: false,
  error: null,
  itemCount: 2,
  searchRadiusMiles: 3,
  distanceUnit: 'mi' as const,
  location: { lat: 40.7128, lng: -74.006, city: 'New York', type: 'selected' as const },
  onLocationSelect: jest.fn().mockResolvedValue(undefined),
  onRadiusChange: jest.fn().mockResolvedValue(undefined),
  onDistanceUnitChange: jest.fn().mockResolvedValue(undefined),
  map: <div aria-label="Nearby mosque map">Map</div>,
  results: <div aria-label="Mosque results">Results</div>,
  attribution: <span>OpenStreetMap</span>,
}

describe('NearbyExperience', () => {
  it('keeps category, map, and list access visible in the main discovery flow', () => {
    render(<NearbyExperience {...baseProps} />)

    expect(screen.getByRole('heading', { name: 'Nearby' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Mosques' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Halal Food' })).toHaveAttribute(
      'href',
      '/places/food'
    )
    expect(screen.getByLabelText('Nearby mosque map')).toBeVisible()
    expect(screen.getByLabelText('Mosque results')).toBeVisible()
    expect(screen.getByText('2 mosques nearby')).toBeVisible()
  })

  it('moves radius and distance units into one concise filters sheet', () => {
    render(<NearbyExperience {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Filters, 3 miles, miles' }))

    expect(screen.getByRole('dialog', { name: 'Nearby filters' })).toBeVisible()
    fireEvent.click(screen.getByRole('radio', { name: '5 mi' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Kilometers' }))

    expect(baseProps.onRadiusChange).toHaveBeenCalledWith(5)
    expect(baseProps.onDistanceUnitChange).toHaveBeenCalledWith('km')
  })

  it('shows a compact recovery state when a location has not been set', () => {
    render(
      <NearbyExperience
        {...baseProps}
        location={null}
        error="Location not set. Please enable location access or set your location manually."
        itemCount={0}
        map={null}
        results={null}
      />
    )

    expect(screen.getByRole('status')).toHaveTextContent('Choose a location to see what is nearby')
    expect(screen.queryByText('Unable to load mosques')).not.toBeInTheDocument()
  })

  it('displays kilometers while keeping radius callbacks in canonical miles', () => {
    render(<NearbyExperience {...baseProps} distanceUnit="km" />)

    fireEvent.click(screen.getByRole('button', { name: 'Filters, 4.8 kilometers, kilometers' }))
    fireEvent.click(screen.getByRole('radio', { name: '8 km' }))

    expect(baseProps.onRadiusChange).toHaveBeenCalledWith(5)
  })
})
