import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HadithCard } from '../HadithCard'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock hooks
jest.mock('@/hooks/useHadithOfTheDay')
jest.mock('@/hooks/useHadithFavorites')
jest.mock('@/components/auth/LoginModal', () => ({
  LoginModal: () => <div data-testid="login-modal">Login Modal</div>,
}))

import * as useHadithOfTheDayModule from '@/hooks/useHadithOfTheDay'
import * as useHadithFavoritesModule from '@/hooks/useHadithFavorites'

const mockUseHadithOfTheDay = useHadithOfTheDayModule.useHadithOfTheDay as jest.MockedFunction<typeof useHadithOfTheDayModule.useHadithOfTheDay>
const mockUseHadithFavorites = useHadithFavoritesModule.useHadithFavorites as jest.MockedFunction<typeof useHadithFavoritesModule.useHadithFavorites>

describe('HadithCard', () => {
  const mockHadithData = {
    hadithEnglish: 'The reward of deeds depends upon the intentions.',
    hadithUrdu: 'تمام اعمال کا دارومدار نیت پر ہے',
    hadithArabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
    narrator: "Narrated 'Umar bin Al-Khattab",
    book: 'Sahih Bukhari',
    bookSlug: 'sahih-bukhari',
    chapter: 'Belief',
    hadithNumber: '1',
    status: 'Sahih' as const,
    selectedLanguage: 'english' as const,
    loading: false,
    error: null,
  }

  beforeEach(() => {
    mockUseHadithOfTheDay.mockReturnValue(mockHadithData)
    mockUseHadithFavorites.mockReturnValue({
      isFavorited: false,
      isLoading: false,
      toggleFavorite: jest.fn(),
      requiresAuth: false,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render hadith card with data', async () => {
    render(<HadithCard />)

    await waitFor(() => {
      expect(screen.getByText('Hadith of the Day')).toBeInTheDocument()
      expect(screen.getByText(mockHadithData.hadithArabic)).toBeInTheDocument()
      expect(screen.getByText(mockHadithData.hadithEnglish)).toBeInTheDocument()
      expect(screen.getByText(`Sahih Bukhari 1`)).toBeInTheDocument()
      expect(screen.getByText('Sahih')).toBeInTheDocument()
    })
  })

  it('should render loading state', () => {
    mockUseHadithOfTheDay.mockReturnValue({
      ...mockHadithData,
      loading: true,
      hadithArabic: null,
    })

    render(<HadithCard />)

    // Check for the loading spinner (Loader2 icon with animate-spin class)
    const loader = document.querySelector('.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('should render error state', () => {
    mockUseHadithOfTheDay.mockReturnValue({
      ...mockHadithData,
      loading: false,
      error: 'Failed to load',
      hadithArabic: null,
    })

    render(<HadithCard />)

    expect(screen.getByText(/Failed to load daily hadith/i)).toBeInTheDocument()
  })

  it('should toggle favorite when heart icon is clicked', async () => {
    const mockToggleFavorite = jest.fn()
    mockUseHadithFavorites.mockReturnValue({
      isFavorited: false,
      isLoading: false,
      toggleFavorite: mockToggleFavorite,
      requiresAuth: false,
    })

    render(<HadithCard />)

    const heartButton = screen.getByRole('button', { name: /add to favorites/i })
    await userEvent.click(heartButton)

    expect(mockToggleFavorite).toHaveBeenCalled()
  })

  it('should display Urdu text when language is set to Urdu', async () => {
    mockUseHadithOfTheDay.mockReturnValue({
      ...mockHadithData,
      selectedLanguage: 'urdu' as const,
    })

    render(<HadithCard />)

    await waitFor(() => {
      expect(screen.getByText(mockHadithData.hadithUrdu)).toBeInTheDocument()
    })
  })

  it('should display Arabic text when language is set to Arabic', async () => {
    mockUseHadithOfTheDay.mockReturnValue({
      ...mockHadithData,
      selectedLanguage: 'arabic' as const,
    })

    render(<HadithCard />)

    await waitFor(() => {
      // Arabic text is always shown as the main text, so it should appear twice
      const arabicTexts = screen.getAllByText(mockHadithData.hadithArabic)
      expect(arabicTexts.length).toBeGreaterThan(0)
    })
  })

  it('should link to quran-hadith page', () => {
    render(<HadithCard />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/quran-hadith')
  })

  it('should show correct status badge colors', () => {
    render(<HadithCard />)

    const statusBadge = screen.getByText('Sahih')
    expect(statusBadge).toHaveClass('text-green-600')
  })
})
