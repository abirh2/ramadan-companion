'use client'

import type { HadithChapter } from '@/types/hadith.types'
import { ChapterRow } from './ChapterRow'

interface ChapterListProps {
  chapters: HadithChapter[]
  bookSlug: string
}

/**
 * ChapterList — grouped Chapter Browser list.
 *
 * Presents all chapters in the data-source order (no adding, removing,
 * reordering, or altering data) as divider-separated `ChapterRow` items
 * inside a single `.surface-grouped` container. A hairline divider sits
 * between adjacent rows only — never before the first row or after the last.
 * When zero chapters are returned, an empty-state message renders with no rows.
 */
export function ChapterList({ chapters, bookSlug }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">No chapters found</p>
      </div>
    )
  }

  return (
    <div className="surface-grouped overflow-hidden">
      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className={index === 0 ? '' : 'border-t border-border-subtle'}
        >
          <ChapterRow chapter={chapter} bookSlug={bookSlug} />
        </div>
      ))}
    </div>
  )
}
