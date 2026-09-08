import { render, screen, fireEvent } from '@testing-library/react'
import { PreferencesSection } from '../PreferencesSection'

describe('PreferencesSection', () => {
  const onEditCalculationMethod = jest.fn()
  const onEditMadhab = jest.fn()
  const onEditLocation = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderSection = (locationLabel: string | null = 'London') =>
    render(
      <PreferencesSection
        calculationMethodLabel="ISNA"
        madhabLabel="Hanafi (later Asr)"
        locationLabel={locationLabel}
        onEditCalculationMethod={onEditCalculationMethod}
        onEditMadhab={onEditMadhab}
        onEditLocation={onEditLocation}
        notifications={<div data-testid="notif" />}
      />
    )

  it('shows the current Calculation Method, Madhab, and Location values (R4.1, R4.2, R4.3)', () => {
    renderSection()

    expect(screen.getByText('Calculation Method')).toBeInTheDocument()
    expect(screen.getByText('ISNA')).toBeInTheDocument()

    expect(screen.getByText('Madhab')).toBeInTheDocument()
    expect(screen.getByText('Hanafi (later Asr)')).toBeInTheDocument()

    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
  })

  it('invokes onEditCalculationMethod when the Calculation Method row is activated (R4.6)', () => {
    renderSection()

    fireEvent.click(screen.getByRole('button', { name: /Calculation Method/i }))

    expect(onEditCalculationMethod).toHaveBeenCalledTimes(1)
    expect(onEditMadhab).not.toHaveBeenCalled()
    expect(onEditLocation).not.toHaveBeenCalled()
  })

  it('invokes onEditMadhab when the Madhab row is activated (R4.7)', () => {
    renderSection()

    fireEvent.click(screen.getByRole('button', { name: /Madhab/i }))

    expect(onEditMadhab).toHaveBeenCalledTimes(1)
    expect(onEditCalculationMethod).not.toHaveBeenCalled()
    expect(onEditLocation).not.toHaveBeenCalled()
  })

  it('invokes onEditLocation when the Location row is activated (R4.8)', () => {
    renderSection()

    fireEvent.click(screen.getByRole('button', { name: /Location/i }))

    expect(onEditLocation).toHaveBeenCalledTimes(1)
    expect(onEditCalculationMethod).not.toHaveBeenCalled()
    expect(onEditMadhab).not.toHaveBeenCalled()
  })

  it('renders the muted "No location selected" placeholder when locationLabel is null (R4.4)', () => {
    renderSection(null)

    const placeholder = screen.getByText('No location selected')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveClass('text-text-tertiary')
  })

  it('renders the muted placeholder when locationLabel is an empty/whitespace string (R4.4)', () => {
    renderSection('   ')

    const placeholder = screen.getByText('No location selected')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveClass('text-text-tertiary')
  })

  it('renders the notifications node (R4.5)', () => {
    renderSection()

    expect(screen.getByTestId('notif')).toBeInTheDocument()
  })
})
