'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useHadithsByChapter } from '@/hooks/useHadithsByChapter'

interface ChapterHeaderProps {
  bookSlug: string
  chapterNumber: string
  bookNameDisplay: string
}

export function ChapterHeader({ bookSlug, chapterNumber, bookNameDisplay }: ChapterHeaderProps) {
  const { chapter, loading } = useHadithsByChapter({ bookSlug, chapterNumber })

  // Show chapter number while loading, then show full title
  const chapterDisplay = loading || !chapter 
    ? `Chapter ${chapterNumber}` 
    : chapter.chapterEnglish

  return (
    <div className="mb-6">
      <Link 
        href={`/hadith/${bookSlug}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
        aria-label="Navigate back to chapters"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm">Back to Chapters</span>
      </Link>
      
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/hadith" className="hover:text-foreground transition-colors">
              Hadith Browser
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/hadith/${bookSlug}`} className="hover:text-foreground transition-colors">
              {bookNameDisplay}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground">
            {chapterDisplay}
          </li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {bookNameDisplay} — Chapter {chapterNumber}
      </h1>
      <p className="text-muted-foreground">
        {chapter && !loading ? chapter.chapterEnglish : 'Read and explore hadiths from this chapter'}
      </p>
    </div>
  )
}

