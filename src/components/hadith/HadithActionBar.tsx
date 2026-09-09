'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Heart, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHadithFavorites } from '@/hooks/useHadithFavorites'
import type { HadithData, HadithLanguageId, HadithFavoriteData } from '@/types/hadith.types'

interface HadithActionBarProps {
  hadith: HadithData
  selectedLanguage: HadithLanguageId
}

// Shared visual treatment for every control in the action group: a ghost icon
// button with a 44x44 touch target. Matches the Quran reader's AyahActionBar so
// the whole group reads as one coherent set rather than a row of outline pills.
const targetClasses = 'min-h-11 min-w-11'

// Transient copy state per control: idle, copied (Check for <= 2s), or failed.
type CopyState = 'idle' | 'copied' | 'failed'

export function HadithActionBar({ hadith, selectedLanguage }: HadithActionBarProps) {
  const [arabicState, setArabicState] = useState<CopyState>('idle')
  const [translationState, setTranslationState] = useState<CopyState>('idle')

  // Translation and narrator for the selected reading language.
  const translationText =
    selectedLanguage === 'urdu' ? hadith.hadithUrdu : hadith.hadithEnglish
  const narratorText =
    selectedLanguage === 'urdu' ? hadith.urduNarrator : hadith.englishNarrator

  // Favorite payload composed exactly as HadithItem does today.
  const hadithFavoriteData: HadithFavoriteData = {
    hadithNumber: hadith.hadithNumber,
    book: hadith.book.bookName,
    bookSlug: hadith.book.bookSlug,
    chapter: hadith.chapter.chapterEnglish,
    status: hadith.status,
    narrator: hadith.englishNarrator,
    hadithEnglish: hadith.hadithEnglish,
    hadithUrdu: hadith.hadithUrdu,
    hadithArabic: hadith.hadithArabic,
  }

  const { isFavorited, toggleFavorite } = useHadithFavorites(hadithFavoriteData)

  // Byte-identical composed copy-translation string, preserved verbatim.
  const copyTranslationText = `${narratorText}\n\n${translationText}\n\nSource: ${hadith.book.bookName} — ${hadith.book.writerName}\nChapter: ${hadith.chapter.chapterEnglish}\nHadith #${hadith.hadithNumber} (${hadith.status})\n\n* Hadith numbering follows HadithAPI edition`

  // Copy a value and flash the copied state for <= 2s; on failure show a
  // failure indication and never show the copied state.
  const runCopy = async (
    text: string,
    setState: (state: CopyState) => void
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      setState('failed')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const handleCopyArabic = () => runCopy(hadith.hadithArabic, setArabicState)
  const handleCopyTranslation = () => runCopy(copyTranslationText, setTranslationState)

  // Accessible labels; the favorite label reflects its current toggle state.
  const favoriteLabel = isFavorited ? 'Favorited' : 'Favorite'
  const copyArabicLabel =
    arabicState === 'copied'
      ? 'Arabic copied'
      : arabicState === 'failed'
        ? 'Failed to copy Arabic'
        : 'Copy Arabic'
  const copyTranslationLabel =
    translationState === 'copied'
      ? 'Translation copied'
      : translationState === 'failed'
        ? 'Failed to copy translation'
        : 'Copy translation'

  const copyIcon = (state: CopyState) =>
    state === 'copied' ? (
      <Check className="h-4 w-4" aria-hidden="true" />
    ) : state === 'failed' ? (
      <X className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Copy className="h-4 w-4" aria-hidden="true" />
    )

  return (
    <div className="flex items-center gap-1 pt-1">
      {/* Favorite — toggles via useHadithFavorites; no-ops when not authenticated */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleFavorite}
        className={cn(targetClasses, isFavorited && 'text-primary')}
        title={favoriteLabel}
        aria-label={favoriteLabel}
        aria-pressed={isFavorited}
      >
        <Heart
          className={cn('h-4 w-4', isFavorited && 'fill-current')}
          aria-hidden="true"
        />
        <span className="sr-only">{favoriteLabel}</span>
      </Button>

      {/* Copy Arabic — writes hadith.hadithArabic */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopyArabic}
        className={cn(targetClasses, arabicState === 'failed' && 'text-destructive')}
        title={copyArabicLabel}
        aria-label={copyArabicLabel}
      >
        {copyIcon(arabicState)}
        <span className="sr-only">{copyArabicLabel}</span>
      </Button>

      {/* Copy translation — writes the byte-identical composed source string */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopyTranslation}
        className={cn(
          targetClasses,
          translationState === 'failed' && 'text-destructive'
        )}
        title={copyTranslationLabel}
        aria-label={copyTranslationLabel}
      >
        {copyIcon(translationState)}
        <span className="sr-only">{copyTranslationLabel}</span>
      </Button>
    </div>
  )
}
