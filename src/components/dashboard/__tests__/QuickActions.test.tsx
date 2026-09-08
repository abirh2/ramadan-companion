import { render, screen } from '@testing-library/react'
import { QuickActions } from '../QuickActions'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('QuickActions', () => {
  it('keeps universal tools available while subtly labeling protected routes for guests', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false } as ReturnType<typeof useAuth>)
    render(<QuickActions />)

    expect(screen.getByRole('link', { name: 'Qibla' })).toHaveAttribute('href', '/times#qibla')
    expect(screen.getByRole('link', { name: 'Nearby' })).toHaveAttribute('href', '/places/mosques')
    expect(screen.getByRole('link', { name: /Charity, sign in required/i })).toHaveAttribute('href', '/charity')
    expect(screen.getByRole('link', { name: /Favorites, sign in required/i })).toHaveAttribute('href', '/favorites')
  })

  it('removes guest-only lock labels for signed-in users', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false } as ReturnType<typeof useAuth>)
    render(<QuickActions />)

    expect(screen.getByRole('link', { name: 'Charity' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Favorites' })).toBeInTheDocument()
    expect(screen.queryByTitle('Sign in required')).not.toBeInTheDocument()
  })
})
