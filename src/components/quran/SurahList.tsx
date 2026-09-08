'use client'

import { useMemo } from 'react'
import { SURAHS } from '@/lib/quranData'
import { useQuranBookmarks } from '@/hooks/useQuranBookmarks'
import { SurahRow } from './SurahRow'

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
    <div className="surface-grouped overflow-hidden">
      {filteredSurahs.map((surah, index) => (
        <div
          key={surah.number}
          className={
            index === 0 ? '' : 'border-t border-border-subtle'
          }
        >
          <SurahRow
            surah={surah}
            bookmark={getBookmark(surah.number)}
            isFavorited={false}
          />
        </div>
      ))}
    </div>
  )
}
