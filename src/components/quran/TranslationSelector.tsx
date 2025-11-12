'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QURAN_TRANSLATIONS, QuranTranslationId } from '@/types/quran.types'

interface TranslationSelectorProps {
  value: QuranTranslationId
  onValueChange: (translation: QuranTranslationId) => void
  disabled?: boolean
}

export function TranslationSelector({
  value,
  onValueChange,
  disabled = false,
}: TranslationSelectorProps) {
  const { user } = useAuth()
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
    onValueChange(translationId)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        Translation
      </label>
      <Select
        value={value}
        onValueChange={handleChange}
        disabled={disabled || isSaving}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select translation" />
        </SelectTrigger>
        <SelectContent>
          {QURAN_TRANSLATIONS.map((translation) => (
            <SelectItem key={translation.id} value={translation.id}>
              <div className="flex flex-col items-start">
                <span className="font-medium">{translation.name}</span>
                {translation.description && (
                  <span className="text-xs text-muted-foreground">
                    {translation.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isSaving && (
        <p className="text-xs text-muted-foreground">Saving preference...</p>
      )}
    </div>
  )
}

