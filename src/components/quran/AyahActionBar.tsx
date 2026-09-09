'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Copy,
  Heart,
  Share2,
  Bookmark,
  Check,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AyahAudioPlayer } from './AyahAudioPlayer'
import { TafsirView } from './TafsirView'
import type { QuranReciterId, QuranFavoriteData, BookmarkData } from '@/types/quran.types'

interface AyahActionsProps {
  surahNumber: number
  surahName: string
  ayahNumber: number
  globalNumber: number
  arabicText: string
  translationText: string
  reciter: QuranReciterId
  isFavorited: (ayahNumber: number) => boolean
  addFavorite: (data: QuranFavoriteData) => Promise<boolean>
  removeFavorite: (ayahNumber: number) => Promise<boolean>
  getBookmark: (surahNumber: number) => BookmarkData | undefined
  saveBookmark: (surahNumber: number, ayahNumber: number) => Promise<boolean>
  deleteBookmark: (surahNumber: number) => Promise<boolean>
}

/**
 * Tracks whether the viewport is at desktop width so the overflow "More" control
 * can open a dropdown-menu on desktop and a bottom Sheet on mobile.
 * Presentation-only; mirrors the pattern used by TafsirView.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isDesktop
}

// Shared visual treatment for every control in the action group: a ghost icon
// toggle with a 44x44 touch target. Matches AyahAudioPlayer so the whole group
// reads as one coherent set rather than a row of outline pills.
const targetClasses = 'min-h-11 min-w-11'

export function AyahActionBar({
  surahNumber,
  surahName,
  ayahNumber,
  globalNumber,
  arabicText,
  translationText,
  reciter,
  isFavorited,
  addFavorite,
  removeFavorite,
  getBookmark,
  saveBookmark,
  deleteBookmark,
}: AyahActionsProps) {
  const [copied, setCopied] = useState(false)
  const [tafsirOpen, setTafsirOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const isFav = isFavorited(globalNumber)

  // Check if this specific ayah is bookmarked
  const bookmark = getBookmark(surahNumber)
  const isBookmarked = bookmark?.ayah_number === ayahNumber

  // --- Handlers: logic preserved verbatim from AyahActions ---

  const handleCopy = async () => {
    const textToCopy = `${arabicText}\n\n${translationText}\n\n— Quran ${surahNumber}:${ayahNumber} (${surahName})`

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleFavorite = async () => {
    if (isFav) {
      await removeFavorite(globalNumber)
    } else {
      await addFavorite({
        ayahNumber: globalNumber,
        numberInSurah: ayahNumber,
        surahNumber,
        surahName,
        arabicText,
        translationText,
        translationId: 'en.asad', // TODO: Get from context
      })
    }
  }

  const handleBookmark = async () => {
    if (isBookmarked) {
      // Remove bookmark if clicking on the currently bookmarked ayah
      await deleteBookmark(surahNumber)
    } else {
      // Save new bookmark (overwrites any previous bookmark in this surah)
      await saveBookmark(surahNumber, ayahNumber)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Quran ${surahNumber}:${ayahNumber}`,
      text: `${arabicText}\n\n${translationText}`,
      url: `${window.location.origin}/quran/${surahNumber}?ayah=${ayahNumber}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback: copy link
      await navigator.clipboard.writeText(shareData.url)
      alert('Link copied to clipboard!')
    }
  }

  const openTafsir = () => setTafsirOpen(true)

  // --- Accessible labels; toggle actions reflect their current state ---
  const favoriteLabel = isFav ? 'Favorited' : 'Favorite'
  const copyLabel = copied ? 'Copied' : 'Copy ayah'
  const bookmarkLabel = isBookmarked ? 'Bookmarked' : 'Bookmark'
  const tafsirLabel = 'Read tafsir'
  const shareLabel = 'Share ayah'

  // Inline icon toggles — listen, favorite, copy, bookmark stay directly visible.
  const favoriteButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleFavorite}
      className={cn(targetClasses, isFav && 'text-primary')}
      title={favoriteLabel}
      aria-label={favoriteLabel}
      aria-pressed={isFav}
    >
      <Heart className={cn('h-4 w-4 transition-transform duration-150', isFav && 'scale-105 fill-current motion-reduce:scale-100')} aria-hidden="true" />
      <span className="sr-only">{favoriteLabel}</span>
    </Button>
  )

  const copyButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn(targetClasses)}
      title={copyLabel}
      aria-label={copyLabel}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="sr-only">{copyLabel}</span>
    </Button>
  )

  const bookmarkButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleBookmark}
      className={cn(targetClasses, isBookmarked && 'text-primary')}
      title={bookmarkLabel}
      aria-label={bookmarkLabel}
      aria-pressed={isBookmarked}
    >
      <Bookmark
        className={cn('h-4 w-4 transition-transform duration-150', isBookmarked && 'scale-105 fill-current motion-reduce:scale-100')}
        aria-hidden="true"
      />
      <span className="sr-only">{bookmarkLabel}</span>
    </Button>
  )

  return (
    <div className="flex items-center gap-1 border-t pt-4">
      {/* Listen — always directly visible in the row */}
      <AyahAudioPlayer globalAyahNumber={globalNumber} reciter={reciter} />

      {/* Favorite, copy, bookmark — directly visible in the row */}
      {favoriteButton}
      {copyButton}
      {bookmarkButton}

      {/*
        Overflow: tafsir + share collapse into a labeled "More" control when six
        actions do not fit at 44x44. Listen stays visible; no target shrinks.
        More opens a dropdown-menu on desktop and a bottom Sheet on mobile.
      */}
      {isDesktop ? (
        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(targetClasses)}
              title="More actions"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={openTafsir}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {tafsirLabel}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {shareLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMoreOpen(true)}
            className={cn(targetClasses)}
            title="More actions"
            aria-label="More actions"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">More actions</span>
          </Button>

          <SheetContent side="bottom" className="pb-8">
            <SheetHeader>
              <SheetTitle>More actions</SheetTitle>
              <SheetDescription>
                Actions for ayah {surahNumber}:{ayahNumber}
              </SheetDescription>
            </SheetHeader>
            <div className="flex items-center justify-center gap-2 px-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setMoreOpen(false)
                  openTafsir()
                }}
                className={cn(targetClasses)}
                title={tafsirLabel}
                aria-label={tafsirLabel}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{tafsirLabel}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setMoreOpen(false)
                  handleShare()
                }}
                className={cn(targetClasses)}
                title={shareLabel}
                aria-label={shareLabel}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{shareLabel}</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Only mount TafsirView when opened to avoid per-ayah API calls */}
      {tafsirOpen && (
        <TafsirView
          open={tafsirOpen}
          onOpenChange={setTafsirOpen}
          surahNumber={surahNumber}
          surahName={surahName}
          ayahNumber={ayahNumber}
        />
      )}
    </div>
  )
}
