'use client'

import { useState } from 'react'
import { useOptionalAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { SelectionSheet } from '@/components/ui/selection-sheet'
import { QURAN_TRANSLATIONS, QuranTranslationId } from '@/types/quran.types'

interface TranslationSelectorProps {
  currentTranslation: QuranTranslationId
  onTranslationChange: (translation: QuranTranslationId) => void
  disabled?: boolean
  compact?: boolean
}

export function TranslationSelector({
  currentTranslation,
  onTranslationChange,
  disabled = false,
  compact = false,
}: TranslationSelectorProps) {
  const user = useOptionalAuth()?.user
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = async (newTranslation: string) => {
    const translationId = newTranslation as QuranTranslationId

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('quran_translation', translationId)
    }

    // Save to Supabase profile if authenticated
    if (user) {
      setIsSaving(true)
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('profiles')
          .update({ quran_translation: translationId })
          .eq('id', user.id)

        if (error) {
          console.error('Error saving translation preference:', error)
        }
      } catch (error) {
        console.error('Error saving translation preference:', error)
      } finally {
        setIsSaving(false)
      }
    }

    // Trigger refetch with new translation
    onTranslationChange(translationId)
  }

  return (
    <div className={compact ? 'inline-flex max-w-full' : 'space-y-2'}>
      <SelectionSheet
        label="Translation"
        value={currentTranslation}
        onValueChange={handleChange}
        disabled={disabled || isSaving}
        compact={compact}
        triggerRole={compact ? 'button' : 'combobox'}
        searchable
        searchPlaceholder="Search translations…"
        emptyText="No translations found"
        description="Choose the English translation used throughout the reader."
        options={QURAN_TRANSLATIONS.map((translation) => ({
          value: translation.id,
          title: translation.name,
          subtitle: translation.description,
          searchText: translation.translator,
        }))}
      />
      {isSaving && (
        <p role="status" className="type-caption text-text-secondary">
          Saving preference…
        </p>
      )}
    </div>
  )
}
