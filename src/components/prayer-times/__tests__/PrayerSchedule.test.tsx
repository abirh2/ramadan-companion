import { render, screen } from '@testing-library/react'
import { PrayerSchedule } from '../PrayerSchedule'
import { formatTime } from '../prayerRowViewModel'
import type { PrayerRowViewModel } from '../prayerRowViewModel'

// --- Fixture: the six ordered rows (R3.1) --------------------------------
// Order is Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha. Sunrise is the only
// non-prayer row; Fajr carries an Imsak time.
const rows: PrayerRowViewModel[] = [
  {
    name: 'Fajr',
    time: '05:12',
    isPrayer: true,
    state: 'passed',
    timeUntil: null,
    completed: false,
    imsak: '05:02',
  },
  {
    name: 'Sunrise',
    time: '06:42',
    isPrayer: false,
    state: 'passed',
    timeUntil: null,
    completed: false,
  },
  {
    name: 'Dhuhr',
    time: '13:15',
    isPrayer: true,
    state: 'now',
    timeUntil: 'now',
    completed: false,
  },
  {
    name: 'Asr',
    time: '16:36',
    isPrayer: true,
    state: 'upnext',
    timeUntil: 'in 2h 10m',
    completed: false,
  },
  {
    name: 'Maghrib',
    time: '19:02',
    isPrayer: true,
    state: 'future',
    timeUntil: 'in 4h 40m',
    completed: false,
  },
  {
    name: 'Isha',
    time: '20:30',
    isPrayer: true,
    state: 'future',
    timeUntil: 'in 6h 8m',
    completed: false,
  },
]

const header = {
  gregorianDate: 'Monday, March 11',
  hijriDate: '10 Ramadan 1446',
  hijriUnavailable: false,
  onOpenDatePicker: jest.fn(),
}

describe('PrayerSchedule', () => {
  const onToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderSchedule = () =>
    render(
      <PrayerSchedule
        header={header}
        rows={rows}
        showCompletion
        onToggle={onToggle}
        formatTime={formatTime}
      />,
    )

  // --- one grouped surface (R3.10) ----------------------------------------
  it('renders all prayers inside a single grouped surface, not one card per prayer (R3.10, R17.9)', () => {
    const { container } = renderSchedule()

    // Exactly one grouped-surface container wraps the whole schedule.
    const surfaces = container.querySelectorAll('.bg-surface-grouped')
    expect(surfaces).toHaveLength(1)

    const surface = surfaces[0] as HTMLElement
    expect(surface.tagName).toBe('SECTION')
    // Grouped surface uses the rounded-grouped token and clips its contents.
    expect(surface).toHaveClass('rounded-grouped')
    expect(surface).toHaveClass('overflow-hidden')

    // No leftover per-prayer card wrappers: no rounded-card wrapper repeated
    // per row inside the surface (R17.9).
    expect(container.querySelectorAll('.rounded-grouped')).toHaveLength(1)
    expect(container.querySelector('.rounded-card')).toBeNull()
  })

  // --- exactly six rows in order (R3.1) -----------------------------------
  it('renders exactly six rows in the order Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha (R3.1)', () => {
    renderSchedule()

    const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    for (const name of names) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }

    // Verify document order matches the schedule order.
    const rendered = names.map((name) => screen.getByText(name))
    for (let i = 0; i < rendered.length - 1; i++) {
      const position = rendered[i].compareDocumentPosition(rendered[i + 1])
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  // --- header rendered inside the surface (R2.6) --------------------------
  it('renders the ScheduleHeader inside the grouped surface, before the rows (R2.6)', () => {
    const { container } = renderSchedule()

    const surface = container.querySelector('.bg-surface-grouped') as HTMLElement

    // Header content lives inside the same surface.
    const gregorian = screen.getByText('Monday, March 11')
    const hijri = screen.getByText('10 Ramadan 1446')
    expect(surface).toContainElement(gregorian)
    expect(surface).toContainElement(hijri)

    // The "Other Dates" control is present inside the surface header.
    const otherDates = screen.getByRole('button', { name: /Other Dates/i })
    expect(surface).toContainElement(otherDates)

    // Header precedes the first prayer row in document order.
    const fajr = screen.getByText('Fajr')
    const position = gregorian.compareDocumentPosition(fajr)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  // --- dividers between rows, none after the last (R3.1) ------------------
  it('places dividers between rows and omits the divider after the final (Isha) row (R3.1)', () => {
    const { container } = renderSchedule()

    const surface = container.querySelector('.bg-surface-grouped') as HTMLElement

    // Direct row children of the surface are: header + six rows.
    const directChildren = Array.from(surface.children) as HTMLElement[]
    // header is first; the remaining six are the prayer rows.
    const rowEls = directChildren.slice(1)
    expect(rowEls).toHaveLength(6)

    // First five rows carry a bottom divider; the last (Isha) does not.
    rowEls.slice(0, 5).forEach((row) => {
      expect(row).toHaveClass('border-b')
    })
    expect(rowEls[5]).not.toHaveClass('border-b')
  })
})
