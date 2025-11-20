'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SURAHS } from '@/lib/quranData'
import { Bookmark } from 'lucide-react'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'

interface SurahGridProps {
  searchQuery: string
}

export function SurahGrid({ searchQuery }: SurahGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredSurahs.map((surah) => {
        const bookmark = getBookmark(surah.number)
        
        return (
          <Link key={surah.number} href={`/quran/${surah.number}`}>
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                {/* Surah Number */}
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {surah.number}
                </div>

                {/* Arabic Name */}
                <h3 className="text-2xl font-arabic" dir="rtl">
                  {surah.arabicName}
                </h3>

                {/* English Names */}
                <div>
                  <p className="font-semibold">{surah.englishName}</p>
                  <p className="text-sm text-muted-foreground">
                    {surah.englishNameTranslation}
                  </p>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground border-t pt-2 w-full">
                  <div className="flex justify-center gap-2">
                    <span>{surah.revelationType}</span>
                    <span>·</span>
                    <span>{surah.numberOfAyahs} Ayahs</span>
                  </div>
                  {bookmark && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-primary">
                      <Bookmark className="h-3 w-3 fill-current" />
                      <span>Bookmark: Ayah {bookmark.ayah_number}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

