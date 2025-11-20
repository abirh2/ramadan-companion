'use client'

import { useEffect, useRef } from 'react'
import { useFullSurah } from '@/hooks/useFullSurah'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'
import { Button } from '@/components/ui/button'
import { Bookmark } from 'lucide-react'
import { SurahHeader } from './SurahHeader'
import { AyahCard } from './AyahCard'
import { TranslationSelector } from './TranslationSelector'
import { AyahRangeLookup } from './AyahRangeLookup'
import type { SurahMetadata } from '@/lib/quranData'

interface SurahReaderProps {
  surahNumber: number
  surahMetadata: SurahMetadata
  initialAyah?: number
}

export function SurahReader({ surahNumber, surahMetadata, initialAyah }: SurahReaderProps) {
  const { surahData, loading, error, translation, setTranslation } = useFullSurah(surahNumber)
  const { getBookmark } = useQuranBookmarks()
  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Get bookmark for current surah
  const bookmark = getBookmark(surahNumber)

  // Scroll to initial ayah if provided (from Juz/Ayah navigation)
  useEffect(() => {
    if (!surahData || !initialAyah) return

    if (ayahRefs.current[initialAyah]) {
      setTimeout(() => {
        ayahRefs.current[initialAyah]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }, [surahData, initialAyah])

  // Handle Go to Bookmark button click
  const handleGoToBookmark = () => {
    if (bookmark && ayahRefs.current[bookmark.ayah_number]) {
      ayahRefs.current[bookmark.ayah_number]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading surah...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading surah: {error}</p>
      </div>
    )
  }

  if (!surahData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SurahHeader surah={surahData.surah} metadata={surahMetadata} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <TranslationSelector
            currentTranslation={translation}
            onTranslationChange={setTranslation}
          />
          {bookmark && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToBookmark}
              className="gap-2"
            >
              <Bookmark className="h-4 w-4" />
              Go to Bookmark (Ayah {bookmark.ayah_number})
            </Button>
          )}
        </div>
        <AyahRangeLookup
          surahNumber={surahNumber}
          totalAyahs={surahMetadata.numberOfAyahs}
        />
      </div>

      {/* Ayahs */}
      <div className="space-y-6">
        {surahData.ayahs.map((ayahPair) => (
          <div
            key={ayahPair.numberInSurah}
            ref={(el) => {
              ayahRefs.current[ayahPair.numberInSurah] = el
            }}
          >
            <AyahCard
              ayahPair={ayahPair}
              surahNumber={surahNumber}
              surahName={surahMetadata.englishName}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

