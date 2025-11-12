import { render, screen } from '@testing-library/react'
import { RamadanCard } from '../RamadanCard'

describe('RamadanCard', () => {
  it('renders card with Ramadan title', () => {
    render(<RamadanCard />)
    
    expect(screen.getByText(/Ramadan 1446/i)).toBeInTheDocument()
  })

  it('displays countdown to Ramadan', () => {
    render(<RamadanCard />)
    
    expect(screen.getByText(/Starts in 42 days/i)).toBeInTheDocument()
  })

  it('shows expected date', () => {
    render(<RamadanCard />)
    
    expect(screen.getByText(/March 1, 2025/i)).toBeInTheDocument()
  })

  it('includes settings adjustment hint', () => {
    render(<RamadanCard />)
    
    expect(screen.getByText(/Adjust in Settings/i)).toBeInTheDocument()
  })

  it('renders moon icon', () => {
    const { container } = render(<RamadanCard />)
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('has accent border styling', () => {
    const { container } = render(<RamadanCard />)
    
    const card = container.firstChild
    expect(card).toHaveClass('border-accent/20')
  })
})

