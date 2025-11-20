'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ChapterList } from './ChapterList'
import { useHadithChapters } from '@/hooks/useHadithChapters'

interface ChapterSelectorProps {
  bookSlug: string
}

export function ChapterSelector({ bookSlug }: ChapterSelectorProps) {
  const { 
    filteredChapters, 
    loading, 
    error, 
    searchQuery, 
    setSearchQuery 
  } = useHadithChapters({ bookSlug })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading chapters...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-2">Error loading chapters</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative flex-1 w-full max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search chapters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Chapter List */}
      {filteredChapters.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No chapters found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <ChapterList chapters={filteredChapters} bookSlug={bookSlug} />
      )}
    </div>
  )
}

