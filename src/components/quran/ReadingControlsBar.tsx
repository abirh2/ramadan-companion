'use client'

import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  type QuranTranslationId,
  type QuranReciterId,
  type BookmarkData,
} from '@/types/quran.types'
import { TranslationSelector } from './TranslationSelector'
import { ReciterSelector } from './ReciterSelector'
import { GoToAyah } from './GoToAyah'

interface ReadingControlsBarProps {
  translation: QuranTranslationId
  onTranslationChange: (translation: QuranTranslationId) => void
  reciter: QuranReciterId
  onReciterChange: (reciter: QuranReciterId) => void
  surahNumber: number
  totalAyahs: number
  bookmark?: BookmarkData | null
  onGoToBookmark: () => void
}

/**
 * ReadingControlsBar — a compact, inline single-row bar of content-sized chips.
 *
 * Each chip is a button carrying a persistent visible text label ("Translation:
 * {name}", "Reciter: {name}"). Tapping a chip opens a searchable selection
 * sheet. The go-to-ayah control and — when a bookmark exists — a
 * go-to-bookmark control sit on the same row.
 *
 * Presentation-only: this bar arranges existing controls. It does not own
 * translation/reciter state or persistence.
 */
export function ReadingControlsBar({
  translation,
  onTranslationChange,
  reciter,
  onReciterChange,
  surahNumber,
  totalAyahs,
  bookmark,
  onGoToBookmark,
}: ReadingControlsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TranslationSelector
        currentTranslation={translation}
        onTranslationChange={onTranslationChange}
        compact
      />

      <ReciterSelector
        currentReciter={reciter}
        onReciterChange={onReciterChange}
        compact
      />

      <GoToAyah surahNumber={surahNumber} totalAyahs={totalAyahs} />

      {bookmark && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px] gap-2"
          onClick={onGoToBookmark}
          aria-label={`Go to bookmarked ayah ${bookmark.ayah_number}`}
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          <span>Go to bookmark (Ayah {bookmark.ayah_number})</span>
        </Button>
      )}
    </div>
  )
}
