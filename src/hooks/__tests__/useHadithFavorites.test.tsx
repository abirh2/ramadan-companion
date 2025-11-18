import { renderHook, waitFor } from '@testing-library/react'
import { useHadithFavorites } from '../useHadithFavorites'
import { addHadithFavorite, removeHadithFavorite, checkIsHadithFavorited } from '@/lib/favorites'
import type { HadithFavoriteData } from '@/types/hadith.types'

// Mock dependencies
jest.mock('@/hooks/useAuth')
jest.mock('@/lib/favorites')

import * as useAuthModule from '@/hooks/useAuth'

const mockUseAuth = useAuthModule.useAuth as jest.MockedFunction<typeof useAuthModule.useAuth>
const mockAddHadithFavorite = addHadithFavorite as jest.MockedFunction<typeof addHadithFavorite>
const mockRemoveHadithFavorite = removeHadithFavorite as jest.MockedFunction<typeof removeHadithFavorite>
const mockCheckIsHadithFavorited = checkIsHadithFavorited as jest.MockedFunction<typeof checkIsHadithFavorited>

describe('useHadithFavorites', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockHadithData: HadithFavoriteData = {
    hadithNumber: '1',
    book: 'Sahih Bukhari',
    bookSlug: 'sahih-bukhari',
    chapter: 'Belief',
    status: 'Sahih',
    narrator: "Narrated 'Umar bin Al-Khattab",
    hadithEnglish: 'The reward of deeds depends upon the intentions.',
    hadithUrdu: 'تمام اعمال کا دارومدار نیت پر ہے',
    hadithArabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckIsHadithFavorited.mockResolvedValue({ isFavorited: false })
  })

  it('should check favorite status on mount for authenticated user', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as any)

    const { result } = renderHook(() => useHadithFavorites(mockHadithData))

    await waitFor(() => {
      expect(mockCheckIsHadithFavorited).toHaveBeenCalledWith(
        mockUser.id,
        mockHadithData.hadithNumber,
        mockHadithData.bookSlug
      )
    })

    expect(result.current.isFavorited).toBe(false)
    expect(result.current.requiresAuth).toBe(false)
  })

  it('should not check favorite status for unauthenticated user', async () => {
    mockUseAuth.mockReturnValue({ user: null } as any)

    const { result } = renderHook(() => useHadithFavorites(mockHadithData))

    await waitFor(() => {
      expect(result.current.requiresAuth).toBe(true)
    })

    expect(mockCheckIsHadithFavorited).not.toHaveBeenCalled()
    expect(result.current.isFavorited).toBe(false)
  })

  it('should add hadith to favorites', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as any)
    mockAddHadithFavorite.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useHadithFavorites(mockHadithData))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.toggleFavorite()

    await waitFor(() => {
      expect(mockAddHadithFavorite).toHaveBeenCalledWith(mockUser.id, mockHadithData)
    })
  })

  it('should remove hadith from favorites', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as any)
    mockCheckIsHadithFavorited.mockResolvedValue({ isFavorited: true })
    mockRemoveHadithFavorite.mockResolvedValue({ success: true })

    const { result } = renderHook(() => useHadithFavorites(mockHadithData))

    await waitFor(() => {
      expect(result.current.isFavorited).toBe(true)
    })

    await result.current.toggleFavorite()

    await waitFor(() => {
      expect(mockRemoveHadithFavorite).toHaveBeenCalledWith(
        mockUser.id,
        mockHadithData.hadithNumber,
        mockHadithData.bookSlug
      )
    })
  })

  it('should not toggle favorite when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null } as any)

    const { result } = renderHook(() => useHadithFavorites(mockHadithData))

    await result.current.toggleFavorite()

    expect(mockAddHadithFavorite).not.toHaveBeenCalled()
    expect(mockRemoveHadithFavorite).not.toHaveBeenCalled()
  })
})

