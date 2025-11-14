'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { SURAHS } from '@/lib/quranData'
import { BookOpen } from 'lucide-react'

interface SurahListProps {
  searchQuery: string
}

export function SurahList({ searchQuery }: SurahListProps) {
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS

    const query = searchQuery.toLowerCase()
    return SURAHS.filter(
      (surah) =>
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query) ||
        surah.number.toString().includes(query)
    )
  }, [searchQuery])

  if (filteredSurahs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No surahs found matching &quot;{searchQuery}&quot;</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredSurahs.map((surah) => (
        <Link key={surah.number} href={`/quran/${surah.number}`}>
          <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Number and Name */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Surah Number Circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {surah.number}
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{surah.englishName}</h3>
                    <span className="text-sm text-muted-foreground">
                      {surah.englishNameTranslation}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {surah.revelationType} · {surah.numberOfAyahs} Ayahs
                  </p>
                </div>
              </div>

              {/* Right: Arabic Name */}
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-arabic" dir="rtl">
                  {surah.arabicName}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

