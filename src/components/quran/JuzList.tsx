'use client'

import { JUZ_DATA, getSurahByNumber } from '@/lib/quranData'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'
import { JuzRow } from './JuzRow'

export function JuzList() {
  const { getBookmark } = useQuranBookmarks()

  return (
    <div className="surface-grouped overflow-hidden">
      {JUZ_DATA.map((juz, index) => {
        const startSurah = getSurahByNumber(juz.startSurah)
        const endSurah = getSurahByNumber(juz.endSurah)
        const bookmark = getBookmark(juz.startSurah)

        return (
          <div
            key={juz.number}
            className={index === 0 ? '' : 'border-t border-border-subtle'}
          >
            <JuzRow
              juz={juz}
              startSurah={startSurah}
              endSurah={endSurah}
              bookmark={bookmark}
            />
          </div>
        )
      })}
    </div>
  )
}
