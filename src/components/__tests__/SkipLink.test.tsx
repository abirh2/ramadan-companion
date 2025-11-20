/**
 * Tests for SkipLink component
 */

import { render, screen } from '@testing-library/react'
import { SkipLink } from '../SkipLink'

describe('SkipLink', () => {
  it('renders skip link with correct text', () => {
    render(<SkipLink />)
    
    const link = screen.getByRole('link', { name: /skip to main content/i })
    expect(link).toBeInTheDocument()
  })

  it('links to main content area', () => {
    render(<SkipLink />)
    
    const link = screen.getByRole('link', { name: /skip to main content/i })
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('is visually hidden until focused', () => {
    render(<SkipLink />)
    
    const link = screen.getByRole('link', { name: /skip to main content/i })
    
    // Check for screen reader only class
    expect(link).toHaveClass('sr-only')
    
    // Check for focus styles that make it visible
    expect(link).toHaveClass('focus:not-sr-only')
    expect(link).toHaveClass('focus:absolute')
  })

  it('has proper positioning when focused', () => {
    render(<SkipLink />)
    
    const link = screen.getByRole('link', { name: /skip to main content/i })
    
    // Verify focus positioning classes
    expect(link).toHaveClass('focus:top-4')
    expect(link).toHaveClass('focus:left-4')
    expect(link).toHaveClass('focus:z-[100]')
  })

  it('has accessible styling when focused', () => {
    render(<SkipLink />)
    
    const link = screen.getByRole('link', { name: /skip to main content/i })
    
    // Verify focus ring and styling
    expect(link).toHaveClass('focus:ring-2')
    expect(link).toHaveClass('focus:ring-ring')
    expect(link).toHaveClass('focus:ring-offset-2')
  })
})

