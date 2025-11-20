'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollText, Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHadithOfTheDay } from '@/hooks/useHadithOfTheDay'
import { useHadithFavorites } from '@/hooks/useHadithFavorites'
import { LoginModal } from '@/components/auth/LoginModal'
import Link from 'next/link'
import type { HadithFavoriteData } from '@/types/hadith.types'

export function HadithCard() {
  const {
    hadithEnglish,
    hadithUrdu,
    hadithArabic,
    narrator,
    book,
    bookSlug,
    bookWriter,
    chapter,
    chapterArabic,
    hadithNumber,
    status,
    selectedLanguage,
    loading,
    error,
  } = useHadithOfTheDay()

  const [showLoginModal, setShowLoginModal] = useState(false)

  // Prepare favorite data
  const favoriteData: HadithFavoriteData | null = useMemo(() => {
    if (
      !hadithEnglish ||
      !hadithUrdu ||
      !hadithArabic ||
      !narrator ||
      !book ||
      !bookSlug ||
      !chapter ||
      !hadithNumber ||
      !status
    ) {
      return null
    }
    return {
      hadithNumber,
      book,
      bookSlug,
      chapter,
      status,
      narrator,
      hadithEnglish,
      hadithUrdu,
      hadithArabic,
    }
  }, [hadithEnglish, hadithUrdu, hadithArabic, narrator, book, bookSlug, chapter, hadithNumber, status])

  const { isFavorited, isLoading: favLoading, toggleFavorite, requiresAuth } = useHadithFavorites(favoriteData)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (requiresAuth) {
      setShowLoginModal(true)
      return
    }

    await toggleFavorite()
  }

  // Get the selected language text
  const getSelectedText = () => {
    switch (selectedLanguage) {
      case 'urdu':
        return hadithUrdu
      case 'english':
      default:
        return hadithEnglish
    }
  }

  // Status badge color
  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'Sahih':
        return 'text-green-600 dark:text-green-400'
      case 'Hasan':
        return 'text-blue-600 dark:text-blue-400'
      case "Da'eef":
        return 'text-amber-600 dark:text-amber-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const cardAriaLabel = !loading && !error && book 
    ? `Hadith of the Day. ${getSelectedText()}. Narrated by ${narrator}. From ${book}, hadith ${hadithNumber}. Grading: ${status}. Click to view more.`
    : loading 
    ? 'Loading Hadith of the Day'
    : 'Hadith of the Day card'

  return (
    <>
      <Link href="/quran-hadith" className="block" aria-label={cardAriaLabel}>
        <Card className="rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer" role="article">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hadith of the Day
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7"
                onClick={handleFavoriteClick}
                disabled={favLoading}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current text-red-500' : ''}`} aria-hidden="true" />
                <span className="sr-only">
                  {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-8" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading hadith...</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive py-4" role="alert" aria-live="polite">
                Failed to load daily hadith. Please try again later.
              </div>
            )}

            {!loading && !error && hadithArabic && (
              <>
                {/* Arabic Text */}
                <div className="space-y-2">
                  <p className="text-base leading-relaxed text-right font-serif" dir="rtl" lang="ar" aria-label={`Arabic text: ${hadithArabic}`}>
                    {hadithArabic}
                  </p>
                </div>

                {/* Selected Language Translation */}
                <div className="border-t pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getSelectedText()}
                  </p>
                </div>

                {/* Narrator and Reference */}
                <div className="space-y-1">
                  {narrator && (
                    <p className="text-xs text-muted-foreground italic">{narrator}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {book} {hadithNumber}
                      </p>
                      {chapter && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {chapter}
                          {chapterArabic && (
                            <span className="block text-right font-serif text-[10px] mt-0.5" dir="rtl" lang="ar">
                              {chapterArabic}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    {status && (
                      <span className={`text-xs font-medium ${getStatusColor(status)}`} role="status" aria-label={`Hadith grading: ${status}`}>
                        {status}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Link>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}
