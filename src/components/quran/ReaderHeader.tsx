'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import type { QuranSurah } from '@/types/quran.types'
import type { SurahMetadata } from '@/lib/quranData'

interface ReaderHeaderProps {
  surah: QuranSurah
  metadata: SurahMetadata
}

export function ReaderHeader({ metadata }: ReaderHeaderProps) {
  return (
    <header className="space-y-3 border-b border-border-subtle pb-6">
      {/* Back control */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 min-h-touch text-text-secondary">
        <Link href="/quran" aria-label="Back to Quran Browser">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Quran Browser
        </Link>
      </Button>

      {/* Editorial title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="type-page-title text-text-primary">{metadata.englishName}</h1>
          <p className="type-body text-text-secondary">{metadata.englishNameTranslation}</p>
          <p className="type-caption text-text-tertiary">
            Surah {metadata.number} · {metadata.revelationType} · {metadata.numberOfAyahs} Ayahs
          </p>
        </div>

        {/* Arabic name — Arabic font, restrained size, RTL/bidi */}
        <p
          className="type-arabic text-text-secondary sm:text-right"
          dir="rtl"
          lang="ar"
        >
          {metadata.arabicName}
        </p>
      </div>
    </header>
  )
}
