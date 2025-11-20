'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { JUZ_DATA, getSurahByNumber } from '@/lib/quranData'
import { BookOpen, Bookmark } from 'lucide-react'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'

export function JuzList() {
  const { getBookmark } = useQuranBookmarks()
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {JUZ_DATA.map((juz) => {
        const startSurah = getSurahByNumber(juz.startSurah)
        const endSurah = getSurahByNumber(juz.endSurah)
        const bookmark = getBookmark(juz.startSurah)

        return (
          <Link key={juz.number} href={`/quran/${juz.startSurah}?ayah=${juz.startAyah}`}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Juz {juz.number}</h3>
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Range Info */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Starts:</p>
                    <p className="font-medium">
                      {startSurah?.englishName} ({juz.startSurah}:{juz.startAyah})
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ends:</p>
                    <p className="font-medium">
                      {endSurah?.englishName} ({juz.endSurah}:{juz.endAyah})
                    </p>
                  </div>
                  {bookmark && (
                    <div className="flex items-center gap-1 pt-2 border-t text-xs text-primary">
                      <Bookmark className="h-3 w-3 fill-current" />
                      <span>Bookmark in {startSurah?.englishName}: Ayah {bookmark.ayah_number}</span>
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

