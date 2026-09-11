import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button touch targets', () => {
  it.each(['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const)(
    'keeps the %s variant at least one touch target high',
    (size) => {
      render(<Button size={size} aria-label={`${size} action`} />)

      expect(screen.getByRole('button', { name: `${size} action` })).toHaveClass('min-h-touch')
    }
  )

  it.each(['icon', 'icon-sm', 'icon-lg'] as const)(
    'keeps the %s variant at least one touch target wide',
    (size) => {
      render(<Button size={size} aria-label={`${size} action`} />)

      expect(screen.getByRole('button', { name: `${size} action` })).toHaveClass('min-w-touch')
    }
  )
})
