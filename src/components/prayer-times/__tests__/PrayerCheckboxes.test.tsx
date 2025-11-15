import { render, screen, fireEvent } from '@testing-library/react'
import { PrayerCheckbox, PrayerCompletionSummary } from '../PrayerCheckboxes'
import type { DailyPrayerCompletion } from '@/types/prayer-tracking.types'

describe('PrayerCheckbox', () => {
  const mockToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders unchecked state', () => {
    render(<PrayerCheckbox prayerName="Fajr" completed={false} onToggle={mockToggle} />)

    const button = screen.getByRole('button', { name: /Mark Fajr as completed/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('renders checked state', () => {
    render(<PrayerCheckbox prayerName="Dhuhr" completed={true} onToggle={mockToggle} />)

    const button = screen.getByRole('button', { name: /Mark Dhuhr as incomplete/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    render(<PrayerCheckbox prayerName="Asr" completed={false} onToggle={mockToggle} />)

    const button = screen.getByRole('button', { name: /Mark Asr as completed/i })
    fireEvent.click(button)

    expect(mockToggle).toHaveBeenCalledWith('Asr')
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('handles disabled state', () => {
    render(<PrayerCheckbox prayerName="Maghrib" completed={false} onToggle={mockToggle} disabled />)

    const button = screen.getByRole('button', { name: /Mark Maghrib as completed/i })
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(mockToggle).not.toHaveBeenCalled()
  })

  it('toggles between completed and incomplete states', () => {
    const { rerender } = render(
      <PrayerCheckbox prayerName="Isha" completed={false} onToggle={mockToggle} />
    )

    let button = screen.getByRole('button', { name: /Mark Isha as completed/i })
    expect(button).toBeInTheDocument()

    // Rerender with completed=true
    rerender(<PrayerCheckbox prayerName="Isha" completed={true} onToggle={mockToggle} />)

    button = screen.getByRole('button', { name: /Mark Isha as incomplete/i })
    expect(button).toBeInTheDocument()
  })
})

describe('PrayerCompletionSummary', () => {
  it('returns null when todayCompletion is null', () => {
    const { container } = render(<PrayerCompletionSummary todayCompletion={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays 0/5 prayers completed with 0%', () => {
    const completion: DailyPrayerCompletion = {
      date: '2024-01-15',
      fajr_completed: false,
      dhuhr_completed: false,
      asr_completed: false,
      maghrib_completed: false,
      isha_completed: false,
      totalCompleted: 0,
      completionRate: 0,
    }

    render(<PrayerCompletionSummary todayCompletion={completion} />)

    expect(screen.getByText('0/5')).toBeInTheDocument()
    expect(screen.getByText('prayers completed')).toBeInTheDocument()
    expect(screen.queryByText('%')).not.toBeInTheDocument() // No percentage when 0
  })

  it('displays 3/5 prayers completed with percentage', () => {
    const completion: DailyPrayerCompletion = {
      date: '2024-01-15',
      fajr_completed: true,
      dhuhr_completed: true,
      asr_completed: true,
      maghrib_completed: false,
      isha_completed: false,
      totalCompleted: 3,
      completionRate: 60,
    }

    render(<PrayerCompletionSummary todayCompletion={completion} />)

    expect(screen.getByText('3/5')).toBeInTheDocument()
    expect(screen.getByText('prayers completed')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('displays 5/5 prayers completed with 100%', () => {
    const completion: DailyPrayerCompletion = {
      date: '2024-01-15',
      fajr_completed: true,
      dhuhr_completed: true,
      asr_completed: true,
      maghrib_completed: true,
      isha_completed: true,
      totalCompleted: 5,
      completionRate: 100,
    }

    render(<PrayerCompletionSummary todayCompletion={completion} />)

    expect(screen.getByText('5/5')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('displays correct formatting with 1 prayer completed', () => {
    const completion: DailyPrayerCompletion = {
      date: '2024-01-15',
      fajr_completed: true,
      dhuhr_completed: false,
      asr_completed: false,
      maghrib_completed: false,
      isha_completed: false,
      totalCompleted: 1,
      completionRate: 20,
    }

    render(<PrayerCompletionSummary todayCompletion={completion} />)

    expect(screen.getByText('1/5')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
  })
})

