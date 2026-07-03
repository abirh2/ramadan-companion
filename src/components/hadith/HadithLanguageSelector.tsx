'use client'

import { HADITH_LANGUAGES, type HadithLanguageId } from '@/types/hadith.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Languages } from 'lucide-react'

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
  const currentLanguage = HADITH_LANGUAGES.find((lang) => lang.id === value)

  if (variant === 'form') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Hadith Language</label>
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {HADITH_LANGUAGES.map((lang) => (
              <SelectItem key={lang.id} value={lang.id}>
                {lang.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose your preferred language for hadith translations
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
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
