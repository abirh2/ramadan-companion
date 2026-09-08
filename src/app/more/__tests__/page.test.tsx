import { render, screen } from '@testing-library/react'
import MorePage from '@/app/more/page'

describe('MorePage', () => {
  it.each([
    ['Hadith Browser', '/hadith'],
    ['Daily Quran & Hadith', '/quran-hadith'],
    ['Qibla Finder', '/times#qibla'],
    ['Islamic Calendar', '/calendar'],
    ['Favorites', '/favorites'],
    ['Charity Tracker', '/charity'],
    ['Mosques', '/places/mosques'],
    ['Halal Food', '/places/food'],
    ['About Deen Companion', '/about'],
    ['Privacy', '/privacy'],
  ])('links %s to %s', (label, href) => {
    render(<MorePage />)

    expect(screen.getByRole('link', { name: new RegExp(`^${label}`) })).toHaveAttribute('href', href)
  })
})
