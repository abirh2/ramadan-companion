import { render, screen } from '@testing-library/react'
import { PreservedSurface } from '../PreservedSurface'

describe('PreservedSurface', () => {
  it('renders its children', () => {
    render(
      <PreservedSurface>
        <p>Compass content</p>
      </PreservedSurface>
    )
    expect(screen.getByText('Compass content')).toBeInTheDocument()
  })

  it('applies the id so #qibla scroll targeting works (R6.3)', () => {
    render(
      <PreservedSurface id="qibla">
        <p>Qibla</p>
      </PreservedSurface>
    )
    expect(document.getElementById('qibla')).toBeInTheDocument()
  })

  it('wires aria-labelledby to the section', () => {
    const { container } = render(
      <PreservedSurface id="qibla" labelledBy="qibla-title">
        <p>Qibla</p>
      </PreservedSurface>
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('aria-labelledby', 'qibla-title')
  })

  it('uses the elevated surface token by default (no inverted white card)', () => {
    const { container } = render(
      <PreservedSurface>
        <p>Content</p>
      </PreservedSurface>
    )
    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-surface-elevated')
    expect(section).toHaveClass('border-border-subtle')
  })

  it('supports the grouped surface variant (R6.4)', () => {
    const { container } = render(
      <PreservedSurface variant="grouped">
        <p>Content</p>
      </PreservedSurface>
    )
    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-surface-grouped')
  })
})
