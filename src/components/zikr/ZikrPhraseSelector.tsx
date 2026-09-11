'use client'

import { FormEvent, useState } from 'react'
import { Check, ChevronRight, Infinity, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import type { ZikrPhrase } from '@/types/zikr.types'

interface ZikrPhraseSelectorProps {
  phrases: ZikrPhrase[]
  currentPhraseId: string
  currentTarget: number | null
  onSelectPhrase: (phraseId: string) => void
  onSetTarget: (target: number | null) => void
}

export function ZikrPhraseSelector({
  phrases,
  currentPhraseId,
  currentTarget,
  onSelectPhrase,
  onSetTarget,
}: ZikrPhraseSelectorProps) {
  const [open, setOpen] = useState(false)
  const [customTarget, setCustomTarget] = useState(currentTarget?.toString() || '')
  const currentPhrase = phrases.find((phrase) => phrase.id === currentPhraseId) ?? phrases[0]
  const hasTarget = currentTarget !== null && currentTarget > 0

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setCustomTarget(currentTarget?.toString() || '')
    setOpen(nextOpen)
  }

  const handleSetDefaultTarget = () => {
    onSetTarget(currentPhrase.defaultTarget)
    setCustomTarget(currentPhrase.defaultTarget.toString())
  }

  const handleSetFreeCount = () => {
    onSetTarget(null)
    setCustomTarget('')
  }

  const handleSetCustomTarget = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = Number.parseInt(customTarget, 10)
    if (Number.isFinite(target) && target > 0) onSetTarget(target)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="surface-grouped flex min-h-14 w-full touch-manipulation items-center gap-3 px-4 py-3 text-left transition-[background-color,transform] duration-100 hover:bg-surface-elevated active:scale-[0.99] active:bg-surface-grouped/70 motion-reduce:active:scale-100"
          aria-label={`Change zikr or target. Selected: ${currentPhrase.transliteration}. ${hasTarget ? `Target ${currentTarget}` : 'Free count'}.`}
        >
          <Settings2 className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="type-nav block text-text-primary">Change zikr</span>
            <span className="type-caption block truncate text-text-secondary">
              {currentPhrase.transliteration} · {hasTarget ? `${currentTarget} target` : 'Free count'}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" aria-hidden="true" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[90dvh] gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 pr-14 text-left">
          <SheetTitle className="type-section-title">Choose your zikr</SheetTitle>
          <SheetDescription className="type-body-secondary">
            Selecting a different phrase starts its count from zero.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="overflow-hidden rounded-grouped border border-border-subtle bg-surface-primary" role="listbox" aria-label="Zikr phrases">
          {phrases.map((phrase) => {
            const selected = phrase.id === currentPhraseId
            return (
              <button
                key={phrase.id}
                type="button"
                onClick={() => {
                  onSelectPhrase(phrase.id)
                  setOpen(false)
                }}
                className={`flex min-h-[4.75rem] w-full touch-manipulation items-center gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors last:border-b-0 ${selected ? 'bg-teal-muted' : 'hover:bg-surface-grouped'}`}
                role="option"
                aria-selected={selected}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="type-nav text-text-primary">{phrase.transliteration}</span>
                    <span className="type-caption text-text-tertiary">{phrase.defaultTarget}×</span>
                  </span>
                  <span className="mt-0.5 block font-arabic text-xl leading-relaxed text-text-primary" dir="rtl" lang="ar">
                    {phrase.arabic}
                  </span>
                  <span className="type-caption block text-text-secondary">{phrase.meaning}</span>
                </span>
                {selected && <Check className="h-5 w-5 shrink-0 text-teal" aria-hidden="true" />}
              </button>
            )
          })}
        </div>

        <div className="mt-2 border-t border-border-subtle pt-5">
          <h3 className="type-nav mb-3 text-text-primary">Target count</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={hasTarget && currentTarget === currentPhrase.defaultTarget ? 'default' : 'outline'}
              onClick={handleSetDefaultTarget}
              className="h-12"
            >
              {currentPhrase.defaultTarget} default
            </Button>
            <Button type="button" variant={!hasTarget ? 'default' : 'outline'} onClick={handleSetFreeCount} className="h-12">
              <Infinity className="h-4 w-4" aria-hidden="true" />
              Free count
            </Button>
          </div>

          <form className="mt-3 flex gap-2" onSubmit={handleSetCustomTarget}>
            <label className="sr-only" htmlFor="zikr-custom-target">Custom target count</label>
            <Input
              id="zikr-custom-target"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="Custom target"
              value={customTarget}
              onChange={(event) => setCustomTarget(event.target.value)}
              className="h-12 flex-1"
            />
            <Button type="submit" variant="outline" disabled={!customTarget || Number.parseInt(customTarget, 10) <= 0} className="h-12 px-5">
              Set
            </Button>
          </form>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
