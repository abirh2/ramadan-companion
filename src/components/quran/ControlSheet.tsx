'use client'

import { Component, useEffect, useState, type ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface ControlSheetProps {
  /** Controlled open state of the sheet. */
  open: boolean
  /** Called when the open state should change (Radix passes the next value). */
  onOpenChange: (open: boolean) => void
  /** Accessible dialog title. Defaults to "Reading settings". */
  title?: string
  /** Optional trigger element rendered inside a SheetTrigger. */
  trigger?: ReactNode
  /** Sheet body — the existing selectors, rendered as-is. */
  children: ReactNode
}

/**
 * Tracks whether the viewport is at desktop width so the control sheet can slide
 * in from the right on desktop and up from the bottom on mobile. Presentation-only.
 * Mirrors the responsive pattern used by TafsirView.
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

/**
 * Confines a rendering failure of the sheet body to a brief inline indication so
 * the surrounding caller bar (trigger and controls) stays operable. Selections are
 * left unchanged because the failure never propagates out of the sheet.
 */
class ControlSheetBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <p role="alert" className="text-sm text-text-tertiary">
          Reading settings could not be shown. Your current selections are
          unchanged.
        </p>
      )
    }
    return this.props.children
  }
}

/**
 * ControlSheet — a thin presentational wrapper around ui/sheet (Radix Dialog).
 *
 * It renders its children (the existing reading-setting selectors) as-is inside a
 * labelled, accessible sheet. Radix supplies the focus trap, focus return, and
 * dialog labelling. The sheet slides in from the bottom on mobile and from the
 * right on desktop.
 *
 * Failure handling: if the sheet body fails to render, the selections are left
 * unchanged and a brief inline indication is surfaced. The caller bar stays
 * operable because the failure is confined to the sheet body.
 */
export function ControlSheet({
  open,
  onOpenChange,
  title = 'Reading settings',
  trigger,
  children,
}: ControlSheetProps) {
  const isDesktop = useIsDesktop()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className="max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">
            Adjust {title.toLocaleLowerCase()} without leaving the reader.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <ControlSheetBoundary>{children}</ControlSheetBoundary>
        </div>
      </SheetContent>
    </Sheet>
  )
}
