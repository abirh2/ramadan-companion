'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Info } from 'lucide-react'
import { HadithItem } from './HadithItem'
import { HadithLanguageSelector } from './HadithLanguageSelector'
import { HadithGradingDialog } from './HadithGradingDialog'
import { ReturnToTopButton } from './ReturnToTopButton'
import { useHadithsByChapter } from '@/hooks/useHadithsByChapter'
import { HADITH_LANGUAGES } from '@/types/hadith.types'

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

  // Reading-language consistency from the Daily Hadith surface (Requirement 11).
  // When arriving via a link that carries the active reading-language as a
  // `?lang=` query param, present hadith text in that same value. This uses the
  // hook's already-exposed `setLanguage` (no hook change; the fetch/persistence
  // logic is untouched). An absent or invalid value is ignored, so the hook's
  // existing default/precedence applies with no error (Requirements 11.3, 11.4).
  const searchParams = useSearchParams()
  const langParam = searchParams.get('lang')
  const appliedLangParamRef = useRef(false)
  useEffect(() => {
    if (appliedLangParamRef.current) return
    const isValid = HADITH_LANGUAGES.some((language) => language.id === langParam)
    if (isValid && langParam !== selectedLanguage) {
      appliedLangParamRef.current = true
      void setLanguage(langParam as (typeof HADITH_LANGUAGES)[number]['id'])
    } else if (isValid) {
      // Already matches; no work needed but don't re-run.
      appliedLangParamRef.current = true
    }
  }, [langParam, selectedLanguage, setLanguage])

  // Initial-load spinner — sits on the reading canvas via semantic tokens.
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
        <p className="mt-4 text-text-secondary">Loading hadiths...</p>
      </div>
    )
  }

  // Full error state only when nothing has loaded yet (initial-load failure).
  // A load-more failure surfaces via `error` while hadiths already exist; that
  // case is handled non-destructively near the Load More control below so the
  // already-loaded hadiths are retained (Requirement 10.8).
  if (error && hadiths.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 text-destructive">Error loading hadiths</p>
        <p className="type-caption text-text-tertiary">{error}</p>
      </div>
    )
  }

  if (hadiths.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">No hadiths found in this chapter</p>
      </div>
    )
  }

  // A load-more failure: error is set but hadiths are already loaded.
  const loadMoreFailed = Boolean(error) && hadiths.length > 0

  return (
    <div className="space-y-8">
      {/* Quiet reading-controls row: count line, grading-info, language selector.
          Sits on the canvas with no card/box treatment (Requirements 4.6, 7.9). */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-caption text-text-secondary">
          showing {hadiths.length} of {totalHadiths} hadith{totalHadiths !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-touch"
            onClick={() => setGradingDialogOpen(true)}
            aria-label="Learn about hadith grading"
          >
            <Info className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          </Button>
          <HadithLanguageSelector
            value={selectedLanguage}
            onValueChange={setLanguage}
          />
        </div>
      </div>

      {/* Hadith list on the reading canvas. Hairline dividers separate hadiths,
          and inter-hadith spacing (space-y-8 + pt-8) is greater than the
          intra-hadith spacing (space-y-3 inside each block) (Requirements 5.1, 5.7). */}
      <div className="space-y-8">
        {hadiths.map((hadith, index) => (
          <div
            key={`${hadith.bookSlug}-${hadith.hadithNumber}-${index}`}
            className={index === 0 ? '' : 'border-t border-border-subtle pt-8'}
          >
            <HadithItem hadith={hadith} selectedLanguage={selectedLanguage} />
          </div>
        ))}
      </div>

      {/* Load More — preserves the loading indicator and remaining count. On a
          failed additional load the spinner is gone (loadingMore is false), the
          loaded hadiths remain, and a non-destructive inline indication shows
          that loading did not complete (Requirements 10.5–10.8). */}
      {hasMore && (
        <div className="flex flex-col items-center gap-2 pt-4">
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
          {loadMoreFailed && !loadingMore ? (
            <p className="type-caption text-destructive" role="status">
              Couldn&apos;t load more hadiths. Please try again.
            </p>
          ) : null}
        </div>
      )}

      {/* Return to Top Button — preserved unchanged */}
      <ReturnToTopButton />

      {/* Grading Dialog — reused, opened independently of any single hadith */}
      <HadithGradingDialog
        open={gradingDialogOpen}
        onOpenChange={setGradingDialogOpen}
      />
    </div>
  )
}
