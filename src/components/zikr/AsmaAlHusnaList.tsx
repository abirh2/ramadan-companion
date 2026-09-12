'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { AsmaAlHusna } from '@/types/zikr.types'
import namesData from '@/data/asmaAlHusna.json'

const ALL_NAMES: AsmaAlHusna[] = namesData as AsmaAlHusna[]

export function AsmaAlHusnaList() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_NAMES
    return ALL_NAMES.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.name.includes(query.trim())
    )
  }, [query])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative mx-auto max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search names or meanings…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search the 99 names"
        />
      </div>

      {/* Result count when filtering */}
      {query.trim() && (
        <p className="type-caption text-center text-text-secondary" role="status">
          {filtered.length === 0
            ? 'No names found'
            : `${filtered.length} name${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <Card
            key={n.number}
            variant="grouped"
            className="gap-0 py-0"
          >
            <CardContent className="space-y-2 p-4">
              {/* Number + Arabic */}
              <div className="flex items-start justify-between gap-2">
                <span className="type-caption mt-1 shrink-0 tabular-nums text-text-tertiary">
                  {String(n.number).padStart(2, '0')}
                </span>
                <p
                  className="type-arabic flex-1 text-right text-text-primary"
                  dir="rtl"
                  lang="ar"
                >
                  {n.name}
                </p>
              </div>

              {/* Transliteration */}
              <p className="type-body-secondary font-medium italic text-text-primary">
                {n.transliteration}
              </p>

              {/* Meaning */}
              <p className="type-body-secondary text-text-secondary">
                {n.meaning}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
