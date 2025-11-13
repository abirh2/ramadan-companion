import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CharityCard } from '../CharityCard'
import { AuthContext } from '@/components/auth/AuthProvider'
import { AuthContextType } from '@/types/auth.types'

// Mock useDonations hook
jest.mock('@/hooks/useDonations', () => ({
  useDonations: () => ({
    donations: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
    isEmpty: true,
    summary: {
      ramadanTotal: 0,
      yearlyTotal: 0,
      allTimeTotal: 0,
      totalCount: 0,
    },
  }),
}))

const mockAuthContext: AuthContextType = {
  user: { id: '123', email: 'test@example.com' } as any,
  session: {} as any,
  profile: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signInWithOAuth: jest.fn(),
  signOut: jest.fn(),
  refreshProfile: jest.fn(),
}

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  )
}

describe('CharityCard', () => {
  it('renders card with Charity Tracker title', () => {
    renderWithAuth(<CharityCard />)
    
    expect(screen.getByText('Charity Tracker')).toBeInTheDocument()
  })

  it('displays Ramadan donation total', () => {
    renderWithAuth(<CharityCard />)
    
    expect(screen.getByText('This Ramadan')).toBeInTheDocument()
    const amounts = screen.getAllByText('$0.00')
    expect(amounts.length).toBeGreaterThan(0)
  })

  it('shows all-time donation total', () => {
    renderWithAuth(<CharityCard />)
    
    expect(screen.getByText('All Time')).toBeInTheDocument()
  })

  it('displays two separate totals', () => {
    renderWithAuth(<CharityCard />)
    
    const amounts = screen.getAllByText('$0.00')
    expect(amounts).toHaveLength(2)
  })

  it('includes descriptive text about tracking', () => {
    renderWithAuth(<CharityCard />)
    
    expect(screen.getByText(/Track your sadaqah and zakat donations/i)).toBeInTheDocument()
  })

  it('renders as a clickable link to charity page', () => {
    renderWithAuth(<CharityCard />)
    
    const link = screen.getByRole('link', { name: /Charity Tracker/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/charity')
  })

  it('uses grid layout for totals', () => {
    const { container } = renderWithAuth(<CharityCard />)
    
    const grid = container.querySelector('.grid-cols-2')
    expect(grid).toBeInTheDocument()
  })
})

