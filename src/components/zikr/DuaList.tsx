'use client'

import { DuaCard } from './DuaCard'
import { DUAS, getDuaCategories, getCategoryDisplayName } from '@/lib/duas'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

export function DuaList() {
  const categories = getDuaCategories()
  const first = categories[0]

  return (
    <Accordion type="multiple" defaultValue={first ? [first] : []}>
      {categories.map((category) => {
        const categoryDuas = DUAS.filter((dua) => dua.category === category)
        if (categoryDuas.length === 0) return null

        return (
          <AccordionItem key={category} value={category} className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-3">
              <div>
                <h3 className="text-lg font-semibold leading-tight">
                  {getCategoryDisplayName(category)} Duas
                </h3>
                <p className="text-sm text-muted-foreground font-normal">
                  {categoryDuas.length} dua{categoryDuas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryDuas.map((dua) => (
                  <DuaCard key={dua.id} dua={dua} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

