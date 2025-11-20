/**
 * ReciterSelector Component
 * 
 * Dropdown to select Quran reciter for audio playback.
 * Similar to TranslationSelector pattern.
 */

'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AVAILABLE_RECITERS } from '@/lib/quranAudio'
import type { QuranReciterId } from '@/types/quran.types'

interface ReciterSelectorProps {
  currentReciter: QuranReciterId
  onReciterChange: (reciter: QuranReciterId) => void
}

export function ReciterSelector({ currentReciter, onReciterChange }: ReciterSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="reciter-select" className="text-sm font-medium">
        Reciter:
      </label>
      <Select value={currentReciter} onValueChange={onReciterChange}>
        <SelectTrigger id="reciter-select" className="w-[200px]" aria-label="Select Quran reciter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_RECITERS.map((reciter) => (
            <SelectItem key={reciter.identifier} value={reciter.identifier}>
              {reciter.englishName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

