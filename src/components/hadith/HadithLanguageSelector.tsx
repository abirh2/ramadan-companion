'use client'

import { HADITH_LANGUAGES, type HadithLanguageId } from '@/types/hadith.types'
import { SelectionSheet } from '@/components/ui/selection-sheet'

interface HadithLanguageSelectorProps {
  value: HadithLanguageId
  onValueChange: (language: HadithLanguageId) => void
  disabled?: boolean
  variant?: 'compact' | 'form'
}

export function HadithLanguageSelector({
  value,
  onValueChange,
  disabled,
  variant = 'compact',
}: HadithLanguageSelectorProps) {
  return (
    <SelectionSheet
      label={variant === 'form' ? 'Hadith Language' : 'Language'}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      compact={variant === 'compact'}
      triggerRole={variant === 'compact' ? 'button' : 'combobox'}
      description="Choose the translation language used for hadith text."
      options={HADITH_LANGUAGES.map((language) => ({
        value: language.id,
        title: language.displayName,
      }))}
    />
  )
}
