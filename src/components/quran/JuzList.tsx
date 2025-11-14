'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { JUZ_DATA, getSurahByNumber } from '@/lib/quranData'
import { BookOpen } from 'lucide-react'

export function JuzList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {JUZ_DATA.map((juz) => {
        const startSurah = getSurahByNumber(juz.startSurah)
        const endSurah = getSurahByNumber(juz.endSurah)

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
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

