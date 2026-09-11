'use client'

import { useState } from 'react'
import { HadithGradingDialog } from './HadithGradingDialog'
import { HadithActionBar } from './HadithActionBar'
import type { HadithData, HadithLanguageId } from '@/types/hadith.types'

interface HadithItemProps {
  hadith: HadithData
  selectedLanguage: HadithLanguageId
}

export function HadithItem({ hadith, selectedLanguage }: HadithItemProps) {
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)

  // Translation and narrator for the selected reading language.
  // Arabic is always shown regardless of language (Requirement 8.4).
  const translationText =
    selectedLanguage === 'urdu' ? hadith.hadithUrdu : hadith.hadithEnglish
  const narratorText =
    selectedLanguage === 'urdu' ? hadith.urduNarrator : hadith.englishNarrator

  // --- Reference_Line composition (Requirement 7.1–7.3) -----------------------
  // Order: Collection name · writer · Chapter English title · Hadith_Number,
  // with volume included when non-empty. Absent non-volume components are
  // omitted along with their separator, with no placeholder text.
  const referenceParts = [
    hadith.book.bookName,
    hadith.book.writerName,
    hadith.chapter.chapterEnglish,
    hadith.hadithNumber ? `Hadith #${hadith.hadithNumber}` : '',
    hadith.volume ? `Vol. ${hadith.volume}` : '',
  ].filter((part) => part && part.trim().length > 0)

  const hasStatus = Boolean(hadith.status && hadith.status.trim().length > 0)

  return (
    <article className="space-y-3">
      {/* "Hadith N" label — tertiary contrast, smaller than Arabic/translation */}
      <p className="type-eyebrow text-text-tertiary">Hadith {hadith.hadithNumber}</p>

      {/* Narrator — distinct attribution line immediately above the translation;
          omitted with zero reserved space when empty (Requirement 5.5, 5.6) */}
      {narratorText ? (
        <p className="type-caption font-medium text-text-secondary break-words">
          {narratorText}
        </p>
      ) : null}

      {/* Arabic — greatest reading weight; .type-arabic at 24px, RTL, diacritic-safe */}
      <p
        className="type-arabic text-text-primary break-words text-[1.5rem]"
        dir="rtl"
        lang="ar"
      >
        {hadith.hadithArabic}
      </p>

      {/* Translation — wraps fully, no clamp/truncation (Requirement 10.1–10.4).
          When the translation/narrator is unavailable in the selected language,
          keep the Arabic and show a visible "translation unavailable" text
          indication instead of removing the hadith (Requirement 8.6). */}
      {translationText && translationText.trim().length > 0 ? (
        <p className="type-quran-translation text-text-primary break-words">
          {translationText}
        </p>
      ) : (
        <p className="type-quran-translation italic text-text-tertiary">
          Translation unavailable in the selected language.
        </p>
      )}

      {/* Reference_Line — secondary, ≥ 15% smaller than translation, ≥ 4.5:1 */}
      {referenceParts.length > 0 ? (
        <p
          className="type-caption text-text-tertiary break-words"
          aria-label={`Source: ${referenceParts.join(', ')}`}
        >
          {referenceParts.join(' · ')}
        </p>
      ) : null}

      {/* HadithAPI-edition numbering note (Requirement 7.4) */}
      <p className="type-caption italic text-text-tertiary">
        * Hadith numbering follows HadithAPI edition and may differ from other publications
      </p>

      {/* Grade indicator — exact status value, omitted when empty (Requirement 7.6, 7.7) */}
      {hasStatus ? (
        <button
          type="button"
          onClick={() => setGradingDialogOpen(true)}
          className="type-eyebrow inline-flex min-h-touch items-center rounded-control text-text-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
          aria-label={`Hadith grade: ${hadith.status}. Learn what this grade means.`}
        >
          {hadith.status}
        </button>
      ) : null}

      {/* Action bar — favorite / copy-Arabic / copy-translation icon group */}
      <HadithActionBar hadith={hadith} selectedLanguage={selectedLanguage} />

      {/* Grading dialog — reused unchanged (Requirement 7.8) */}
      <HadithGradingDialog open={gradingDialogOpen} onOpenChange={setGradingDialogOpen} />
    </article>
  )
}
