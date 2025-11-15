import { screen } from '@testing-library/react'
import Home from '../page'
import { renderWithAuth } from '@/test-utils'

// Component tests are in their respective __tests__ directories
// This test focuses on page-level integration

describe('Dashboard Page', () => {
  it('renders the dashboard page content', () => {
    const { container } = renderWithAuth(<Home />)
    
    // Check that the main content container renders
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays all dashboard cards', () => {
    renderWithAuth(<Home />)
    
    // Check for card titles
    expect(screen.getByText('Next Prayer')).toBeInTheDocument()
    expect(screen.getByText(/Ramadan 1446/i)).toBeInTheDocument()
    expect(screen.getByText('Quran of the Day')).toBeInTheDocument()
    expect(screen.getByText('Hadith of the Day')).toBeInTheDocument()
    expect(screen.getByText('Charity Tracker')).toBeInTheDocument()
  })

  it('renders cards in a grid layout', () => {
    const { container } = renderWithAuth(<Home />)
    
    // Select the main grid container (not card internal grids)
    const grid = container.querySelector('.grid.grid-cols-1')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('md:grid-cols-2')
  })

  it('has proper mobile-first responsive classes', () => {
    const { container } = renderWithAuth(<Home />)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('max-w-4xl')
    expect(wrapper).toHaveClass('mx-auto')
  })

  it('applies proper spacing to content', () => {
    const { container } = renderWithAuth(<Home />)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('px-4')
    expect(wrapper).toHaveClass('py-6')
  })
})

