import { render, screen, fireEvent } from '@testing-library/react'
import { PrayerScheduleRow } from '../PrayerScheduleRow'
import { formatTime } from '../prayerRowViewModel'
import type { PrayerRowViewModel } from '../prayerRowViewModel'

// --- Fixtures: one PrayerRowViewModel per state (R3.2–R3.9) --------------

const passedRow: PrayerRowViewModel = {
  name: 'Dhuhr',
  time: '13:15',
  isPrayer: true,
  state: 'passed',
  timeUntil: null,
  completed: false,
}

const nowRow: PrayerRowViewModel = {
  name: 'Asr',
  time: '16:36',
  isPrayer: true,
  state: 'now',
  timeUntil: 'now',
  completed: false,
}

const upNextRow: PrayerRowViewModel = {
  name: 'Maghrib',
  time: '19:02',
  isPrayer: true,
  state: 'upnext',
  timeUntil: 'in 2h 10m',
  completed: false,
}

const futureRow: PrayerRowViewModel = {
  name: 'Isha',
  time: '20:30',
  isPrayer: true,
  state: 'future',
  timeUntil: 'in 3h 30m',
  completed: false,
}

const sunriseRow: PrayerRowViewModel = {
  name: 'Sunrise',
  time: '06:42',
  isPrayer: false,
  state: 'passed',
  timeUntil: null,
  completed: false,
}

const fajrRow: PrayerRowViewModel = {
  name: 'Fajr',
  time: '05:12',
  isPrayer: true,
  state: 'passed',
  timeUntil: null,
  completed: false,
  imsak: '05:02',
}

describe('PrayerScheduleRow', () => {
  const onToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderRow = (
    row: PrayerRowViewModel,
    overrides?: Partial<{
      showCompletion: boolean
      isLast: boolean
    }>,
  ) =>
    render(
      <PrayerScheduleRow
        row={row}
        showCompletion={overrides?.showCompletion ?? true}
        onToggle={onToggle}
        formatTime={formatTime}
        isLast={overrides?.isLast ?? false}
      />,
    )

  // --- passed state (R3.3) -------------------------------------------------
  it('renders the "Passed" signal with reduced emphasis for a passed row (R3.3)', () => {
    renderRow(passedRow)

    expect(screen.getByText('Passed')).toBeInTheDocument()

    // Reduced-emphasis name text (still readable, >= 4.5:1 via token).
    const name = screen.getByText('Dhuhr')
    expect(name).toHaveClass('text-text-secondary')
  })

  // --- now state (R3.4, R3.7) ---------------------------------------------
  it('renders the "Now" signal for a now row (R3.4, R3.7)', () => {
    const { container } = renderRow(nowRow)

    expect(screen.getByText('Now')).toBeInTheDocument()

    // Row carries the teal-muted tint (token, not a hard-coded green).
    const rowEl = container.firstChild as HTMLElement
    expect(rowEl).toHaveClass('bg-teal-muted')
  })

  // --- upnext state (R3.5, R3.7, R3.8) ------------------------------------
  it('renders the teal tint, icon, "Up next" label, and countdown for an upnext row (R3.5, R3.7, R3.8)', () => {
    const { container } = renderRow(upNextRow)

    expect(screen.getByText('Up next')).toBeInTheDocument()

    // Teal tint on the row.
    const rowEl = container.firstChild as HTMLElement
    expect(rowEl).toHaveClass('bg-teal-muted')

    // An indicator icon accompanies the "Up next" label.
    expect(container.querySelector('svg.lucide-circle')).toBeInTheDocument()

    // Countdown from row.timeUntil.
    expect(screen.getByText('in 2h 10m')).toBeInTheDocument()
  })

  // --- future state (R3.8) -------------------------------------------------
  it('renders the remaining time for a future row (R3.8)', () => {
    renderRow(futureRow)

    expect(screen.getByText('in 3h 30m')).toBeInTheDocument()
    // No "Passed"/"Now"/"Up next" signals for a plain future row.
    expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    expect(screen.queryByText('Now')).not.toBeInTheDocument()
    expect(screen.queryByText('Up next')).not.toBeInTheDocument()
  })

  // --- Sunrise (R3.2) ------------------------------------------------------
  it('renders Sunrise quietly with no completion control (R3.2)', () => {
    const { container } = renderRow(sunriseRow)

    expect(screen.getByText('Sunrise')).toBeInTheDocument()
    // Sunrise icon present.
    expect(container.querySelector('svg.lucide-sunrise')).toBeInTheDocument()
    // Formatted time shown.
    expect(screen.getByText('6:42 AM')).toBeInTheDocument()
    // No completion toggle button for a non-prayer row.
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // --- Fajr Imsak (R3.6) ---------------------------------------------------
  it('renders the Imsak time inside the Fajr row (R3.6)', () => {
    renderRow(fajrRow)

    // Imsak label derived from row.imsak, formatted for display.
    expect(screen.getByText('Imsak 5:02 AM')).toBeInTheDocument()
  })

  it('does not render Imsak on non-Fajr rows (R3.6)', () => {
    renderRow(futureRow)

    expect(screen.queryByText(/Imsak/)).not.toBeInTheDocument()
  })

  // --- completion toggle (R3.9, R10.1) ------------------------------------
  it('calls onToggle with the prayer name when the completion control is activated (R3.9)', () => {
    renderRow(futureRow)

    fireEvent.click(screen.getByRole('button'))

    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith('Isha')
  })

  it('conveys the checked state via a Check icon and an accessible label, not color alone (R10.1, R3.9)', () => {
    const { container } = renderRow({ ...futureRow, completed: true })

    // Checked state uses the Check icon (icon signal, not color alone).
    expect(container.querySelector('svg.lucide-check')).toBeInTheDocument()
    // Accessible label conveys completion in text.
    expect(
      screen.getByRole('button', { name: /marked complete/i }),
    ).toBeInTheDocument()
  })

  it('conveys the unchecked state via an empty Circle icon and a "Mark complete" label (R10.1)', () => {
    const { container } = renderRow({ ...futureRow, completed: false })

    expect(container.querySelector('svg.lucide-circle')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^Mark .* complete$/i }),
    ).toBeInTheDocument()
  })

  it('omits the completion control when showCompletion is false', () => {
    renderRow(futureRow, { showCompletion: false })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // --- token discipline: no hard-coded green background (R10.1) ------------
  it('uses semantic tokens and no hard-coded bg-green-900 in any state', () => {
    for (const row of [passedRow, nowRow, upNextRow, futureRow, fajrRow, sunriseRow]) {
      const { container, unmount } = renderRow(row)
      expect(container.innerHTML).not.toContain('bg-green-900')
      unmount()
    }
  })

  // --- divider behavior ----------------------------------------------------
  it('renders a divider by default and omits it on the last row', () => {
    const { container, rerender } = render(
      <PrayerScheduleRow
        row={futureRow}
        showCompletion
        onToggle={onToggle}
        formatTime={formatTime}
        isLast={false}
      />,
    )
    expect(container.firstChild).toHaveClass('border-b')

    rerender(
      <PrayerScheduleRow
        row={futureRow}
        showCompletion
        onToggle={onToggle}
        formatTime={formatTime}
        isLast
      />,
    )
    expect(container.firstChild).not.toHaveClass('border-b')
  })
})
