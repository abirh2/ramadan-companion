import { render, screen } from '@testing-library/react'
import { QiblaCompass } from '../QiblaCompass'

describe('QiblaCompass', () => {
  const mockQiblaDirection = {
    direction: 58.48,
    latitude: 40.7128,
    longitude: -74.006,
    compassDirection: 'NE',
  } as any

  it('renders loading state', () => {
    render(<QiblaCompass qiblaDirection={null} loading={true} error={null} />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(<QiblaCompass qiblaDirection={null} loading={false} error="Failed to load" />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument()
  })

  it('displays Qibla direction with bearing', () => {
    render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    expect(screen.getByText(/58\.5° NE/i)).toBeInTheDocument()
    expect(screen.getByText(/Direction to Mecca/i)).toBeInTheDocument()
  })

  it('renders compass SVG', () => {
    const { container } = render(
      <QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('displays cardinal directions', () => {
    render(<QiblaCompass qiblaDirection={mockQiblaDirection} loading={false} error={null} />)

    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.getByText('W')).toBeInTheDocument()
  })

  it('handles null qiblaDirection gracefully', () => {
    render(<QiblaCompass qiblaDirection={null} loading={false} error={null} />)

    expect(screen.getByText('Qibla Direction')).toBeInTheDocument()
    expect(screen.getByText(/Unable to determine direction/i)).toBeInTheDocument()
  })
})

