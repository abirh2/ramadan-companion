import { render, screen } from '@testing-library/react'
import { NextPrayerHero } from '../NextPrayerHero'

// Identity/format stubs — the hero should pass raw values through these.
const formatTime = (t: string) => `formatted:${t}`
const formatCountdown = (c: string) => `countdown:${c}`

const baseNextPrayer = {
  name: 'Dhuhr',
  countdown: '2h 14m',
  time: '12:36',
  isTomorrow: false,
}

const baseLocation = { city: 'London' }

describe('NextPrayerHero', () => {
  it('renders the prayer name, countdown, formatted time, and location (R1.1, R1.2, R1.3, R1.4)', () => {
    render(
      <NextPrayerHero
        nextPrayer={baseNextPrayer}
        location={baseLocation}
        loading={false}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    expect(screen.getByText('Dhuhr')).toBeInTheDocument()
    expect(screen.getByText('countdown:2h 14m')).toBeInTheDocument()
    expect(screen.getByText('at formatted:12:36')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
  })

  it('appends a "tomorrow" indicator when nextPrayer.isTomorrow is true (R1.8)', () => {
    render(
      <NextPrayerHero
        nextPrayer={{ ...baseNextPrayer, name: 'Fajr', isTomorrow: true }}
        location={baseLocation}
        loading={false}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    expect(screen.getByText(/Fajr\s+tomorrow/i)).toBeInTheDocument()
  })

  it('omits the "tomorrow" indicator when nextPrayer.isTomorrow is false (R1.8)', () => {
    render(
      <NextPrayerHero
        nextPrayer={baseNextPrayer}
        location={baseLocation}
        loading={false}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    expect(screen.getByRole('heading', { name: 'Dhuhr' })).toBeInTheDocument()
    expect(screen.queryByText(/tomorrow/i)).not.toBeInTheDocument()
  })

  it('exposes the countdown as a timer without announcing every second', () => {
    render(
      <NextPrayerHero
        nextPrayer={baseNextPrayer}
        location={baseLocation}
        loading={false}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    const countdown = screen.getByText('countdown:2h 14m')
    expect(countdown).toHaveAttribute('role', 'timer')
    expect(countdown).toHaveAttribute('aria-live', 'off')
    expect(countdown).toHaveAccessibleName(/Dhuhr, countdown:2h 14m until prayer at formatted:12:36/i)
  })

  it('renders location smaller than the name and countdown via type-caption tokens (R1.4, R1.6)', () => {
    render(
      <NextPrayerHero
        nextPrayer={baseNextPrayer}
        location={baseLocation}
        loading={false}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    // jsdom does not resolve CSS, so compare the typography tokens each element
    // carries. type-caption (0.8125rem) is smaller than the name (text-[2rem])
    // and the countdown (type-feature-number, 2.5rem).
    const location = screen.getByText('London')
    const name = screen.getByRole('heading', { name: 'Dhuhr' })
    const countdown = screen.getByText('countdown:2h 14m')

    expect(location.closest('.type-caption')).not.toBeNull()
    expect(name).toHaveClass('text-[2rem]')
    expect(countdown).toHaveClass('type-feature-number')
    // The location must not use the larger name/countdown type sizes.
    expect(location).not.toHaveClass('text-[2rem]')
    expect(location).not.toHaveClass('type-feature-number')
  })

  it('shows an unavailable placeholder in place of name/countdown/time when nextPrayer is null (R1.9)', () => {
    render(
      <NextPrayerHero
        nextPrayer={null}
        location={baseLocation}
        loading={false}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    expect(screen.getByText(/Prayer times unavailable/i)).toBeInTheDocument()
    // Name, countdown, and time are replaced by the placeholder.
    expect(screen.queryByText('Dhuhr')).not.toBeInTheDocument()
    expect(screen.queryByText('countdown:2h 14m')).not.toBeInTheDocument()
    expect(screen.queryByText(/^at /i)).not.toBeInTheDocument()
  })

  it('shows the unavailable placeholder when an error is present (R1.9)', () => {
    render(
      <NextPrayerHero
        nextPrayer={baseNextPrayer}
        location={baseLocation}
        loading={false}
        error="Location unavailable"
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    expect(screen.getByText(/Prayer times unavailable/i)).toBeInTheDocument()
    expect(screen.queryByText('Dhuhr')).not.toBeInTheDocument()
  })

  it('renders the loading variant with an accessible status message (R15.1)', () => {
    render(
      <NextPrayerHero
        nextPrayer={null}
        location={baseLocation}
        loading={true}
        error={null}
        formatTime={formatTime}
        formatCountdown={formatCountdown}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/Loading today's prayer times/i)).toBeInTheDocument()
    // The loaded content must not render while loading.
    expect(screen.queryByText('Dhuhr')).not.toBeInTheDocument()
    expect(screen.queryByText(/Prayer times unavailable/i)).not.toBeInTheDocument()
  })
})
