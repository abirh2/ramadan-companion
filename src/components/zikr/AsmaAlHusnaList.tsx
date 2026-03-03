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
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search by name, transliteration, or meaning..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search the 99 names"
        />
      </div>

      {/* Result count when filtering */}
      {query.trim() && (
        <p className="text-sm text-muted-foreground text-center">
          {filtered.length === 0
            ? 'No names found'
            : `${filtered.length} name${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((n) => (
          <Card
            key={n.number}
            className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 space-y-2">
              {/* Number + Arabic */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground mt-1 shrink-0">
                  {String(n.number).padStart(2, '0')}
                </span>
                <p
                  className="text-2xl leading-relaxed font-serif text-right flex-1"
                  dir="rtl"
                  lang="ar"
                >
                  {n.name}
                </p>
              </div>

              {/* Transliteration */}
              <p className="text-sm font-medium italic text-foreground">
                {n.transliteration}
              </p>

              {/* Meaning */}
              <p className="text-sm text-muted-foreground">
                {n.meaning}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
