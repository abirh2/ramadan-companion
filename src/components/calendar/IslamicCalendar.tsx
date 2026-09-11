import { CalendarGrid } from './CalendarGrid'
import type { CalendarDate } from '@/types/calendar.types'

interface IslamicCalendarProps {
  dates: CalendarDate[]
  onDateSelect: (date: CalendarDate) => void
}

export function IslamicCalendar({ dates, onDateSelect }: IslamicCalendarProps) {
  return <CalendarGrid dates={dates} onDateSelect={onDateSelect} view="islamic" />
}
