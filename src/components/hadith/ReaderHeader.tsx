'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useHadithsByChapter } from '@/hooks/useHadithsByChapter'

interface ReaderHeaderProps {
  bookSlug: string
  chapterNumber: string
  bookNameDisplay: string
}

export function ReaderHeader({ bookSlug, chapterNumber, bookNameDisplay }: ReaderHeaderProps) {
  const { book, chapter, loading } = useHadithsByChapter({ bookSlug, chapterNumber })

  // Collection name: prefer resolved data, fall back to the derived display name.
  const collectionName = (book?.bookName || bookNameDisplay).trim()

  // Chapter English title: only once resolved and non-empty. Omitted entirely
  // (no placeholder / no reserved space) when unavailable.
  const chapterTitle = !loading && chapter ? chapter.chapterEnglish.trim() : ''

  return (
    <header className="mb-4 border-b border-border-subtle pb-4">
      <Link
        href={`/hadith/${bookSlug}`}
        className="mb-3 inline-flex items-center gap-2 text-secondary transition-colors hover:text-primary"
        aria-label="Navigate back to chapters"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm">Back to Chapters</span>
      </Link>

      {/* Breadcrumb — activatable links to the Hadith Browser and Chapter Browser */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="type-eyebrow flex items-center gap-2 text-tertiary">
          <li>
            <Link href="/hadith" className="transition-colors hover:text-primary">
              Hadith
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/hadith/${bookSlug}`}
              className="transition-colors hover:text-primary"
            >
              {collectionName || bookNameDisplay}
            </Link>
          </li>
        </ol>
      </nav>

      {/* Editorial title — Collection name and Chapter English title.
          Each field is rendered only when available; a missing field is
          omitted with no placeholder, error box, or layout gap. */}
      {collectionName && <h1 className="type-page-title">{collectionName}</h1>}
      {chapterTitle && (
        <p className="mt-1 type-section-title text-secondary">{chapterTitle}</p>
      )}
    </header>
  )
}
