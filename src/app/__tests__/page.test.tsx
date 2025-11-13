import { screen } from '@testing-library/react'
import Home from '../page'
import { renderWithAuth } from '@/test-utils'

// Component tests are in their respective __tests__ directories
// This test focuses on page-level integration

describe('Dashboard Page', () => {
  it('renders the dashboard page', () => {
    renderWithAuth(<Home />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays app title in header', () => {
    renderWithAuth(<Home />)
    
    expect(screen.getByText('Ramadan Companion')).toBeInTheDocument()
  })

  it('renders auth button in header', () => {
    renderWithAuth(<Home />)
    
    // UserMenu button should be present when user is authenticated
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
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
    const main = screen.getByRole('main')
    const grid = main.querySelector('.grid.grid-cols-1')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('md:grid-cols-2')
  })

  it('uses semantic HTML structure', () => {
    renderWithAuth(<Home />)
    
    // Check for semantic elements
    const header = screen.getByRole('banner')
    const main = screen.getByRole('main')
    
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
  })

  it('has proper mobile-first responsive classes', () => {
    const { container } = renderWithAuth(<Home />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('max-w-4xl')
    expect(main).toHaveClass('mx-auto')
  })

  it('applies proper spacing to content', () => {
    const { container } = renderWithAuth(<Home />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('px-4')
    expect(main).toHaveClass('py-6')
  })

  it('uses appropriate background and text colors', () => {
    const { container } = renderWithAuth(<Home />)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('bg-background')
    expect(wrapper).toHaveClass('text-foreground')
  })

  it('header has border separator', () => {
    renderWithAuth(<Home />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('border-b')
  })
})

