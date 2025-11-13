'use client'

import { DuaCard } from './DuaCard'
import { DUAS, getDuaCategories, getCategoryDisplayName } from '@/lib/duas'

export function DuaList() {
  const categories = getDuaCategories()

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryDuas = DUAS.filter((dua) => dua.category === category)
        
        if (categoryDuas.length === 0) {
          return null
        }

        return (
          <div key={category}>
            {/* Category Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{getCategoryDisplayName(category)} Duas</h3>
              <p className="text-sm text-muted-foreground">
                {categoryDuas.length} dua{categoryDuas.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Dua Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryDuas.map((dua) => (
                <DuaCard key={dua.id} dua={dua} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

