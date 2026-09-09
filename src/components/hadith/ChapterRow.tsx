'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HadithChapter } from '@/types/hadith.types'

interface ChapterRowProps {
  chapter: HadithChapter
  bookSlug: string
}

/**
 * ChapterRow — presentational Chapter Browser row.
 *
 * The whole row is the navigation Link to `/hadith/{bookSlug}/{chapterNumber}`.
 * All displayed fields are sourced from the `chapter` (HadithChapter) record;
 * no data fetching here. Arabic and Urdu titles render only when non-empty,
 * with no reserved space when absent.
 */
export function ChapterRow({ chapter, bookSlug }: ChapterRowProps) {
  const hasArabicTitle = chapter.chapterArabic?.trim().length > 0
  const hasUrduTitle = chapter.chapterUrdu?.trim().length > 0

  return (
    <Link
      href={`/hadith/${bookSlug}/${chapter.chapterNumber}`}
      className={cn(
        'flex items-center gap-4 px-4 py-3',
        'min-h-[var(--spacing-touch)]',
        'transition-colors hover:bg-accent focus-visible:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {/* Leading quiet Chapter number — no filled circle */}
      <span className="type-eyebrow w-8 flex-shrink-0 text-tertiary tabular-nums">
        {chapter.chapterNumber}
      </span>

      {/* Titles */}
      <span className="min-w-0 flex-1">
        <span className="type-nav block text-primary">
          {chapter.chapterEnglish}
        </span>
        {hasUrduTitle && (
          <span className="mt-0.5 block text-sm text-secondary">
            {chapter.chapterUrdu}
          </span>
        )}
      </span>

      {/* Trailing Arabic title — omitted entirely (no reserved space) when empty.
          It must wrap (never force horizontal overflow at 320px), so it is
          allowed to shrink (`min-w-0`, no `flex-shrink-0`), capped to a share of
          the row, and broken across lines with `break-words` rather than clipped. */}
      {hasArabicTitle && (
        <span
          className="type-arabic min-w-0 max-w-[45%] break-words text-right text-primary"
          dir="rtl"
          lang="ar"
        >
          {chapter.chapterArabic}
        </span>
      )}

      <ChevronRight
        className="h-4 w-4 flex-shrink-0 text-tertiary"
        aria-hidden="true"
      />
    </Link>
  )
}
