'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HADITH_LANGUAGES, type HadithLanguageId } from '@/types/hadith.types'
import { Languages } from 'lucide-react'

interface HadithLanguageSelectorProps {
  selectedLanguage: HadithLanguageId
  onLanguageChange: (language: HadithLanguageId) => void
}

export function HadithLanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: HadithLanguageSelectorProps) {
  const currentLanguage = HADITH_LANGUAGES.find(lang => lang.id === selectedLanguage)

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[200px]" aria-label="Select hadith translation language">
          <SelectValue>{currentLanguage?.displayName || 'English'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {HADITH_LANGUAGES.map((language) => (
            <SelectItem key={language.id} value={language.id}>
              {language.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

