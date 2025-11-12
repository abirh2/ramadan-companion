'use client'

import { HADITH_LANGUAGES, type HadithLanguageId } from '@/types/hadith.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LanguageSelectorProps {
  value: HadithLanguageId
  onValueChange: (language: HadithLanguageId) => void
  disabled?: boolean
}

export function LanguageSelector({ value, onValueChange, disabled }: LanguageSelectorProps) {
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

