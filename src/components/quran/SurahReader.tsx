'use client'

import { useEffect, useRef } from 'react'
import { useFullSurah } from '@/hooks/useFullSurah'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'
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
  const { saveBookmark, getBookmark } = useQuranBookmarks()
  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Scroll to initial ayah or last bookmark
  useEffect(() => {
    if (!surahData) return

    const targetAyah = initialAyah || getBookmark(surahNumber)?.ayah_number

    if (targetAyah && ayahRefs.current[targetAyah]) {
      setTimeout(() => {
        ayahRefs.current[targetAyah]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }, [surahData, initialAyah, surahNumber, getBookmark])

  // Auto-save bookmark when scrolling (debounced)
  useEffect(() => {
    if (!surahData) return

    const handleScroll = () => {
      // Find the ayah currently in view
      const ayahElements = Object.entries(ayahRefs.current)
      for (const [ayahNum, element] of ayahElements) {
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            // This ayah is in the upper half of the viewport
            saveBookmark(surahNumber, parseInt(ayahNum))
            break
          }
        }
      }
    }

    let timeoutId: NodeJS.Timeout
    const debouncedScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 1000)
    }

    window.addEventListener('scroll', debouncedScroll)
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(timeoutId)
    }
  }, [surahData, surahNumber, saveBookmark])

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
        <TranslationSelector
          currentTranslation={translation}
          onTranslationChange={setTranslation}
        />
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

