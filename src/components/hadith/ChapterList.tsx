'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { HadithChapter } from '@/types/hadith.types'

interface ChapterListProps {
  chapters: HadithChapter[]
  bookSlug: string
}

export function ChapterList({ chapters, bookSlug }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No chapters found</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <Link 
          key={chapter.id} 
          href={`/hadith/${bookSlug}/${chapter.chapterNumber}`}
        >
          <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Chapter Number and Name */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Chapter Number Circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {chapter.chapterNumber}
                </div>

                {/* Chapter Names */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base leading-snug">
                    {chapter.chapterEnglish}
                  </h3>
                  {chapter.chapterUrdu && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {chapter.chapterUrdu}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Arabic Name */}
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-arabic" dir="rtl">
                  {chapter.chapterArabic}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

