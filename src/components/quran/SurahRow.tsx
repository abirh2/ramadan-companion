'use client'

import Link from 'next/link'
import { Bookmark, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SurahMetadata } from '@/lib/quranData'
import type { BookmarkData } from '@/types/quran.types'

interface SurahRowProps {
  surah: SurahMetadata
  bookmark?: BookmarkData
  isFavorited: boolean
}

/**
 * SurahRow — presentational Quran Browser row.
 *
 * The whole row is the navigation Link to `/quran/{number}`. All displayed
 * fields are sourced from the `surah` (SURAHS) record; bookmark/favorite
 * indicators reflect the data passed in by the list. No data fetching here.
 */
export function SurahRow({ surah, bookmark, isFavorited }: SurahRowProps) {
  const hasArabicName = surah.arabicName.trim().length > 0

  return (
    <Link
      href={`/quran/${surah.number}`}
      className={cn(
        'flex items-center gap-4 px-4 py-3',
        'min-h-[var(--spacing-touch)]',
        'transition-colors hover:bg-accent focus-visible:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {/* Leading quiet Surah number — no filled circle */}
      <span className="type-eyebrow w-8 flex-shrink-0 text-tertiary tabular-nums">
        {surah.number}
      </span>

      {/* Names + metadata */}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2 flex-wrap">
          <span className="type-nav text-primary">{surah.englishName}</span>
          <span className="text-sm text-secondary">
            {surah.englishNameTranslation}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-tertiary">
          <span>
            {surah.revelationType} · {surah.numberOfAyahs} Ayahs
          </span>
          {isFavorited && (
            <Star
              className="h-3 w-3 fill-current text-tertiary"
              aria-label="Favorited"
            />
          )}
          {bookmark && (
            <Bookmark
              className="h-3 w-3 fill-current text-tertiary"
              aria-label="Bookmarked"
            />
          )}
        </span>
      </span>

      {/* Trailing Arabic name — omitted entirely (no reserved space) when empty */}
      {hasArabicName && (
        <span
          className="type-arabic flex-shrink-0 text-primary"
          dir="rtl"
          lang="ar"
        >
          {surah.arabicName}
        </span>
      )}
    </Link>
  )
}
