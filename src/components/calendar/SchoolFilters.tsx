'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { SchoolFilter } from '@/types/calendar.types'

interface SchoolFiltersProps {
  filters: SchoolFilter
  onFiltersChange: (filters: SchoolFilter) => void
}

const BRANCHES = [
  { id: 'sunni' as keyof SchoolFilter, name: 'Sunni', description: 'Includes all Sunni madhabs (Hanafi, Shafi\'i, Maliki, Hanbali, etc.)' },
  { id: 'shia' as keyof SchoolFilter, name: 'Shia', description: 'Includes Twelver, Ismaili, Zaydi, and other Shia branches' },
  { id: 'ibadi' as keyof SchoolFilter, name: 'Ibadi', description: 'The dominant school in Oman' },
]

export function SchoolFilters({ filters, onFiltersChange }: SchoolFiltersProps) {
  const handleCheckboxChange = (school: keyof SchoolFilter, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [school]: checked,
    })
  }

  const selectAll = () => {
    onFiltersChange({
      sunni: true,
      shia: true,
      ibadi: true,
    })
  }

  const deselectAll = () => {
    onFiltersChange({
      sunni: false,
      shia: false,
      ibadi: false,
    })
  }

  const enabledCount = Object.values(filters).filter(Boolean).length
  const totalCount = BRANCHES.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter by Branch</h3>
        <span className="text-xs text-muted-foreground">
          {enabledCount} of {totalCount} selected
        </span>
      </div>

      <div className="space-y-3">
        {BRANCHES.map((branch) => (
          <div key={branch.id} className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`branch-${branch.id}`}
                checked={filters[branch.id]}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(branch.id, checked === true)
                }
              />
              <Label
                htmlFor={`branch-${branch.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {branch.name}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {branch.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={selectAll} className="flex-1">
          All
        </Button>
        <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">
          None
        </Button>
      </div>
    </div>
  )
}

