import { fireEvent, render, screen } from '@testing-library/react'
import { GregorianCalendar } from '../GregorianCalendar'
import { IslamicCalendar } from '../IslamicCalendar'
import { TodayHeader } from '../TodayHeader'
import { UpcomingEvents } from '../UpcomingEvents'
import type { CalendarDate } from '@/types/calendar.types'

const dates: CalendarDate[] = [
  {
    gregorian: {
      day: 10,
      month: 9,
      year: 2026,
      monthName: 'September',
      weekday: 'Thursday',
      date: '10-09-2026',
    },
    hijri: {
      day: 28,
      month: 3,
      year: 1448,
      monthName: 'Rabīʿ al-awwal',
      monthNameAr: 'رَبِيع الْأَوَّل',
      weekday: 'Al Khamees',
      weekdayAr: 'الخميس',
      date: '28-03-1448',
    },
    isToday: true,
    isSelected: true,
    isImportant: true,
    importantDates: [
      {
        id: 'event',
        name: 'Existing event',
        hijriDate: { day: 28, month: 3 },
        significance: 'medium',
        branch: ['all'],
        color: '',
        icon: 'Calendar',
        description: 'Existing event description',
      },
    ],
  },
]

describe('Calendar experience', () => {
  it('announces Gregorian, Hijri, today, selected, and event states for a date cell', () => {
    const onDateSelect = jest.fn()
    render(<GregorianCalendar dates={dates} onDateSelect={onDateSelect} />)

    const dateCell = screen.getByRole('button', {
      name: /Thursday, September 10, 2026.*Hijri: 28 Rabīʿ al-awwal 1448.*Today.*Selected.*Event: Existing event/i,
    })

    expect(dateCell).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(dateCell)
    expect(onDateSelect).toHaveBeenCalledWith(dates[0])
  })

  it('makes Hijri the primary value in Islamic view while retaining Gregorian context', () => {
    render(<IslamicCalendar dates={dates} onDateSelect={jest.fn()} />)

    expect(screen.getByText('28')).toHaveAttribute('data-calendar-primary', 'true')
    expect(screen.getByText('10 Sep')).toBeInTheDocument()
  })

  it('renders today as a typographic Gregorian and Hijri pairing with correct Arabic direction', () => {
    render(<TodayHeader date={dates[0]} />)

    expect(screen.getByText('September 10, 2026')).toBeInTheDocument()
    expect(screen.getByText('28 Rabīʿ al-awwal 1448')).toBeInTheDocument()
    expect(screen.getByText('رَبِيع الْأَوَّل')).toHaveAttribute('dir', 'rtl')
    expect(screen.getByText('رَبِيع الْأَوَّل')).toHaveAttribute('lang', 'ar')
  })

  it('presents upcoming app events as a compact chronological list', () => {
    render(
      <UpcomingEvents
        loading={false}
        error={null}
        events={[
          {
            id: 'ramadan',
            name: 'Ramadan',
            arabicName: 'رمضان',
            description: 'Existing description',
            icon: 'Moon',
            startDate: '2027-02-07',
            endDate: '2027-03-08',
            durationDays: 30,
            daysUntil: 15,
            isActive: false,
            currentDay: null,
          },
        ]}
      />
    )

    expect(screen.getByRole('heading', { name: 'Upcoming' })).toBeInTheDocument()
    expect(screen.getByText('Ramadan')).toBeInTheDocument()
    expect(screen.getByText('February 7, 2027')).toBeInTheDocument()
    expect(screen.getByText('15 days')).toBeInTheDocument()
    expect(screen.getByText('رمضان')).toHaveAttribute('dir', 'rtl')
  })
})
