'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Copy, Check } from 'lucide-react'
import { useHadithFavorites } from '@/hooks/useHadithFavorites'
import { HadithGradingDialog } from './HadithGradingDialog'
import type { HadithData, HadithLanguageId, HadithFavoriteData } from '@/types/hadith.types'

interface HadithItemProps {
  hadith: HadithData
  selectedLanguage: HadithLanguageId
}

export function HadithItem({ hadith, selectedLanguage }: HadithItemProps) {
  const [copiedArabic, setCopiedArabic] = useState(false)
  const [copiedTranslation, setCopiedTranslation] = useState(false)
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)

  // Prepare hadith data for favorites hook
  const hadithFavoriteData: HadithFavoriteData = {
    hadithNumber: hadith.hadithNumber,
    book: hadith.book.bookName,
    bookSlug: hadith.book.bookSlug,
    chapter: hadith.chapter.chapterEnglish,
    status: hadith.status,
    narrator: hadith.englishNarrator,
    hadithEnglish: hadith.hadithEnglish,
    hadithUrdu: hadith.hadithUrdu,
    hadithArabic: hadith.hadithArabic,
  }

  const { isFavorited, toggleFavorite, requiresAuth } = useHadithFavorites(hadithFavoriteData)

  // Get translation text based on selected language
  const translationText = selectedLanguage === 'urdu' 
    ? hadith.hadithUrdu 
    : hadith.hadithEnglish

  const narratorText = selectedLanguage === 'urdu'
    ? hadith.urduNarrator
    : hadith.englishNarrator

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (requiresAuth) {
      // TODO: Show login modal
      console.log('Authentication required to favorite hadith')
      return
    }
    await toggleFavorite()
  }

  // Copy Arabic text
  const handleCopyArabic = async () => {
    try {
      await navigator.clipboard.writeText(hadith.hadithArabic)
      setCopiedArabic(true)
      setTimeout(() => setCopiedArabic(false), 2000)
    } catch (err) {
      console.error('Failed to copy Arabic text:', err)
    }
  }

  // Copy translation text
  const handleCopyTranslation = async () => {
    const fullText = `${narratorText}\n\n${translationText}\n\nSource: ${hadith.book.bookName} — ${hadith.book.writerName}\nChapter: ${hadith.chapter.chapterEnglish}\nHadith #${hadith.hadithNumber} (${hadith.status})\n\n* Hadith numbering follows HadithAPI edition`
    
    try {
      await navigator.clipboard.writeText(fullText)
      setCopiedTranslation(true)
      setTimeout(() => setCopiedTranslation(false), 2000)
    } catch (err) {
      console.error('Failed to copy translation:', err)
    }
  }

  // Status badge color
  const statusColor = 
    hadith.status === 'Sahih' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
    hadith.status === 'Hasan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'

  return (
    <Card className="p-5">
      {/* Header: Hadith Number and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Hadith #{hadith.hadithNumber}
          </span>
          <button
            onClick={() => setGradingDialogOpen(true)}
            className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-opacity hover:opacity-80 ${statusColor}`}
            aria-label={`Learn about ${hadith.status} grading`}
          >
            {hadith.status}
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`h-5 w-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} 
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* Arabic Text */}
      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Arabic Text</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyArabic}
            className="h-8 px-2"
            aria-label="Copy Arabic text"
          >
            {copiedArabic ? (
              <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        <p className="text-lg leading-relaxed font-arabic" dir="rtl">
          {hadith.hadithArabic}
        </p>
      </div>

      {/* Translation */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            {selectedLanguage === 'urdu' ? 'Urdu Translation' : 'English Translation'}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyTranslation}
            className="h-8 px-2"
            aria-label="Copy translation"
          >
            {copiedTranslation ? (
              <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {narratorText && (
          <p className="text-sm font-medium text-primary">
            {narratorText}
          </p>
        )}

        <p className="text-base leading-relaxed">
          {translationText}
        </p>
      </div>

      {/* Footer: Source Info */}
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
        <p>
          <span className="font-semibold">Source:</span> {hadith.book.bookName} — {hadith.book.writerName}
        </p>
        <p>
          <span className="font-semibold">Chapter:</span> {hadith.chapter.chapterEnglish}
        </p>
        {hadith.volume && (
          <p>
            <span className="font-semibold">Volume:</span> {hadith.volume}
          </p>
        )}
        <p className="text-xs italic mt-2">
          * Hadith numbering follows HadithAPI edition and may differ from other publications
        </p>
      </div>

      {/* Grading Dialog */}
      <HadithGradingDialog
        open={gradingDialogOpen}
        onOpenChange={setGradingDialogOpen}
      />
    </Card>
  )
}

