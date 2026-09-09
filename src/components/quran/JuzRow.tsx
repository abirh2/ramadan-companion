'use client'

import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import type { JuzData, SurahMetadata } from '@/lib/quranData'
import type { BookmarkData } from '@/types/quran.types'

export interface JuzRowProps {
  /** The Juz entry from `JUZ_DATA`. */
  juz: JuzData
  /** Start-range surah metadata from `getSurahByNumber(juz.startSurah)`. */
  startSurah?: SurahMetadata
  /** End-range surah metadata from `getSurahByNumber(juz.endSurah)`. */
  endSurah?: SurahMetadata
  /** Existing bookmark for this Juz's start surah from `getBookmark`, if any. */
  bookmark?: BookmarkData
}

/**
 * Presentational row for a single Juz in the editorial Quran Browser.
 *
 * The whole row is the `Link` to `/quran/{startSurah}?ayah={startAyah}`, which
 * preserves the existing Juz navigation behavior exactly (Requirements 1.10,
 * 19.2). It shows "Juz N", the start/end surah range, and a bookmark indicator
 * when present (Requirement 3.3), on a touch target of at least 44px
 * (Requirement 1.11). All colors, typography, and spacing come from Step-1
 * semantic tokens (Requirement 1.12).
 */
export function JuzRow({ juz, startSurah, endSurah, bookmark }: JuzRowProps) {
  return (
    <Link
      href={`/quran/${juz.startSurah}?ayah=${juz.startAyah}`}
      className="flex min-h-touch touch-manipulation items-center gap-4 px-4 py-3 transition-[background-color,transform] duration-150 hover:bg-surface-grouped active:scale-[0.99] active:bg-teal-muted motion-reduce:active:scale-100 focus-visible:relative focus-visible:z-10 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Leading quiet Juz number */}
      <span className="type-eyebrow shrink-0 tabular-nums text-text-tertiary">
        Juz {juz.number}
      </span>

      {/* Start / end surah range */}
      <span className="type-body-secondary min-w-0 flex-1 truncate text-text-secondary">
        {startSurah?.englishName} ({juz.startSurah}:{juz.startAyah})
        {' \u2013 '}
        {endSurah?.englishName} ({juz.endSurah}:{juz.endAyah})
      </span>

      {/* Bookmark indicator, only when present */}
      {bookmark && (
        <Bookmark
          className="size-4 shrink-0 fill-current text-teal"
          aria-label="Bookmarked"
        />
      )}
    </Link>
  )
}
