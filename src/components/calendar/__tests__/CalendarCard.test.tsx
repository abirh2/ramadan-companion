import { render, screen, waitFor } from '@testing-library/react'
import { CalendarCard } from '@/components/dashboard/CalendarCard'

// Mock fetch
global.fetch = jest.fn()

describe('CalendarCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<CalendarCard />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/loading calendar/i)).toBeInTheDocument()
  })

  it('should render error state on API failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<CalendarCard />)

    await waitFor(() => {
      expect(screen.getByText(/unable to load/i)).toBeInTheDocument()
    })
  })

  it('should render calendar data when API succeeds', async () => {
    const mockData = {
      code: 200,
      status: 'OK',
      data: {
        gregorian: {
          day: 21,
          month: 11,
          year: 2024,
          monthName: 'November',
          weekday: 'Thursday',
          date: '21-11-2024',
        },
        hijri: {
          day: 19,
          month: 5,
          year: 1446,
          monthName: 'Jumada al-Ula',
          monthNameAr: 'جُمادى الأولى',
          weekday: 'Al Khamis',
          weekdayAr: 'الخميس',
          date: '19-05-1446',
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<CalendarCard />)

    await waitFor(() => {
      expect(screen.getByText(/thursday, november 21, 2024/i)).toBeInTheDocument()
      expect(screen.getByText(/19 jumada al-ula 1446/i)).toBeInTheDocument()
    })
  })

  it('should have accessible link to calendar page', async () => {
    const mockData = {
      code: 200,
      status: 'OK',
      data: {
        gregorian: {
          day: 21,
          month: 11,
          year: 2024,
          monthName: 'November',
          weekday: 'Thursday',
          date: '21-11-2024',
        },
        hijri: {
          day: 19,
          month: 5,
          year: 1446,
          monthName: 'Jumada al-Ula',
          monthNameAr: 'جُمادى الأولى',
          weekday: 'Al Khamis',
          weekdayAr: 'الخميس',
          date: '19-05-1446',
        },
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<CalendarCard />)

    await waitFor(() => {
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/calendar')
    })
  })
})

