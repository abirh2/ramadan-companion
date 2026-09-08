'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTafsir } from '@/hooks/useTafsir'
import type { TafsirResource } from '@/types/quran.types'

interface TafsirViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  surahNumber: number
  surahName: string
  ayahNumber: number
}

/**
 * Groups tafsirs by language with English first
 */
function groupTafsirsByLanguage(tafsirs: TafsirResource[]) {
  const grouped = new Map<string, TafsirResource[]>()

  tafsirs.forEach((tafsir) => {
    const lang = tafsir.language_name
    if (!grouped.has(lang)) {
      grouped.set(lang, [])
    }
    grouped.get(lang)!.push(tafsir)
  })

  // Sort languages: English first, then alphabetically
  const sortedLanguages = Array.from(grouped.keys()).sort((a, b) => {
    if (a === 'english') return -1
    if (b === 'english') return 1
    return a.localeCompare(b)
  })

  return sortedLanguages.map((lang) => ({
    language: lang,
    tafsirs: grouped.get(lang)!,
  }))
}

/**
 * Tracks whether the viewport is at desktop width so the tafsir view can render
 * a centered Dialog on desktop and a bottom Sheet on mobile. Presentation-only.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isDesktop
}

export function TafsirView({
  open,
  onOpenChange,
  surahNumber,
  surahName,
  ayahNumber,
}: TafsirViewProps) {
  const isDesktop = useIsDesktop()

  const {
    tafsirs,
    tafsirLoading,
    tafsirError,
    selectedTafsirId,
    setSelectedTafsirId,
    tafsirContent,
    contentLoading,
    contentError,
    fetchTafsirContent,
    clearContent,
    syncFromStorage,
  } = useTafsir()

  // Sync tafsir selection from sessionStorage when the view opens
  // This ensures the selection is consistent across all ayah views
  useEffect(() => {
    if (open) {
      syncFromStorage()
    }
  }, [open, syncFromStorage])

  // Fetch tafsir content when the view opens or tafsir selection changes
  useEffect(() => {
    if (open) {
      fetchTafsirContent(surahNumber, ayahNumber)
    } else {
      clearContent()
    }
  }, [open, selectedTafsirId, surahNumber, ayahNumber, fetchTafsirContent, clearContent])

  // Group tafsirs by language
  const groupedTafsirs = useMemo(() => {
    if (!tafsirs.length) return []
    return groupTafsirsByLanguage(tafsirs)
  }, [tafsirs])

  // Get current tafsir name for display
  const currentTafsirName = useMemo(() => {
    const tafsir = tafsirs.find((t) => t.id === selectedTafsirId)
    return tafsir?.name || 'Select Tafsir'
  }, [tafsirs, selectedTafsirId])

  const title = `Tafsir: ${surahName} ${surahNumber}:${ayahNumber}`

  // Shared inner body used by both the desktop Dialog and mobile Sheet
  const body = (
    <>
      {/* Tafsir Selector */}
      <div className="space-y-2">
        <label htmlFor="tafsir-select" className="text-sm font-medium">
          Select Tafsir
        </label>
        <Select
          value={selectedTafsirId.toString()}
          onValueChange={(value) => setSelectedTafsirId(parseInt(value))}
          disabled={tafsirLoading}
        >
          <SelectTrigger id="tafsir-select" className="w-full">
            <SelectValue placeholder={currentTafsirName} />
          </SelectTrigger>
          <SelectContent>
            {tafsirLoading ? (
              <SelectItem value="loading" disabled>
                Loading tafsirs...
              </SelectItem>
            ) : tafsirError ? (
              <SelectItem value="error" disabled>
                Error loading tafsirs
              </SelectItem>
            ) : (
              groupedTafsirs.map((group) => (
                <SelectGroup key={group.language}>
                  <SelectLabel className="capitalize">
                    {group.language}
                  </SelectLabel>
                  {group.tafsirs.map((tafsir) => (
                    <SelectItem key={tafsir.id} value={tafsir.id.toString()}>
                      {tafsir.name} — {tafsir.author_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Tafsir Content */}
      <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-muted/30">
        {contentLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading tafsir...</p>
          </div>
        ) : contentError ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
            <p className="text-muted-foreground font-medium">
              Tafsir Unavailable
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              This tafsir is not available for this ayah. Please select a different tafsir from the dropdown above.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Try: Ibn Kathir (default), Ma&apos;arif al-Qur&apos;an, or Tafsir Muyassar
            </p>
          </div>
        ) : tafsirContent ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: tafsirContent.text }}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Select a tafsir to view commentary
            </p>
          </div>
        )}
      </div>
    </>
  )

  // Desktop: centered Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Commentary and explanation of the ayah
            </DialogDescription>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: bottom Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-hidden flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Commentary and explanation of the ayah
          </SheetDescription>
        </SheetHeader>
        {body}
      </SheetContent>
    </Sheet>
  )
}
