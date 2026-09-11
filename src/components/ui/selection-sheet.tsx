'use client'

import { useId, useMemo, useState, type ReactNode } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface SelectionSheetOption<TValue extends string = string> {
  value: TValue
  title: string
  subtitle?: string
  trailing?: ReactNode
  searchText?: string
  lang?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

interface SelectionSheetProps<TValue extends string = string> {
  label: string
  value: TValue
  options: readonly SelectionSheetOption<TValue>[]
  onValueChange: (value: TValue) => void
  description?: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  triggerClassName?: string
  triggerRole?: 'button' | 'combobox'
  compact?: boolean
}

export function SelectionSheet<TValue extends string = string>({
  label,
  value,
  options,
  onValueChange,
  description,
  disabled = false,
  searchable = false,
  searchPlaceholder,
  emptyText,
  className,
  triggerClassName,
  triggerRole = 'combobox',
  compact = false,
}: SelectionSheetProps<TValue>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const listId = useId()
  const current = options.find((option) => option.value === value)
  const normalizedQuery = query.trim().toLocaleLowerCase()

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options
    return options.filter((option) =>
      [option.title, option.subtitle, option.searchText]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    )
  }, [normalizedQuery, options])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setQuery('')
  }

  const handleSelect = (nextValue: TValue) => {
    onValueChange(nextValue)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={cn(compact ? 'inline-flex' : 'space-y-2', className)}>
      {!compact && (
        <span className="type-label block text-text-secondary">{label}</span>
      )}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            role={triggerRole}
            aria-label={`${label}: ${current?.title ?? 'Not selected'}`}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            className={cn(
              'h-auto min-h-11 justify-between gap-3 px-3 py-2.5 text-left font-normal',
              compact ? 'w-auto max-w-full' : 'w-full',
              triggerClassName
            )}
          >
            <span className="min-w-0 flex-1">
              {compact && (
                <span className="mr-1.5 text-text-tertiary">{label}:</span>
              )}
              <span className="block truncate font-medium text-text-primary">
                {current?.title ?? 'Choose an option'}
              </span>
              {!compact && current?.subtitle && (
                <span className="type-caption mt-0.5 block truncate text-text-secondary">
                  {current.subtitle}
                </span>
              )}
            </span>
            <ChevronDown className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
          </Button>
        </SheetTrigger>

        <SheetContent side="bottom" className="gap-0 overflow-hidden p-0">
          <SheetHeader className="border-b border-border-subtle px-5 pb-4 pt-2 text-left">
            <SheetTitle className="type-section-title pr-12 text-text-primary">
              {label}
            </SheetTitle>
            <SheetDescription className="type-caption text-text-secondary">
              {description ?? `Choose your preferred ${label.toLocaleLowerCase()}.`}
            </SheetDescription>
          </SheetHeader>

          {searchable && (
            <div className="sticky top-0 z-10 border-b border-border-subtle bg-surface-elevated px-4 py-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label={`Search ${label.toLocaleLowerCase()}`}
                  placeholder={searchPlaceholder ?? `Search ${label.toLocaleLowerCase()}…`}
                  autoComplete="off"
                  className="pr-10 pl-10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label={`Clear ${label.toLocaleLowerCase()} search`}
                    className="absolute right-0 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-control-sm text-text-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            id={listId}
            role="listbox"
            aria-label={label}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-2"
          >
            {filteredOptions.length > 0 ? (
              <div className="overflow-hidden rounded-grouped border border-border-subtle bg-surface-primary">
                {filteredOptions.map((option, index) => {
                  const selected = option.value === value
                  const descriptionId = `${listId}-option-${index}-description`
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-label={option.title}
                      aria-describedby={option.subtitle ? descriptionId : undefined}
                      onClick={() => handleSelect(option.value)}
                      className="flex min-h-14 w-full items-center gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-grouped focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className="block font-medium text-text-primary"
                          lang={option.lang}
                          dir={option.dir}
                        >
                          {option.title}
                        </span>
                        {option.subtitle && (
                          <span
                            id={descriptionId}
                            className="type-caption mt-0.5 block text-text-secondary"
                          >
                            {option.subtitle}
                          </span>
                        )}
                      </span>
                      {option.trailing}
                      <span className="flex size-6 shrink-0 items-center justify-center text-teal">
                        {selected && <Check className="size-4" aria-hidden="true" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p role="status" className="px-4 py-12 text-center text-text-secondary">
                {emptyText ?? `No ${label.toLocaleLowerCase()}s found`}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
