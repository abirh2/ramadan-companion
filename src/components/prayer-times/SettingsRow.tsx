'use client'

import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface SettingsRowProps {
  label: string
  value: string
  placeholder?: boolean
  onPress: () => void
  isLast?: boolean
  icon?: ReactNode
}

/**
 * Presentational settings row for the PreferencesSection grouped list.
 *
 * Renders a `min-h-touch` tappable row with a `type-body` label, a
 * `type-body-secondary` value, and a right-aligned `ChevronRight` disclosure.
 * Rows are separated by a `border-subtle` divider unless `isLast` is set.
 * When `placeholder` is true, the value is rendered in muted tertiary text.
 * Styling is token-only so light and dark modes both re-theme.
 */
export function SettingsRow({
  label,
  value,
  placeholder = false,
  onPress,
  isLast = false,
  icon,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`group flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-grouped focus-visible:relative focus-visible:z-10 active:bg-teal-muted ${
        isLast ? '' : 'border-b border-border-subtle'
      }`}
    >
      {icon ? (
        <span className="flex shrink-0 items-center text-text-secondary transition-colors group-hover:text-teal" aria-hidden="true">
          {icon}
        </span>
      ) : null}

      <span className="type-body min-w-0 flex-1 text-text-primary">{label}</span>

      <span
        className={`type-body-secondary min-w-0 truncate text-right ${
          placeholder ? 'text-text-tertiary' : 'text-text-secondary'
        }`}
      >
        {value}
      </span>

      <ChevronRight className="size-4 shrink-0 text-text-tertiary" aria-hidden="true" />
    </button>
  )
}
