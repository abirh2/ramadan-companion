'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Info } from 'lucide-react'
import { HadithItem } from './HadithItem'
import { HadithLanguageSelector } from './HadithLanguageSelector'
import { HadithGradingDialog } from './HadithGradingDialog'
import { ReturnToTopButton } from './ReturnToTopButton'
import { useHadithsByChapter } from '@/hooks/useHadithsByChapter'

interface HadithListProps {
  bookSlug: string
  chapterNumber: string
}

export function HadithList({ bookSlug, chapterNumber }: HadithListProps) {
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)
  
  const {
    hadiths,
    loading,
    loadingMore,
    error,
    hasMore,
    totalHadiths,
    selectedLanguage,
    setLanguage,
    loadMore,
  } = useHadithsByChapter({ bookSlug, chapterNumber })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading hadiths...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-2">Error loading hadiths</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (hadiths.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hadiths found in this chapter</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Language Selector and Info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {hadiths.length} of {totalHadiths} hadith{totalHadiths !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setGradingDialogOpen(true)}
            aria-label="Learn about hadith grading"
          >
            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Button>
          <HadithLanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setLanguage}
          />
        </div>
      </div>

      {/* Hadiths List */}
      <div className="space-y-4">
        {hadiths.map((hadith, index) => (
          <HadithItem
            key={`${hadith.bookSlug}-${hadith.hadithNumber}-${index}`}
            hadith={hadith}
            selectedLanguage={selectedLanguage}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            size="lg"
            variant="outline"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Loading...
              </>
            ) : (
              `Load More (${totalHadiths - hadiths.length} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* Return to Top Button */}
      <ReturnToTopButton />

      {/* Grading Dialog */}
      <HadithGradingDialog
        open={gradingDialogOpen}
        onOpenChange={setGradingDialogOpen}
      />
    </div>
  )
}

