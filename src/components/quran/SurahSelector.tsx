'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { SurahList } from './SurahList'

export function SurahSelector() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-4">
      {/* Search — single prominent, native-feeling control (Req 2.1, 2.5) */}
      <div className="relative w-full sm:max-w-md">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
        />
        <Input
          type="text"
          placeholder="Search surahs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search surahs"
          className="pl-10"
        />
      </div>

      {/* Surah Display */}
      <SurahList searchQuery={searchQuery} />
    </div>
  )
}
