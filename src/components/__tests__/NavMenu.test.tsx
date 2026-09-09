import { render, screen } from '@testing-library/react'
import { NavMenu } from '@/components/NavMenu'

let mockPathname = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

describe('NavMenu', () => {
  beforeEach(() => {
    mockPathname = '/'
  })

  it('presents the same five primary destinations on desktop', () => {
    render(<NavMenu />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Quran' })).toHaveAttribute('href', '/quran')
    expect(screen.getByRole('link', { name: 'Prayer' })).toHaveAttribute('href', '/times')
    expect(screen.getByRole('link', { name: 'Zikr' })).toHaveAttribute('href', '/zikr')
    expect(screen.getByRole('link', { name: 'More' })).toHaveAttribute('href', '/more')
  })

  it.each(['/more', '/hadith/bukhari/1', '/calendar', '/places/food', '/profile'])('selects More for %s', (pathname) => {
    mockPathname = pathname
    render(<NavMenu />)

    expect(screen.getByRole('link', { name: 'More' })).toHaveAttribute('aria-current', 'page')
  })
})
