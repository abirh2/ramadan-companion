import { screen, waitFor } from '@testing-library/react'
import { RamadanCard } from '../RamadanCard'
import { renderWithAuth } from '@/test-utils'

// Mock fetch globally
global.fetch = jest.fn()

describe('RamadanCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock Hijri API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        currentHijri: { day: 28, month: 8, year: 1446, monthName: "Sha'ban" },
        ramadanStart: '2025-03-01T00:00:00.000Z',
        ramadanEnd: '2025-03-30T00:00:00.000Z',
        daysUntilRamadan: 42,
        isRamadan: false,
        currentRamadanDay: undefined,
      }),
    })
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => '0')
  })

  it('renders card with Ramadan title', async () => {
    renderWithAuth(<RamadanCard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Ramadan 1446/i)).toBeInTheDocument()
    })
  })

  it('displays countdown to Ramadan', async () => {
    renderWithAuth(<RamadanCard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Starts in/i)).toBeInTheDocument()
      // The countdown shows days in format like "42d 0h 0m 0s"
      expect(screen.getByText(/\d+d \d+h \d+m \d+s/)).toBeInTheDocument()
    })
  })

  it('shows expected date', async () => {
    renderWithAuth(<RamadanCard />)
    
    await waitFor(() => {
      // The date format is "Expected: [Date] • Adjust in Settings"
      expect(screen.getByText(/Expected:/)).toBeInTheDocument()
      // Date may vary based on timezone, so just check for a date pattern
      expect(screen.getByText(/February 28, 2025|March 1, 2025/)).toBeInTheDocument()
    })
  })

  it('includes settings adjustment hint', async () => {
    renderWithAuth(<RamadanCard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Adjust in Settings/i)).toBeInTheDocument()
    })
  })

  it('renders moon icon', async () => {
    const { container } = renderWithAuth(<RamadanCard />)
    
    await waitFor(() => {
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  it('has accent border styling', async () => {
    const { container } = renderWithAuth(<RamadanCard />)
    
    await waitFor(() => {
      const card = container.firstChild
      expect(card).toHaveClass('border-accent/30')
    })
  })
})

