import { render, screen } from '@testing-library/react'
import { BottomNavigation } from '@/components/BottomNavigation'

let mockPathname = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

describe('BottomNavigation', () => {
  beforeEach(() => {
    mockPathname = '/'
  })

  it('maps every primary tab to the existing feature route', () => {
    render(<BottomNavigation />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Quran' })).toHaveAttribute('href', '/quran')
    expect(screen.getByRole('link', { name: 'Prayer' })).toHaveAttribute('href', '/times')
    expect(screen.getByRole('link', { name: 'Zikr' })).toHaveAttribute('href', '/zikr')
    expect(screen.getByRole('link', { name: 'More' })).toHaveAttribute('href', '/more')
  })

  it('positions a single presentation-only selection indicator for the active tab', () => {
    mockPathname = '/times'
    const { container } = render(<BottomNavigation />)

    const indicator = container.querySelector('[data-testid="mobile-tab-indicator"]')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
    expect(indicator).toHaveStyle({ '--active-tab-index': '2' })
  })

  it.each([
    ['/', 'Home'],
    ['/quran', 'Quran'],
    ['/quran/2', 'Quran'],
    ['/times', 'Prayer'],
    ['/zikr', 'Zikr'],
    ['/more', 'More'],
    ['/hadith/bukhari/1', 'More'],
    ['/quran-hadith', 'More'],
    ['/places/mosques', 'More'],
    ['/calendar', 'More'],
    ['/charity', 'More'],
    ['/favorites', 'More'],
    ['/profile', 'More'],
    ['/about', 'More'],
    ['/privacy', 'More'],
  ])('marks %s with the %s tab active', (pathname, activeLabel) => {
    mockPathname = pathname
    render(<BottomNavigation />)

    expect(screen.getByRole('link', { name: activeLabel })).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page')).toHaveLength(1)
  })

  it('does not render primary navigation in a focused admin flow', () => {
    mockPathname = '/admin'
    render(<BottomNavigation />)

    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()
  })
})
