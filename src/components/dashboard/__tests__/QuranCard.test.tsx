import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { QuranCard } from '../QuranCard'

// Mock dependencies
jest.mock('@/hooks/useQuranOfTheDay', () => ({
  useQuranOfTheDay: () => ({
    arabic: {
      text: 'ٱللَّهُ لَاۤ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَیُّ ٱلۡقَیُّومُۚ',
      edition: {
        identifier: 'quran-uthmani',
        language: 'ar',
      },
    },
    translation: {
      text: 'GOD - there is no deity save Him, the Ever-Living, the Self-Subsistent Fount of All Being.',
      edition: {
        identifier: 'en.asad',
        englishName: 'Muhammad Asad',
      },
    },
    surah: {
      number: 2,
      englishName: 'Al-Baqara',
    },
    ayahNumber: 262,
    numberInSurah: 255,
    loading: false,
    error: null,
  }),
}))

jest.mock('@/hooks/useQuranFavorites', () => ({
  useQuranFavorites: () => ({
    isFavorited: false,
    isLoading: false,
    toggleFavorite: jest.fn(),
    requiresAuth: true,
  }),
}))

// Mock LoginModal to avoid AuthProvider requirement
jest.mock('@/components/auth/LoginModal', () => ({
  LoginModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="login-modal">Login Modal</div> : null
  ),
}))

describe('QuranCard', () => {
  it('renders card with Quran title', () => {
    render(<QuranCard />)
    
    expect(screen.getByText('Quran of the Day')).toBeInTheDocument()
  })

  it('displays Arabic text from API', async () => {
    render(<QuranCard />)
    
    await waitFor(() => {
      expect(screen.getByText(/ٱللَّهُ لَاۤ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَیُّ ٱلۡقَیُّومُۚ/)).toBeInTheDocument()
    })
  })

  it('shows English translation from API', async () => {
    render(<QuranCard />)
    
    await waitFor(() => {
      expect(screen.getByText(/GOD - there is no deity save Him/)).toBeInTheDocument()
    })
  })

  it('displays surah reference', async () => {
    render(<QuranCard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Surah Al-Baqara \(2:255\)/)).toBeInTheDocument()
    })
  })

  it('renders favorite button', () => {
    render(<QuranCard />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('wraps card in Link to /quran-hadith', () => {
    const { container } = render(<QuranCard />)
    
    const link = container.querySelector('a[href="/quran-hadith"]')
    expect(link).toBeInTheDocument()
  })

  it('renders book and heart icons', () => {
    const { container } = render(<QuranCard />)
    
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThanOrEqual(2) // BookOpen + Heart
  })
})

