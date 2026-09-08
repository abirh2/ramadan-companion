import { render, screen } from '@testing-library/react'
import Home from '../page'

jest.mock('@/components/dashboard/HomeDateContext', () => ({
  HomeDateContext: () => <header>Today&apos;s date</header>,
}))
jest.mock('@/components/dashboard/NextPrayerCard', () => ({
  NextPrayerCard: () => <section>Next prayer</section>,
}))
jest.mock('@/components/dashboard/IslamicEventsCarousel', () => ({
  IslamicEventsCarousel: () => <section>Upcoming events</section>,
}))
jest.mock('@/components/dashboard/DailyReflection', () => ({
  DailyReflection: () => <section>Today&apos;s reflection</section>,
}))
jest.mock('@/components/dashboard/QuickActions', () => ({
  QuickActions: () => <section>Tools</section>,
}))
jest.mock('@/components/FeedbackButton', () => ({
  FeedbackButton: () => <button>Feedback</button>,
}))

describe('Home page', () => {
  it('renders the redesigned daily hierarchy in order', () => {
    const { container } = render(<Home />)
    const content = container.textContent ?? ''

    expect(content.indexOf("Today's date")).toBeLessThan(content.indexOf('Next prayer'))
    expect(content.indexOf('Next prayer')).toBeLessThan(content.indexOf('Upcoming events'))
    expect(content.indexOf('Upcoming events')).toBeLessThan(content.indexOf("Today's reflection"))
    expect(content.indexOf("Today's reflection")).toBeLessThan(content.indexOf('Tools'))
  })

  it('keeps the Home surface narrow and mobile-first', () => {
    const { container } = render(<Home />)
    const wrapper = container.firstChild as HTMLElement

    expect(wrapper).toHaveClass('mx-auto', 'w-full', 'max-w-3xl', 'px-4', 'pb-12', 'pt-6')
  })

  it('preserves access to feedback', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: 'Feedback' })).toBeInTheDocument()
  })
})
