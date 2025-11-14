'use client'

import { Card } from '@/components/ui/card'
import { AyahActions } from './AyahActions'
import type { AyahPair } from '@/types/quran.types'

interface AyahCardProps {
  ayahPair: AyahPair
  surahNumber: number
  surahName: string
}

export function AyahCard({ ayahPair, surahNumber, surahName }: AyahCardProps) {
  const { arabic, transliteration, translation, numberInSurah, globalNumber } = ayahPair

  return (
    <Card className="p-6 space-y-4">
      {/* Ayah Number Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-sm font-medium text-primary">
            {surahNumber}:{numberInSurah}
          </span>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="text-right" dir="rtl">
        <p className="text-3xl leading-relaxed font-arabic text-foreground">
          {arabic.text}
        </p>
      </div>

      {/* Transliteration */}
      <div className="border-t pt-3">
        <p className="text-base leading-relaxed text-muted-foreground italic">
          {transliteration.text}
        </p>
      </div>

      {/* Translation Text */}
      <div className="pt-2">
        <p className="text-lg leading-relaxed text-foreground">
          {translation.text}
        </p>
      </div>

      {/* Actions */}
      <AyahActions
        surahNumber={surahNumber}
        surahName={surahName}
        ayahNumber={numberInSurah}
        globalNumber={globalNumber}
        arabicText={arabic.text}
        translationText={translation.text}
      />
    </Card>
  )
}

