import { screen, waitFor } from '@testing-library/react'
import { RamadanCard } from '../RamadanCard'
import { renderWithAuth } from '@/test-utils'

// Mock fetch globally
global.fetch = jest.fn()

describe('RamadanCard', () => {
  let expectedRamadanDate: string

  beforeEach(() => {
    jest.clearAllMocks()

    // Keep the mocked start in the future so the countdown test is stable
    // after the 2025 Ramadan date has passed.
    const start = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000)
    expectedRamadanDate = start.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
    
    // Mock Hijri API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        currentHijri: { day: 28, month: 8, year: 1448, monthName: "Sha'ban" },
        ramadanStart: start.toISOString(),
        ramadanEnd: new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      expect(screen.getByText(/Ramadan 1448/i)).toBeInTheDocument()
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
      expect(screen.getByText(new RegExp(expectedRamadanDate))).toBeInTheDocument()
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
