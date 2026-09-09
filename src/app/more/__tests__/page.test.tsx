import { render, screen } from '@testing-library/react'
import MorePage from '@/app/more/page'

const mockUseAuth = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light', setTheme: jest.fn() }),
}))

describe('MorePage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: false })
  })

  it.each([
    ['Hadith', '/hadith'],
    ['Daily Quran & Hadith', '/quran-hadith'],
    ['Qibla', '/times#qibla'],
    ['Islamic Calendar', '/calendar'],
    ['Favorites', '/favorites'],
    ['Charity Tracker', '/charity'],
    ['Nearby Mosques', '/places/mosques'],
    ['Halal Food', '/places/food'],
    ['Prayer Preferences', '/times#preferences'],
    ['Prayer Notifications', '/times#notifications'],
    ['About Deen Companion', '/about'],
    ['Quran & Hadith Sources', '/about?tab=acknowledgements'],
    ['Privacy', '/privacy'],
  ])('links %s to %s', (label, href) => {
    render(<MorePage />)

    expect(screen.getByRole('link', { name: new RegExp(`^${label}`) })).toHaveAttribute('href', href)
  })

  it('keeps sign in optional and offers feedback without navigation', () => {
    render(<MorePage />)

    expect(screen.getByRole('button', { name: /^Sign In/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Feedback/ })).toBeInTheDocument()
  })

  it('shows a compact profile destination when signed in', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'reader@example.com' },
      profile: { display_name: 'Reader' },
      loading: false,
    })

    render(<MorePage />)

    expect(screen.getByRole('link', { name: /^Profile/ })).toHaveAttribute('href', '/profile')
    expect(screen.getByText('Reader')).toBeInTheDocument()
  })
})
