'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import type { QuranSurah } from '@/types/quran.types'
import type { SurahMetadata } from '@/lib/quranData'

interface SurahHeaderProps {
  surah: QuranSurah
  metadata: SurahMetadata
}

export function SurahHeader({ surah, metadata }: SurahHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link href="/quran">
        <Button variant="ghost" size="sm">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Quran Browser
        </Button>
      </Link>

      {/* Surah Info Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left: English Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{metadata.englishName}</h1>
            <p className="text-lg text-muted-foreground mb-1">
              {metadata.englishNameTranslation}
            </p>
            <p className="text-sm text-muted-foreground">
              Surah {metadata.number} · {metadata.revelationType} · {metadata.numberOfAyahs} Ayahs
            </p>
          </div>

          {/* Right: Arabic Name */}
          <div className="text-right">
            <h2 className="text-4xl font-arabic" dir="rtl">
              {metadata.arabicName}
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}

