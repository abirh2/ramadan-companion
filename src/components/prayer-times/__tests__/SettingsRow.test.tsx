import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsRow } from '../SettingsRow'

describe('SettingsRow', () => {
  const onPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the label and value (R4.4, R7.1)', () => {
    render(<SettingsRow label="Calculation Method" value="ISNA" onPress={onPress} />)

    expect(screen.getByText('Calculation Method')).toBeInTheDocument()
    expect(screen.getByText('ISNA')).toBeInTheDocument()
  })

  it('renders the value with muted tertiary text when placeholder is true (R4.4)', () => {
    render(
      <SettingsRow
        label="Location"
        value="No location selected"
        placeholder
        onPress={onPress}
      />
    )

    const value = screen.getByText('No location selected')
    expect(value).toHaveClass('text-text-tertiary')
    expect(value).not.toHaveClass('text-text-secondary')
  })

  it('renders the value with secondary (non-muted) text when placeholder is false (R4.4)', () => {
    render(<SettingsRow label="Madhab" value="Shafi" onPress={onPress} />)

    const value = screen.getByText('Shafi')
    expect(value).toHaveClass('text-text-secondary')
    expect(value).not.toHaveClass('text-text-tertiary')
  })

  it('fires onPress when the row is activated (R7.1)', () => {
    render(<SettingsRow label="Madhab" value="Shafi" onPress={onPress} />)

    fireEvent.click(screen.getByRole('button', { name: /Madhab/i }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders a right-aligned chevron disclosure indicator', () => {
    const { container } = render(
      <SettingsRow label="Location" value="London" onPress={onPress} />
    )

    // lucide-react renders an <svg> with a lucide class; the chevron is the disclosure icon.
    const chevron = container.querySelector('svg.lucide-chevron-right')
    expect(chevron).toBeInTheDocument()
  })

  it('applies the min-h-touch class for a 44x44 touch target (R10.3)', () => {
    render(<SettingsRow label="Madhab" value="Shafi" onPress={onPress} />)

    expect(screen.getByRole('button', { name: /Madhab/i })).toHaveClass('min-h-touch')
  })

  it('renders a divider by default and omits it on the last row', () => {
    const { rerender } = render(
      <SettingsRow label="Madhab" value="Shafi" onPress={onPress} />
    )
    expect(screen.getByRole('button', { name: /Madhab/i })).toHaveClass('border-b')

    rerender(<SettingsRow label="Madhab" value="Shafi" onPress={onPress} isLast />)
    expect(screen.getByRole('button', { name: /Madhab/i })).not.toHaveClass('border-b')
  })

  it('renders an optional leading icon', () => {
    render(
      <SettingsRow
        label="Location"
        value="London"
        onPress={onPress}
        icon={<svg data-testid="leading-icon" />}
      />
    )

    expect(screen.getByTestId('leading-icon')).toBeInTheDocument()
  })
})
