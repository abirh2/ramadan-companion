'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * PreservedSurface
 *
 * A thin presentational wrapper that places preserved components
 * (`QiblaCompass`, `PrayerStatistics`) inside a surface that is compatible
 * with the redesigned `/times` system, without rebuilding the components
 * themselves (R6.1, R6.2, R6.4).
 *
 * It renders a semantic `<section>` so the caller can attach an `id`
 * (e.g. `#qibla`) that the existing scroll-into-view effect targets (R6.3),
 * plus an optional `aria-labelledby` for the section heading.
 *
 * The visual surface is expressed purely through Step 1 semantic tokens
 * (`surface-elevated` / `surface-grouped`) so light and dark themes render
 * through the token system rather than inverted white cards (R9, R13.3, R18.2).
 */

type PreservedSurfaceVariant = 'elevated' | 'grouped'

const VARIANT_CLASSES: Record<PreservedSurfaceVariant, string> = {
  // Matches the `elevated` / `grouped` variants defined in `ui/card.tsx`.
  elevated: 'rounded-surface border border-border-subtle bg-surface-elevated shadow-low',
  grouped: 'rounded-grouped border border-border-subtle bg-surface-grouped shadow-none',
}

export interface PreservedSurfaceProps {
  /** Content to wrap — typically `QiblaCompass` or `PrayerStatistics`, unchanged. */
  children: ReactNode
  /** Surface style. Both are compatible with the redesign (R6.4). Defaults to `elevated`. */
  variant?: PreservedSurfaceVariant
  /** Optional id for the section, e.g. `"qibla"` so `#qibla` scroll targeting works (R6.3). */
  id?: string
  /** Optional id of the heading element that labels this section. */
  labelledBy?: string
  /** Extra classes for spacing/layout at the call site. */
  className?: string
}

export function PreservedSurface({
  children,
  variant = 'elevated',
  id,
  labelledBy,
  className,
}: PreservedSurfaceProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('overflow-hidden p-4 sm:p-5', VARIANT_CLASSES[variant], className)}
    >
      {children}
    </section>
  )
}
