'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    refetch,
    searchQuery,
    setSearchQuery,
  } = useHadithChapters({ bookSlug })

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
        <p className="mt-4 text-text-secondary">Loading chapters...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="type-section-title mb-1 text-text-primary">
          Chapters could not be loaded
        </p>
        <p className="mb-4 text-sm text-text-secondary">{error}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chapter search — a single sticky row above the list, visible while scrolling */}
      <div className="sticky top-0 z-10 -mx-1 bg-canvas px-1 py-2">
        <div className="relative mx-auto w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search chapters..."
            aria-label="Search chapters"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chapter List */}
      {filteredChapters.length === 0 && searchQuery ? (
        <div className="py-12 text-center">
          <p className="text-text-secondary">
            No chapters found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <ChapterList chapters={filteredChapters} bookSlug={bookSlug} />
      )}
    </div>
  )
}
