import { CalendarGrid } from './CalendarGrid'
import type { CalendarDate } from '@/types/calendar.types'

interface GregorianCalendarProps {
  dates: CalendarDate[]
  onDateSelect: (date: CalendarDate) => void
}

export function GregorianCalendar({ dates, onDateSelect }: GregorianCalendarProps) {
  return <CalendarGrid dates={dates} onDateSelect={onDateSelect} view="gregorian" />
}
