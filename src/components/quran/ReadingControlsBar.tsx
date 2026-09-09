'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  QURAN_TRANSLATIONS,
  type QuranTranslationId,
  type QuranReciterId,
  type BookmarkData,
} from '@/types/quran.types'
import { AVAILABLE_RECITERS } from '@/lib/quranAudio'
import { ControlSheet } from './ControlSheet'
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
 * Resolves the display name for the currently selected translation from
 * QURAN_TRANSLATIONS. Falls back to the raw id if the id is unknown so the chip
 * label is never empty. Read-only lookup — no selection logic here.
 */
function translationName(id: QuranTranslationId): string {
  return QURAN_TRANSLATIONS.find((t) => t.id === id)?.name ?? id
}

/**
 * Resolves the display name for the currently selected reciter from
 * AVAILABLE_RECITERS, falling back to the raw id when unknown.
 */
function reciterName(id: QuranReciterId): string {
  return AVAILABLE_RECITERS.find((r) => r.identifier === id)?.englishName ?? id
}

/**
 * ReadingControlsBar — a compact, inline single-row bar of content-sized chips.
 *
 * Each chip is a button carrying a persistent visible text label ("Translation:
 * {name}", "Reciter: {name}"). Tapping a chip opens a ControlSheet on all
 * viewports; the sheet wraps the existing TranslationSelector / ReciterSelector
 * with their persistence and selection logic untouched. The go-to-ayah control
 * and — when a bookmark exists — a go-to-bookmark control sit on the same row.
 *
 * Presentation-only: this bar arranges existing controls and looks up display
 * names. It does not own translation/reciter state or persistence.
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
  const [translationOpen, setTranslationOpen] = useState(false)
  const [reciterOpen, setReciterOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ControlSheet
        open={translationOpen}
        onOpenChange={setTranslationOpen}
        title="Translation"
        trigger={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            aria-label={`Translation: ${translationName(translation)}. Change translation`}
          >
            <span className="text-text-tertiary">Translation:</span>
            <span className="font-medium text-teal">
              {translationName(translation)}
            </span>
          </Button>
        }
      >
        <TranslationSelector
          currentTranslation={translation}
          onTranslationChange={onTranslationChange}
        />
      </ControlSheet>

      <ControlSheet
        open={reciterOpen}
        onOpenChange={setReciterOpen}
        title="Reciter"
        trigger={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            aria-label={`Reciter: ${reciterName(reciter)}. Change reciter`}
          >
            <span className="text-text-tertiary">Reciter:</span>
            <span className="font-medium text-teal">
              {reciterName(reciter)}
            </span>
          </Button>
        }
      >
        <ReciterSelector
          currentReciter={reciter}
          onReciterChange={onReciterChange}
        />
      </ControlSheet>

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
