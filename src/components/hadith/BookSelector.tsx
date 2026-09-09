'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { BookList } from './BookList'
import { useHadithBrowser } from '@/hooks/useHadithBrowser'

export function BookSelector() {
  // Search state stays local; the case-insensitive substring predicate over
  // bookName / writerName / bookSlug lives in BookList and is preserved verbatim
  // (client-side filtering only — no full-text hadith search).
  const [searchQuery, setSearchQuery] = useState('')
  const { books, loading, error, refetch } = useHadithBrowser()

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4 text-secondary">Loading hadith collections...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 text-destructive">Error loading hadith collections</p>
        <p className="mb-4 text-sm text-secondary">{error}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search — the single restrained prominent control. Sticky at the top of
          the list so it stays visible while scrolling, occupying no more than a
          single input row above the first list item. Full-width on mobile,
          capped on desktop. */}
      <div className="sticky top-0 z-10 -mx-4 bg-canvas px-4 py-2">
        <div className="relative mx-auto w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search hadith collections"
          />
        </div>
      </div>

      {/* Book List */}
      <BookList books={books} searchQuery={searchQuery} />
    </div>
  )
}
