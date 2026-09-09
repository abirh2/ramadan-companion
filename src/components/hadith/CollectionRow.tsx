'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HadithBook } from '@/types/hadith.types'

interface CollectionRowProps {
  book: HadithBook
}

/**
 * CollectionRow — presentational Hadith Browser row.
 *
 * The whole row is the navigation Link to `/hadith/{bookSlug}`.
 * All displayed fields are sourced from the `book` (HadithBook) record;
 * no data fetching here. The death-year metadata renders only when
 * `writerDeath` is non-empty, with no placeholder or reserved space when absent.
 */
export function CollectionRow({ book }: CollectionRowProps) {
  const hasDeathYear = book.writerDeath?.trim().length > 0

  return (
    <Link
      href={`/hadith/${book.bookSlug}`}
      className={cn(
        'flex items-center gap-4 px-4 py-3',
        'min-h-[var(--spacing-touch)]',
        'transition-colors hover:bg-accent focus-visible:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {/* Collection name + writer + optional death year */}
      <span className="min-w-0 flex-1">
        <span className="type-nav block text-teal">{book.bookName}</span>
        <span className="mt-0.5 block text-sm text-text-secondary">
          {book.writerName}
        </span>
        {hasDeathYear && (
          <span className="type-eyebrow mt-0.5 block text-text-tertiary">
            d. {book.writerDeath}
          </span>
        )}
      </span>

      {/* Trailing chevron — onward navigation affordance */}
      <ChevronRight
        className="h-4 w-4 flex-shrink-0 text-text-tertiary"
        aria-hidden="true"
      />
    </Link>
  )
}
