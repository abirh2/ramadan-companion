'use client'

import { AyahActionBar } from './AyahActionBar'
import type { AyahPair, QuranReciterId, QuranFavoriteData, BookmarkData } from '@/types/quran.types'

interface AyahBlockProps {
  ayahPair: AyahPair
  surahNumber: number
  surahName: string
  reciter: QuranReciterId
  isFavorited: (ayahNumber: number) => boolean
  addFavorite: (data: QuranFavoriteData) => Promise<boolean>
  removeFavorite: (ayahNumber: number) => Promise<boolean>
  getBookmark: (surahNumber: number) => BookmarkData | undefined
  saveBookmark: (surahNumber: number, ayahNumber: number) => Promise<boolean>
  deleteBookmark: (surahNumber: number) => Promise<boolean>
  /** Highlights this block as the active verse (token-based, not a card). */
  isActive?: boolean
  /** When true, no divider is drawn above this block (first block in the list). */
  isFirst?: boolean
}

export function AyahBlock({
  ayahPair,
  surahNumber,
  surahName,
  reciter,
  isFavorited,
  addFavorite,
  removeFavorite,
  getBookmark,
  saveBookmark,
  deleteBookmark,
  isActive = false,
  isFirst = false,
}: AyahBlockProps) {
  const { arabic, transliteration, translation, numberInSurah, globalNumber } = ayahPair

  // Vertical rhythm: larger space between ayahs than within an ayah.
  // Within-ayah spacing comes from `space-y-3`; between-ayah spacing from the
  // block's own top padding + hairline divider (suppressed on the first block).
  const dividerClasses = isFirst ? '' : 'border-t border-border-subtle pt-8 mt-8'
  const activeClasses = isActive
    ? 'border-l-2 border-l-primary bg-surface-grouped/60 pl-4 -ml-4 rounded-r-sm'
    : ''

  return (
    <article className={`space-y-3 ${dividerClasses} ${activeClasses}`.trim()}>
      {/* Quiet ayah number — smaller and lower-contrast than Arabic/translation */}
      <p className="type-eyebrow text-text-tertiary">
        {surahNumber}:{numberInSurah}
      </p>

      {/* Arabic — largest size, greatest weight, RTL, diacritic-safe line-height */}
      <p className="type-quran-arabic text-text-primary break-words" dir="rtl" lang="ar">
        {arabic.text}
      </p>

      {/* Translation — wraps fully (no clip/truncation) even at 320px / 200% zoom */}
      <p className="type-quran-translation text-text-primary break-words">
        {translation.text}
      </p>

      {/* Transliteration — secondary, lower contrast; omitted entirely when absent */}
      {transliteration.text ? (
        <p className="type-quran-translation text-text-tertiary italic break-words">
          {transliteration.text}
        </p>
      ) : null}

      {/* Actions — coherent icon-button group with More overflow */}
      <div className="pt-1">
        <AyahActionBar
          surahNumber={surahNumber}
          surahName={surahName}
          ayahNumber={numberInSurah}
          globalNumber={globalNumber}
          arabicText={arabic.text}
          translationText={translation.text}
          reciter={reciter}
          isFavorited={isFavorited}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
          getBookmark={getBookmark}
          saveBookmark={saveBookmark}
          deleteBookmark={deleteBookmark}
        />
      </div>
    </article>
  )
}
