import { render, screen, fireEvent } from '@testing-library/react'
import { ScheduleHeader } from '../ScheduleHeader'

describe('ScheduleHeader', () => {
  const onOpenDatePicker = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('always renders the Gregorian date (R2.1)', () => {
    render(
      <ScheduleHeader
        gregorianDate="Monday, March 11"
        hijriDate="10 Ramadan 1446"
        hijriUnavailable={false}
        onOpenDatePicker={onOpenDatePicker}
      />
    )

    expect(screen.getByText('Monday, March 11')).toBeInTheDocument()
  })

  it('renders the Hijri date when present (R2.2)', () => {
    render(
      <ScheduleHeader
        gregorianDate="Monday, March 11"
        hijriDate="10 Ramadan 1446"
        hijriUnavailable={false}
        onOpenDatePicker={onOpenDatePicker}
      />
    )

    expect(screen.getByText('10 Ramadan 1446')).toBeInTheDocument()
    expect(screen.queryByText('Hijri date unavailable')).not.toBeInTheDocument()
  })

  it('shows "Hijri date unavailable" while keeping Gregorian visible when hijriUnavailable is true (R2.3)', () => {
    render(
      <ScheduleHeader
        gregorianDate="Monday, March 11"
        hijriDate={null}
        hijriUnavailable={true}
        onOpenDatePicker={onOpenDatePicker}
      />
    )

    expect(screen.getByText('Monday, March 11')).toBeInTheDocument()

    const unavailable = screen.getByText('Hijri date unavailable')
    expect(unavailable).toBeInTheDocument()
    expect(unavailable).toHaveClass('text-text-tertiary')
  })

  it('does not render a Hijri date when it is null and not flagged unavailable', () => {
    render(
      <ScheduleHeader
        gregorianDate="Monday, March 11"
        hijriDate={null}
        hijriUnavailable={false}
        onOpenDatePicker={onOpenDatePicker}
      />
    )

    expect(screen.getByText('Monday, March 11')).toBeInTheDocument()
    expect(screen.queryByText('Hijri date unavailable')).not.toBeInTheDocument()
  })

  it('calls onOpenDatePicker when the "Other Dates" control is activated (R2.4)', () => {
    render(
      <ScheduleHeader
        gregorianDate="Monday, March 11"
        hijriDate="10 Ramadan 1446"
        hijriUnavailable={false}
        onOpenDatePicker={onOpenDatePicker}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Other Dates/i }))

    expect(onOpenDatePicker).toHaveBeenCalledTimes(1)
  })
})
