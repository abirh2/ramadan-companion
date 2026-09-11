/**
 * ReciterSelector Component
 * 
 * Dropdown to select Quran reciter for audio playback.
 * Similar to TranslationSelector pattern.
 */

'use client'

import { SelectionSheet } from '@/components/ui/selection-sheet'
import { AVAILABLE_RECITERS } from '@/lib/quranAudio'
import type { QuranReciterId } from '@/types/quran.types'

interface ReciterSelectorProps {
  currentReciter: QuranReciterId
  onReciterChange: (reciter: QuranReciterId) => void
  compact?: boolean
}

export function ReciterSelector({
  currentReciter,
  onReciterChange,
  compact = false,
}: ReciterSelectorProps) {
  return (
    <SelectionSheet
      label="Reciter"
      value={currentReciter}
      onValueChange={onReciterChange}
      compact={compact}
      triggerRole={compact ? 'button' : 'combobox'}
      searchable
      searchPlaceholder="Search reciters…"
      emptyText="No reciters found"
      description="Choose the reciter used for ayah audio playback."
      options={AVAILABLE_RECITERS.map((reciter) => ({
        value: reciter.identifier as QuranReciterId,
        title: reciter.englishName,
        subtitle: reciter.name,
        searchText: reciter.name,
      }))}
    />
  )
}
