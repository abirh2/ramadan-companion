'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuranOfTheDay } from '@/hooks/useQuranOfTheDay'
import { useQuranFavorites } from '@/hooks/useQuranFavorites'
import { LoginModal } from '@/components/auth/LoginModal'
import Link from 'next/link'
import type { QuranFavoriteData } from '@/types/quran.types'

export function QuranCard() {
  const { arabic, translation, surah, ayahNumber, numberInSurah, loading, error } = useQuranOfTheDay()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Prepare favorite data
  const favoriteData: QuranFavoriteData | null = useMemo(() => {
    if (!arabic || !translation || !surah || !ayahNumber || !numberInSurah) {
      return null
    }
    return {
      ayahNumber,
      numberInSurah,
      surahNumber: surah.number,
      surahName: surah.englishName,
      arabicText: arabic.text,
      translationText: translation.text,
      translationId: translation.edition.identifier as QuranFavoriteData['translationId'],
    }
  }, [arabic, translation, surah, ayahNumber, numberInSurah])

  const { isFavorited, isLoading: favLoading, toggleFavorite, requiresAuth } = useQuranFavorites(favoriteData)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (requiresAuth) {
      setShowLoginModal(true)
      return
    }

    await toggleFavorite()
  }

  return (
    <>
      <Link href="/quran-hadith" className="block">
        <Card className="rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quran of the Day
                </CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="h-7 w-7"
                onClick={handleFavoriteClick}
                disabled={favLoading}
              >
                <Heart 
                  className={`h-3.5 w-3.5 ${isFavorited ? 'fill-current text-red-500' : ''}`} 
                />
              </Button>
            </div>
          </CardHeader>
        <CardContent className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive py-4">
              Failed to load daily ayah. Please try again later.
            </div>
          )}

          {!loading && !error && arabic && translation && surah && (
            <>
              <div className="space-y-2">
                <p 
                  className="text-lg leading-relaxed text-right font-serif" 
                  dir="rtl"
                  lang="ar"
                >
                  {arabic.text}
                </p>
                <p className="text-sm text-muted-foreground">
                  {translation.text}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Surah {surah.englishName} ({surah.number}:{numberInSurah})
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
    <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}

