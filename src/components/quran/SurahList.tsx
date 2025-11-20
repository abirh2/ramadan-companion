'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { SURAHS } from '@/lib/quranData'
import { Bookmark } from 'lucide-react'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'

interface SurahListProps {
  searchQuery: string
}

export function SurahList({ searchQuery }: SurahListProps) {
  const { getBookmark } = useQuranBookmarks()
  
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
      {filteredSurahs.map((surah) => {
        const bookmark = getBookmark(surah.number)
        
        return (
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
                    {bookmark && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                        <Bookmark className="h-3 w-3 fill-current" />
                        <span>Bookmark: Ayah {bookmark.ayah_number}</span>
                      </div>
                    )}
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
        )
      })}
    </div>
  )
}

