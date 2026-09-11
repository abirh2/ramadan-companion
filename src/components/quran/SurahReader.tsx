'use client'

import { useEffect, useRef, useState } from 'react'
import { useFullSurah } from '@/hooks/useFullSurah'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'
import { useQuranBrowserFavorites } from '@/hooks/useQuranBrowserFavorites'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { ReaderHeader } from './ReaderHeader'
import { AyahBlock } from './AyahBlock'
import { ReadingControlsBar } from './ReadingControlsBar'
import { DEFAULT_RECITER } from '@/lib/quranAudio'
import type { SurahMetadata } from '@/lib/quranData'
import type { QuranReciterId } from '@/types/quran.types'

interface SurahReaderProps {
  surahNumber: number
  surahMetadata: SurahMetadata
  /**
   * Raw `ayah` deep-link query param (unparsed). The reader validates it
   * against the surah's ayah count so that a non-integer / out-of-range /
   * non-numeric value opens the reader at ayah 1 with a valid-range message,
   * while a valid integer in 1..N is scrolled into view and marked active.
   */
  ayahParam?: string
}

/**
 * Resolve the scroll behavior honoring the user's reduced-motion preference.
 * Programmatic `scrollIntoView`/`scrollTo` with `behavior: 'smooth'` is a JS
 * API call and is NOT affected by the CSS `scroll-behavior: auto` override in
 * the reduced-motion media query, so it must be gated here. Under reduced
 * motion the target is presented in its final position with no animation.
 */
function scrollBehavior(): ScrollBehavior {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto'
  }
  return 'smooth'
}

/**
 * Validate a raw deep-link ayah param against the surah's ayah count.
 * Returns the target ayah number when the param is an integer within 1..N,
 * otherwise null. A `null` result with a present param means out-of-range.
 */
function resolveDeepLinkAyah(
  ayahParam: string | undefined,
  totalAyahs: number
): number | null {
  if (ayahParam === undefined) return null
  const trimmed = ayahParam.trim()
  // Strict integer only: rejects non-numeric ("abc") and non-integer ("2.5").
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (n < 1 || n > totalAyahs) return null
  return n
}

export function SurahReader({ surahNumber, surahMetadata, ayahParam }: SurahReaderProps) {
  const { surahData, loading, error, translation, setTranslation } = useFullSurah(surahNumber)
  const { getBookmark, saveBookmark, deleteBookmark } = useQuranBookmarks()
  const { isFavorited, addFavorite, removeFavorite } = useQuranBrowserFavorites()
  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [reciter, setReciter] = useState<QuranReciterId>(DEFAULT_RECITER)

  // Resolve the deep-link target once per param/surah change.
  const totalAyahs = surahMetadata.numberOfAyahs
  const initialAyah = resolveDeepLinkAyah(ayahParam, totalAyahs)
  // A present-but-invalid ayah param means we opened at ayah 1 and must show
  // the valid-range message (deep-link out-of-range handling).
  const deepLinkOutOfRange = ayahParam !== undefined && initialAyah === null

  // Active verse for the token-based highlight, driven by the deep link /
  // go-to navigation (both arrive via the `ayah` query param → `ayahParam`).
  const [activeAyah, setActiveAyah] = useState<number | null>(initialAyah)

  // Keep the active verse in sync when the deep link / go-to target changes.
  useEffect(() => {
    setActiveAyah(initialAyah)
  }, [initialAyah])

  // Scroll the active ayah into view within 1000ms. Reduced-motion is honored:
  // the scroll behavior falls back to 'auto' (no animation) when the user
  // prefers reduced motion.
  useEffect(() => {
    if (!surahData || !activeAyah) return

    if (ayahRefs.current[activeAyah]) {
      const timer = setTimeout(() => {
        ayahRefs.current[activeAyah]?.scrollIntoView({
          behavior: scrollBehavior(),
          block: 'center',
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [surahData, activeAyah])

  // Get bookmark for current surah
  const bookmark = getBookmark(surahNumber)

  // Show/hide scroll-to-top button based on scroll position
  useEffect(() => {
    let frame: number | null = null
    const handleScroll = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        setShowScrollTop(window.scrollY > 400)
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  // Handle Go to Bookmark button click
  const handleGoToBookmark = () => {
    if (bookmark && ayahRefs.current[bookmark.ayah_number]) {
      ayahRefs.current[bookmark.ayah_number]?.scrollIntoView({
        behavior: scrollBehavior(),
        block: 'center',
      })
    }
  }

  // Handle scroll to top button click
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: scrollBehavior(),
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="type-body text-text-secondary">Loading surah...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="type-body text-destructive">Error loading surah: {error}</p>
      </div>
    )
  }

  if (!surahData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ReaderHeader surah={surahData.surah} metadata={surahMetadata} />

      {/* Controls */}
      <ReadingControlsBar
        translation={translation}
        onTranslationChange={setTranslation}
        reciter={reciter}
        onReciterChange={setReciter}
        surahNumber={surahNumber}
        totalAyahs={totalAyahs}
        bookmark={bookmark}
        onGoToBookmark={handleGoToBookmark}
      />

      {/* Deep-link out-of-range: opened at ayah 1, surface the valid range. */}
      {deepLinkOutOfRange && (
        <p
          role="alert"
          aria-live="polite"
          className="type-caption text-destructive"
        >
          That ayah does not exist in this surah. Enter a number from 1 to {totalAyahs}.
        </p>
      )}

      {/* Ayahs — reading canvas region (warm ivory / tinted midnight, never teal) */}
      <div className="bg-canvas">
        {surahData.ayahs.map((ayahPair, index) => (
          <div
            key={ayahPair.numberInSurah}
            ref={(el) => {
              ayahRefs.current[ayahPair.numberInSurah] = el
            }}
          >
            <AyahBlock
              ayahPair={ayahPair}
              surahNumber={surahNumber}
              surahName={surahMetadata.englishName}
              reciter={reciter}
              isFavorited={isFavorited}
              addFavorite={addFavorite}
              removeFavorite={removeFavorite}
              getBookmark={getBookmark}
              saveBookmark={saveBookmark}
              deleteBookmark={deleteBookmark}
              isFirst={index === 0}
              isActive={activeAyah === ayahPair.numberInSurah}
            />
          </div>
        ))}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="app-floating-control fixed z-30 h-12 w-12 rounded-full shadow-low transition-opacity"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
