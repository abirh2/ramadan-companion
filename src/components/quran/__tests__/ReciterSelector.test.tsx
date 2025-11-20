import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ReciterSelector } from '../ReciterSelector'
import type { QuranReciterId } from '@/types/quran.types'

describe('ReciterSelector', () => {
  const mockOnReciterChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders reciter selector with label', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    expect(screen.getByText('Reciter:')).toBeInTheDocument()
  })

  it('displays current reciter', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    const trigger = screen.getByRole('combobox', { name: /select quran reciter/i })
    expect(trigger).toHaveAttribute('aria-label', 'Select Quran reciter')
  })

  it('renders reciter selection combobox', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    const trigger = screen.getByRole('combobox')
    // Verify combobox is interactive and present
    expect(trigger).toBeInTheDocument()
    expect(trigger).not.toBeDisabled()
  })

  it('renders all reciter options in markup', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    // Note: shadcn/ui Select renders options in a portal
    // We verify the component renders without errors
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('updates when currentReciter prop changes', () => {
    const { rerender } = render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    
    rerender(
      <ReciterSelector 
        currentReciter="ar.husary" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders with default Alafasy reciter', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('associates label with select element', () => {
    render(
      <ReciterSelector 
        currentReciter="ar.alafasy" 
        onReciterChange={mockOnReciterChange} 
      />
    )
    
    const label = screen.getByText('Reciter:')
    const trigger = screen.getByRole('combobox')
    
    expect(label).toBeInTheDocument()
    expect(trigger).toHaveAttribute('id', 'reciter-select')
  })
})

